"use client";

import { useState, useEffect } from "react";
import { UserVoucher } from "../hooks/useVouchers";
import { X } from "lucide-react";

interface UserVouchersModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onFetchUserVouchers: (userId: string) => Promise<UserVoucher[]>;
}

export default function UserVouchersModal({
  userId,
  userName,
  isOpen,
  onClose,
  onFetchUserVouchers,
}: UserVouchersModalProps) {
  const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserVouchers();
    }
  }, [isOpen, userId]);

  const fetchUserVouchers = async () => {
    setLoading(true);
    try {
      const vouchers = await onFetchUserVouchers(userId);
      setUserVouchers(vouchers);
    } catch (error) {
      console.error("Error fetching user vouchers:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    
    try {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">
            Vouchers for {userName || userId}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="py-8 text-center">Loading vouchers...</div>
          ) : userVouchers.length === 0 ? (
            <div className="py-8 text-center">
              This user has not purchased any vouchers yet.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userVouchers.map((voucher) => (
                  <div
                    key={voucher.id}
                    className="border rounded-md overflow-hidden flex"
                  >
                    <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                      {voucher.imageUrl ? (
                        <img
                          src={voucher.imageUrl}
                          alt={voucher.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{voucher.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            voucher.isUsed
                              ? "bg-gray-100 text-gray-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {voucher.isUsed ? "Used" : "Available"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1 mt-1">
                        {voucher.description}
                      </p>
                      <div className="mt-2 text-xs text-gray-500 flex flex-col">
                        <span>Code: {voucher.code}</span>
                        <span>Purchased: {formatDate(voucher.purchasedAt)}</span>
                        {voucher.usedAt && (
                          <span>Used: {formatDate(voucher.usedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 