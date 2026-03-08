import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await queries.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    console.log("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get products by current user (protected)
export const getMyProducts = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const products = await queries.getProductsByUserId(userId);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error getting user products:", error);
    res.status(500).json({ error: "Failed to get user products" });
  }
};

// Get single product by ID (public)
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await queries.getProductById(id as string);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ error: "Failed to get product" });
  }
};

// Create new product (protected)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { title, price, description, imageUrl } = req.body;
    if (!title || !description || !imageUrl || !price) {
      res.status(400).json({
        error: "Title, description, imageUrl, and price are required",
      });
      return;
    }
    const product = await queries.createProduct({
      title,
      price,
      description,
      imageUrl,
      userId,
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

// Update product (protected - owner only)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const { title, price, description, imageUrl } = req.body;
    const existingProduct = await queries.getProductById(id as string);
    if (!existingProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    if (existingProduct.userId !== userId) {
      res.status(403).json({ error: "You can only update your own products" });
      return;
    }
    const product = await queries.updateProduct(id as string, {
      title,
      price,
      description,
      imageUrl,
    });
    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// Delete product (protected - owner only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { id } = req.params;
    const existingProduct = await queries.getProductById(id as string);
    if (!existingProduct) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    if (existingProduct.userId !== userId) {
      res.status(403).json({ error: "You can only delete your own products" });
      return;
    }
    await queries.deleteProduct(id as string);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// ─── Like Controllers ─────────────────────────────────────────────────────────

// POST /api/products/:id/like — toggle like (protected)
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { id: productId } = req.params;
    const product = await queries.getProductById(productId as string);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const result = await queries.toggleLike(userId, productId as string);
    // Create notification when liked (not when unliked, and not for your own product)
    if (result.liked && product.userId !== userId) {
      await queries.createNotification({
        recipientId: product.userId,
        actorId: userId,
        type: "like",
        productId: productId as string,
      });
    }
    res.status(200).json(result); // { liked: true } or { liked: false }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "Failed to toggle like" });
  }
};

// GET /api/products/:id/likes — get all likes for a product (public)
export const getProductLikes = async (req: Request, res: Response) => {
  try {
    const { id: productId } = req.params;
    const likes = await queries.getLikesByProductId(productId as string);
    res.status(200).json(likes);
  } catch (error) {
    console.error("Error fetching likes:", error);
    res.status(500).json({ error: "Failed to fetch likes" });
  }
};

// GET /api/products/:id/like/me — check if current user liked a product (protected)
export const getMyLike = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { id: productId } = req.params;
    const like = await queries.getUserLike(userId, productId as string);
    res.status(200).json({ liked: !!like });
  } catch (error) {
    console.error("Error checking like:", error);
    res.status(500).json({ error: "Failed to check like" });
  }
};
