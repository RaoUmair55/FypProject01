import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

// Config & DB
import { PORT, FRONTEND_URL } from './config/env.js';
import connectMongoDB from './db/connectMongoDB.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import adminRoutes from './routes/admin.routes.js';
import productRoutes from './routes/product.routes.js';
import eventRoutes from './routes/event.routes.js';
import resourceRoutes from './routes/resource.routes.js';

import { app, server } from "./socket/socket.js";

const __dirname = path.resolve();

// Middleware
app.use(cors({
  origin: [FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "https://campusbuzzz.com"], // Allow env var + local dev + production
  credentials: true,
}));

app.use(express.json({ limit: "5mb" })); // Added JSON parsing with limit
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/resources", resourceRoutes);

// Static assets (if any)
app.use(express.static(path.join(__dirname, "public")));

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectMongoDB();
});
