// app/API/Backend/example/route.ts
/**
 * Example API Route
 * 
 * This is a template showing best practices for Next.js API routes
 * Copy this pattern when creating new API endpoints
 * 
 * Available endpoints:
 * - GET /API/Backend/example
 * - POST /API/Backend/example
 * - PUT /API/Backend/example/[id]
 * - DELETE /API/Backend/example/[id]
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
} from "./db";

/**
 * GET endpoint - Fetch items
 */
export async function GET(request: NextRequest) {
  try {
    // Optional: Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    // If ID provided, fetch single item
    if (id) {
      const { data, error } = await getItemById(id);

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: true, data },
        { status: 200 }
      );
    }

    // Otherwise fetch all items
    const { data, error } = await getAllItems();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ GET /API/Backend/example error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint - Create item
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    const { data, error } = await createItem(body);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ POST /API/Backend/example error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT endpoint - Update item
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    // Validation
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    const { data, error } = await updateItem(id, body);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ PUT /API/Backend/example error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE endpoint - Delete item
 */
export async function DELETE(request: NextRequest) {
  try {
    // Extract ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    // Validation
    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await deleteItem(id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ DELETE /API/Backend/example error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
