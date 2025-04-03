"use client";

import { useState, useEffect } from "react";
import { useFirebase } from "../context/firebase-context";
import { DocumentData } from "firebase/firestore";
import { Plus, Pencil, Trash2, Search, Loader2, Filter, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Donor {
  id?: string;
  name: string;
  email: string;
  contactNumber: string;
  bloodGroup: string;
  area: string;
  city: string;
  contactPreference: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function DonorsListPage() {
  const { getDonors, createDonor, updateDonor, deleteDonor } = useFirebase();
  
  const [donors, setDonors] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const [newDonor, setNewDonor] = useState<Donor>({
    name: "",
    email: "",
    contactNumber: "",
    bloodGroup: "",
    area: "",
    city: "",
    contactPreference: "phone"
  });
  
  const [editingDonor, setEditingDonor] = useState<Donor | null>(null);
  
  const [filters, setFilters] = useState({
    bloodGroup: "",
    city: "",
    contactPreference: ""
  });
  
  const [sortBy, setSortBy] = useState("name");
  
  // Blood group options
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  
  // Contact preference options
  const contactPreferences = ["phone", "email", "both", "none"];
  
  useEffect(() => {
    fetchDonors();
  }, []);
  
  const fetchDonors = async () => {
    try {
      setLoading(true);
      const donorsData = await getDonors();
      setDonors(donorsData);
    } catch (error) {
      console.error("Error fetching donors:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddDonor = async () => {
    try {
      await createDonor(newDonor);
      setNewDonor({
        name: "",
        email: "",
        contactNumber: "",
        bloodGroup: "",
        area: "",
        city: "",
        contactPreference: "phone"
      });
      setShowAddModal(false);
      fetchDonors();
    } catch (error) {
      console.error("Error adding donor:", error);
    }
  };
  
  const handleUpdateDonor = async () => {
    if (!editingDonor || !editingDonor.id) return;
    
    try {
      await updateDonor(editingDonor.id, {
        name: editingDonor.name,
        email: editingDonor.email,
        contactNumber: editingDonor.contactNumber,
        bloodGroup: editingDonor.bloodGroup,
        area: editingDonor.area,
        city: editingDonor.city,
        contactPreference: editingDonor.contactPreference
      });
      setEditingDonor(null);
      setShowEditModal(false);
      fetchDonors();
    } catch (error) {
      console.error("Error updating donor:", error);
    }
  };
  
  const handleDeleteDonor = async (id: string) => {
    if (confirmDelete === id) {
      try {
        await deleteDonor(id);
        setDonors(donors.filter(donor => donor.id !== id));
        setConfirmDelete(null);
      } catch (error) {
        console.error("Error deleting donor:", error);
      }
    } else {
      setConfirmDelete(id);
    }
  };
  
  const applyFilters = () => {
    setShowFilterModal(false);
  };
  
  const resetFilters = () => {
    setFilters({
      bloodGroup: "",
      city: "",
      contactPreference: ""
    });
    setShowFilterModal(false);
  };
  
  const filteredDonors = donors.filter(donor => {
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesQuery = 
        donor.name?.toLowerCase().includes(query) ||
        donor.email?.toLowerCase().includes(query) ||
        donor.contactNumber?.includes(query) ||
        donor.bloodGroup?.toLowerCase().includes(query) ||
        donor.city?.toLowerCase().includes(query);
      
      if (!matchesQuery) return false;
    }
    
    // Apply blood group filter
    if (filters.bloodGroup && donor.bloodGroup !== filters.bloodGroup) {
      return false;
    }
    
    // Apply city filter
    if (filters.city && donor.city?.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }
    
    // Apply contact preference filter
    if (filters.contactPreference && donor.contactPreference !== filters.contactPreference) {
      return false;
    }
    
    return true;
  });
  
  // Sort donors
  const sortedDonors = [...filteredDonors].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "bloodGroup") {
      return a.bloodGroup.localeCompare(b.bloodGroup);
    } else if (sortBy === "city") {
      return a.city.localeCompare(b.city);
    } else if (sortBy === "date") {
      return b.createdAt?.toDate() - a.createdAt?.toDate();
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href="/" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donors Management</h1>
          <p className="text-muted-foreground">
            Manage blood donors in your application
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Donor
        </button>
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search donors..."
            className="w-full rounded-md border border-input bg-background pl-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilterModal(true)}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background p-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      <div className="flex justify-end gap-2 mb-2">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="name">Sort by Name</option>
          <option value="bloodGroup">Sort by Blood Group</option>
          <option value="city">Sort by City</option>
          <option value="date">Sort by Date Added</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          {sortedDonors.length > 0 ? (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Blood Group</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Contact Preference</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDonors.map((donor) => (
                    <tr key={donor.id} className="border-t border-border hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{donor.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {donor.bloodGroup}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div>{donor.contactNumber}</div>
                        <div className="text-xs text-muted-foreground">{donor.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{donor.city}</div>
                        <div className="text-xs text-muted-foreground">{donor.area}</div>
                      </td>
                      <td className="px-4 py-3 capitalize">{donor.contactPreference}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingDonor(donor as Donor);
                              setShowEditModal(true);
                            }}
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background w-8 h-8 text-sm hover:bg-accent hover:text-accent-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDonor(donor.id)}
                            className={`inline-flex items-center justify-center rounded-md w-8 h-8 text-sm ${
                              confirmDelete === donor.id
                                ? "bg-destructive text-destructive-foreground"
                                : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground">No donors found.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Donor
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Donor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Add New Donor</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name*
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newDonor.name}
                  onChange={(e) => setNewDonor({ ...newDonor, name: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email*
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newDonor.email}
                  onChange={(e) => setNewDonor({ ...newDonor, email: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="contactNumber" className="block text-sm font-medium mb-1">
                  Contact Number*
                </label>
                <input
                  id="contactNumber"
                  type="tel"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newDonor.contactNumber}
                  onChange={(e) => setNewDonor({ ...newDonor, contactNumber: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium mb-1">
                  Blood Group*
                </label>
                <select
                  id="bloodGroup"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newDonor.bloodGroup}
                  onChange={(e) => setNewDonor({ ...newDonor, bloodGroup: e.target.value })}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1">
                  City*
                </label>
                <input
                  id="city"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newDonor.city}
                  onChange={(e) => setNewDonor({ ...newDonor, city: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="area" className="block text-sm font-medium mb-1">
                  Area
                </label>
                <input
                  id="area"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newDonor.area}
                  onChange={(e) => setNewDonor({ ...newDonor, area: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="contactPreference" className="block text-sm font-medium mb-1">
                  Contact Preference
                </label>
                <select
                  id="contactPreference"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={newDonor.contactPreference}
                  onChange={(e) => setNewDonor({ ...newDonor, contactPreference: e.target.value })}
                >
                  {contactPreferences.map(preference => (
                    <option key={preference} value={preference}>{preference.charAt(0).toUpperCase() + preference.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDonor}
                  disabled={!newDonor.name || !newDonor.email || !newDonor.contactNumber || !newDonor.bloodGroup || !newDonor.city}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Add Donor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Donor Modal */}
      {showEditModal && editingDonor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Edit Donor</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium mb-1">
                  Name*
                </label>
                <input
                  id="edit-name"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editingDonor.name}
                  onChange={(e) => setEditingDonor({ ...editingDonor, name: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="edit-email" className="block text-sm font-medium mb-1">
                  Email*
                </label>
                <input
                  id="edit-email"
                  type="email"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editingDonor.email}
                  onChange={(e) => setEditingDonor({ ...editingDonor, email: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="edit-contactNumber" className="block text-sm font-medium mb-1">
                  Contact Number*
                </label>
                <input
                  id="edit-contactNumber"
                  type="tel"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editingDonor.contactNumber}
                  onChange={(e) => setEditingDonor({ ...editingDonor, contactNumber: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="edit-bloodGroup" className="block text-sm font-medium mb-1">
                  Blood Group*
                </label>
                <select
                  id="edit-bloodGroup"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editingDonor.bloodGroup}
                  onChange={(e) => setEditingDonor({ ...editingDonor, bloodGroup: e.target.value })}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="edit-city" className="block text-sm font-medium mb-1">
                  City*
                </label>
                <input
                  id="edit-city"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editingDonor.city}
                  onChange={(e) => setEditingDonor({ ...editingDonor, city: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="edit-area" className="block text-sm font-medium mb-1">
                  Area
                </label>
                <input
                  id="edit-area"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editingDonor.area}
                  onChange={(e) => setEditingDonor({ ...editingDonor, area: e.target.value })}
                />
              </div>
              
              <div>
                <label htmlFor="edit-contactPreference" className="block text-sm font-medium mb-1">
                  Contact Preference
                </label>
                <select
                  id="edit-contactPreference"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={editingDonor.contactPreference}
                  onChange={(e) => setEditingDonor({ ...editingDonor, contactPreference: e.target.value })}
                >
                  {contactPreferences.map(preference => (
                    <option key={preference} value={preference}>{preference.charAt(0).toUpperCase() + preference.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDonor(null);
                  }}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateDonor}
                  disabled={!editingDonor.name || !editingDonor.email || !editingDonor.contactNumber || !editingDonor.bloodGroup || !editingDonor.city}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Update Donor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Filter Donors</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="filter-bloodGroup" className="block text-sm font-medium mb-1">
                  Blood Group
                </label>
                <select
                  id="filter-bloodGroup"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={filters.bloodGroup}
                  onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                >
                  <option value="">All Blood Groups</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="filter-city" className="block text-sm font-medium mb-1">
                  City
                </label>
                <input
                  id="filter-city"
                  type="text"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  placeholder="Enter city name"
                />
              </div>
              
              <div>
                <label htmlFor="filter-contactPreference" className="block text-sm font-medium mb-1">
                  Contact Preference
                </label>
                <select
                  id="filter-contactPreference"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={filters.contactPreference}
                  onChange={(e) => setFilters({ ...filters, contactPreference: e.target.value })}
                >
                  <option value="">All Preferences</option>
                  {contactPreferences.map(preference => (
                    <option key={preference} value={preference}>{preference.charAt(0).toUpperCase() + preference.slice(1)}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background hover:bg-accent hover:text-accent-foreground"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 