import express from 'express';
import cors from 'cors';
import  authRoutes from './routes/auth.routes.js';
import UserRoutes from './routes/user.routes.js';
import postRoutes from './routes/post.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import dotenv from 'dotenv';
import connectMongoDB from './db/connectMongoDB.js.js';
import cookieParser from 'cookie-parser';


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({limit:"5mb"}));   // limit shouldn't be to large as it makes it more susceptible to DOS attack
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use("/api/auth", authRoutes);
app.use("/api/user", UserRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
// console.log(process.env.PORT)


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectMongoDB();
});