import { db } from "./index";
import { eq, and, desc, isNull } from "drizzle-orm";
import {
  users,
  comments,
  products,
  likes,
  notifications,
  type NewUser,
  type NewComment,
  type NewProduct,
  type NewLike,
  type NewNotification,
} from "./schema";

// ─── USER QUERIES ─────────────────────────────────────────────────────────────

export const createUser = async (data: NewUser) => {
  const [user] = await db.insert(users).values(data).returning();
  return user;
};

export const getUserById = async (id: string) => {
  return db.query.users.findFirst({ where: eq(users.id, id) });
};

export const updateUser = async (id: string, data: Partial<NewUser>) => {
  const existingUser = await getUserById(id);
  if (!existingUser) {
    throw new Error(`User with id ${id} not found`);
  }
  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, id))
    .returning();
  return user;
};

// upsert => create or update
export const upsertUser = async (data: NewUser) => {
  const [user] = await db
    .insert(users)
    .values(data)
    .onConflictDoUpdate({
      target: users.id,
      set: data,
    })
    .returning();
  return user;
};

// ─── PRODUCT QUERIES ──────────────────────────────────────────────────────────

export const createProduct = async (data: NewProduct) => {
  const [product] = await db.insert(products).values(data).returning();
  return product;
};

export const getAllProducts = async () => {
  return db.query.products.findMany({
    with: { user: true },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
};

export const getProductById = async (id: string) => {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      user: true,
      likes: true,
      comments: {
        where: isNull(comments.parentId), // only top-level comments
        with: {
          user: true,
          replies: {
            with: { user: true },
            orderBy: (comments, { asc }) => [asc(comments.createdAt)],
          },
        },
        orderBy: (comments, { desc }) => [desc(comments.createdAt)],
      },
    },
  });
};

export const getProductsByUserId = async (userId: string) => {
  return db.query.products.findMany({
    where: eq(products.userId, userId),
    with: { user: true },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  });
};

export const updateProduct = async (id: string, data: Partial<NewProduct>) => {
  const existingProduct = await getProductById(id);
  if (!existingProduct) {
    throw new Error(`Product with id ${id} not found`);
  }
  const [product] = await db
    .update(products)
    .set(data)
    .where(eq(products.id, id))
    .returning();
  return product;
};

export const deleteProduct = async (id: string) => {
  const existingProduct = await getProductById(id);
  if (!existingProduct) {
    throw new Error(`Product with id ${id} not found`);
  }
  const [product] = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();
  return product;
};

// ─── COMMENT QUERIES ──────────────────────────────────────────────────────────

export const createComment = async (data: NewComment) => {
  const [comment] = await db.insert(comments).values(data).returning();
  return comment;
};

export const getCommentById = async (id: string) => {
  return db.query.comments.findFirst({
    where: eq(comments.id, id),
    with: {
      user: true,
      replies: {
        with: { user: true },
        orderBy: (comments, { asc }) => [asc(comments.createdAt)],
      },
    },
  });
};

export const deleteComment = async (id: string) => {
  const existingComment = await getCommentById(id);
  if (!existingComment) {
    throw new Error(`Comment with id ${id} not found`);
  }
  // Cascades to replies automatically via onDelete: "cascade"
  const [comment] = await db
    .delete(comments)
    .where(eq(comments.id, id))
    .returning();
  return comment;
};

// Reply to a comment (creates a comment with parentId set)
export const createReply = async (data: NewComment & { parentId: string }) => {
  const parentComment = await getCommentById(data.parentId);
  if (!parentComment) {
    throw new Error(`Parent comment with id ${data.parentId} not found`);
  }
  const [reply] = await db.insert(comments).values(data).returning();
  return reply;
};

// ─── LIKE QUERIES ─────────────────────────────────────────────────────────────

// Returns the new like, or null if user already liked the product
export const likeProduct = async (data: NewLike) => {
  const [like] = await db
    .insert(likes)
    .values(data)
    .onConflictDoNothing() // unique constraint handles duplicates gracefully
    .returning();
  return like ?? null; // null means already liked
};

export const unlikeProduct = async (userId: string, productId: string) => {
  const [like] = await db
    .delete(likes)
    .where(and(eq(likes.userId, userId), eq(likes.productId, productId)))
    .returning();
  return like ?? null; // null means like didn't exist
};

// Check if a specific user has liked a specific product
export const getUserLike = async (userId: string, productId: string) => {
  return db.query.likes.findFirst({
    where: and(eq(likes.userId, userId), eq(likes.productId, productId)),
  });
};

// Get all likes for a product (with user info)
export const getLikesByProductId = async (productId: string) => {
  return db.query.likes.findMany({
    where: eq(likes.productId, productId),
    with: { user: true },
  });
};

// Toggle like — returns { liked: true } if liked, { liked: false } if unliked
export const toggleLike = async (userId: string, productId: string) => {
  const existing = await getUserLike(userId, productId);
  if (existing) {
    await unlikeProduct(userId, productId);
    return { liked: false };
  }
  await likeProduct({ userId, productId });
  return { liked: true };
};

// ─── NOTIFICATION QUERIES ─────────────────────────────────────────────────────

export const createNotification = async (data: NewNotification) => {
  const [notification] = await db
    .insert(notifications)
    .values(data)
    .returning();
  return notification;
};

// Get all notifications for a user, most recent first
export const getNotificationsByUserId = async (userId: string) => {
  return db.query.notifications.findMany({
    where: eq(notifications.recipientId, userId),
    with: {
      actor: true, // who triggered the notification
      product: true, // related product (if any)
      comment: true, // related comment (if any)
    },
    orderBy: [desc(notifications.createdAt)],
  });
};

// Get only unread notifications for a user
export const getUnreadNotifications = async (userId: string) => {
  return db.query.notifications.findMany({
    where: and(
      eq(notifications.recipientId, userId),
      eq(notifications.isRead, false),
    ),
    with: { actor: true, product: true, comment: true },
    orderBy: [desc(notifications.createdAt)],
  });
};

// Count unread notifications (useful for badge in UI)
export const getUnreadNotificationCount = async (userId: string) => {
  const unread = await getUnreadNotifications(userId);
  return unread.length;
};

// Mark a single notification as read
export const markNotificationAsRead = async (id: string) => {
  const [notification] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id))
    .returning();
  return notification;
};

// Mark ALL notifications for a user as read
export const markAllNotificationsAsRead = async (userId: string) => {
  return db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.recipientId, userId),
        eq(notifications.isRead, false),
      ),
    )
    .returning();
};

export const deleteNotification = async (id: string) => {
  const [notification] = await db
    .delete(notifications)
    .where(eq(notifications.id, id))
    .returning();
  return notification;
};
