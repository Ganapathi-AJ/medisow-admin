"use client";

import { useState, useEffect } from "react";
import { useVouchers, Voucher, UserVoucher } from "./hooks/useVouchers";
import VoucherForm from "./components/VoucherForm";
import VoucherCard from "./components/VoucherCard";
import UserVouchersModal from "./components/UserVouchersModal";
import { useToast } from "../components/ui/use-toast";
import { Plus, Search, Users, Filter } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function VouchersPage() {
  const { vouchers, loading, error, updateVoucher, deleteVoucher, getUserVouchers, fetchVouchers } = useVouchers();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().displayName || doc.data().name || doc.data().email || "Unknown User"
        }));
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter vouchers based on active tab and search query
  const filteredVouchers = vouchers.filter(voucher => {
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "active" && voucher.isActive) || 
      (activeTab === "inactive" && !voucher.isActive);
    
    const matchesSearch = 
      !searchQuery || 
      voucher.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      voucher.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  // Handle edit voucher
  const handleEditVoucher = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setShowForm(true);
  };

  // Handle delete voucher
  const handleDeleteVoucher = async (id: string) => {
    const success = await deleteVoucher(id);
    if (success) {
      toast({
        title: "Voucher deleted successfully",
        variant: "default",
      });
    }
  };

  // Handle toggle voucher active status
  const handleToggleActive = async (id: string, isActive: boolean) => {
    const success = await updateVoucher(id, { isActive });
    if (success) {
      toast({
        title: `Voucher ${isActive ? "activated" : "deactivated"} successfully`,
        variant: "default",
      });
    }
  };

  // Refresh vouchers list
  const refreshVouchers = () => {
    fetchVouchers();
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setEditingVoucher(null);
    // Refresh vouchers when form is closed
    refreshVouchers();
  };

  // Handle showing user vouchers
  const handleShowUserVouchers = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setUserModalOpen(true);
  };

  return (
    <div className="container mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Voucher Management</h1>
          <p className="text-muted-foreground">
            Create and manage vouchers for users to purchase with credits.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Voucher
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search vouchers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md"
          />
        </div>
        
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "all"
                ? "bg-indigo-100 text-indigo-700 font-medium"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "active"
                ? "bg-green-100 text-green-700 font-medium"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("inactive")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "inactive"
                ? "bg-gray-200 text-gray-900 font-medium"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Inactive
          </button>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <select
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                const [userId, userName] = value.split("||");
                handleShowUserVouchers(userId, userName);
              }
            }}
            value=""
            className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md appearance-none"
          >
            <option value="">View User Vouchers...</option>
            {users.map(user => (
              <option key={user.id} value={`${user.id}||${user.name}`}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4">Loading vouchers...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500">No vouchers found</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="mt-2 text-indigo-600 hover:text-indigo-800"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVouchers.map((voucher) => (
            <VoucherCard
              key={voucher.id}
              voucher={voucher}
              onEdit={handleEditVoucher}
              onDelete={handleDeleteVoucher}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto p-6">
            <h2 className="text-xl font-semibold mb-6">
              {editingVoucher ? "Edit Voucher" : "Create New Voucher"}
            </h2>
            <VoucherForm
              mode={editingVoucher ? "edit" : "add"}
              voucher={editingVoucher || undefined}
              onSuccess={handleFormClose}
            />
          </div>
        </div>
      )}

      {/* User Vouchers Modal */}
      <UserVouchersModal
        userId={selectedUserId}
        userName={selectedUserName}
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onFetchUserVouchers={getUserVouchers}
      />
    </div>
  );
} 