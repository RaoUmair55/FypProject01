import Notification from "../models/notification.model.js";

const getNotification = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming you have the user ID in req.user
        const notifications = await Notification.find({ to: userId }).populate({path:"from", select: 'username profileImg'}); // Populate user details if needed
        await Notification.updateMany({ to: userId }, { $set: { isRead: true } }); // Mark notifications as read
        return res.status(200).json({ notifications });
        
    } catch (error) {
        console.error("Error in get notification controller", error);
        res.status(500).json({ error: "Server error" });
        
    }
};

const deleteNotification = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming you have the user ID in req.user
        await Notification.deleteMany({ to: userId });
        res.status(200).json({ message: "Notifications deleted successfully" });
    } catch (error) {
        console.error("Error in delete notification controller", error);
        res.status(500).json({ error: "Server error" });
        
    }
};

export { getNotification, deleteNotification };