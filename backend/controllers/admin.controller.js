import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import bcrypt from "bcryptjs";

export const getDashboardStats = async (req, res) => {
    try {
        const user = req.user;
        let stats = {};

        if (user.role === 'superadmin') {
            // Global Stats
            const totalUsers = await User.countDocuments({ role: 'student' });
            const totalAdmins = await User.countDocuments({ role: 'admin' });
            const totalPosts = await Post.countDocuments();

            // Aggregation for charts
            const usersByUniversity = await User.aggregate([
                { $match: { role: 'student' } },
                { $group: { _id: "$university", count: { $sum: 1 } } }
            ]);

            const postsByCategory = await Post.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } }
            ]);

            stats = {
                totalUsers,
                totalAdmins,
                totalPosts,
                usersByUniversity,
                postsByCategory
            };
        } else {
            // University Specific Stats
            const university = user.university;
            const totalUsers = await User.countDocuments({ university, role: 'student' });
            const totalPosts = await Post.countDocuments({ university });

            const postsByCategory = await Post.aggregate([
                { $match: { university } },
                { $group: { _id: "$category", count: { $sum: 1 } } }
            ]);

            stats = {
                totalUsers,
                totalPosts,
                postsByCategory,
                university
            };
        }

        res.status(200).json(stats);
    } catch (error) {
        console.error("Error in getDashboardStats:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const createAdmin = async (req, res) => {
    try {
        const { username, fullName, email, password, university } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ error: "Username is already taken" });

        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ error: "Email is already taken" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newAdmin = new User({
            username,
            fullName,
            email,
            password: hashedPassword,
            university,
            role: "admin",
            isVerified: true // Auto-verify admins created by superadmin
        });

        if (newAdmin) {
            await newAdmin.save();
            res.status(201).json({
                _id: newAdmin._id,
                username: newAdmin.username,
                email: newAdmin.email,
                role: newAdmin.role
            });
        } else {
            res.status(400).json({ error: "Invalid user data" });
        }

    } catch (error) {
        console.error("Error in createAdmin:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userToDelete = await User.findById(id);

        if (!userToDelete) return res.status(404).json({ error: "User not found" });

        // Admin can only delete users from their university
        if (req.user.role === 'admin' && userToDelete.university !== req.user.university) {
            return res.status(403).json({ error: "You can only delete users from your university" });
        }

        await User.findByIdAndDelete(id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error in deleteUser:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);

        if (!post) return res.status(404).json({ error: "Post not found" });

        // Admin can only delete posts from their university
        if (req.user.role === 'admin' && post.university !== req.user.university) {
            return res.status(403).json({ error: "You can only delete posts from your university" });
        }

        await Post.findByIdAndDelete(id);
        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error in deletePost:", error);
        res.status(500).json({ error: "Server error" });
    }
};


export const getAllAdmins = async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-password');
        res.status(200).json(admins);
    } catch (error) {
        console.error('Error in getAllAdmins:', error);
        res.status(500).json({ error: 'Server error' });
    }
};


export const getUniversityStudents = async (req, res) => {
    try {
        const user = req.user;
        let students;

        if (user.role === 'superadmin') {
            students = await User.find({ role: 'student' }).select('-password');
        } else {
            // Only fetch students from the admin's university
            students = await User.find({ role: 'student', university: user.university }).select('-password');
        }

        res.status(200).json(students);
    } catch (error) {
        console.error('Error in getUniversityStudents:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const getUniversityPosts = async (req, res) => {
    try {
        const user = req.user;
        let posts;

        if (user.role === 'superadmin') {
            posts = await Post.aggregate([
                { $addFields: { likesCount: { $size: "$likes" } } },
                { $sort: { likesCount: -1 } },
                { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
                { $unwind: "$user" },
                { $project: { "user.password": 0 } }
            ]);
        } else {
            posts = await Post.aggregate([
                { $match: { university: user.university } },
                { $addFields: { likesCount: { $size: "$likes" } } },
                { $sort: { likesCount: -1 } },
                { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "user" } },
                { $unwind: "$user" },
                { $project: { "user.password": 0 } }
            ]);
        }

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error in getUniversityPosts:", error);
        res.status(500).json({ error: "Server error" });
    }
};
