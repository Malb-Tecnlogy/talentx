import { useState } from "react";
import AdminLayout from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Check, X, Edit, Trash2, Plus, DollarSign, Clock, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobSchema, type InsertJob, type Job } from "@shared/schema";

export default function AdminJobs() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: jobs = [], isLoading, error } = useQuery<any[]>({
    queryKey: ["/api/admin/jobs"],
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: companies = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/companies"],
    staleTime: 0,
  });

  const createForm = useForm<InsertJob>({
    resolver: zodResolver(insertJobSchema),
    defaultValues: {
      title: "",
      description: "",
      requirements: "",
      skills: [],
      type: "full-time",
      status: "draft",
      companyId: "",
    },
  });

  const editForm = useForm<InsertJob>({
    resolver: zodResolver(insertJobSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertJob) => apiRequest("POST", "/api/admin/jobs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Success", description: "Job created successfully" });
      setIsCreateOpen(false);
      createForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create job", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertJob> }) =>
      apiRequest("PATCH", `/api/admin/jobs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Success", description: "Job updated successfully" });
      setEditingJob(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update job", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/jobs/${id}`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Success", description: "Job deleted successfully" });
      setDeletingJobId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete job", variant: "destructive" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/jobs/${id}/approve`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Success", description: "Job approved and now visible to professionals" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/admin/jobs/${id}/reject`, undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({ title: "Success", description: "Job rejected and closed" });
    },
  });

  const handleCreateSubmit = (data: InsertJob) => {
    createMutation.mutate(data);
  };

  const handleEditSubmit = (data: InsertJob) => {
    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, data });
    }
  };

  const handleEdit = (job: any) => {
    setEditingJob(job);
    editForm.reset({
      companyId: job.companyId || "",
      title: job.title || "",
      description: job.description || "",
      requirements: job.requirements || "",
      skills: job.skills || [],
      budget: job.budget ? job.budget.toString() : "",
      duration: job.duration || "",
      type: job.type || "full-time",
      status: job.status || "draft",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending_approval":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>;
      case "closed":
        return <Badge variant="secondary">Closed</Badge>;
      case "paused":
        return <Badge variant="outline">Paused</Badge>;
      case "draft":
        return <Badge variant="outline" className="border-gray-400">Draft</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filter jobs by status
  const filteredJobs = statusFilter === "all" 
    ? jobs 
    : jobs.filter((job: any) => job.status === statusFilter);

  // Count jobs by status
  const jobCounts = {
    all: jobs.length,
    active: jobs.filter((j: any) => j.status === "active").length,
    pending_approval: jobs.filter((j: any) => j.status === "pending_approval").length,
    draft: jobs.filter((j: any) => j.status === "draft").length,
    closed: jobs.filter((j: any) => j.status === "closed").length,
  };

  return (
    <AdminLayout>
      <div>
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3" data-testid="title-jobs">
              <Briefcase className="h-8 w-8" />
              Jobs Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage and approve job postings</p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create-job">
            <Plus className="h-4 w-4 mr-2" />
            Create New Job
          </Button>
        </div>

        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter} className="mb-6">
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">
              All ({jobCounts.all})
            </TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-active">
              Active ({jobCounts.active})
            </TabsTrigger>
            <TabsTrigger value="pending_approval" data-testid="tab-pending">
              Pending ({jobCounts.pending_approval})
            </TabsTrigger>
            <TabsTrigger value="draft" data-testid="tab-draft">
              Draft ({jobCounts.draft})
            </TabsTrigger>
            <TabsTrigger value="closed" data-testid="tab-closed">
              Closed ({jobCounts.closed})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>
              {statusFilter === "all" ? "All Jobs" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1).replace("_", " ")} Jobs`}
            </CardTitle>
            <CardDescription>
              {filteredJobs.length} job{filteredJobs.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive font-medium mb-2">Failed to load jobs</p>
                <p className="text-muted-foreground text-sm">
                  {error instanceof Error ? error.message : "Authentication required. Please login as admin."}
                </p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No {statusFilter !== "all" && statusFilter} jobs found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[250px]">Job Details</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job: any) => (
                      <TableRow key={job.id} data-testid={`job-row-${job.id}`}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{job.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {job.duration || "Not specified"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{job.company?.name || job.companyId}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {job.skills.slice(0, 2).map((skill: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {job.skills.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{job.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {job.budget ? (
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <DollarSign className="h-3 w-3" />
                              {job.budget}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {job.status === "pending_approval" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
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
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(job)}
                              data-testid={`button-edit-${job.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeletingJobId(job.id)}
                              data-testid={`button-delete-${job.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
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

        {/* Create Job Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company">
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Senior React Developer" data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder="Job description..." data-testid="input-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Job requirements..." data-testid="input-requirements" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma separated) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="React, TypeScript, Node.js"
                          value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                          onChange={(e) => {
                            const skills = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                            field.onChange(skills);
                          }}
                          data-testid="input-skills"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="project">Project</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value || "draft"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending_approval">Pending Approval</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ""} placeholder="5000" data-testid="input-budget" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="3 months" data-testid="input-duration" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-create">
                    {createMutation.isPending ? "Creating..." : "Create Job"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Job Dialog */}
        <Dialog open={!!editingJob} onOpenChange={() => setEditingJob(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-edit-company">
                            <SelectValue placeholder="Select a company" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {companies.map((company: any) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Senior React Developer" data-testid="input-edit-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder="Job description..." data-testid="input-edit-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requirements *</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Job requirements..." data-testid="input-edit-requirements" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma separated) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="React, TypeScript, Node.js"
                          value={Array.isArray(field.value) ? field.value.join(", ") : ""}
                          onChange={(e) => {
                            const skills = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                            field.onChange(skills);
                          }}
                          data-testid="input-edit-skills"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-time">Full-time</SelectItem>
                            <SelectItem value="part-time">Part-time</SelectItem>
                            <SelectItem value="contract">Contract</SelectItem>
                            <SelectItem value="project">Project</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "draft"}>
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending_approval">Pending Approval</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                            <SelectItem value="paused">Paused</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Budget ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} value={field.value || ""} placeholder="5000" data-testid="input-edit-budget" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="3 months" data-testid="input-edit-duration" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditingJob(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit">
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deletingJobId} onOpenChange={() => setDeletingJobId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete this job? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingJobId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deletingJobId && deleteMutation.mutate(deletingJobId)}
                disabled={deleteMutation.isPending}
                data-testid="button-confirm-delete"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
