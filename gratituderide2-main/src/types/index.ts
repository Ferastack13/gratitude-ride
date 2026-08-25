export type UserRole = "client" | "rider" | "admin";

export type DeliveryStatus =
  | "pending"
  | "accepted"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "cancelled";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  referral_code: string;
  total_deliveries: number;
  rating: number;
}

export interface Rider {
  id: string;
  user_id: string;
  vehicle_type: string;
  license_number: string;
  is_verified: boolean;
  is_available: boolean;
  rating: number;
  total_deliveries: number;
  earnings: number;
}

export interface Delivery {
  id: string;
  tracking_id: string;
  client_id: string;
  rider_id?: string;
  pickup_address: string;
  delivery_address: string;
  status: DeliveryStatus;
  package_description: string;
  package_weight?: number;
  estimated_fee: number;
  actual_fee?: number;
  city: string;
  created_at: string;
  updated_at: string;
  estimated_delivery?: string;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  is_default: boolean;
}

export interface Review {
  id: string;
  delivery_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "delivery";
  is_read: boolean;
  created_at: string;
}

export interface PricingTier {
  id: string;
  name: string;
  description: string;
  base_price: number;
  per_km: number;
  features: string[];
  is_popular?: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar: string;
  rating: number;
  content: string;
  city: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image: string;
  author: string;
  published_at: string;
  category: string;
  read_time: number;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  starting_price: number;
}
