import type { NextApiRequest, NextApiResponse } from 'next';
import admin from '@/app/lib/firebaseAdmin';  // Make sure to import the admin SDK

type ResponseData = {
  message: string;
  messageId?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { title, body, imageUrl, topic = "all_users" } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: "Title and body are required" });
  }

  const message: any = {
    notification: {
      title,
      body,
    },
    topic: topic,
  };

  // Add optional image if provided
  if (imageUrl) {
    message.notification.imageUrl = imageUrl;
  }

  try {
    console.log("Sending notification:", message);
    const response = await admin.messaging().send(message);
    
    // Store the notification in Firestore for history
    await admin.firestore().collection('notifications').add({
      title,
      body,
      imageUrl: imageUrl || null,
      topic,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      successful: true
    });
    
    res.status(200).json({
      message: "Notification sent successfully to all users",
      messageId: response,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    
    // Store failed attempt in Firestore
    try {
      await admin.firestore().collection('notifications').add({
        title,
        body,
        imageUrl: imageUrl || null,
        topic,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        successful: false,
        error: (error instanceof Error) ? error.message : "Unknown error"
      });
    } catch (dbError) {
      console.error("Failed to log notification failure:", dbError);
    }
    
    res.status(500).json({ message: "Failed to send notification" });
  }
}