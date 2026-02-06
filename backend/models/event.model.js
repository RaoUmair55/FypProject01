import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        img: {
            type: String,
        },
        university: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["Academic", "Sports", "Cultural", "Workshop", "Other"],
            default: "Other",
        },
    },
    { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
