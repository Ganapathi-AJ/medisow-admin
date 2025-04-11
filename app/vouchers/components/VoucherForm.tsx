"use client";

import { useState, useEffect } from "react";
import { useVouchers, Voucher } from "../hooks/useVouchers";
import { useToast } from "@/app/components/ui/use-toast";
import Image from "next/image";

interface VoucherFormProps {
  voucher?: Voucher;
  onSuccess?: () => void;
  mode: "add" | "edit";
}

export default function VoucherForm({ voucher, onSuccess, mode }: VoucherFormProps) {
  const { addVoucher, updateVoucher, generateVoucherCode, error: voucherError } = useVouchers();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Voucher, 'id' | 'createdAt'>>({
    title: "",
    description: "",
    imageUrl: "",
    creditCost: 0,
    code: "",
    isActive: true,
    expiresAt: null
  });

  // Initialize form when editing
  useEffect(() => {
    if (mode === "edit" && voucher) {
      setFormData({
        title: voucher.title,
        description: voucher.description,
        imageUrl: voucher.imageUrl,
        creditCost: voucher.creditCost,
        code: voucher.code,
        isActive: voucher.isActive,
        expiresAt: voucher.expiresAt ? new Date(voucher.expiresAt.seconds * 1000) : null
      });
      setImagePreview(voucher.imageUrl);
    } else {
      // Don't auto-generate code for new vouchers
      setFormData(prev => ({
        ...prev,
        code: ""
      }));
    }
  }, [voucher, mode]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: isChecked }));
    } else if (name === 'creditCost') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (value) {
      setFormData(prev => ({ 
        ...prev, 
        expiresAt: new Date(value) 
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        expiresAt: null 
      }));
    }
  };

  // Generate new code button
  const handleGenerateCode = () => {
    setFormData(prev => ({
      ...prev,
      code: generateVoucherCode()
    }));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let success = false;
      
      if (mode === "add") {
        success = await addVoucher(formData, imageFile || undefined);
      } else if (mode === "edit" && voucher?.id) {
        success = await updateVoucher(voucher.id, formData, imageFile || undefined);
      }

      if (success) {
        toast({
          title: `Voucher ${mode === "add" ? "created" : "updated"} successfully`,
          variant: "default",
        });
        
        if (onSuccess) {
          // Close the form and trigger a refresh in parent component
          onSuccess();
        }
        
        // Reset form if adding
        if (mode === "add") {
          setFormData({
            title: "",
            description: "",
            imageUrl: "",
            creditCost: 0,
            code: "",
            isActive: true,
            expiresAt: null
          });
          setImageFile(null);
          setImagePreview(null);
        }
      } else if (voucherError) {
        setError(voucherError);
      }
    } catch (error) {
      console.error("Error saving voucher:", error);
      toast({
        title: "Error saving voucher",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder="Gift Card Voucher"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              required
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder="Redeem at any store"
            />
          </div>

          {/* Credit Cost */}
          <div>
            <label htmlFor="creditCost" className="block text-sm font-medium">
              Credit Cost
            </label>
            <input
              id="creditCost"
              name="creditCost"
              type="number"
              required
              min="0"
              value={formData.creditCost}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              placeholder="1000"
            />
          </div>

          {/* Voucher Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium">
              Voucher Code
            </label>
            <div className="flex">
              <input
                id="code"
                name="code"
                type="text"
                required
                value={formData.code}
                onChange={handleChange}
                className="mt-1 block w-full rounded-l-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                placeholder="Enter code or generate one"
              />
              <button
                type="button"
                onClick={handleGenerateCode}
                className="mt-1 inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                Generate
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Enter a unique code or click Generate to create one automatically
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          {/* Expiration Date */}
          <div>
            <label htmlFor="expiresAt" className="block text-sm font-medium">
              Expiration Date (Optional)
            </label>
            <input
              id="expiresAt"
              name="expiresAt"
              type="date"
              value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().split('T')[0] : ''}
              onChange={handleDateChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium">
              Voucher Image
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Upload a voucher image (JPG, PNG, GIF)
            </p>
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mt-4">
              <p className="block text-sm font-medium">Image Preview</p>
              <div className="mt-1 overflow-hidden rounded-md border border-gray-300">
                <img
                  src={imagePreview}
                  alt="Voucher Preview"
                  className="h-64 w-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Form Submission */}
          <div className="pt-5">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onSuccess}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`ml-3 inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  loading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                }`}
              >
                {loading ? (
                  "Saving..."
                ) : mode === "add" ? (
                  "Create Voucher"
                ) : (
                  "Update Voucher"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
} 