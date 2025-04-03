"use client";

import { storage } from "@/app/lib/firebase";
import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";

export function useUpload() {
  const uploadImage = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const deleteImage = async (url: string) => {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  };

  return {
    uploadImage,
    deleteImage
  };
} 