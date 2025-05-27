import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import { uploadOnCloudinary } from "../utills/uploadCloudinary.js";
import { pipeline } from "@xenova/transformers";
import { GoogleGenAI } from '@google/genai';
import dotenv from "dotenv"

dotenv.config()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function main(text) {
  const prompt = `
You are a Roman Urdu translator.
Step 1: Translate the following sentence from Roman Urdu to English.
Step 2: Provide the English translation in a single line without any additional text or formatting.
Step 3: Do not include any Roman Urdu text in your response.
Step 4: Do not include any explanations or additional information.
Step 5: Ensure the translation is accurate and captures the meaning of the original Roman Urdu sentence.
Sentence: "${text}"
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const output = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return output.trim();
}

export const createPost = async (req, res) => {
  try {
    const text = req.body.text;
    const category = req.body.category;
    const localFilePath = req.file?.path;
    const isAnonymous = req.body.isAnonymous;

    
    if (!text || !category) {
      return res.status(400).json({ error: "Text and category are required" });
    }
    
    if (isAnonymous === "true") {
      // Translate text from Roman Urdu to English
      const pipe = await pipeline('sentiment-analysis', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english');
      
      const translatedText = await main(text);
      console.log("Translated Text:", translatedText);

      if (!translatedText) {
        return res.status(400).json({ error: "Translation failed or returned empty result." });
      }

      // Analyze sentiment
      const sentiment = await pipe(translatedText);
      const label = sentiment[0].label;

      if (label === 'NEGATIVE') {
        return res.status(400).json({
          error: "⚠️ Your post contains negative sentiment. Consider rephrasing."
        });
      }
    }

    let imageUrl = '';
    if (localFilePath) {
      const cloudinaryResult = await uploadOnCloudinary(localFilePath);
      imageUrl = cloudinaryResult?.secure_url;
      console.log('Cloudinary result:', cloudinaryResult);
      // Optionally: fs.unlinkSync(localFilePath);
    }

    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const post = await Post.create({
      user: userId,
      text,
      img: imageUrl,
      university: user.university,
      category,
      isAnonymous,
    });

    return res.status(201).json({ message: "Post created successfully", post });

  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id; // Assuming the post ID is passed as a URL parameter
    const userId = req.user._id; // Assuming you have the user ID in req.user

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res.status(403).json({ error: "You are not authorized to delete this post" });
    }
    await Post.findByIdAndDelete(postId);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in delete post controller", error);
    res.status(500).json({ error: "Server error" });
  }
}

export const commentPost = async (req, res) => {
  try {
    const postId = req.params.id; // Assuming the post ID is passed as a URL parameter
    const { text } = req.body; // Assuming the comment text is sent in the request body
    const userId = req.user._id; // Assuming you have the user ID in req.user

    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }
    const post = await Post.findById(postId);


    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    //check if post university and user university are same
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (post.university !== user.university) {
      return res.status(403).json({ error: "You are not authorized to comment on this post" });
    }

    const comment = {
      user: userId,
      text,
    };

    post.comments.push(comment);
    await post.save();

    return res.status(200).json({ message: "Comment added successfully", comment });
  } catch (error) {
    console.error("Error in comment post controller", error);
    res.status(500).json({ error: "Server error" });
  }
}

export const likeUnLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId).populate("user", "university"); // populate post.user
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare university values (assuming it's a string)
    if (String(post.user.university) !== String(user.university)) {
      return res
        .status(403)
        .json({ error: "You are not authorized to like/unlike this post" });
    }

    const alreadyLiked = post.likes.includes(userId);

    if (!alreadyLiked) {
      post.likes.push(userId);
      await user.updateOne({ $addToSet: { likedPosts: postId } });

      await post.save();

      if (String(post.user._id) !== String(userId)) {
        await Notification.create({
          from: userId,
          to: post.user._id,
          type: "like",
        });
      }

      const updatedPost = await Post.findById(postId).populate("user", "university");
      return res.status(200).json(updatedPost);
    } else {
      post.likes = post.likes.filter((id) => String(id) !== String(userId));
      await user.updateOne({ $pull: { likedPosts: postId } });

      await post.save();

      const updatedPost = await Post.findById(postId).populate("user", "university");
      return res.status(200).json(updatedPost);
    }
  } catch (error) {
    console.error("Error in like/unlike post controller", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate({
      path: "user",
      select: "-password",
    })
      .populate({
        path: "comments.user",
        select: "-password -bio -followers -following -link",
      }).limit(limit).skip(skip);
    const totalPosts = await Post.countDocuments();
    if (posts.length === 0) {
      return res.status(200).json({ message: "No posts found" });
    }
    return res.status(200).json({ posts, total: totalPosts });
  } catch (error) {
    console.error("Error in get all posts controller", error);
    res.status(500).json({ error: "Server error" });
  }
}

// Get all posts liked by a user
export const likedPost = async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const total = user.likedPosts.length;

    // Slice likedPosts array for pagination
    const paginatedPostIds = user.likedPosts.slice(skip, skip + limit);

    const likedPosts = await Post.find({ _id: { $in: paginatedPostIds } })
      .populate({
        path: "user",
        select: "-password -bio -followers -following -link", // customize as needed
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ posts: likedPosts, total });
  } catch (error) {
    console.error("Error in get liked posts controller", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getFollowedPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following;

    // Only non-anonymous posts from followed users
    const posts = await Post.find({ user: { $in: following }, isAnonymous: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "user",
        select: "username fullName university"
      })
      .populate({
        path: "comments.user",
        select: "username fullName university"
      });

    const total = await Post.countDocuments({ user: { $in: following }, isAnonymous: false });

    return res.status(200).json({ posts, total });
  } catch (error) {
    console.error("Error in getFollowedPosts controller", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getUserPosts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const skip = (page - 1) * limit;

  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    //where isAnonymous is false
    const posts = await Post.find({ user: user._id, isAnonymous: false })
      .populate("user", "username fullName university")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ user: user._id, isAnonymous: false });

    return res.status(200).json({ posts, total: totalPosts });
  } catch (error) {
    console.error("Error in get user posts controller", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getPostsByCategory = async (req, res) => {
  try {
    const { categorytype } = req.params;
    if (!categorytype) {
      return res.status(400).json({ error: "Category type is required" });
    }
    const allowedCategories = ["Announcement", "Department", "Events", "Other"];

    if (!allowedCategories.includes(categorytype)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const total = await Post.countDocuments({ category: categorytype });

    const posts = await Post.find({ category: categorytype, isAnonymous: false })
      .populate("user", "username fullName university")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ posts, total });
  } catch (error) {
    console.error("Error in get posts by category controller", error);
    res.status(500).json({ error: "Server error" });
  }
};


/*
// sentiment analysist
import express from 'express';
import {pipeline} from "@xenova/transformers";      // pipeline is a fnx that allows us to do the processing

const app = express();
const port = process.env.PORT || 5000

app.use(express.json());        // middleware to process json data
const pipe = await pipeline('sentiment-analysis');

app.get('/', (req, res) => {
    res.send("JOEE")
})

app.post('/', async (req, res) => {
    const result = await(pipe(req.body.text))
    res.json(result)
})

// console.log(await pipe("u suck"))

app.listen(port, () => {
    console.log(`server listening on http://localhost:${port}`)
})

*/