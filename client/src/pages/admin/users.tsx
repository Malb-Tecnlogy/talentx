import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/users/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User deleted",
        description: "User has been deleted successfully",
      });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "company":
        return "default";
      case "professional":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <AdminLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="title-users">Users Management</h1>
            <p className="text-muted-foreground">Manage all platform users</p>
          </div>
          <Button data-testid="button-add-user">
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by name, email, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-users"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                        <TableCell className="font-medium" data-testid={`user-username-${user.id}`}>
                          {user.username}
                        </TableCell>
                        <TableCell data-testid={`user-email-${user.id}`}>
                          {user.email || "N/A"}
                        </TableCell>
                        <TableCell data-testid={`user-name-${user.id}`}>
                          {user.firstName || user.lastName
                            ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeColor(user.role)} data-testid={`user-role-${user.id}`}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.emailVerified ? "default" : "outline"} data-testid={`user-status-${user.id}`}>
                            {user.emailVerified ? "Verified" : "Not Verified"}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`user-last-login-${user.id}`}>
                          {user.lastLoginAt
                            ? new Date(user.lastLoginAt).toLocaleString()
                            : "Never"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              data-testid={`button-edit-${user.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteId(user.id)}
                              data-testid={`button-delete-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
