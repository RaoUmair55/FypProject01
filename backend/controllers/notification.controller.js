import Notification from "../models/notification.model.js";

const getNotification = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming you have the user ID in req.user
        const notifications = await Notification.find({ to: userId }).populate({path:"from", select: 'username profileImg'}); // Populate user details if needed
        // await Notification.updateMany({ to: userId }, { $set: { isRead: true } }); // Mark notifications as read
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

const getNotificationNumber = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming you have the user ID in req.user
        const notifications = await Notification.find({ to: userId, new: true });
        res.status(200).json({ number: notifications.length });
    } catch (error) {
        console.error("Error in get notification number controller", error);
        res.status(500).json({ error: "Server error" });

    }
};


// PUT /api/notifications/:id/read
const markNotificationRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: false }
    );
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.status(200).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export { getNotification, deleteNotification, getNotificationNumber, markNotificationRead };