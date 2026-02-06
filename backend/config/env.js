import dotenv from "dotenv";
import path from "path";

// Try loading from default location (CWD)
dotenv.config();

// Also try loading from parent directory (classic monorepo setup) just in case
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
// And explicitly from potential root if we are in backend/
dotenv.config({ path: path.resolve(process.cwd(), '.env') });


export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET || "default_secret_dev";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
