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

export function usePrescriptions() {
  const { getCategoryById } = useCategories();

  const getPrescriptions = async (categoryId?: string): Promise<Prescription[]> => {
    let prescriptionsRef;
    
    if (categoryId) {
      prescriptionsRef = query(collection(db, "prescriptions"), where("categoryId", "==", categoryId));
    } else {
      prescriptionsRef = collection(db, "prescriptions");
    }
    
    const snapshot = await getDocs(prescriptionsRef);
    
    // Get prescriptions with category names
    const prescriptionsWithCategoryPromises = snapshot.docs.map(async (prescriptionDoc) => {
      const data = prescriptionDoc.data();
      let categoryName = data.categoryName || "";
      
      // If category name is not in the document, fetch it
      if (!categoryName && data.categoryId) {
        const category = await getCategoryById("prescription", data.categoryId);
        categoryName = category?.name || "";
      }
      
      return {
        id: prescriptionDoc.id,
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
    
    return Promise.all(prescriptionsWithCategoryPromises);
  };

  const getPrescriptionById = async (id: string): Promise<Prescription | null> => {
    const docRef = doc(db, "prescriptions", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      let categoryName = data.categoryName || "";
      
      // If category name is not in the document, fetch it
      if (!categoryName && data.categoryId) {
        const category = await getCategoryById("prescription", data.categoryId);
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

  const createPrescription = async (data: any) => {
    // If we have categoryId but not categoryName, fetch the category name
    if (data.categoryId && !data.categoryName) {
      const category = await getCategoryById("prescription", data.categoryId);
      if (category) {
        data.categoryName = category.name;
      }
    }
    
    const prescriptionsRef = collection(db, "prescriptions");
    const newDocRef = doc(prescriptionsRef);
    await setDoc(newDocRef, {
      ...data,
      createdAt: new Date(),
    });
    return newDocRef.id;
  };

  const updatePrescription = async (id: string, data: any) => {
    // If we're updating categoryId but not categoryName, fetch the category name
    if (data.categoryId && !data.categoryName) {
      const category = await getCategoryById("prescription", data.categoryId);
      if (category) {
        data.categoryName = category.name;
      }
    }
    
    const docRef = doc(db, "prescriptions", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  };

  const deletePrescription = async (id: string) => {
    const docRef = doc(db, "prescriptions", id);
    await deleteDoc(docRef);
  };

  return {
    getPrescriptions,
    getPrescriptionById,
    createPrescription,
    updatePrescription,
    deletePrescription
  };
} 