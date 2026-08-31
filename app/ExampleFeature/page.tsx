// app/ExampleFeature/Page.tsx
/**
 * Example Frontend Component
 * 
 * Shows how to connect to backend API from a frontend component
 * This demonstrates the complete flow:
 * 1. Frontend component fetches data
 * 2. Sends request to API route
 * 3. API route calls database layer
 * 4. Database layer queries Supabase
 * 5. Response flows back to frontend
 */

"use client";

import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut, apiDelete, ApiResponse } from "@/lib/apiClient";
import ConnectionTest from "@/components/ConnectionTest";

interface Item {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export default function ExampleFeaturePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch all items
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);

    const response = await apiGet<Item[]>("/API/Backend/example");

    if (response.success && response.data) {
      setItems(response.data);
    } else {
      setError(response.error || "Failed to fetch items");
    }

    setLoading(false);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError(null);

    const response = await apiPost("/API/Backend/example", {
      name: formData.name,
      description: formData.description,
    });

    if (response.success) {
      // Refresh list
      await fetchItems();
      // Clear form
      setFormData({ name: "", description: "" });
    } else {
      setError(response.error || "Failed to create item");
    }

    setLoading(false);
  };

  const handleUpdateItem = async (id: string) => {
    setLoading(true);
    setError(null);

    const response = await apiPut(`/API/Backend/example?id=${id}`, {
      name: formData.name,
      description: formData.description,
    });

    if (response.success) {
      // Refresh list
      await fetchItems();
      // Clear form and editing state
      setFormData({ name: "", description: "" });
      setEditingId(null);
    } else {
      setError(response.error || "Failed to update item");
    }

    setLoading(false);
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    setLoading(true);
    setError(null);

    const response = await apiDelete(`/API/Backend/example?id=${id}`);

    if (response.success) {
      // Refresh list
      await fetchItems();
    } else {
      setError(response.error || "Failed to delete item");
    }

    setLoading(false);
  };

  const startEdit = (item: Item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Example Feature
          </h1>
          <p className="text-gray-600">
            Complete database ↔ backend ↔ frontend integration example
          </p>
        </div>

        {/* Connection Status */}
        <ConnectionTest />

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-red-900 font-semibold">⚠️ Error</p>
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingId ? "Edit Item" : "Create New Item"}
          </h2>

          <form onSubmit={(e) => {
            e.preventDefault();
            editingId ? handleUpdateItem(editingId) : handleCreateItem(e);
          }} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter item name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Description Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter item description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {loading ? "Processing..." : editingId ? "Update Item" : "Create Item"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="px-6 py-2 bg-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-400 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Items List Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Items</h2>
            <button
              onClick={fetchItems}
              disabled={loading}
              className="px-4 py-2 bg-gray-300 text-gray-900 font-medium rounded-lg hover:bg-gray-400 disabled:opacity-50 transition"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {loading && items.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Loading items...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No items yet. Create one to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 mt-1">{item.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Created: {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => startEdit(item)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 disabled:opacity-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 disabled:opacity-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-indigo-900 text-sm">
            <strong>How it works:</strong> When you click "Create Item", your form data is sent to the backend API route
            at <code className="bg-indigo-100 px-2 py-1 rounded">/API/Backend/example</code>, which calls the database
            layer to insert data into Supabase. The response flows back to update the UI.
          </p>
        </div>
      </div>
    </div>
  );
}
