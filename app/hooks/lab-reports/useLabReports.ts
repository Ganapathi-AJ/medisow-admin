"use client";

import { db } from "@/app/lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  DocumentData
} from "firebase/firestore";
import { useCategories } from "../shared/useCategories";

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

export function useLabReports() {
  const { getCategoryById } = useCategories();

  const getLabReports = async (categoryId?: string): Promise<LabReport[]> => {
    let labReportsRef;
    
    if (categoryId) {
      labReportsRef = query(collection(db, "labReports"), where("categoryId", "==", categoryId));
    } else {
      labReportsRef = collection(db, "labReports");
    }
    
    const snapshot = await getDocs(labReportsRef);
    
    // Get lab reports with category names
    const labReportsWithCategoryPromises = snapshot.docs.map(async (labReportDoc) => {
      const data = labReportDoc.data();
      let categoryName = data.categoryName || "";
      
      // If category name is not in the document, fetch it
      if (!categoryName && data.categoryId) {
        const category = await getCategoryById("labReport", data.categoryId);
        categoryName = category?.name || "";
      }
      
      return {
        id: labReportDoc.id,
        title: data.title || "",
        description: data.description || "",
        categoryId: data.categoryId || "",
        categoryName,
        images_url: data.images_url || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ...data
      };
    });
    
    return Promise.all(labReportsWithCategoryPromises);
  };

  const getLabReportById = async (id: string): Promise<LabReport | null> => {
    const docRef = doc(db, "labReports", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      let categoryName = data.categoryName || "";
      
      // If category name is not in the document, fetch it
      if (!categoryName && data.categoryId) {
        const category = await getCategoryById("labReport", data.categoryId);
        categoryName = category?.name || "";
      }
      
      return {
        id: docSnap.id,
        title: data.title || "",
        description: data.description || "",
        categoryId: data.categoryId || "",
        categoryName,
        images_url: data.images_url || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ...data
      };
    } else {
      return null;
    }
  };

  const createLabReport = async (data: any) => {
    // If we have categoryId but not categoryName, fetch the category name
    if (data.categoryId && !data.categoryName) {
      const category = await getCategoryById("labReport", data.categoryId);
      if (category) {
        data.categoryName = category.name;
      }
    }
    
    const labReportsRef = collection(db, "labReports");
    const newDocRef = doc(labReportsRef);
    await setDoc(newDocRef, {
      ...data,
      createdAt: new Date(),
    });
    return newDocRef.id;
  };

  const updateLabReport = async (id: string, data: any) => {
    // If we're updating categoryId but not categoryName, fetch the category name
    if (data.categoryId && !data.categoryName) {
      const category = await getCategoryById("labReport", data.categoryId);
      if (category) {
        data.categoryName = category.name;
      }
    }
    
    const docRef = doc(db, "labReports", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  };

  const deleteLabReport = async (id: string) => {
    const docRef = doc(db, "labReports", id);
    await deleteDoc(docRef);
  };

  return {
    getLabReports,
    getLabReportById,
    createLabReport,
    updateLabReport,
    deleteLabReport
  };
} 