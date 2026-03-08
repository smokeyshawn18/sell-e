import type { Request, Response } from "express";
import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

// Create comment (protected)
export const createComment = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { productId } = req.params;
    const { content } = req.body;
    if (!content)
      return res.status(400).json({ error: "Comment content is required" });
    // verify product exists
    const product = await queries.getProductById(productId as string);
    if (!product) return res.status(404).json({ error: "Product not found" });
    const comment = await queries.createComment({
      content,
      userId,
      productId: productId as string,
    });
    // Notify product owner (not if commenting on your own product)
    if (product.userId !== userId) {
      await queries.createNotification({
        recipientId: product.userId,
        actorId: userId,
        type: "comment",
        productId: productId as string,
        commentId: comment.id,
      });
    }
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
};

// Create reply to a comment (protected)
export const createReply = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { productId, commentId: parentId } = req.params;
    const { content } = req.body;
    if (!content)
      return res.status(400).json({ error: "Reply content is required" });
    // verify product exists
    const product = await queries.getProductById(productId as string);
    if (!product) return res.status(404).json({ error: "Product not found" });
    // verify parent comment exists
    const parentComment = await queries.getCommentById(parentId as string);
    if (!parentComment)
      return res.status(404).json({ error: "Comment not found" });
    const reply = await queries.createComment({
      content,
      userId,
      productId: productId as string,
      parentId: parentId as string,
    });
    // Notify parent comment owner (not if replying to your own comment)
    if (parentComment.userId !== userId) {
      await queries.createNotification({
        recipientId: parentComment.userId,
        actorId: userId,
        type: "reply",
        productId: productId as string,
        commentId: reply.id,
      });
    }
    res.status(201).json(reply);
  } catch (error) {
    console.error("Error creating reply:", error);
    res.status(500).json({ error: "Failed to create reply" });
  }
};

// Delete comment (protected - owner only)
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const { commentId } = req.params;
    const existingComment = await queries.getCommentById(commentId as string);
    if (!existingComment)
      return res.status(404).json({ error: "Comment not found" });
    if (existingComment.userId !== userId) {
      return res
        .status(403)
        .json({ error: "You can only delete your own comments" });
    }
    // Cascades to all replies automatically via onDelete: "cascade"
    await queries.deleteComment(commentId as string);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};
