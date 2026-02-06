import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
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
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        img: {
            type: String, // Optional image
        },
        university: {
            type: String,
            required: true,
        },
        condition: {
            type: String,
            enum: ["New", "Like New", "Good", "Fair"],
            default: "Good",
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
