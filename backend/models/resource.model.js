import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["Notes", "Past Paper", "Assignment", "Other"],
            default: "Notes",
        },
        fileUrl: {
            type: String,
            required: true,
        },
        university: {
            type: String,
            required: true,
        },
        semester: {
            type: Number,
        },
    },
    { timestamps: true }
);

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
