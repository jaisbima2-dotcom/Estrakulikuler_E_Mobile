// app/API/Backend/example/db.ts
/**
 * Example Database Layer
 * 
 * This is a template showing best practices for connecting to Supabase
 * Copy this pattern when creating new features
 */

import { supabaseAdmin } from "@/library/SupabaseClient";

/**
 * Example: Get all items
 */
export async function getAllItems() {
  try {
    const { data, error } = await supabaseAdmin
      .from("table_name")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Database error:", error.message);
      return { data: null, error };
    }

    console.log("✅ Fetched items:", data?.length);
    return { data, error: null };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { 
      data: null, 
      error: new Error("Database operation failed") 
    };
  }
}

/**
 * Example: Get single item by ID
 */
export async function getItemById(id: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("table_name")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("❌ Database error:", error.message);
      return { data: null, error };
    }

    if (!data) {
      return { 
        data: null, 
        error: new Error("Item not found") 
      };
    }

    console.log("✅ Fetched item:", id);
    return { data, error: null };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { 
      data: null, 
      error: new Error("Database operation failed") 
    };
  }
}

/**
 * Example: Create new item
 */
export async function createItem(payload: any) {
  try {
    // Validation
    if (!payload.name) {
      return { 
        data: null, 
        error: new Error("Name is required") 
      };
    }

    const { data, error } = await supabaseAdmin
      .from("table_name")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("❌ Database error:", error.message);
      return { data: null, error };
    }

    console.log("✅ Created item:", data.id);
    return { data, error: null };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { 
      data: null, 
      error: new Error("Database operation failed") 
    };
  }
}

/**
 * Example: Update item
 */
export async function updateItem(id: string, payload: any) {
  try {
    // Validation
    if (!id) {
      return { 
        data: null, 
        error: new Error("ID is required") 
      };
    }

    const { data, error } = await supabaseAdmin
      .from("table_name")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Database error:", error.message);
      return { data: null, error };
    }

    console.log("✅ Updated item:", id);
    return { data, error: null };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { 
      data: null, 
      error: new Error("Database operation failed") 
    };
  }
}

/**
 * Example: Delete item
 */
export async function deleteItem(id: string) {
  try {
    // Validation
    if (!id) {
      return { 
        data: null, 
        error: new Error("ID is required") 
      };
    }

    const { data, error } = await supabaseAdmin
      .from("table_name")
      .delete()
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Database error:", error.message);
      return { data: null, error };
    }

    console.log("✅ Deleted item:", id);
    return { data, error: null };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { 
      data: null, 
      error: new Error("Database operation failed") 
    };
  }
}

/**
 * Example: Query with filters
 */
export async function getItemsByStatus(status: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("table_name")
      .select("*")
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Database error:", error.message);
      return { data: null, error };
    }

    console.log("✅ Fetched items with status:", status);
    return { data, error: null };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { 
      data: null, 
      error: new Error("Database operation failed") 
    };
  }
}

/**
 * Example: Batch operations
 */
export async function createMultipleItems(items: any[]) {
  try {
    // Validation
    if (!Array.isArray(items) || items.length === 0) {
      return { 
        data: null, 
        error: new Error("Items array is required and cannot be empty") 
      };
    }

    const { data, error } = await supabaseAdmin
      .from("table_name")
      .insert(items)
      .select();

    if (error) {
      console.error("❌ Database error:", error.message);
      return { data: null, error };
    }

    console.log("✅ Created items:", data?.length);
    return { data, error: null };
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return { 
      data: null, 
      error: new Error("Database operation failed") 
    };
  }
}
