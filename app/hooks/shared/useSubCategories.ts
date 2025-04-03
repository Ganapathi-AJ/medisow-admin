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

interface SubCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  parentCategoryId?: string;
  parentCategoryName?: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

export function useSubCategories() {
  // Helper to determine the parent category collection name based on ID format or path
  const getCategoryCollectionName = (parentId: string): string => {
    // In the future, we could use a more robust way to determine the collection type
    // For now, we parse the parent ID to determine which collection it belongs to
    if (parentId.startsWith('med_')) {
      return 'medicineCategories';
    } else if (parentId.startsWith('pre_')) {
      return 'prescriptionCategories';
    } else if (parentId.startsWith('lab_')) {
      return 'labReportCategories';
    }
    
    // Default to medicine categories if can't determine
    return 'medicineCategories';
  };

  const getSubCategories = async (parentId: string): Promise<SubCategory[]> => {
    const categoryCollection = getCategoryCollectionName(parentId);
    const subCategoriesRef = collection(db, `${categoryCollection}/${parentId}/subCategories`);
    const snapshot = await getDocs(subCategoriesRef);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        description: data.description,
        image_url: data.image_url,
        parentCategoryId: parentId,
        parentCategoryName: data.parentCategoryName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ...(data as any)
      };
    });
  };

  const getAllSubCategories = async (): Promise<SubCategory[]> => {
    // We need to fetch subcategories from all category collections
    const categoryCollections = ['medicineCategories', 'prescriptionCategories', 'labReportCategories'];
    let allSubCategories: SubCategory[] = [];
    
    for (const collectionName of categoryCollections) {
      // Get all categories for this collection
      const categoriesRef = collection(db, collectionName);
      const categoriesSnapshot = await getDocs(categoriesRef);
      
      // For each category, get its subcategories
      const subCategoriesPromises = categoriesSnapshot.docs.map(async (categoryDoc) => {
        const categoryId = categoryDoc.id;
        const categoryData = categoryDoc.data();
        
        const subCategoriesRef = collection(db, `${collectionName}/${categoryId}/subCategories`);
        const subCategoriesSnapshot = await getDocs(subCategoriesRef);
        
        return subCategoriesSnapshot.docs.map(subCategoryDoc => {
          const data = subCategoryDoc.data();
          return {
            id: subCategoryDoc.id,
            name: data.name || "",
            description: data.description,
            image_url: data.image_url,
            parentCategoryId: categoryId,
            parentCategoryName: categoryData.name,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            ...(data as any)
          };
        });
      });
      
      const collectionSubCategories = await Promise.all(subCategoriesPromises);
      allSubCategories = [...allSubCategories, ...collectionSubCategories.flat()];
    }
    
    return allSubCategories;
  };

  const getSubCategoryById = async (parentId: string, id: string): Promise<SubCategory | null> => {
    const categoryCollection = getCategoryCollectionName(parentId);
    const docRef = doc(db, `${categoryCollection}/${parentId}/subCategories`, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Get parent category name
      const parentCategoryRef = doc(db, categoryCollection, parentId);
      const parentCategorySnap = await getDoc(parentCategoryRef);
      const parentCategoryName = parentCategorySnap.exists() ? parentCategorySnap.data().name : "";
      
      return {
        id: docSnap.id,
        name: data.name || "",
        description: data.description,
        image_url: data.image_url,
        parentCategoryId: parentId,
        parentCategoryName,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        ...(data as any)
      };
    } else {
      return null;
    }
  };

  const createSubCategory = async (parentId: string, data: any) => {
    const categoryCollection = getCategoryCollectionName(parentId);
    
    // Verify parent category exists
    const parentCategoryRef = doc(db, categoryCollection, parentId);
    const parentCategorySnap = await getDoc(parentCategoryRef);
    
    if (!parentCategorySnap.exists()) {
      throw new Error("Parent category does not exist");
    }
    
    const subCategoriesRef = collection(db, `${categoryCollection}/${parentId}/subCategories`);
    const newDocRef = doc(subCategoriesRef);
    
    await setDoc(newDocRef, {
      ...data,
      parentCategoryName: parentCategorySnap.data().name,
      createdAt: new Date(),
    });
    
    return newDocRef.id;
  };

  const updateSubCategory = async (parentId: string, id: string, data: any) => {
    const categoryCollection = getCategoryCollectionName(parentId);
    const docRef = doc(db, `${categoryCollection}/${parentId}/subCategories`, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  };

  const deleteSubCategory = async (parentId: string, id: string) => {
    const categoryCollection = getCategoryCollectionName(parentId);
    
    // Determine which collection to check based on category collection
    let itemsCollection = "medicines";
    if (categoryCollection === "prescriptionCategories") {
      itemsCollection = "prescriptions";
    } else if (categoryCollection === "labReportCategories") {
      itemsCollection = "labReports";
    }
    
    // Check if there are any items that use this subcategory
    const itemsRef = query(
      collection(db, itemsCollection), 
      where("subCategoryId", "==", id)
    );
    const itemsSnapshot = await getDocs(itemsRef);
    
    if (!itemsSnapshot.empty) {
      throw new Error(`Cannot delete sub-category with existing ${itemsCollection}. Please delete the ${itemsCollection} first.`);
    }
    
    const docRef = doc(db, `${categoryCollection}/${parentId}/subCategories`, id);
    await deleteDoc(docRef);
  };

  return {
    getSubCategories,
    getAllSubCategories,
    getSubCategoryById,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory
  };
} 