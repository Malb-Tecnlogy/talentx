import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2 } from "lucide-react";

export default function AdminCompanies() {
  const { data: companies = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/companies"],
  });

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3" data-testid="title-companies">
            <Building2 className="h-8 w-8" />
            Companies Management
          </h1>
          <p className="text-muted-foreground">Manage all registered companies</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Companies ({companies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : companies.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No companies found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Website</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id} data-testid={`company-row-${company.id}`}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.industry || "N/A"}</TableCell>
                      <TableCell>{company.location || "N/A"}</TableCell>
                      <TableCell>{company.website || "N/A"}</TableCell>
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
