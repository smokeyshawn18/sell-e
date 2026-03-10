// src/types/index.ts

export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// src/types/index.ts

export interface ProductWithRelations extends Product {
  user: Pick<User, "name" | "imageUrl">;
  comments?: CommentWithUser[];
}

export interface UserSync {
  email: string | undefined;
  name: string | null;
  imageUrl: string | null;
}

export interface User {
  id: string | undefined;
  email: string | undefined;
  name: string | null;
  imageUrl: string | undefined;
  createdAt: Date | undefined;
  updatedAt: Date | undefined;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  productId: string;
  parentId: string | null;
  createdAt: Date;
}

export interface CommentWithUser extends Comment {
  user: Pick<User, "name" | "imageUrl">;
  replies?: CommentWithUser[];
}

export interface Like {
  id: string;
  userId: string;
  productId: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  recipientId: string;
  actorId: string;
  type: "like" | "comment" | "reply";
  isRead: boolean;
  productId: string | null;
  commentId: string | null;
  createdAt: Date;
  actor: Pick<User, "name" | "imageUrl">;
  product: Pick<Product, "id" | "title"> | null;
}
