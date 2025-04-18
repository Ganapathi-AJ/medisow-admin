"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Send, Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { toast } from "sonner";
import { useNotifications } from "./hooks/use-notifications";
import { NotificationHistory } from "./components/notification-history";
import { storage } from "@/app/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function NotificationsPage() {
  const { notifications, loading } = useNotifications();
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [notificationImage, setNotificationImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNotificationImage(file);

    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const clearForm = () => {
    setNotificationTitle("");
    setNotificationBody("");
    setNotificationImage(null);
    setImagePreview(null);
  };

  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationBody) {
      toast.error("Please fill in both title and body");
      return;
    }

    setIsSending(true);

    try {
      let imageUrl = null;

      // Upload image if provided
      if (notificationImage) {
        setIsUploading(true);
        const storageRef = ref(storage, `notification_images/${Date.now()}_${notificationImage.name}`);
        await uploadBytes(storageRef, notificationImage);
        imageUrl = await getDownloadURL(storageRef);
        setIsUploading(false);
      }

      toast.message("Sending notification...");
      const response = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: notificationTitle,
          body: notificationBody,
          imageUrl: imageUrl,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Notification sent to all users!");
        clearForm();
        setNotificationDialogOpen(false);
      } else {
        toast.error(result.message || "Failed to send notification");
      }
    } catch (error: any) {
      toast.error("Failed to send notification");
      console.error("Error sending notification:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold">Push Notifications</h2>
          <p className="text-muted-foreground mt-1">
            Send notifications to all app users
          </p>
        </div>
        <Dialog open={notificationDialogOpen} onOpenChange={setNotificationDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-white">
            <DialogHeader>
              <DialogTitle>Send Push Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Body</label>
                <Textarea
                  value={notificationBody}
                  onChange={(e) => setNotificationBody(e.target.value)}
                  placeholder="Enter notification message"
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Image (optional)</label>
                <div className="mt-1 flex items-center space-x-4">
                  <Input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="flex-1"
                    disabled={isUploading}
                  />
                  {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-40 rounded-md object-contain" 
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setNotificationDialogOpen(false)}
                  disabled={isSending}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendNotification} 
                  disabled={isSending || isUploading}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>Send to All</>
                  )}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="history">Notification History</TabsTrigger>
          <TabsTrigger value="info">Information</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <Card className="p-6">
            <h3 className="text-xl font-medium mb-4">Recent Notifications</h3>
            <NotificationHistory 
              notifications={notifications} 
              loading={loading} 
            />
          </Card>
        </TabsContent>
        
        <TabsContent value="info">
          <Card className="p-6">
            <h3 className="text-xl font-medium mb-3">Push Notification Guidelines</h3>
            <ul className="space-y-2 list-disc list-inside text-muted-foreground">
              <li>Notifications will be sent to all users subscribed to the app</li>
              <li>Keep titles short and attention-grabbing (recommended: under 50 characters)</li>
              <li>Message body should be clear and concise (recommended: under 150 characters)</li>
              <li>Images can help increase engagement but are optional</li>
              <li>Avoid sending too many notifications in a short period of time</li>
              <li>Best times for sending notifications are typically between 9 AM and 8 PM</li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}