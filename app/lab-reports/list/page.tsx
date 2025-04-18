"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useFirebase } from "../../context/firebase-context";
import { DocumentData } from "firebase/firestore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Search, ArrowLeft, Upload, X, Loader2 } from "lucide-react";

interface LabReport {
  id?: string;
  title: string;
  description: string;
  categoryId: string;
  images_url: string[];
  createdAt?: any;
  updatedAt?: any;
}

function LabReportsContent() {
  const {
    getLabReports,
    deleteLabReport,
    createLabReport,
    updateLabReport,
    getCategoryById,
    uploadImage,
  } = useFirebase();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams?.get("categoryId");

  const [labReports, setLabReports] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLabReport, setNewLabReport] = useState<LabReport>({
    title: "",
    description: "",
    categoryId: categoryId || "",
    images_url: []
  });
  const [editingLabReport, setEditingLabReport] = useState<LabReport | null>(null);
  const [parentCategory, setParentCategory] = useState<DocumentData | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (categoryId) {
      fetchParentCategory();
    }
    
    fetchLabReports();
  }, [categoryId]);

  const fetchParentCategory = async () => {
    if (!categoryId) return;
    
    try {
      const category = await getCategoryById("labReport", categoryId);
      if (category) {
        setParentCategory(category);
      }
    } catch (error) {
      console.error("Error fetching parent category:", error);
    }
  };

  const fetchLabReports = async () => {
    try {
      setLoading(true);
      const labReportsData = await getLabReports(categoryId || undefined);
      setLabReports(labReportsData);
    } catch (error) {
      console.error("Error fetching lab reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLabReport = async (id: string) => {
    if (confirmDelete === id) {
      try {
        await deleteLabReport(id);
        setLabReports(labReports.filter(report => report.id !== id));
        setConfirmDelete(null);
      } catch (error) {
        console.error("Error deleting lab report:", error);
      }
    } else {
      setConfirmDelete(id);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImages(true);
      const imageUrls = [];
      const totalFiles = files.length;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const downloadUrl = await uploadImage(file, "labReports");
        imageUrls.push(downloadUrl);
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }
      
      if (isEdit && editingLabReport) {
        setEditingLabReport({
          ...editingLabReport,
          images_url: [...(editingLabReport.images_url || []), ...imageUrls],
        });
      } else {
        setNewLabReport({
          ...newLabReport,
          images_url: [...(newLabReport.images_url || []), ...imageUrls],
        });
      }
    } catch (error) {
      console.error("Error uploading images:", error);
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (url: string, isEdit = false) => {
    if (isEdit && editingLabReport) {
      setEditingLabReport({
        ...editingLabReport,
        images_url: editingLabReport.images_url.filter(imgUrl => imgUrl !== url),
      });
    } else {
      setNewLabReport({
        ...newLabReport,
        images_url: newLabReport.images_url.filter(imgUrl => imgUrl !== url),
      });
    }
  };

  const handleAddLabReport = async () => {
    try {
      await createLabReport(newLabReport);
      setNewLabReport({
        title: "",
        description: "",
        categoryId: categoryId || "",
        images_url: [],
      });
      setShowAddModal(false);
      fetchLabReports();
    } catch (error) {
      console.error("Error adding lab report:", error);
    }
  };

  const handleUpdateLabReport = async () => {
    if (!editingLabReport || !editingLabReport.id) return;
    
    try {
      await updateLabReport(editingLabReport.id, {
        title: editingLabReport.title,
        description: editingLabReport.description,
        categoryId: editingLabReport.categoryId,
        images_url: editingLabReport.images_url || [],
      });
      setEditingLabReport(null);
      fetchLabReports();
    } catch (error) {
      console.error("Error updating lab report:", error);
    }
  };

  const filteredLabReports = labReports.filter(report => {
    if (!searchQuery) return true;
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    return (
      (report.title && report.title.toLowerCase().includes(lowerCaseQuery)) ||
      (report.description && report.description.toLowerCase().includes(lowerCaseQuery))
    );
  });

  const getPageTitle = () => {
    if (parentCategory) {
      return `${parentCategory.name} Lab Reports`;
    } else {
      return "All Lab Reports";
    }
  };

  const getBackLink = () => {
    if (categoryId) {
      return "/lab-reports/categories";
    } else {
      return "/";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href={getBackLink()} className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
          <p className="text-muted-foreground">
            Manage lab reports in your application
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lab Report
        </button>
      </div>

      <div className="flex items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search lab reports..."
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
          {filteredLabReports.length > 0 ? (
            filteredLabReports.map((report) => (
              <div key={report.id} className="rounded-lg border overflow-hidden">
                <div className="h-48 bg-muted relative">
                  {report.images_url && report.images_url.length > 0 ? (
                    <img
                      src={report.images_url[0]}
                      alt={report.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{report.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {report.description || "-"}
                  </p>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => setEditingLabReport(report as LabReport)}
                      className="flex-1 inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteLabReport(report.id)}
                      className={`flex-1 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm ${
                        confirmDelete === report.id
                          ? "bg-destructive text-destructive-foreground"
                          : "border border-input hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {confirmDelete === report.id ? "Confirm" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 lg:col-span-3 h-64 flex items-center justify-center border rounded-lg">
              <div className="text-center">
                <p className="text-muted-foreground">No lab reports found.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Lab Report
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Lab Report Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Add Lab Report</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Report Title*
                </label>
                <input
                  id="title"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newLabReport.title}
                  onChange={(e) => setNewLabReport({ ...newLabReport, title: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
                  Description*
                </label>
                <textarea
                  id="description"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                  value={newLabReport.description}
                  onChange={(e) => setNewLabReport({ ...newLabReport, description: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Images
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {newLabReport.images_url.map((url, index) => (
                    <div key={index} className="relative h-20 bg-muted rounded-md overflow-hidden">
                      <img
                        src={url}
                        alt={`Lab Report ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 bg-background rounded-full p-1 shadow-sm hover:bg-accent"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="relative mt-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e)}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImages}
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground w-full disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                  </button>
                  {uploadingImages && (
                    <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLabReport}
                  disabled={!newLabReport.title || !newLabReport.description || uploadingImages}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Add Lab Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lab Report Modal */}
      {editingLabReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-xl overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Edit Lab Report</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium mb-1">
                  Report Title*
                </label>
                <input
                  id="edit-title"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editingLabReport.title}
                  onChange={(e) =>
                    setEditingLabReport({ ...editingLabReport, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium mb-1">
                  Description*
                </label>
                <textarea
                  id="edit-description"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                  value={editingLabReport.description}
                  onChange={(e) =>
                    setEditingLabReport({ ...editingLabReport, description: e.target.value })
                  }
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Images
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {editingLabReport.images_url && editingLabReport.images_url.length > 0 ? (
                    editingLabReport.images_url.map((url, index) => (
                      <div key={index} className="relative h-20 bg-muted rounded-md overflow-hidden">
                        <img
                          src={url}
                          alt={`Lab Report ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(url, true)}
                          className="absolute top-1 right-1 bg-background rounded-full p-1 shadow-sm hover:bg-accent"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 h-20 flex items-center justify-center bg-muted rounded-md">
                      No images
                    </div>
                  )}
                </div>
                <div className="relative mt-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, true)}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImages}
                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background hover:bg-accent hover:text-accent-foreground w-full disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                  </button>
                  {uploadingImages && (
                    <div className="w-full bg-muted rounded-full h-2.5 mt-2">
                      <div
                        className="bg-primary h-2.5 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEditingLabReport(null)}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateLabReport}
                  disabled={!editingLabReport.title || !editingLabReport.description || uploadingImages}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                >
                  Update Lab Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LabReportsListPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>}>
      <LabReportsContent />
    </Suspense>
  );
} 