"use client";

import React, { useState, useEffect } from "react";
import { useFirebase } from "../../context/firebase-context";
import { DocumentData } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { getUserById, deleteUser } = useFirebase();
  const [user, setUser] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  
  // Unwrap params using React.use()
  const resolvedParams = React.use(params);
  const userId = resolvedParams.id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [getUserById, userId]);

  const handleDeleteUser = async () => {
    if (confirmDelete) {
      try {
        await deleteUser(userId);
        router.push("/users");
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    } else {
      setConfirmDelete(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Link href="/users" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Users
          </Link>
        </div>
        <div className="rounded-md border p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
          <p className="text-muted-foreground">
            The user you are looking for does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/users" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Users
          </Link>
        </div>
        <button
          onClick={handleDeleteUser}
          className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${
            confirmDelete
              ? "bg-destructive text-destructive-foreground"
              : "border border-input hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {confirmDelete ? "Confirm Delete" : "Delete User"}
        </button>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{user.name || "Unknown User"}</h1>
        <p className="text-muted-foreground">
          User Details and Information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Full Name</div>
                <div>{user.name || "-"}</div>
              </div>
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Email Address</div>
                <div>{user.email || "-"}</div>
              </div>
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Phone Number</div>
                <div>{user.number || "-"}</div>
              </div>
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Gender</div>
                <div>{user.gender || "-"}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Account Details</h2>
            <div className="space-y-4">
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">User Type</div>
                <div>{user.userType || "-"}</div>
              </div>
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Institution</div>
                <div>{user.institution || "-"}</div>
              </div>
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Credits</div>
                <div>{user.credits !== undefined ? user.credits : "-"}</div>
              </div>
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Profile Status</div>
                <div>
                  {user.needsProfileCompletion !== undefined
                    ? user.needsProfileCompletion
                      ? "Incomplete"
                      : "Complete"
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Image</h2>
            {user.displayImage ? (
              <div className="flex justify-center">
                <img
                  src={user.displayImage}
                  alt={`${user.name}'s profile`}
                  className="rounded-md max-h-64 object-cover"
                />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-muted rounded-md">
                <p className="text-muted-foreground">No profile image</p>
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Account Timestamps</h2>
            <div className="space-y-4">
              <div>
                <div className="font-medium text-sm text-muted-foreground mb-1">Created At</div>
                <div>
                  {user.createdAt
                    ? new Date(user.createdAt.seconds * 1000).toLocaleString()
                    : "-"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-xl font-semibold mb-4">Bookmarks</h2>
            {user.bookmarks && Object.keys(user.bookmarks).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(user.bookmarks).map(([key, value]) => (
                  <div key={key} className="py-1">
                    <div className="font-medium">{key}</div>
                    <div className="text-sm text-muted-foreground">{String(value)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No bookmarks found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 