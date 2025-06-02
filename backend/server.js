// app.js (your main server file)
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import UserRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js'; // This router will now exclude the /create route
import notificationRoutes from './routes/notification.routes.js';
import dotenv from 'dotenv';
import connectMongoDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';

// --- IMPORTANT: Import the necessary middleware and controller ---
import { upload } from './middlewares/multer.middleware.js'; // Adjust path if needed
import { createPost } from './controllers/post.controller.js'; // Adjust path if needed
import { protectRoute } from './middlewares/protectRoute.js'; // Adjust path if needed
// -------------------------------------------------------------------------

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin:"https://campusbuzzz.com",
  credentials: true,
}));

// ***************************************************************************
// This is the FIX: Define the /api/posts/create route *before* the global JSON parsers.
// This route will be handled by Multer first, before express.json() can interfere.
app.post('/api/posts/create', protectRoute, upload.single("image"), createPost);
// ***************************************************************************


// Now, apply global JSON and URL-encoded body parsers for all *other* routes
// (i.e., routes that primarily expect JSON or URL-encoded form data).
app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public")) // For serving static files
app.use(cookieParser()); // For parsing cookies


// Mount your other API routers
app.use("/api/auth", authRoutes);
app.use("/api/user", UserRoutes);
// IMPORTANT: Ensure your 'postRoutes' router (./routes/post.routes.js)
// no longer includes the 'router.post('/create', ...)' line, as it's now handled
// directly by `app.post` above.
app.use("/api/posts", postRoutes); // This will handle all /api/posts routes *except* /create
app.use("/api/notifications", notificationRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectMongoDB();
});