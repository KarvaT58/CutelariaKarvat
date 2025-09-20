export type Item = {
  id: string;
  title: string;
  description: string;
  price_cents: number;
  image_path: string; // Keep for backward compatibility
  image_paths: string[]; // New field for multiple images
  whatsapp_message?: string; // Custom WhatsApp message for this item
  published: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Settings = {
  id: string;
  whatsapp_number: string;
  whatsapp_message: string;
  updated_at: string;
};

export type ItemWithImageUrl = Item & {
  image_url: string; // Keep for backward compatibility
  image_urls: string[]; // New field for multiple image URLs
};
