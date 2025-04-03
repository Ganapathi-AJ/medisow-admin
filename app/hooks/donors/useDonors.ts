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
} from "firebase/firestore";

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

export function useDonors() {
  const getDonors = async (): Promise<Donor[]> => {
    const donorsRef = collection(db, "Donors");
    const snapshot = await getDocs(donorsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Donor));
  };

  const getDonorById = async (id: string): Promise<Donor | null> => {
    const docRef = doc(db, "Donors", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Donor;
    } else {
      return null;
    }
  };

  const createDonor = async (data: any) => {
    const donorsRef = collection(db, "Donors");
    const newDocRef = doc(donorsRef);
    await setDoc(newDocRef, {
      ...data,
      createdAt: new Date(),
    });
    return newDocRef.id;
  };

  const updateDonor = async (id: string, data: any) => {
    const docRef = doc(db, "Donors", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  };

  const deleteDonor = async (id: string) => {
    const docRef = doc(db, "Donors", id);
    await deleteDoc(docRef);
  };

  return {
    getDonors,
    getDonorById,
    createDonor,
    updateDonor,
    deleteDonor
  };
} 