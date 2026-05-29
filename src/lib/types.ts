export interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

export type CreateImageDTO = {
  title: string;
  description: string;
  image_url: string;
};

export type UpdateImageDTO = {
  title?: string;
  description?: string;
  image_url?: string;
};