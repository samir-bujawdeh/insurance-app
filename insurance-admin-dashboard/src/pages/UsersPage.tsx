import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getUsers, 
  deactivateUser, 
  activateUser, 
  deleteUser, 
  UserFilters,
  getUserPolicies,
  getUserClaims,
  createUserPolicy,
  deleteUserPolicy
} from "@/api/users";
import { getPolicies } from "@/api/policies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { User } from "@/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Plus,
  FileText,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

function AddPolicyForm({
  availablePolicies,
  onSubmit,
  onCancel,
  isLoading,
}: {
  availablePolicies: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    policy_id: "",
    status: "pending_payment",
    premium_paid: "",
    start_date: "",
    end_date: "",
    policy_number: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.policy_id) {
      toast.error("Please select a policy");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="policy_id">Policy *</Label>
        <Select
          id="policy_id"
          value={formData.policy_id}
          onChange={(e) => setFormData({ ...formData, policy_id: e.target.value })}
          required
        >
          <option value="">Select a policy...</option>
          {availablePolicies.map((policy) => (
            <option key={policy.policy_id} value={policy.policy_id}>
              {policy.name} - {policy.provider?.name || "Unknown Provider"}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
        >
          <option value="pending_payment">Pending Payment</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="premium_paid">Premium Paid</Label>
          <Input
            id="premium_paid"
            type="number"
            step="0.01"
            value={formData.premium_paid}
            onChange={(e) => setFormData({ ...formData, premium_paid: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="policy_number">Policy Number</Label>
          <Input
            id="policy_number"
            value={formData.policy_number}
            onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Policy"}
        </Button>
      </DialogFooter>
    </form>
  );
}


function UserActions({ user }: { user: User }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateUser(user.user_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deactivated");
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => activateUser(user.user_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User activated");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(user.user_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted");
      setDeleteDialogOpen(false);
    },
  });

  const isActive = user.is_active !== false;

  return (
    <>
      <div className="flex items-center gap-2">
        {isActive ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deactivateMutation.mutate()}
          >
            <XCircle className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => activateMutation.mutate()}
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {user.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    page_size: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => getUsers(filters),
    placeholderData: {
      items: [
        {
          user_id: 1,
          name: "John Doe",
          email: "john@example.com",
          phone: "+1-555-0123",
          created_at: "2024-01-15T10:00:00Z",
          is_active: true,
        },
        {
          user_id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+1-555-0124",
          created_at: "2024-01-20T10:00:00Z",
          is_active: true,
        },
      ],
      total: 2,
      page: 1,
      page_size: 10,
      total_pages: 1,
    },
  });


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users Management</h1>
        <p className="text-muted-foreground">
          Manage all platform users, view their policies and claims, activate/deactivate accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
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
            <div>Loading users...</div>
          ) : (
            <div className="space-y-2">
              {(data?.items || []).map((user) => (
                <div key={user.user_id} className="border rounded-lg">
                  <UserRowWithDetails user={user} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserRowWithDetails({ user }: { user: User }) {
  const [expanded, setExpanded] = useState(false);
  const [addPolicyDialogOpen, setAddPolicyDialogOpen] = useState(false);
  const [deletePolicyDialogOpen, setDeletePolicyDialogOpen] = useState(false);
  const [selectedUserPolicy, setSelectedUserPolicy] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: policies, isLoading: policiesLoading } = useQuery({
    queryKey: ["user-policies", user.user_id],
    queryFn: () => getUserPolicies(user.user_id),
    enabled: expanded,
  });

  const { data: claims, isLoading: claimsLoading } = useQuery({
    queryKey: ["user-claims", user.user_id],
    queryFn: () => getUserClaims(user.user_id),
    enabled: expanded,
  });

  const { data: availablePolicies } = useQuery({
    queryKey: ["policies", { page: 1, page_size: 100 }],
    queryFn: () => getPolicies({ page: 1, page_size: 100 }),
    enabled: addPolicyDialogOpen,
  });

  const createPolicyMutation = useMutation({
    mutationFn: (data: any) => createUserPolicy(user.user_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-policies", user.user_id] });
      toast.success("Policy added to user successfully");
      setAddPolicyDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to add policy");
    },
  });

  const deletePolicyMutation = useMutation({
    mutationFn: (userPolicyId: number) => deleteUserPolicy(user.user_id, userPolicyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-policies", user.user_id] });
      toast.success("Policy removed from user successfully");
      setDeletePolicyDialogOpen(false);
      setSelectedUserPolicy(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to remove policy");
    },
  });

  const handleAddPolicy = (formData: any) => {
    createPolicyMutation.mutate({
      policy_id: parseInt(formData.policy_id),
      status: formData.status || "pending_payment",
      premium_paid: formData.premium_paid ? parseFloat(formData.premium_paid) : undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      policy_number: formData.policy_number || undefined,
    });
  };

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 grid grid-cols-5 gap-4">
            <div>
              <div className="text-sm font-medium">ID</div>
              <div className="text-sm text-muted-foreground">{user.user_id}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Name</div>
              <div className="text-sm text-muted-foreground">{user.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Email</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Phone</div>
              <div className="text-sm text-muted-foreground">{user.phone || "N/A"}</div>
            </div>
            <div>
              <div className="text-sm font-medium">Created</div>
              <div className="text-sm text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <UserActions user={user} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t p-4 space-y-4 bg-muted/50">
          {/* Policies Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Policies ({policies?.length || 0})
              </h3>
              <Button
                size="sm"
                onClick={() => setAddPolicyDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Policy
              </Button>
            </div>
            {policiesLoading ? (
              <div className="text-sm text-muted-foreground">Loading policies...</div>
            ) : policies && policies.length > 0 ? (
              <div className="space-y-2">
                {policies.map((userPolicy: any) => (
                  <div
                    key={userPolicy.user_policy_id}
                    className="p-3 border rounded-lg bg-background"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{userPolicy.policy?.name || "Unknown Policy"}</span>
                          <Badge variant={
                            userPolicy.status === "active" ? "default" :
                            userPolicy.status === "pending_payment" ? "secondary" :
                            "destructive"
                          }>
                            {userPolicy.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {userPolicy.policy_number && (
                            <div>Policy #: {userPolicy.policy_number}</div>
                          )}
                          {userPolicy.premium_paid && (
                            <div>Premium: ${userPolicy.premium_paid}</div>
                          )}
                          {userPolicy.start_date && (
                            <div>Start: {new Date(userPolicy.start_date).toLocaleDateString()}</div>
                          )}
                          {userPolicy.end_date && (
                            <div>End: {new Date(userPolicy.end_date).toLocaleDateString()}</div>
                          )}
                          <div>Issued: {new Date(userPolicy.issued_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUserPolicy(userPolicy);
                          setDeletePolicyDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No policies found</div>
            )}
          </div>

          {/* Claims Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Claims ({claims?.length || 0})
              </h3>
            </div>
            {claimsLoading ? (
              <div className="text-sm text-muted-foreground">Loading claims...</div>
            ) : claims && claims.length > 0 ? (
              <div className="space-y-2">
                {claims.map((claim: any) => (
                  <div
                    key={claim.claim_id}
                    className="p-3 border rounded-lg bg-background"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">Claim #{claim.claim_id}</span>
                          <Badge variant={
                            claim.status === "approved" ? "default" :
                            claim.status === "rejected" ? "destructive" :
                            "secondary"
                          }>
                            {claim.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {claim.claim_amount && (
                            <div>Amount: ${claim.claim_amount}</div>
                          )}
                          <div>Filed: {new Date(claim.date_filed).toLocaleDateString()}</div>
                          {claim.description && (
                            <div className="mt-1">{claim.description}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No claims found</div>
            )}
          </div>
        </div>
      )}

      {/* Add Policy Dialog */}
      <Dialog open={addPolicyDialogOpen} onOpenChange={setAddPolicyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Policy to User</DialogTitle>
            <DialogDescription>
              Assign a new policy to {user.name}
            </DialogDescription>
          </DialogHeader>
          <AddPolicyForm
            availablePolicies={availablePolicies?.items || []}
            onSubmit={handleAddPolicy}
            onCancel={() => setAddPolicyDialogOpen(false)}
            isLoading={createPolicyMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Policy Confirmation Dialog */}
      <Dialog open={deletePolicyDialogOpen} onOpenChange={setDeletePolicyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Policy</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{selectedUserPolicy?.policy?.name}" from {user.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeletePolicyDialogOpen(false);
                setSelectedUserPolicy(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedUserPolicy) {
                  deletePolicyMutation.mutate(selectedUserPolicy.user_policy_id);
                }
              }}
              disabled={deletePolicyMutation.isPending}
            >
              {deletePolicyMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
