"use client";

import { db } from "@/app/lib/firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  deleteDoc,
  DocumentData 
} from "firebase/firestore";

export function useUsers() {
  const getUsers = async () => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const getUserById = async (id: string) => {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  };

  const deleteUser = async (id: string) => {
    const docRef = doc(db, "users", id);
    await deleteDoc(docRef);
  };

  return {
    getUsers,
    getUserById,
    deleteUser
  };
} 