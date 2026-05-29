import { NextRequest, NextResponse } from "next/server";
import { getImageById, updateImage, deleteImage } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const image = await getImageById(id);
    if (!image) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(image);
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json(
      { error: "Error al obtener la imagen" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, image_url } = body;

    const image = await updateImage(id, {
      title,
      description,
      image_url,
    });

    if (!image) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error("Error updating image:", error);
    return NextResponse.json(
      { error: "Error al actualizar la imagen" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteImage(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Imagen eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Error al eliminar la imagen" },
      { status: 500 }
    );
  }
}