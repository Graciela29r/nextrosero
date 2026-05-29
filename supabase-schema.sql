-- Borramos la tabla vieja por si acaso para no tener conflictos
DROP TABLE IF EXISTS gallery_images;

-- Creamos la tabla con el nombre EXACTO y todos los campos que pide tu Next.js
CREATE TABLE gallery_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    blob_url TEXT NOT NULL, -- ¡Esta no puede faltar!
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índice para búsqueda por título (optimiza tu filtro 'ilike' de la API)
CREATE INDEX IF NOT EXISTS idx_gallery_images_title ON gallery_images USING btree (title);

-- Políticas de seguridad (RLS) para 'gallery_images'
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Permitir todas las operaciones de forma pública
CREATE POLICY "Allow public select" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON gallery_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON gallery_images FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON gallery_images FOR DELETE USING (true);