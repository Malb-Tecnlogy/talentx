import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileSignature } from "lucide-react";

export default function AdminContracts() {
  const { data: contracts = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/contracts"],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3" data-testid="title-contracts">
            <FileSignature className="h-8 w-8" />
            Contracts Management
          </h1>
          <p className="text-muted-foreground">View and manage contracts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Contracts ({contracts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No contracts found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Terms</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id} data-testid={`contract-row-${contract.id}`}>
                      <TableCell className="font-medium max-w-md truncate">
                        {contract.terms || "No terms"}
                      </TableCell>
                      <TableCell>{contract.amount ? `$${contract.amount}` : "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>
                        {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "N/A"}
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
