"use client";

import { useState, useEffect } from "react";
import { useFirebase } from "../context/firebase-context";
import { DocumentData } from "firebase/firestore";
import Link from "next/link";
import { Trash2, UserCog, Search } from "lucide-react";

export default function UsersPage() {
  const { getUsers, deleteUser } = useFirebase();
  const [users, setUsers] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getUsers]);

  const handleDeleteUser = async (id: string) => {
    if (confirmDelete === id) {
      try {
        await deleteUser(id);
        setUsers(users.filter(user => user.id !== id));
        setConfirmDelete(null);
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    } else {
      setConfirmDelete(id);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    return (
      (user.name && user.name.toLowerCase().includes(lowerCaseQuery)) ||
      (user.email && user.email.toLowerCase().includes(lowerCaseQuery)) ||
      (user.number && user.number.includes(searchQuery)) ||
      (user.institution && user.institution.toLowerCase().includes(lowerCaseQuery))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage all users in your application
          </p>
        </div>
      </div>

      <div className="flex items-center mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded-md border border-input bg-background pl-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Phone</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User Type</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Institution</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle">{user.name || "-"}</td>
                      <td className="p-4 align-middle">{user.email || "-"}</td>
                      <td className="p-4 align-middle">{user.number || "-"}</td>
                      <td className="p-4 align-middle">{user.userType || "-"}</td>
                      <td className="p-4 align-middle">{user.institution || "-"}</td>
                      <td className="p-4 align-middle">
                        <div className="flex gap-2">
                          <Link
                            href={`/users/${user.id}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground"
                          >
                            <UserCog className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${
                              confirmDelete === user.id
                                ? "bg-destructive text-destructive-foreground"
                                : "border border-input hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete user</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="h-24 text-center">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 