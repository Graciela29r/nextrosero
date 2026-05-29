"use client";

import { useState } from "react";
import { FiEdit2, FiTrash2, FiImage } from "react-icons/fi";
import { GalleryImage } from "@/lib/types";
import { showToast } from "./Toast";

interface GalleryCardProps {
  image: GalleryImage;
  onEdit: (image: GalleryImage) => void;
  onDelete: (id: string) => void;
}

export default function GalleryCard({ image, onEdit, onDelete }: GalleryCardProps) {
  const [imgError, setImgError] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar "${image.title}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/images/${image.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar");
      showToast("Imagen eliminada correctamente", "success");
      onDelete(image.id);
    } catch (error) {
      showToast("Error al eliminar la imagen", "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-gray-700 transition-all duration-300 flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-800">
        {imgError ? (
          <div className="w-full h-full flex items-center justify-center">
            <FiImage size={48} className="text-gray-600" />
          </div>
        ) : (
          <img
            src={image.image_url}
            alt={image.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        )}
        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => onEdit(image)}
            className="p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition transform hover:scale-110"
            title="Editar"
          >
            <FiEdit2 size={18} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition transform hover:scale-110 disabled:opacity-50"
            title="Eliminar"
          >
            {deleting ? (
              <div className="w-[18px] h-[18px] border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiTrash2 size={18} />
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-white font-semibold text-base truncate mb-1">
          {image.title}
        </h3>
        {image.description && (
          <p className="text-gray-400 text-sm line-clamp-2 flex-1">
            {image.description}
          </p>
        )}
        <p className="text-gray-600 text-xs mt-2">
          {new Date(image.created_at).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}