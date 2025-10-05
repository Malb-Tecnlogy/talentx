import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function AdminApplications() {
  const { data: applications = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/applications"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge variant="default">Accepted</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3" data-testid="title-applications">
            <FileText className="h-8 w-8" />
            Applications Management
          </h1>
          <p className="text-muted-foreground">View and manage job applications</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Applications ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No applications found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proposal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Timeline</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => (
                    <TableRow key={app.id} data-testid={`application-row-${app.id}`}>
                      <TableCell className="font-medium max-w-md truncate">
                        {app.coverLetter || "No proposal"}
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>{app.proposedRate ? `$${app.proposedRate}` : "N/A"}</TableCell>
                      <TableCell>{app.proposedTimeline || "N/A"}</TableCell>
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
