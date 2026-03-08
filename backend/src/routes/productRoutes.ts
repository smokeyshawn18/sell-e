import { Router } from "express";

import { requireAuth } from "@clerk/express";
import * as productController from "../controllers/productController";

const router = Router();

router.get("/", productController.getAllProducts);

// GET /api/products/my - Get current user's products (protected)
router.get("/my", requireAuth(), productController.getMyProducts);

// GET /api/products/:id - Get single product by ID (public)
router.get("/:id", productController.getProductById);

// POST /api/products - Create new product (protected)
router.post("/", requireAuth(), productController.createProduct);

// PUT /api/products/:id - Update product (protected - owner only)
router.put("/:id", requireAuth(), productController.updateProduct);

// DELETE /api/products/:id - Delete product (protected - owner only)
router.delete("/:id", requireAuth(), productController.deleteProduct);

// Get likes for a product
router.get("/:id/likes", productController.getProductLikes);

// Toggle like for a product
router.post("/:id/like", requireAuth(), productController.toggleLike);

// Get current user's like status for a product
router.get("/:id/like/me", requireAuth(), productController.getMyLike);
export default router;
