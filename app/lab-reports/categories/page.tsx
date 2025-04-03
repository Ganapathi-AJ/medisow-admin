"use client";

import { useState, useEffect } from "react";
import { useFirebase } from "../../context/firebase-context";
import { DocumentData } from "firebase/firestore";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LabReportCategoriesPage() {
  const { getCategories, createCategory, updateCategory, deleteCategory, uploadImage } = useFirebase();
  
  const [categories, setCategories] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", image_url: "" });
  const [editingCategory, setEditingCategory] = useState<DocumentData | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await getCategories("labReport");
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setUploadingImage(true);
      const downloadUrl = await uploadImage(file, "categories");
      
      if (isEdit && editingCategory) {
        setEditingCategory({ ...editingCategory, image_url: downloadUrl });
      } else {
        setNewCategory({ ...newCategory, image_url: downloadUrl });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleAddCategory = async () => {
    try {
      await createCategory("labReport", newCategory);
      setNewCategory({ name: "", image_url: "" });
      setShowAddModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };
  
  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    try {
      await updateCategory("labReport", editingCategory.id, {
        name: editingCategory.name,
        image_url: editingCategory.image_url
      });
      setEditingCategory(null);
      setShowEditModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };
  
  const handleDeleteCategory = async (id: string) => {
    if (confirmDelete === id) {
      try {
        await deleteCategory("labReport", id);
        setCategories(categories.filter(category => category.id !== id));
        setConfirmDelete(null);
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    } else {
      setConfirmDelete(id);
    }
  };
  
  const filteredCategories = categories.filter(category => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return category.name.toLowerCase().includes(lowerCaseQuery);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lab Report Categories</h1>
          <p className="text-muted-foreground">
            Manage lab report categories in your application
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </button>
      </div>

      <div className="flex items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full rounded-md border border-input bg-background pl-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div key={category.id} className="rounded-lg border bg-card overflow-hidden">
                <div className="h-48 bg-muted relative">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{category.name}</h3>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/lab-reports/list?categoryId=${category.id}`}
                      className="flex-1 inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground"
                    >
                      View Lab Reports
                    </Link>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCategory(category);
                        setShowEditModal(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className={`flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium ${
                        confirmDelete === category.id
                          ? "bg-destructive text-destructive-foreground"
                          : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {confirmDelete === category.id ? "Confirm" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 lg:col-span-3 h-64 flex items-center justify-center border rounded-lg">
              <div className="text-center">
                <p className="text-muted-foreground">No categories found.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Lab Report Category</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Category Name*
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium mb-1">
                  Category Image
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() => document.getElementById("image")?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                  >
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </button>
                  {newCategory.image_url && (
                    <div className="w-16 h-16 rounded overflow-hidden">
                      <img
                        src={newCategory.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewCategory({ name: "", image_url: "" });
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory.name || uploadingImage}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Lab Report Category</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
                  Category Name*
                </label>
                <input
                  id="edit-name"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({ ...editingCategory, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="edit-image" className="block text-sm font-medium mb-1">
                  Category Image
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="edit-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, true)}
                  />
                  <button
                    onClick={() => document.getElementById("edit-image")?.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                  >
                    {uploadingImage ? "Uploading..." : "Change Image"}
                  </button>
                  {editingCategory.image_url && (
                    <div className="w-16 h-16 rounded overflow-hidden">
                      <img
                        src={editingCategory.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCategory(null);
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  disabled={!editingCategory.name || uploadingImage}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Update Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 