import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import  {getUniversityFromEmail}  from "../utills/universityUtills.js";


export const getUserProfile = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("-password -__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  } 
}

export const followUnfollowUser = async (req, res) => {
    const { id } = req.params;
    // const { userId } = req.body; // Assuming you're sending the userId in the request body
    
    try {
        const userToModify = await User.findById(id);
        if (!userToModify) {
        return res.status(404).json({ message: "User not found" });
        }
        const currentUser = await User.findById(req.user._id); // Assuming req.user contains the authenticated user's info
        if(id === req.user._id.toString()) {
            // Check if the user is trying to follow/unfollow themselves
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
        }

        if(!userToModify || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        // Check if the user is already followed
        const isFollowing = currentUser.following.includes(userToModify._id);

        if (isFollowing) {
            // Unfollow the user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } }, { new: true });
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } }, { new: true });
            //Send notification to the unfollowed user
            const newNotification = new Notification({
                from: req.user._id,
                to: userToModify._id,
                type: "unfollow",
            });
            await newNotification.save();
            // Optionally, you can send a notification to the user who was unfollowed
            
            res.status(200).json({ message: "Unfollowed successfully" });
         
        } else {
            // Follow the user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } }, { new: true });
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } }, { new: true });
            //Send notification to the followed user
            const newNotification = new Notification({
                from: req.user._id,
                to: userToModify._id,
                type: "follow",
            });
            await newNotification.save();
            res.status(200).json({ message: "Followed successfully" });
        }

    } catch (error) {
        console.error("Error following/unfollowing user:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming you have the user ID from the request
        const usersFollowedByMe = await User.findById(userId).select("following");
      const users = await User.aggregate([
        { $match: {
            _id:{$ne: userId},

        } 
        },
        {$sample: { size: 10 }}, // Randomly sample 10 users
      ])

      const filterUsers = users.filter(user => !usersFollowedByMe.following.includes(user._id.toString()))
      const suggestedUsers = filterUsers.slice(0, 5); // Limit to 10 users
      
      suggestedUsers.forEach(user => user.password=null); // Remove password field from each user object

        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.error("Error fetching suggested users:", error);
        res.status(500).json({ message: "Server error" });
    }
}

export const updateUserProfile = async (req, res) => {
    const {fullName, bio, email, username, currentPassword, newPassword} = req.body;

    const userId = req.user._id; // Assuming you have the user ID from the request
    try {
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

       if (currentPassword || newPassword) {

         if(!newPassword && !currentPassword) {
             return res.status(400).json({ message: "Please provide current and new password" });
         }
         // Check if the current password is correct
         if (currentPassword && newPassword) {
             const isMatch = await bcrypt.compare(currentPassword, user.password);
             if (!isMatch) {
                 return res.status(400).json({ message: "Current password is incorrect" });
             }
             if (newPassword.length < 6) {
                 return res.status(400).json({ message: "New password must be at least 6 characters long" });
             }
             // Hash the new password before saving
             const salt = await bcrypt.genSalt(10);
             const hashedPassword = await bcrypt.hash(newPassword, salt);
             user.password = hashedPassword; // Update the password
         }
       }

        if(email) {
            const university = getUniversityFromEmail(email);
            if (!university) {
                return res.status(400).json({ message: "Email does not belong to a recognized university" });
            }
        }

        user.fullName = fullName || user.fullName;
        user.bio = bio || user.bio;
        user.email = email || user.email;
        user.username = username || user.username;
        if (email) { // Check if email is provided
            user.university = getUniversityFromEmail(email); // Update university if email is provided
        }
        
        await user.save();


        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Server error" });
    } 
}