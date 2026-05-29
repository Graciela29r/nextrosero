import { sql } from "@vercel/postgres";
import { GalleryImage, CreateImageDTO, UpdateImageDTO } from "./types";

// In-memory fallback for local development when PostgreSQL is not configured
const isLocalDev = () => !process.env.POSTGRES_URL;

// In-memory store
class LocalStore {
  private images: GalleryImage[] = [];

  async createTable() {
    // no-op
  }

  async getAll(search?: string): Promise<GalleryImage[]> {
    let result = [...this.images].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    if (search && search.trim()) {
      const term = search.toLowerCase().trim();
      result = result.filter(img => img.title.toLowerCase().includes(term));
    }
    return result;
  }

  async getById(id: string): Promise<GalleryImage | null> {
    return this.images.find(img => img.id === id) || null;
  }

  async create(data: CreateImageDTO): Promise<GalleryImage> {
    const image: GalleryImage = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description || '',
      image_url: data.image_url,
      created_at: new Date().toISOString(),
    };
    this.images.push(image);
    return image;
  }

  async update(id: string, data: UpdateImageDTO): Promise<GalleryImage | null> {
    const index = this.images.findIndex(img => img.id === id);
    if (index === -1) return null;
    const existing = this.images[index];
    const updated: GalleryImage = {
      ...existing,
      title: data.title ?? existing.title,
      description: data.description ?? existing.description,
      image_url: data.image_url ?? existing.image_url,
    };
    this.images[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.images.findIndex(img => img.id === id);
    if (index === -1) return false;
    this.images.splice(index, 1);
    return true;
  }
}

const localStore = new LocalStore();

export async function createImagesTable() {
  if (isLocalDev()) return localStore.createTable();
  await sql`
    CREATE TABLE IF NOT EXISTS gallery_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;
}

export async function getAllImages(search?: string): Promise<GalleryImage[]> {
  if (isLocalDev()) return localStore.getAll(search);
  if (search && search.trim()) {
    const result = await sql<GalleryImage>`
      SELECT * FROM gallery_images 
      WHERE title ILIKE ${'%' + search.trim() + '%'}
      ORDER BY created_at DESC
    `;
    return result.rows;
  }
  const result = await sql<GalleryImage>`
    SELECT * FROM gallery_images 
    ORDER BY created_at DESC
  `;
  return result.rows;
}

export async function getImageById(id: string): Promise<GalleryImage | null> {
  if (isLocalDev()) return localStore.getById(id);
  const result = await sql<GalleryImage>`
    SELECT * FROM gallery_images WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

export async function createImage(data: CreateImageDTO): Promise<GalleryImage> {
  if (isLocalDev()) return localStore.create(data);
  const result = await sql<GalleryImage>`
    INSERT INTO gallery_images (title, description, image_url)
    VALUES (${data.title}, ${data.description}, ${data.image_url})
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateImage(id: string, data: UpdateImageDTO): Promise<GalleryImage | null> {
  if (isLocalDev()) return localStore.update(id, data);
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.image_url !== undefined) {
    fields.push(`image_url = $${paramIndex++}`);
    values.push(data.image_url);
  }

  if (fields.length === 0) return null;

  const query = `
    UPDATE gallery_images 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;
  values.push(id);

  const result = await sql.query<GalleryImage>(query, values);
  return result.rows[0] || null;
}

export async function deleteImage(id: string): Promise<boolean> {
  if (isLocalDev()) return localStore.delete(id);
  const result = await sql`
    DELETE FROM gallery_images WHERE id = ${id}
  `;
  return result.rowCount !== null && result.rowCount > 0;
}