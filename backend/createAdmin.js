
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./models/user.model.js";

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const adminEmail = "admin@campusbuzzz.com";
        const password = "adminpassword";

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("Admin account already exists.");
            console.log(`Email: ${adminEmail}`);
            // If you want to reset password you could do it here, but for now just notifying is enough.
            // But if the user doesn't know the password, maybe I should reset it?
            // Let's just create if not exists, or update if exists to ensure known password.

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            existingAdmin.password = hashedPassword;
            existingAdmin.role = "superadmin"; // Ensure they are superadmin
            existingAdmin.isVerified = true;
            await existingAdmin.save();
            console.log("Admin password reset to 'adminpassword'");
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newAdmin = new User({
                username: "admin_user",
                fullName: "Super Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "superadmin",
                university: "Air University", // Default for seed
                isVerified: true
            });

            await newAdmin.save();
            console.log("Admin account created successfully.");
        }

        console.log("Credentials:");
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${password}`);

        process.exit(0);
    } catch (error) {
        console.error("Error creating admin:", error);
        process.exit(1);
    }
};

createAdmin();
