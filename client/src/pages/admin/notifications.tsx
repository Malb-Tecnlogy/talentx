import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

export default function AdminNotifications() {
  const { data: notifications = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/notifications/all"],
  });

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3" data-testid="title-notifications">
            <Bell className="h-8 w-8" />
            Notifications Management
          </h1>
          <p className="text-muted-foreground">View and manage system notifications</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Notifications ({notifications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No notifications found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Message</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notif) => (
                    <TableRow key={notif.id} data-testid={`notification-row-${notif.id}`}>
                      <TableCell className="font-medium max-w-md truncate">
                        {notif.message}
                      </TableCell>
                      <TableCell>{notif.type}</TableCell>
                      <TableCell>
                        <Badge variant={notif.read ? "secondary" : "default"}>
                          {notif.read ? "Read" : "Unread"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
