import Resource from "../models/resource.model.js";
import cloudinary from 'cloudinary';

export const createResource = async (req, res) => {
    try {
        const { title, subject, type, fileUrl, semester } = req.body;
        const user = req.user;

        if (!title || !subject || !type || !fileUrl) {
            return res.status(400).json({ error: "Please fill all required fields" });
        }

        // Ensure fileUrl is valid (basic check)
        if (!fileUrl.startsWith("http")) {
            // In a real app with drag-drop, we might handle base64 here or expect a cloud URL.
            // For now, assuming frontend handles upload to Cloudinary or sends a base64 string to be uploaded here.
            // If receiving base64:
            // const uploadedResponse = await cloudinary.v2.uploader.upload(fileUrl, { resource_type: "auto" });
            // finalUrl = uploadedResponse.secure_url;
        }

        let finalUrl = fileUrl;
        if (fileUrl.startsWith("data:")) {
            const uploadedResponse = await cloudinary.v2.uploader.upload(fileUrl, { resource_type: "auto" });
            finalUrl = uploadedResponse.secure_url;
        }

        const newResource = new Resource({
            user: user._id,
            university: user.university,
            title,
            subject,
            type,
            fileUrl: finalUrl,
            semester,
        });

        await newResource.save();
        res.status(201).json(newResource);
    } catch (error) {
        console.error("Error in createResource:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getResources = async (req, res) => {
    try {
        const user = req.user;
        const resources = await Resource.find({ university: user.university })
            .sort({ createdAt: -1 })
            .populate("user", "-password");

        res.status(200).json(resources);
    } catch (error) {
        console.error("Error in getResources:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        const resource = await Resource.findById(id);

        if (!resource) {
            return res.status(404).json({ error: "Resource not found" });
        }

        // Allow deletion if user is the uploader OR an admin from the same university
        if (resource.user.toString() !== req.user._id.toString()) {
            if (req.user.role === 'admin' && req.user.university === resource.university) {
                // Admin allowed
            } else if (req.user.role === 'superadmin') {
                // Superadmin allowed
            } else {
                return res.status(401).json({ error: "You are not authorized to delete this resource" });
            }
        }

        // Attempt to delete from Cloudinary if possible (extract public_id)
        if (resource.fileUrl) {
            const publicId = resource.fileUrl.split("/").pop().split(".")[0];
            await cloudinary.v2.uploader.destroy(publicId);
        }

        await Resource.findByIdAndDelete(id);
        res.status(200).json({ message: "Resource deleted successfully" });
    } catch (error) {
        console.error("Error in deleteResource:", error);
        res.status(500).json({ error: "Server error" });
    }
};
