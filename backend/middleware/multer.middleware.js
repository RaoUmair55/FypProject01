import multer from "multer";
import fs from "fs"; // Import the file system module
import path from "path"; // Import path module for resolving paths

// Define the base directory for temporary uploads
const tempDir = path.resolve("./public/temp"); // Resolve to an absolute path

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Ensure the directory exists before Multer tries to write to it
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true }); // Create directory recursively if it doesn't exist
        }
        cb(null, tempDir); // Pass the resolved temporary directory
    },
    filename: function (req, file, cb) {
        // Using originalname can lead to conflicts if multiple files have the same name.
        // It's safer to use a unique name, e.g., combining timestamp and original extension.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ storage: storage });
