import type { Product, UserSync } from "../types";
import api from "./axios";

// ─── Users API ────────────────────────────────────────────────────────────────

export const syncUser = async (userData: UserSync) => {
  const { data } = await api.post("/users/sync", userData);
  return data;
};

// ─── Products API ─────────────────────────────────────────────────────────────

export const getAllProducts = async () => {
  const { data } = await api.get("/products");
  return data;
};

export const getProductById = async (id: string) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const getMyProducts = async () => {
  const { data } = await api.get("/products/my");
  return data;
};

export const createProduct = async (productData: Product) => {
  const { data } = await api.post("/products", productData);
  return data;
};

export const updateProduct = async ({ id, ...productData }: Product) => {
  const { data } = await api.put(`/products/${id}`, productData);
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await api.delete(`/products/${id}`);
  return data;
};

// ─── Comments API ─────────────────────────────────────────────────────────────

export const createComment = async ({
  productId,
  content,
}: {
  productId: string;
  content: string;
}) => {
  const { data } = await api.post(`/comments/${productId}`, { content });
  return data;
};

export const createReply = async ({
  productId,
  commentId,
  content,
}: {
  productId: string;
  commentId: string;
  content: string;
}) => {
  const { data } = await api.post(`/comments/${productId}/reply/${commentId}`, {
    content,
  });
  return data;
};

export const deleteComment = async ({ commentId }: { commentId: string }) => {
  const { data } = await api.delete(`/comments/${commentId}`);
  return data;
};

// ─── Likes API ────────────────────────────────────────────────────────────────

// Toggle like on a product — returns { liked: true } or { liked: false }
export const toggleLike = async (productId: string) => {
  const { data } = await api.post(`/products/${productId}/like`);
  return data;
};

// Get all likes for a product
export const getProductLikes = async (productId: string) => {
  const { data } = await api.get(`/products/${productId}/likes`);
  return data;
};

// Check if current user liked a product — returns { liked: true/false }
export const getMyLike = async (productId: string) => {
  const { data } = await api.get(`/products/${productId}/like/me`);
  return data;
};

// ─── Notifications API ────────────────────────────────────────────────────────

// Get all notifications for logged-in user
export const getAllNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data;
};

// Get unread notification count for bell badge
export const getUnreadCount = async () => {
  const { data } = await api.get("/notifications/unread");
  return data; // { count: number }
};

// Mark a single notification as read
export const markAsRead = async (id: string) => {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const { data } = await api.patch("/notifications/read-all");
  return data;
};

// Delete a notification
export const deleteNotification = async (id: string) => {
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};
