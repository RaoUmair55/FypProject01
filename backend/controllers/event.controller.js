import Event from "../models/event.model.js";
import cloudinary from 'cloudinary';

export const createEvent = async (req, res) => {
    try {
        const { name, description, location, date, category, img } = req.body;
        const user = req.user;

        if (!name || !description || !location || !date) {
            return res.status(400).json({ error: "Please fill all required fields" });
        }

        let imgUrl = null;
        if (img) {
            const uploadedResponse = await cloudinary.v2.uploader.upload(img);
            imgUrl = uploadedResponse.secure_url;
        }

        const newEvent = new Event({
            user: user._id,
            university: user.university,
            name,
            description,
            location,
            date,
            category,
            img: imgUrl,
        });

        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Error in createEvent:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getEvents = async (req, res) => {
    try {
        const user = req.user;
        const events = await Event.find({ university: user.university })
            .sort({ date: 1 }) // Nearest date first
            .populate("user", "-password");

        res.status(200).json(events);
    } catch (error) {
        console.error("Error in getEvents:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event.findById(id);

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        // Allow deletion if user is the organizer OR an admin from the same university
        if (event.user.toString() !== req.user._id.toString()) {
            if (req.user.role === 'admin' && req.user.university === event.university) {
                // Admin allowed
            } else if (req.user.role === 'superadmin') {
                // Superadmin allowed
            } else {
                return res.status(401).json({ error: "You are not authorized to delete this event" });
            }
        }

        if (event.img) {
            const imgId = event.img.split("/").pop().split(".")[0];
            await cloudinary.v2.uploader.destroy(imgId);
        }

        await Event.findByIdAndDelete(id);
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error in deleteEvent:", error);
        res.status(500).json({ error: "Server error" });
    }
};
