import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { createProduct, getProducts, deleteProduct } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getProducts);
router.post("/create", protectRoute, createProduct);
router.delete("/:id", protectRoute, deleteProduct);

export default router;
