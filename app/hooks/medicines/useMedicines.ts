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
  writeBatch,
  DocumentData
} from "firebase/firestore";
import { useCategories } from "../shared/useCategories";
import { useSubCategories } from "../shared/useSubCategories";

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

export function useMedicines() {
  const { getCategoryById } = useCategories();
  const { getSubCategoryById } = useSubCategories();

  const getMedicines = async (categoryId?: string, subCategoryId?: string): Promise<Medicine[]> => {
    let medicinesRef;
    
    if (categoryId && subCategoryId) {
      medicinesRef = query(
        collection(db, "medicines"), 
        where("categoryId", "==", categoryId),
        where("subCategoryId", "==", subCategoryId)
      );
    } else if (categoryId) {
      medicinesRef = query(
        collection(db, "medicines"), 
        where("categoryId", "==", categoryId)
      );
    } else if (subCategoryId) {
      medicinesRef = query(
        collection(db, "medicines"), 
        where("subCategoryId", "==", subCategoryId)
      );
    } else {
      medicinesRef = collection(db, "medicines");
    }
    
    const snapshot = await getDocs(medicinesRef);
    
    // Get medicines with category and subcategory names
    const medicinesWithCategoryPromises = snapshot.docs.map(async (medicineDoc) => {
      const data = medicineDoc.data();
      let categoryName = data.categoryName || "";
      let subCategoryName = data.subCategoryName || "";
      
      // If category name is not in the document, fetch it
      if (!categoryName && data.categoryId) {
        const category = await getCategoryById("medicine", data.categoryId);
        categoryName = category?.name || "";
      }
      
      // If subcategory name is not in the document, fetch it
      if (!subCategoryName && data.subCategoryId && data.categoryId) {
        const subCategory = await getSubCategoryById(data.categoryId, data.subCategoryId);
        subCategoryName = subCategory?.name || "";
      }
      
      return {
        id: medicineDoc.id,
        name: data.name || "",
        company: data.company || "",
        composition: data.composition || "",
        categoryId: data.categoryId || "",
        categoryName,
        subCategoryId: data.subCategoryId || "",
        subCategoryName,
        images_url: data.images_url || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ...data
      };
    });
    
    return Promise.all(medicinesWithCategoryPromises);
  };

  const getMedicineById = async (id: string): Promise<Medicine | null> => {
    const docRef = doc(db, "medicines", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      let categoryName = data.categoryName || "";
      let subCategoryName = data.subCategoryName || "";
      
      // If category name is not in the document, fetch it
      if (!categoryName && data.categoryId) {
        const category = await getCategoryById("medicine", data.categoryId);
        categoryName = category?.name || "";
      }
      
      // If subcategory name is not in the document, fetch it
      if (!subCategoryName && data.subCategoryId && data.categoryId) {
        const subCategory = await getSubCategoryById(data.categoryId, data.subCategoryId);
        subCategoryName = subCategory?.name || "";
      }
      
      return {
        id: docSnap.id,
        name: data.name || "",
        company: data.company || "",
        composition: data.composition || "",
        categoryId: data.categoryId || "",
        categoryName,
        subCategoryId: data.subCategoryId || "",
        subCategoryName,
        images_url: data.images_url || [],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ...data
      };
    } else {
      return null;
    }
  };

  const createMedicine = async (data: any) => {
    // If we have categoryId but not categoryName, fetch the category name
    if (data.categoryId && !data.categoryName) {
      const category = await getCategoryById("medicine", data.categoryId);
      if (category) {
        data.categoryName = category.name;
      }
    }
    
    // If we have subCategoryId but not subCategoryName, fetch the subcategory name
    if (data.categoryId && data.subCategoryId && !data.subCategoryName) {
      const subCategory = await getSubCategoryById(data.categoryId, data.subCategoryId);
      if (subCategory) {
        data.subCategoryName = subCategory.name;
      }
    }
    
    const medicinesRef = collection(db, "medicines");
    const newDocRef = doc(medicinesRef);
    await setDoc(newDocRef, {
      ...data,
      createdAt: new Date(),
    });
    return newDocRef.id;
  };

  const updateMedicine = async (id: string, data: any) => {
    // If we're updating categoryId but not categoryName, fetch the category name
    if (data.categoryId && !data.categoryName) {
      const category = await getCategoryById("medicine", data.categoryId);
      if (category) {
        data.categoryName = category.name;
      }
    }
    
    // If we're updating subCategoryId but not subCategoryName, fetch the subcategory name
    if (data.categoryId && data.subCategoryId && !data.subCategoryName) {
      const subCategory = await getSubCategoryById(data.categoryId, data.subCategoryId);
      if (subCategory) {
        data.subCategoryName = subCategory.name;
      }
    }
    
    const docRef = doc(db, "medicines", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  };

  const deleteMedicine = async (id: string) => {
    const docRef = doc(db, "medicines", id);
    await deleteDoc(docRef);
  };

  return {
    getMedicines,
    getMedicineById,
    createMedicine,
    updateMedicine,
    deleteMedicine
  };
} 