import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCog } from "lucide-react";

export default function AdminProfessionals() {
  const { data: professionals = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/professionals"],
  });

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3" data-testid="title-professionals">
            <UserCog className="h-8 w-8" />
            Professionals Management
          </h1>
          <p className="text-muted-foreground">Manage all professional profiles</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Professionals ({professionals.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : professionals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No professionals found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Experience</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professionals.map((prof) => (
                    <TableRow key={prof.id} data-testid={`professional-row-${prof.id}`}>
                      <TableCell className="font-medium">{prof.title || "N/A"}</TableCell>
                      <TableCell>{`${prof.city || ""}, ${prof.state || ""}`.trim() || "N/A"}</TableCell>
                      <TableCell>{prof.yearsOfExperience ? `${prof.yearsOfExperience} years` : "N/A"}</TableCell>
                      <TableCell>{prof.hourlyRate ? `$${prof.hourlyRate}/hr` : "N/A"}</TableCell>
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
