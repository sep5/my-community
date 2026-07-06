/* ─── Database Types ─── */

export interface User {
  id: string;
  nickname: string;
  avatar: string | null;
  bio: string | null;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
  author?: User;
  images?: PostImage[];
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  order: number;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  author?: User;
}

/* ─── API Response Types ─── */

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/* ─── Form Types ─── */

export interface PostFormValues {
  title: string;
  content: string;
  thumbnail?: File | null;
  images?: File[];
}

export interface AuthFormValues {
  email: string;
  password: string;
}

export interface SignupFormValues extends AuthFormValues {
  nickname: string;
  confirmPassword: string;
}

export interface ProfileFormValues {
  nickname: string;
  bio: string;
  avatar?: File | null;
}
