import { Router } from "express";
import {
  getAllProducts,
  getMyLike,
  getProductLikes,
  toggleLike,
} from "../controllers/productController";

const router = Router();

// Get /api/products route which retrieves all products
router.get("/", getAllProducts);

// Get likes for a product
router.get("/:id/likes", getProductLikes);

// Toggle like for a product
router.post("/:id/like", toggleLike);

// Get current user's like status for a product
router.get("/:id/like/me", getMyLike);
export default router;
