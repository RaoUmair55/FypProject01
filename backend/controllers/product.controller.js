import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import cloudinary from 'cloudinary';

export const createProduct = async (req, res) => {
    try {
        const { name, price, description, img, condition } = req.body;
        const user = req.user;

        if (!name || !price || !description) {
            return res.status(400).json({ error: "Please fill all required fields" });
        }

        let imgUrl = null;
        if (img) {
            const uploadedResponse = await cloudinary.v2.uploader.upload(img);
            imgUrl = uploadedResponse.secure_url;
        }

        const newProduct = new Product({
            user: user._id,
            university: user.university,
            name,
            price,
            description,
            img: imgUrl,
            condition,
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        console.error("Error in createProduct:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getProducts = async (req, res) => {
    try {
        const user = req.user;
        const products = await Product.find({ university: user.university })
            .sort({ createdAt: -1 })
            .populate("user", "-password");

        res.status(200).json(products);
    } catch (error) {
        console.error("Error in getProducts:", error);
        res.status(500).json({ error: "Server error" });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Allow deletion if user is the owner OR an admin from the same university
        if (product.user.toString() !== req.user._id.toString()) {
            if (req.user.role === 'admin' && req.user.university === product.university) {
                // Admin allowed
            } else if (req.user.role === 'superadmin') {
                // Superadmin allowed
            } else {
                return res.status(401).json({ error: "You are not authorized to delete this product" });
            }
        }

        if (product.img) {
            const imgId = product.img.split("/").pop().split(".")[0];
            await cloudinary.v2.uploader.destroy(imgId);
        }

        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error in deleteProduct:", error);
        res.status(500).json({ error: "Server error" });
    }
};
