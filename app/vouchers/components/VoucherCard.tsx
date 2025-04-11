"use client";

import { useState } from "react";
import { Voucher } from "../hooks/useVouchers";
import { Edit, Trash2, ToggleLeft } from "lucide-react";

interface VoucherCardProps {
  voucher: Voucher;
  onEdit: (voucher: Voucher) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export default function VoucherCard({
  voucher,
  onEdit,
  onDelete,
  onToggleActive,
}: VoucherCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    try {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(voucher.id!);
    setIsDeleting(false);
  };

  const handleToggleActive = async () => {
    setIsToggling(true);
    await onToggleActive(voucher.id!, !voucher.isActive);
    setIsToggling(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md shadow-md overflow-hidden flex flex-col">
      <div className="relative h-48 bg-gray-200">
        {voucher.imageUrl ? (
          <img
            src={voucher.imageUrl}
            alt={voucher.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-300 text-gray-500">
            No Image
          </div>
        )}
        <div className="absolute top-2 right-2 flex space-x-1">
          <button
            onClick={() => onEdit(voucher)}
            className="p-1 rounded-full bg-white text-gray-700 hover:bg-gray-200"
            title="Edit voucher"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 rounded-full bg-white text-red-500 hover:bg-gray-200"
            title="Delete voucher"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggleActive}
            disabled={isToggling}
            className={`p-1 rounded-full ${
              voucher.isActive
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-500"
            } hover:opacity-80`}
            title={voucher.isActive ? "Deactivate voucher" : "Activate voucher"}
          >
            <ToggleLeft className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold truncate">{voucher.title}</h3>
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              voucher.isActive
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {voucher.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {voucher.description}
        </p>
        <div className="mt-4 flex justify-between items-center text-sm">
          <span className="font-bold text-indigo-600 dark:text-indigo-400">
            {voucher.creditCost} Credits
          </span>
          {voucher.expiresAt && (
            <span className="text-gray-500 dark:text-gray-400">
              Expires: {formatDate(voucher.expiresAt)}
            </span>
          )}
        </div>
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded flex justify-between items-center">
          <span className="text-xs font-mono overflow-hidden text-ellipsis">
            Code: {voucher.code}
          </span>
          <span className="text-xs text-gray-500">
            Created: {formatDate(voucher.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
} 