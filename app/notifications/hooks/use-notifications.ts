"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

interface Notification {
  id?: string;
  title: string;
  body: string;
  imageUrl?: string;
  topic: string;
  sentAt: any; // Firestore timestamp
  successful: boolean;
  error?: string;
}

function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("sentAt", "desc")
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationData: Notification[] = [];
        snapshot.forEach((doc) => {
          notificationData.push({ id: doc.id, ...doc.data() } as Notification);
        });
        setNotifications(notificationData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notifications:", error);
        setError("Failed to load notification history");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { notifications, loading, error };
}

export { useNotifications };