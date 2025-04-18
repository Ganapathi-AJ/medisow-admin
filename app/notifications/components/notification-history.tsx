import { formatDistanceToNow } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Bell,
  Users,
  Image
} from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Skeleton } from "@/app/components/ui/skeleton";

interface NotificationHistoryProps {
  notifications: any[];
  loading: boolean;
}

export function NotificationHistory({ notifications, loading }: NotificationHistoryProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <Bell className="mx-auto h-12 w-12 mb-2 opacity-20" />
        <p>No notifications have been sent yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => {
        const sentDate = notification.sentAt?.toDate ? notification.sentAt.toDate() : null;
        
        return (
          <Card key={notification.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{notification.title}</h3>
                  {notification.successful ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-muted-foreground text-sm">{notification.body}</p>
                
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-xs text-muted-foreground">
                  {sentDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDistanceToNow(sentDate, { addSuffix: true })}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>Topic: {notification.topic}</span>
                  </div>
                  
                  {notification.imageUrl && (
                    <div className="flex items-center gap-1">
                      <Image className="h-3 w-3" />
                      <span>With image</span>
                    </div>
                  )}
                </div>
                
                {!notification.successful && notification.error && (
                  <p className="text-xs text-red-500 mt-2">
                    Error: {notification.error}
                  </p>
                )}
              </div>
              
              {notification.imageUrl && (
                <div className="ml-4">
                  <img 
                    src={notification.imageUrl} 
                    alt="Notification image"
                    className="h-16 w-16 object-cover rounded-md" 
                  />
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}