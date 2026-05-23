export interface Service {
  id: string;
  name: string;
  category: "hair" | "bridal" | "skin" | "beauty";
  price: string;
  description: string;
  duration: string;
  features: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  subText?: string;
  date: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: "Hair Styles" | "Bridal Saree & Dress" | "Flawless Makeup" | "Salon Interior" | "Skin Treatments";
  image: string;
}

export interface AppointmentInput {
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  notes: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}
