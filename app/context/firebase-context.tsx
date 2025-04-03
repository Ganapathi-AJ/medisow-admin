"use client";

import { createContext, useContext, ReactNode } from "react";
import { DocumentData } from "firebase/firestore";

// Import all hooks
import { useUsers } from "../hooks/users/useUsers";
import { useDonors } from "../hooks/donors/useDonors";
import { usePrescriptions } from "../hooks/prescriptions/usePrescriptions";
import { useLabReports } from "../hooks/lab-reports/useLabReports";
import { useMedicines } from "../hooks/medicines/useMedicines";
import { useCategories } from "../hooks/shared/useCategories";
import { useSubCategories } from "../hooks/shared/useSubCategories";
import { useUpload } from "../hooks/shared/useUpload";

// Define interfaces for type safety
interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
}

interface Medicine {
  id: string;
  name: string;
  company: string;
  composition: string;
  categoryId: string;
  categoryName?: string;
  subCategoryId: string;
  subCategoryName?: string;
  images_url: string[];
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

interface Prescription {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  images_url: string[];
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

interface LabReport {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  images_url: string[];
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

interface Donor {
  id: string;
  name: string;
  email: string;
  contactNumber: string;
  bloodGroup: string;
  area: string;
  city: string;
  contactPreference: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

interface FirebaseContextType {
  // Users
  getUsers: () => Promise<DocumentData[]>;
  getUserById: (id: string) => Promise<DocumentData | null>;
  deleteUser: (id: string) => Promise<void>;
  
  // Categories
  getCategories: (collectionName: string) => Promise<Category[]>;
  getCategoryById: (collectionName: string, id: string) => Promise<Category | null>;
  createCategory: (collectionName: string, data: any) => Promise<string>;
  updateCategory: (collectionName: string, id: string, data: any) => Promise<void>;
  deleteCategory: (collectionName: string, id: string) => Promise<void>;
  
  // Sub Categories
  getSubCategories: (parentId: string) => Promise<SubCategory[]>;
  getSubCategoryById: (parentId: string, id: string) => Promise<SubCategory | null>;
  createSubCategory: (parentId: string, data: any) => Promise<string>;
  updateSubCategory: (parentId: string, id: string, data: any) => Promise<void>;
  deleteSubCategory: (parentId: string, id: string) => Promise<void>;
  getAllSubCategories: () => Promise<SubCategory[]>;
  
  // Medicines
  getMedicines: (categoryId?: string, subCategoryId?: string) => Promise<Medicine[]>;
  getMedicineById: (id: string) => Promise<Medicine | null>;
  createMedicine: (data: any) => Promise<string>;
  updateMedicine: (id: string, data: any) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  
  // Prescriptions
  getPrescriptions: (categoryId?: string) => Promise<Prescription[]>;
  getPrescriptionById: (id: string) => Promise<Prescription | null>;
  createPrescription: (data: any) => Promise<string>;
  updatePrescription: (id: string, data: any) => Promise<void>;
  deletePrescription: (id: string) => Promise<void>;
  
  // Lab Reports
  getLabReports: (categoryId?: string) => Promise<LabReport[]>;
  getLabReportById: (id: string) => Promise<LabReport | null>;
  createLabReport: (data: any) => Promise<string>;
  updateLabReport: (id: string, data: any) => Promise<void>;
  deleteLabReport: (id: string) => Promise<void>;
  
  // Image Upload
  uploadImage: (file: File, path: string) => Promise<string>;
  deleteImage: (url: string) => Promise<void>;
  
  // Donors
  getDonors: () => Promise<Donor[]>;
  getDonorById: (id: string) => Promise<Donor | null>;
  createDonor: (data: any) => Promise<string>;
  updateDonor: (id: string, data: any) => Promise<void>;
  deleteDonor: (id: string) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  // Initialize all hooks
  const usersHook = useUsers();
  const donorsHook = useDonors();
  const prescriptionsHook = usePrescriptions();
  const labReportsHook = useLabReports();
  const medicinesHook = useMedicines();
  const categoriesHook = useCategories();
  const subCategoriesHook = useSubCategories();
  const uploadHook = useUpload();

  // Create the value object for the context provider
  const value: FirebaseContextType = {
    // Users
    getUsers: usersHook.getUsers,
    getUserById: usersHook.getUserById,
    deleteUser: usersHook.deleteUser,
    
    // Categories
    getCategories: categoriesHook.getCategories,
    getCategoryById: categoriesHook.getCategoryById,
    createCategory: categoriesHook.createCategory,
    updateCategory: categoriesHook.updateCategory,
    deleteCategory: categoriesHook.deleteCategory,
    
    // Sub Categories
    getSubCategories: subCategoriesHook.getSubCategories,
    getSubCategoryById: subCategoriesHook.getSubCategoryById,
    createSubCategory: subCategoriesHook.createSubCategory,
    updateSubCategory: subCategoriesHook.updateSubCategory,
    deleteSubCategory: subCategoriesHook.deleteSubCategory,
    getAllSubCategories: subCategoriesHook.getAllSubCategories,
    
    // Medicines
    getMedicines: medicinesHook.getMedicines,
    getMedicineById: medicinesHook.getMedicineById,
    createMedicine: medicinesHook.createMedicine,
    updateMedicine: medicinesHook.updateMedicine,
    deleteMedicine: medicinesHook.deleteMedicine,
    
    // Prescriptions
    getPrescriptions: prescriptionsHook.getPrescriptions,
    getPrescriptionById: prescriptionsHook.getPrescriptionById,
    createPrescription: prescriptionsHook.createPrescription,
    updatePrescription: prescriptionsHook.updatePrescription,
    deletePrescription: prescriptionsHook.deletePrescription,
    
    // Lab Reports
    getLabReports: labReportsHook.getLabReports,
    getLabReportById: labReportsHook.getLabReportById,
    createLabReport: labReportsHook.createLabReport,
    updateLabReport: labReportsHook.updateLabReport,
    deleteLabReport: labReportsHook.deleteLabReport,
    
    // Image Upload
    uploadImage: uploadHook.uploadImage,
    deleteImage: uploadHook.deleteImage,
    
    // Donors
    getDonors: donorsHook.getDonors,
    getDonorById: donorsHook.getDonorById,
    createDonor: donorsHook.createDonor,
    updateDonor: donorsHook.updateDonor,
    deleteDonor: donorsHook.deleteDonor
  };

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
}; 