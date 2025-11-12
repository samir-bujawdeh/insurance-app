import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPolicies } from "@/api/policies";
import { getTariffsByPolicy, createTariff, deleteTariff, deleteAllTariffsForPolicy, Tariff } from "@/api/tariffs";
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
import { Plus, Edit, Trash2, Search, Filter, X, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function TariffsPage() {
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [search, setSearch] = useState("");
  const [filterClassType, setFilterClassType] = useState<string>("");
  const [filterFamilyType, setFilterFamilyType] = useState<string>("");
  const [filterOutpatientCoverage, setFilterOutpatientCoverage] = useState<string>("");
  const [filterAgeRange, setFilterAgeRange] = useState<string>("");
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);

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

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllTariffsForPolicy,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tariffs", selectedPolicyId] });
      toast.success(data.message);
      setDeleteAllDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to delete all tariffs");
    },
  });

  const filteredPolicies = policies?.items.filter((policy) =>
    policy.name.toLowerCase().includes(search.toLowerCase())
  );

  // Extract unique values for filters
  const uniqueClassTypes = tariffs
    ? Array.from(new Set(tariffs.map((t) => t.class_type).filter(Boolean))).sort()
    : [];
  
  const uniqueFamilyTypes = tariffs
    ? Array.from(new Set(tariffs.map((t) => t.family_type).filter(Boolean))).sort()
    : [];

  // Extract unique outpatient coverage percentages (convert to percentage format for display)
  const uniqueOutpatientCoverages = tariffs
    ? Array.from(
        new Set(
          tariffs
            .map((t) => t.outpatient_coverage_percentage)
            .filter((val) => val !== undefined && val !== null)
            .map((val) => (val * 100).toFixed(0) + "%")
        )
      ).sort((a, b) => {
        // Sort numerically by percentage value
        const numA = parseFloat(a);
        const numB = parseFloat(b);
        return numA - numB;
      })
    : [];

  // Extract unique age ranges
  const uniqueAgeRanges = tariffs
    ? Array.from(
        new Set(
          tariffs.map((t) => `${t.age_min}-${t.age_max}`)
        )
      ).sort((a, b) => {
        // Sort by minimum age
        const minA = parseInt(a.split("-")[0]);
        const minB = parseInt(b.split("-")[0]);
        return minA - minB;
      })
    : [];

  // Filter tariffs based on selected filters
  const filteredTariffs = tariffs?.filter((tariff) => {
    // Filter by class type
    if (filterClassType && tariff.class_type !== filterClassType) {
      return false;
    }

    // Filter by family type
    if (filterFamilyType) {
      if (!tariff.family_type || tariff.family_type !== filterFamilyType) {
        return false;
      }
    }

    // Filter by outpatient coverage
    if (filterOutpatientCoverage) {
      const coverage = tariff.outpatient_coverage_percentage;
      if (coverage === undefined || coverage === null) {
        return false;
      }
      const coveragePercent = (coverage * 100).toFixed(0) + "%";
      if (coveragePercent !== filterOutpatientCoverage) {
        return false;
      }
    }

    // Filter by age range
    if (filterAgeRange) {
      const ageRange = `${tariff.age_min}-${tariff.age_max}`;
      if (ageRange !== filterAgeRange) {
        return false;
      }
    }

    return true;
  }) || [];

  const hasActiveFilters = filterClassType || filterFamilyType || filterOutpatientCoverage || filterAgeRange;

  const clearFilters = () => {
    setFilterClassType("");
    setFilterFamilyType("");
    setFilterOutpatientCoverage("");
    setFilterAgeRange("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tariffs Management</h1>
        <p className="text-muted-foreground">
          Manage pricing tariffs for insurance plans
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Plan</CardTitle>
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
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  onClick={() => setDeleteAllDialogOpen(true)}
                  disabled={deleteAllMutation.isPending || !tariffs || tariffs.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All Tariffs for This Plan
                </Button>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Tariff
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading tariffs...</div>
            ) : tariffs && tariffs.length > 0 ? (
              <>
                {/* Filters */}
                <div className="mb-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-7 text-xs"
                      >
                        <X className="mr-1 h-3 w-3" />
                        Clear All
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Age Range Filter */}
                    <div>
                      <Label htmlFor="filter-age-range" className="text-xs text-muted-foreground">
                        Age Range
                      </Label>
                      <Select
                        id="filter-age-range"
                        value={filterAgeRange}
                        onChange={(e) => setFilterAgeRange(e.target.value)}
                      >
                        <option value="">All Age Ranges</option>
                        {uniqueAgeRanges.map((ageRange) => (
                          <option key={ageRange} value={ageRange}>
                            {ageRange}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Class Type Filter */}
                    <div>
                      <Label htmlFor="filter-class" className="text-xs text-muted-foreground">
                        Class Type
                      </Label>
                      <Select
                        id="filter-class"
                        value={filterClassType}
                        onChange={(e) => setFilterClassType(e.target.value)}
                      >
                        <option value="">All Classes</option>
                        {uniqueClassTypes.map((classType) => (
                          <option key={classType} value={classType}>
                            {classType}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Family Type Filter */}
                    <div>
                      <Label htmlFor="filter-family" className="text-xs text-muted-foreground">
                        Family Type
                      </Label>
                      <Select
                        id="filter-family"
                        value={filterFamilyType}
                        onChange={(e) => setFilterFamilyType(e.target.value)}
                      >
                        <option value="">All Family Types</option>
                        {uniqueFamilyTypes.map((familyType) => (
                          <option key={familyType} value={familyType}>
                            {familyType}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {/* Outpatient Coverage Filter */}
                    <div>
                      <Label htmlFor="filter-outpatient" className="text-xs text-muted-foreground">
                        Outpatient Coverage
                      </Label>
                      <Select
                        id="filter-outpatient"
                        value={filterOutpatientCoverage}
                        onChange={(e) => setFilterOutpatientCoverage(e.target.value)}
                      >
                        <option value="">All Coverage Levels</option>
                        {uniqueOutpatientCoverages.map((coverage) => (
                          <option key={coverage} value={coverage}>
                            {coverage}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  {hasActiveFilters && (
                    <div className="text-sm text-muted-foreground">
                      Showing {filteredTariffs.length} of {tariffs.length} tariffs
                    </div>
                  )}
                </div>

                {/* Table */}
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
                  {filteredTariffs.length > 0 ? (
                    filteredTariffs.map((tariff) => (
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No tariffs match the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </>
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

      {/* Delete All Confirmation Dialog */}
      <Dialog open={deleteAllDialogOpen} onOpenChange={setDeleteAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete All Tariffs
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete ALL tariffs for this plan? This action cannot be undone.
              <br />
              <br />
              <strong className="text-destructive">
                This will permanently delete all {tariffs?.length || 0} tariff record(s) for the selected plan.
              </strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteAllDialogOpen(false)}
              disabled={deleteAllMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedPolicyId && deleteAllMutation.mutate(selectedPolicyId)}
              disabled={deleteAllMutation.isPending || !selectedPolicyId}
            >
              {deleteAllMutation.isPending ? "Deleting..." : "Delete All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

