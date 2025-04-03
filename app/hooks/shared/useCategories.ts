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

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

export function useCategories() {
  const getCategories = async (collectionName: string): Promise<Category[]> => {
    const categoriesRef = collection(db, `${collectionName}Categories`);
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        description: data.description,
        image_url: data.image_url,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ...(data as any)
      };
    });
  };

  const getCategoryById = async (collectionName: string, id: string): Promise<Category | null> => {
    const docRef = doc(db, `${collectionName}Categories`, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name || "",
        description: data.description,
        image_url: data.image_url,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ...(data as any)
      };
    } else {
      return null;
    }
  };

  const createCategory = async (collectionName: string, data: any) => {
    const categoriesRef = collection(db, `${collectionName}Categories`);
    
    // Generate a prefix for the ID based on collection type
    let idPrefix = "";
    if (collectionName === "medicine") {
      idPrefix = "med_";
    } else if (collectionName === "prescription") {
      idPrefix = "pre_";
    } else if (collectionName === "labReport") {
      idPrefix = "lab_";
    }
    
    // Generate a custom ID with the appropriate prefix
    const timestamp = new Date().getTime();
    const customId = `${idPrefix}${timestamp}`;
    
    // Use the custom ID for the document
    const newDocRef = doc(categoriesRef, customId);
    
    await setDoc(newDocRef, {
      ...data,
      createdAt: new Date(),
    });
    return newDocRef.id;
  };

  const updateCategory = async (collectionName: string, id: string, data: any) => {
    const docRef = doc(db, `${collectionName}Categories`, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  };

  const deleteCategory = async (collectionName: string, id: string) => {
    const docRef = doc(db, `${collectionName}Categories`, id);
    
    // Check if there are any items that use this category
    const itemsRef = query(
      collection(db, `${collectionName === "medicine" ? "medicines" : collectionName}s`), 
      where("categoryId", "==", id)
    );
    const itemsSnapshot = await getDocs(itemsRef);
    
    if (!itemsSnapshot.empty) {
      throw new Error(`Cannot delete category with existing ${collectionName}s. Please delete the ${collectionName}s first.`);
    }
    
    await deleteDoc(docRef);
  };

  return {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
  };
} 