import { useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function AdminJobs() {
  const { toast } = useToast();
  const { data: jobs = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/jobs"],
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/jobs/${id}/approve`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({ title: "Job approved", description: "Job posting has been approved" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/admin/jobs/${id}/reject`, "POST"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      toast({ title: "Job rejected", description: "Job posting has been rejected" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3" data-testid="title-jobs">
            <Briefcase className="h-8 w-8" />
            Jobs Management
          </h1>
          <p className="text-muted-foreground">Manage and approve job postings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Jobs ({jobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No jobs found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id} data-testid={`job-row-${job.id}`}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.type}</TableCell>
                      <TableCell>{job.budget ? `$${job.budget}` : "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(job.status)}</TableCell>
                      <TableCell className="text-right">
                        {job.status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => approveMutation.mutate(job.id)}
                              data-testid={`button-approve-${job.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectMutation.mutate(job.id)}
                              data-testid={`button-reject-${job.id}`}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
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
