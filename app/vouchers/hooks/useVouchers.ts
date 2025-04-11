import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  serverTimestamp, 
  query,
  where,
  DocumentData
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';

export interface Voucher {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  creditCost: number;
  code: string;
  isActive: boolean;
  createdAt?: any;
  expiresAt?: any;
}

export interface UserVoucher {
  id?: string;
  voucherId: string;
  userId: string;
  title: string;
  description: string;
  imageUrl: string;
  code: string;
  purchasedAt: any;
  usedAt?: any;
  isUsed: boolean;
}

export const useVouchers = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all vouchers
  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const vouchersRef = collection(db, 'vouchers');
      const snapshot = await getDocs(vouchersRef);
      const vouchersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Voucher[];
      
      setVouchers(vouchersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching vouchers:', err);
      setError('Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  // Add a new voucher
  const addVoucher = async (voucher: Omit<Voucher, 'id' | 'createdAt'>, imageFile?: File) => {
    try {
      let imageUrl = voucher.imageUrl;
      
      // Check if voucher code already exists
      if (voucher.code) {
        const vouchersRef = collection(db, 'vouchers');
        const codeQuery = query(vouchersRef, where('code', '==', voucher.code));
        const existingCodes = await getDocs(codeQuery);
        
        if (!existingCodes.empty) {
          setError('This voucher code already exists. Please use a different code.');
          return false;
        }
      }
      
      // Upload image if provided
      if (imageFile) {
        const storageRef = ref(storage, `vouchers/${Date.now()}-${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }
      
      const voucherData = {
        ...voucher,
        imageUrl,
        createdAt: serverTimestamp(),
      };
      
      // Add to Firestore
      const docRef = await addDoc(collection(db, 'vouchers'), voucherData);
      
      // Update the local state immediately without a full refetch
      const newVoucherWithId = {
        id: docRef.id,
        ...voucherData,
        // For immediate display in UI, use local Date instead of waiting for serverTimestamp
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }
      };
      
      setVouchers(prev => [...prev, newVoucherWithId]);
      setError(null);
      return true;
    } catch (err) {
      console.error('Error adding voucher:', err);
      setError('Failed to add voucher');
      return false;
    }
  };

  // Update an existing voucher
  const updateVoucher = async (id: string, updates: Partial<Voucher>, imageFile?: File) => {
    try {
      // Check if voucher code already exists (if code is being updated)
      if (updates.code) {
        const voucherRef = doc(db, 'vouchers', id);
        const voucherSnap = await getDoc(voucherRef);
        const currentCode = voucherSnap.data()?.code;
        
        // Only check for duplicates if the code is actually changing
        if (currentCode !== updates.code) {
          const vouchersRef = collection(db, 'vouchers');
          const codeQuery = query(vouchersRef, where('code', '==', updates.code));
          const existingCodes = await getDocs(codeQuery);
          
          if (!existingCodes.empty) {
            setError('This voucher code already exists. Please use a different code.');
            return false;
          }
        }
      }
      
      let imageUrl = updates.imageUrl;
      
      // Upload new image if provided
      if (imageFile) {
        const storageRef = ref(storage, `vouchers/${Date.now()}-${imageFile.name}`);
        const uploadResult = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
        updates.imageUrl = imageUrl;
      }
      
      const voucherRef = doc(db, 'vouchers', id);
      await updateDoc(voucherRef, updates);
      
      // Update the local state immediately without a full refetch
      setVouchers(prev => 
        prev.map(voucher => 
          voucher.id === id 
            ? { ...voucher, ...updates } 
            : voucher
        )
      );
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error updating voucher:', err);
      setError('Failed to update voucher');
      return false;
    }
  };

  // Delete a voucher
  const deleteVoucher = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'vouchers', id));
      
      // Update the local state by filtering out the deleted voucher
      setVouchers(prev => prev.filter(voucher => voucher.id !== id));
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error deleting voucher:', err);
      setError('Failed to delete voucher');
      return false;
    }
  };

  // Get user vouchers
  const getUserVouchers = async (userId: string) => {
    try {
      const userVouchersRef = collection(db, `users/${userId}/vouchers`);
      const snapshot = await getDocs(userVouchersRef);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserVoucher[];
    } catch (err) {
      console.error('Error fetching user vouchers:', err);
      setError('Failed to fetch user vouchers');
      return [];
    }
  };

  // Generate a unique voucher code
  const generateVoucherCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Initialize by loading vouchers
  useEffect(() => {
    fetchVouchers();
  }, []);

  return {
    vouchers,
    loading,
    error,
    fetchVouchers,
    addVoucher,
    updateVoucher,
    deleteVoucher,
    getUserVouchers,
    generateVoucherCode
  };
}; 