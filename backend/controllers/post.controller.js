import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import { uploadOnCloudinary } from "../utills/uploadCloudinary.js";


export const createPost = async (req, res) => {
    try {
        //   console.log('Received text:', req.body.text);
        // console.log('Received file:', req.file); // Check the file uploaded (if any)

        const text = req.body.text;
        const category = req.body.category;
        const localFilePath = req.file?.path;

         let imageUrl = '';
        if (localFilePath) {
         const cloudinaryResult = await uploadOnCloudinary(localFilePath);
         imageUrl = cloudinaryResult?.secure_url;
         console.log('Cloudinary result:', cloudinaryResult);
         // Remove the local file after uploading to Cloudinary
        //  fs.unlinkSync(localFilePath);
        }
        if (!text || !category) {
            console.log('Text or category is missing');
            return res.status(400).json({ error: "Text and category are required" });
        }
        const userId = req.user._id; // Assuming you have the user ID in req.user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        console.log(userId);
        const post = await Post.create({
            user: userId,
            text,
            img: imageUrl,
            university: user.university,
            category
        });


        await post.save();
        // await notification.save();
        return res.status(201).json({ message: "Post created successfully", post });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
        
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id; // Assuming the post ID is passed as a URL parameter
        const userId = req.user._id; // Assuming you have the user ID in req.user

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (post.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You are not authorized to delete this post" });
        }
        await Post.findByIdAndDelete(postId);
        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.error("Error in delete post controller",error);
        res.status(500).json({ error: "Server error" });
    } 
}

export const commentPost = async (req, res) => {
    try {
        const postId = req.params.id; // Assuming the post ID is passed as a URL parameter
        const { text } = req.body; // Assuming the comment text is sent in the request body
        const userId = req.user._id; // Assuming you have the user ID in req.user

        if (!text) {
            return res.status(400).json({ error: "Comment text is required" });
        }
        const post = await Post.findById(postId);
        
        
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        //check if post university and user university are same
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (post.university !== user.university) {
            return res.status(403).json({ error: "You are not authorized to comment on this post" });
        }

        const comment = {
            user: userId,
            text,
        };

        post.comments.push(comment);
        await post.save();

        return res.status(200).json({ message: "Comment added successfully", comment });
    } catch (error) {
        console.error("Error in comment post controller",error);
        res.status(500).json({ error: "Server error" });
    } 
}

export const likeUnLike = async (req, res) => {
    try {
        
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
//check if the university of post and user are same
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (post.university !== user.university) {
            return res.status(403).json({ error: "You are not authorized to like/unlike this post" });
        }

        const index = post.likes.indexOf(userId);
        if (index === -1) {

            post.likes.push(userId);
            // Add the post ID to the user's likedPosts array
            await user.updateOne({ $addToSet: { likedPosts: postId } });
            await post.save();
            const updatedLikes = post.likes
            // Create a notification for the user who posted the post
            const notification = await Notification.create({
                from: userId,
                to: post.user,
                type: "like",
            });
            await notification.save();
            return res.status(200).json(updatedLikes);
        } else {
            // Remove the post ID from the user's likedPosts array
            await user.updateOne({ $pull: { likedPosts: postId } });
            post.likes.splice(index, 1);
            const updatedLikes = post.likes
            await post.save();

            return res.status(200).json(updatedLikes);
        }
    } catch (error) {
        console.error("Error in like/unlike post controller",error);
        res.status(500).json({ error: "Server error" });
        
    }
}

export const getAllPosts = async (req, res) => {
     const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password -bio -followers -following -link",
        }).limit(limit).skip(skip);
        const totalPosts = await Post.countDocuments();
       if (posts.length === 0) {
            return res.status(200).json({ message: "No posts found" });
        }
        return res.status(200).json({ posts, total: totalPosts });
    } catch (error) {
        console.error("Error in get all posts controller",error);
        res.status(500).json({ error: "Server error" });
    } 
}

// Get all posts liked by a user
export const likedPost = async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const total = user.likedPosts.length;

    // Slice likedPosts array for pagination
    const paginatedPostIds = user.likedPosts.slice(skip, skip + limit);

    const likedPosts = await Post.find({ _id: { $in: paginatedPostIds } })
      .populate({
        path: "user",
        select: "-password -bio -followers -following -link", // customize as needed
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ posts: likedPosts, total });
  } catch (error) {
    console.error("Error in get liked posts controller", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getFollowedPosts = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming you have the user ID in req.user
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

       const following = user.following; // Array of user IDs that the current user is following

       const feedPosts = await Post.find({ user: { $in: following } })
       .sort({ createdAt: -1 })
       .populate({
           path: "user",
           select: "-password -bio -followers -following -link"
       }).populate({
        
           path: "comments.user",
           select: "-password -bio -followers -following -link"
       });
       return res.status(200).json(feedPosts);
    } catch (error) {
        console.error("Error in get followed posts controller",error);
        res.status(500).json({ error: "Server error" });
    }
}
   
export const getUserPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ user: user._id })
      .populate("user", "username fullName university")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ user: user._id });

    return res.status(200).json({ posts, total: totalPosts });
  } catch (error) {
    console.error("Error in get user posts controller", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getPostsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const allowedCategories = ["Anouncement", "Department", "Events", "Other"];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments({ category });

    const posts = await Post.find({ category })
      .populate("user", "username fullName university")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ posts, total });
  } catch (error) {
    console.error("Error in get posts by category controller", error);
    res.status(500).json({ error: "Server error" });
  }
};
