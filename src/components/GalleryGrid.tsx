"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { FiSearch, FiPlus, FiImage } from "react-icons/fi";
import { GalleryImage } from "@/lib/types";
import GalleryCard from "./GalleryCard";
import Modal from "./Modal";
import ImageForm from "./ImageForm";
import { showToast } from "./Toast";

export default function GalleryGrid() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchImages = useCallback(async (searchTerm?: string) => {
    try {
      setLoading(true);
      const url = searchTerm
        ? `/api/images?search=${encodeURIComponent(searchTerm)}`
        : "/api/images";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al cargar imágenes");
      const data = await res.json();
      setImages(data);
    } catch (error) {
      showToast("Error al cargar las imágenes", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Debounce search
  useEffect(() => {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  useEffect(() => {
    fetchImages(debouncedSearch || undefined);
  }, [debouncedSearch, fetchImages]);

  const handleCreate = async (data: { title: string; description: string; image_url: string }) => {
    try {
      const res = await fetch("/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al crear");
      showToast("Imagen creada correctamente", "success");
      setShowCreateModal(false);
      fetchImages(debouncedSearch || undefined);
    } catch (error) {
      showToast("Error al crear la imagen", "error");
    }
  };

  const handleEdit = useCallback((image: GalleryImage) => {
    setEditingImage(image);
  }, []);

  const handleUpdate = async (data: { title: string; description: string; image_url: string }) => {
    if (!editingImage) return;
    try {
      const res = await fetch(`/api/images/${editingImage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      showToast("Imagen actualizada correctamente", "success");
      setEditingImage(null);
      fetchImages(debouncedSearch || undefined);
    } catch (error) {
      showToast("Error al actualizar la imagen", "error");
    }
  };

  const handleDelete = useCallback(
    (id: string) => {
      setImages((prev) => prev.filter((img) => img.id !== id));
    },
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                NexTrosero
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Galería de imágenes
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-lg shadow-blue-600/25"
            >
              <FiPlus size={18} />
              <span>Nueva Imagen</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative mt-4">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Cargando imágenes...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && images.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FiImage size={64} className="text-gray-700" />
            <div className="text-center">
              <p className="text-gray-400 text-lg">
                {debouncedSearch
                  ? `No se encontraron imágenes para "${debouncedSearch}"`
                  : "No hay imágenes aún"}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-blue-400 hover:text-blue-300 transition font-medium"
              >
                Sube tu primera imagen
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {images.map((image) => (
              <GalleryCard
                key={image.id}
                image={image}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nueva Imagen"
      >
        <ImageForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingImage}
        onClose={() => setEditingImage(null)}
        title="Editar Imagen"
      >
        {editingImage && (
          <ImageForm
            initialData={{
              title: editingImage.title,
              description: editingImage.description,
              image_url: editingImage.image_url,
            }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingImage(null)}
            isEditing
          />
        )}
      </Modal>
    </div>
  );
}