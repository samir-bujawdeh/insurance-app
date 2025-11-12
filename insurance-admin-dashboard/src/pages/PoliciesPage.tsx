import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPolicies, createPolicy, updatePolicy, deletePolicy } from "@/api/policies";
import { getProviders } from "@/api/providers";
import { getInsuranceTypes } from "@/api/insurance-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InsurancePlan } from "@/types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search } from "lucide-react";

export function PoliciesPage() {
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePlan | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["policies", { search }],
    queryFn: () => getPolicies({ search, page: 1, page_size: 50 }),
  });

  const createMutation = useMutation({
    mutationFn: createPolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Plan created successfully");
      setCreateDialogOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updatePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Plan updated successfully");
      setEditDialogOpen(false);
      setSelectedPolicy(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      toast.success("Plan deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedPolicy(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to delete plan");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plans Management</h1>
          <p className="text-muted-foreground">
            Manage insurance plans and rates
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plans</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans..."
                  className="pl-8 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading plans...</div>
          ) : (
            <div className="space-y-4">
              {data?.items.map((policy) => (
                <div key={policy.policy_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{policy.name}</h3>
                    <p className="text-sm text-muted-foreground">{policy.description || "No description"}</p>
                    {policy.duration && (
                      <p className="text-sm">Duration: {policy.duration}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedPolicy(policy);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <PolicyDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={(data) => createMutation.mutate(data)}
      />

      {/* Edit Dialog */}
      {selectedPolicy && (
        <PolicyDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          policy={selectedPolicy}
          onSubmit={(data) => updateMutation.mutate({ id: selectedPolicy.policy_id, data })}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPolicy?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedPolicy(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (selectedPolicy) {
                  deleteMutation.mutate(selectedPolicy.policy_id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PolicyDialog({
  open,
  onOpenChange,
  policy,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy?: InsurancePlan;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: policy?.name || "",
    description: policy?.description || "",
    duration: policy?.duration || "12 months",
    status: (policy?.status || "active") as "active" | "inactive",
    type_id: policy?.type_id || 0,
    provider_id: policy?.provider_id || 0,
    contract_pdf_url: policy?.contract_pdf_url || "",
  });

  const { data: providers } = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
  });

  const { data: insuranceTypes } = useQuery({
    queryKey: ["insurance-types"],
    queryFn: getInsuranceTypes,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{policy ? "Edit Plan" : "Create Plan"}</DialogTitle>
          <DialogDescription>
            {policy ? "Update plan details" : "Add a new insurance plan"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type_id">Insurance Type *</Label>
              <Select
                id="type_id"
                value={formData.type_id}
                onChange={(e) => setFormData({ ...formData, type_id: parseInt(e.target.value) })}
                required
              >
                <option value={0}>Select type...</option>
                {insuranceTypes?.map((type) => (
                  <option key={type.type_id} value={type.type_id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </div>
            
            <div>
              <Label htmlFor="provider_id">Provider *</Label>
              <Select
                id="provider_id"
                value={formData.provider_id}
                onChange={(e) => setFormData({ ...formData, provider_id: parseInt(e.target.value) })}
                required
              >
                <option value={0}>Select provider...</option>
                {providers?.map((provider) => (
                  <option key={provider.provider_id} value={provider.provider_id}>
                    {provider.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 12 months"
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="contract_pdf_url">Contract PDF URL</Label>
            <Input
              id="contract_pdf_url"
              type="url"
              value={formData.contract_pdf_url}
              onChange={(e) => setFormData({ ...formData, contract_pdf_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => onSubmit(formData)}
            disabled={!formData.name || !formData.type_id || !formData.provider_id}
          >
            {policy ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
