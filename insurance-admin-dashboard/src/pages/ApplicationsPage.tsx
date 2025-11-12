import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
  Application,
  ApplicationDetail,
  ApproveApplicationData,
  RejectApplicationData,
  ApplicationFilters,
} from "@/api/applications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  FileText,
  User,
  Building2,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { label: string; className: string }> = {
    pending_payment: {
      label: "Pending Review",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    active: {
      label: "Active",
      className: "bg-green-100 text-green-800 border-green-200",
    },
    expired: {
      label: "Expired",
      className: "bg-red-100 text-red-800 border-red-200",
    },
  };

  const variant = variants[status] || {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <Badge variant="outline" className={variant.className}>
      {variant.label}
    </Badge>
  );
}

function ApplicationDetailDialog({
  applicationId,
  open,
  onOpenChange,
}: {
  applicationId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveData, setApproveData] = useState<ApproveApplicationData>({
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    policy_number: "",
    premium_paid: 0,
  });
  const [rejectReason, setRejectReason] = useState("");

  const queryClient = useQueryClient();

  const { data: application, isLoading } = useQuery({
    queryKey: ["application", applicationId],
    queryFn: () => getApplicationById(applicationId!),
    enabled: !!applicationId && open,
  });

  const approveMutation = useMutation({
    mutationFn: (data: ApproveApplicationData) =>
      approveApplication(applicationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application approved successfully");
      setApproveDialogOpen(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to approve application");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (data: RejectApplicationData) =>
      rejectApplication(applicationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast.success("Application rejected");
      setRejectDialogOpen(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to reject application");
    },
  });

  if (!applicationId) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review application information and documents
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div>Loading application details...</div>
          ) : application ? (
            <div className="space-y-6">
              {/* User Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    User Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Name</Label>
                      <p className="font-medium">{application.user?.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email</Label>
                      <p className="font-medium">{application.user?.email}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Phone</Label>
                      <p className="font-medium">{application.user?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Member Since</Label>
                      <p className="font-medium">
                        {new Date(application.user?.created_at || "").toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Policy Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Policy Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Policy Name</Label>
                      <p className="font-medium">{application.plan?.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Provider</Label>
                      <p className="font-medium">{application.plan?.provider?.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Type</Label>
                      <p className="font-medium">{application.plan?.insurance_type?.name}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Premium</Label>
                      <p className="font-medium">
                        N/A
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Duration</Label>
                      <p className="font-medium">{application.plan?.duration || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Application Date</Label>
                      <p className="font-medium">
                        {new Date(application.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        Required Documents
                      </Label>
                      <div className="space-y-2">
                        {application.required_documents?.length > 0 ? (
                          application.required_documents.map((doc: any) => (
                            <div
                              key={doc.doc_id}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <span className="text-sm">{doc.name}</span>
                              {application.user_documents?.some(
                                (ud: any) => ud.doc_id === doc.doc_id
                              ) ? (
                                <Badge className="bg-green-100 text-green-800">
                                  Uploaded
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-50">
                                  Missing
                                </Badge>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No documents required
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-semibold mb-2 block">
                        Uploaded Documents
                      </Label>
                      <div className="space-y-2">
                        {application.user_documents?.length > 0 ? (
                          application.user_documents.map((doc: any) => (
                            <div
                              key={doc.user_doc_id}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div className="flex items-center gap-2">
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  {doc.document?.name || "Document"}
                                </a>
                              </div>
                              <Badge
                                className={
                                  doc.verified
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {doc.verified ? "Verified" : "Unverified"}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No documents uploaded
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              {application.status === "pending_payment" && (
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setRejectDialogOpen(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button onClick={() => setApproveDialogOpen(true)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Enter policy details to activate this application
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="policy_number">Policy Number *</Label>
              <Input
                id="policy_number"
                value={approveData.policy_number}
                onChange={(e) =>
                  setApproveData({ ...approveData, policy_number: e.target.value })
                }
                placeholder="POL-2024-001"
              />
            </div>
            <div>
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                value={approveData.start_date}
                onChange={(e) =>
                  setApproveData({ ...approveData, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                value={approveData.end_date}
                onChange={(e) =>
                  setApproveData({ ...approveData, end_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="premium_paid">Premium Paid ($) *</Label>
              <Input
                id="premium_paid"
                type="number"
                step="0.01"
                value={approveData.premium_paid}
                onChange={(e) =>
                  setApproveData({
                    ...approveData,
                    premium_paid: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => approveMutation.mutate(approveData)}
              disabled={approveMutation.isPending || !approveData.policy_number}
            >
              {approveMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection (optional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reject_reason">Rejection Reason</Label>
              <Input
                id="reject_reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate({ reason: rejectReason || undefined })}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<ApplicationFilters>({
    page: 1,
    page_size: 10,
  });
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["applications", filters],
    queryFn: () => getApplications(filters),
  });

  const handleViewDetails = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
    setDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Applications Review</h1>
        <p className="text-muted-foreground">
          Review and manage insurance policy applications
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Pending Applications
              {data && data.total > 0 && (
                <Badge variant="outline" className="ml-2">
                  {data.total}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8 w-64"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setFilters({ ...filters, search: e.target.value, page: 1 });
                  }}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading applications...</div>
          ) : data && data.items.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Policy</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((application: Application) => (
                    <TableRow key={application.user_policy_id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {application.user?.name || "Unknown"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {application.user?.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {application.plan?.name || "Unknown Policy"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {application.plan?.insurance_type?.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {application.plan?.provider?.name || "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(application.issued_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={application.status} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(application.user_policy_id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {data.items.length} of {data.total} applications
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters({ ...filters, page: (filters.page || 1) - 1 })
                    }
                    disabled={filters.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFilters({ ...filters, page: (filters.page || 1) + 1 })
                    }
                    disabled={!data.total_pages || filters.page >= data.total_pages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending applications found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ApplicationDetailDialog
        applicationId={selectedApplicationId}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
      />
    </div>
  );
}

