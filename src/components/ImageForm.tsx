"use client";

import { useState, useRef, FormEvent } from "react";
import { FiUpload, FiImage, FiX } from "react-icons/fi";
import { showToast } from "./Toast";

interface ImageFormProps {
  initialData?: {
    title: string;
    description: string;
    image_url: string;
  };
  onSubmit: (data: { title: string; description: string; image_url: string }) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function ImageForm({ initialData, onSubmit, onCancel, isEditing }: ImageFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [imageUrl, setImageUrl] = useState(initialData?.image_url || "");
  const [preview, setPreview] = useState(initialData?.image_url || "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("El archivo debe ser una imagen", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("La imagen no puede superar los 10MB", "error");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al subir la imagen");
      }

      const data = await res.json();
      setImageUrl(data.url);
      setPreview(data.url);
      showToast("Imagen subida correctamente", "success");
    } catch (error: any) {
      showToast(error.message || "Error al subir la imagen", "error");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl("");
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("El título es requerido", "error");
      return;
    }

    if (!imageUrl) {
      showToast("Debes seleccionar una imagen", "error");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), image_url: imageUrl });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Imagen
        </label>
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-gray-700"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition"
            >
              <FiX size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 transition cursor-pointer bg-gray-800/50 hover:bg-gray-800"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-400">Subiendo...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FiUpload size={32} className="text-gray-400" />
                <span className="text-sm text-gray-400">
                  Haz clic para seleccionar una imagen
                </span>
                <span className="text-xs text-gray-500">
                  PNG, JPG, WEBP (max 10MB)
                </span>
              </div>
            )}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ingresa el título de la imagen"
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ingresa una descripción"
          rows={3}
          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {isEditing ? "Actualizando..." : "Creando..."}
            </>
          ) : (
            <>{isEditing ? "Actualizar" : "Crear"} Imagen</>
          )}
        </button>
      </div>
    </form>
  );
}