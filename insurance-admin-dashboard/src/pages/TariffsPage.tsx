import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPolicies } from "@/api/policies";
import { getTariffsByPolicy, createTariff, deleteTariff, Tariff } from "@/api/tariffs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TariffsPage() {
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();

  const { data: policies } = useQuery({
    queryKey: ["policies"],
    queryFn: () => getPolicies({ page: 1, page_size: 100 }),
  });

  const { data: tariffs, isLoading } = useQuery({
    queryKey: ["tariffs", selectedPolicyId],
    queryFn: () => getTariffsByPolicy(selectedPolicyId!),
    enabled: !!selectedPolicyId,
  });

  const createMutation = useMutation({
    mutationFn: createTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
      toast.success("Tariff created successfully");
      setCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to create tariff");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tariffs"] });
      toast.success("Tariff deleted successfully");
    },
  });

  const filteredPolicies = policies?.items.filter((policy) =>
    policy.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tariffs Management</h1>
        <p className="text-muted-foreground">
          Manage pricing tariffs for insurance policies
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Policy</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  className="pl-8 w-64"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredPolicies?.map((policy) => (
              <button
                key={policy.policy_id}
                onClick={() => setSelectedPolicyId(policy.policy_id)}
                className={`w-full text-left p-3 border rounded-lg transition-colors ${
                  selectedPolicyId === policy.policy_id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="font-semibold">{policy.name}</div>
                <div className="text-sm text-muted-foreground">ID: {policy.policy_id}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPolicyId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tariffs</CardTitle>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Tariff
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading tariffs...</div>
            ) : tariffs && tariffs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Age Range</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Family Range</TableHead>
                    <TableHead>Family Type</TableHead>
                    <TableHead>Inpatient (USD)</TableHead>
                    <TableHead>Outpatient Coverage %</TableHead>
                    <TableHead>Outpatient Price (USD)</TableHead>
                    <TableHead>Total (USD)</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tariffs.map((tariff) => (
                    <TableRow key={tariff.tariff_id}>
                      <TableCell>{tariff.age_min}-{tariff.age_max}</TableCell>
                      <TableCell>{tariff.class_type}</TableCell>
                      <TableCell>{tariff.family_min}-{tariff.family_max}</TableCell>
                      <TableCell>{tariff.family_type || "-"}</TableCell>
                      <TableCell>{tariff.inpatient_usd || "-"}</TableCell>
                      <TableCell>{tariff.outpatient_coverage_percentage !== undefined ? `${(tariff.outpatient_coverage_percentage * 100).toFixed(0)}%` : "-"}</TableCell>
                      <TableCell>{tariff.outpatient_price_usd || "-"}</TableCell>
                      <TableCell>{tariff.total_usd || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteMutation.mutate(tariff.tariff_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tariffs found for this policy. Click "Add Tariff" to create one.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      {selectedPolicyId && (
        <TariffDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          policyId={selectedPolicyId}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}
    </div>
  );
}

function TariffDialog({
  open,
  onOpenChange,
  policyId,
  tariff,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policyId: number;
  tariff?: Tariff;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    policy_id: policyId,
    age_min: tariff?.age_min || 0,
    age_max: tariff?.age_max || 100,
    class_type: tariff?.class_type || "",
    family_type: tariff?.family_type || "",
    family_min: tariff?.family_min || 1,
    family_max: tariff?.family_max || 1,
    inpatient_usd: tariff?.inpatient_usd || undefined,
    total_usd: tariff?.total_usd || undefined,
    outpatient_coverage_percentage: tariff?.outpatient_coverage_percentage || undefined,
    outpatient_price_usd: tariff?.outpatient_price_usd || undefined,
  });

  // Update formData when policyId changes or dialog opens
  useEffect(() => {
    if (open && policyId) {
      setFormData(prev => ({
        ...prev,
        policy_id: policyId,
        // Reset form fields when opening for new tariff (not editing)
        ...(tariff ? {} : {
          age_min: 0,
          age_max: 100,
          class_type: "",
          family_type: "",
          family_min: 1,
          family_max: 1,
          inpatient_usd: undefined,
          total_usd: undefined,
          outpatient_coverage_percentage: undefined,
          outpatient_price_usd: undefined,
        })
      }));
    }
  }, [open, policyId, tariff]);

  const classTypes = ["A", "B", "SK", "Other"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tariff ? "Edit Tariff" : "Create Tariff"}</DialogTitle>
          <DialogDescription>
            {tariff ? "Update tariff details" : "Add a new tariff entry"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age_min">Age Min *</Label>
              <Input
                id="age_min"
                type="number"
                value={formData.age_min}
                onChange={(e) => setFormData({ ...formData, age_min: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="age_max">Age Max *</Label>
              <Input
                id="age_max"
                type="number"
                value={formData.age_max}
                onChange={(e) => setFormData({ ...formData, age_max: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="class_type">Class Type *</Label>
            <Select
              id="class_type"
              value={formData.class_type}
              onChange={(e) => setFormData({ ...formData, class_type: e.target.value })}
              required
            >
              <option value="">Select class...</option>
              {classTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="family_min">Family Min *</Label>
              <Input
                id="family_min"
                type="number"
                min="1"
                value={formData.family_min}
                onChange={(e) => setFormData({ ...formData, family_min: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="family_max">Family Max *</Label>
              <Input
                id="family_max"
                type="number"
                min="1"
                value={formData.family_max}
                onChange={(e) => setFormData({ ...formData, family_max: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <div>
              <Label htmlFor="family_type">Family Type (Display Label)</Label>
              <Input
                id="family_type"
                value={formData.family_type}
                onChange={(e) => setFormData({ ...formData, family_type: e.target.value })}
                placeholder="e.g., Family (2–4)"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="inpatient_usd">Inpatient (USD)</Label>
              <Input
                id="inpatient_usd"
                type="number"
                step="0.01"
                value={formData.inpatient_usd || ""}
                onChange={(e) => setFormData({ ...formData, inpatient_usd: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
            <div>
              <Label htmlFor="outpatient_coverage_percentage">Outpatient Coverage %</Label>
              <Input
                id="outpatient_coverage_percentage"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formData.outpatient_coverage_percentage !== undefined ? formData.outpatient_coverage_percentage : ""}
                onChange={(e) => setFormData({ ...formData, outpatient_coverage_percentage: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="e.g., 0.85 for 85%"
              />
            </div>
            <div>
              <Label htmlFor="outpatient_price_usd">Outpatient Price (USD)</Label>
              <Input
                id="outpatient_price_usd"
                type="number"
                step="0.01"
                value={formData.outpatient_price_usd || ""}
                onChange={(e) => setFormData({ ...formData, outpatient_price_usd: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="Additional price"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="total_usd">Total (USD)</Label>
            <Input
              id="total_usd"
              type="number"
              step="0.01"
              value={formData.total_usd || ""}
              onChange={(e) => setFormData({ ...formData, total_usd: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!formData.policy_id) {
                toast.error("Policy ID is required");
                return;
              }
              onSubmit(formData);
            }}
            disabled={!formData.policy_id || formData.age_min == null || formData.age_max == null || !formData.class_type || !formData.family_min || !formData.family_max}
          >
            {tariff ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

