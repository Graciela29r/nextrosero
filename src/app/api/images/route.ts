import { NextRequest, NextResponse } from "next/server";
import { getAllImages, createImage, createImagesTable } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await createImagesTable();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const images = await getAllImages(search);
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Error al obtener las imágenes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await createImagesTable();
    const body = await request.json();
    const { title, description, image_url } = body;

    if (!title || !image_url) {
      return NextResponse.json(
        { error: "Título e imagen son requeridos" },
        { status: 400 }
      );
    }

    const image = await createImage({ title, description: description || "", image_url });
    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("Error creating image:", error);
    return NextResponse.json(
      { error: "Error al crear la imagen" },
      { status: 500 }
    );
  }
}