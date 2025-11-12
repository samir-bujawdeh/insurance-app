import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPolicies } from "@/api/policies";
import { getCriteriaByPolicy, createOrUpdateCriteria, deleteCriteria, InPatientCriteriaData, OutPatientCriteriaData, CoverageItem } from "@/api/criteria";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Search, Save, Trash2 } from "lucide-react";

// Helper function to create default coverage item
const defaultCoverageItem = (): CoverageItem => ({
  notes: "",
});

// Helper function to create default in-patient criteria data
const defaultInPatientCriteriaData = (): InPatientCriteriaData => ({
  in_patient: {
    general_coverages: {
      annual_limit: defaultCoverageItem(),
      scope_of_coverage: defaultCoverageItem(),
      network: defaultCoverageItem(),
      geographic_coverage_elective: defaultCoverageItem(),
      geographic_coverage_emergency: defaultCoverageItem(),
      waiting_period: defaultCoverageItem(),
      non_direct_billing: defaultCoverageItem(),
      cold_case: defaultCoverageItem(),
      hospital_accommodation: defaultCoverageItem(),
      road_ambulance: defaultCoverageItem(),
      maternity_in_patient: defaultCoverageItem(),
      maternity_lab_test: defaultCoverageItem(),
      new_born: defaultCoverageItem(),
      nursery_incubator: defaultCoverageItem(),
      extra_bed_parent: defaultCoverageItem(),
      home_care: defaultCoverageItem(),
      plan_upgrade_downgrade: defaultCoverageItem(),
      passive_war: defaultCoverageItem(),
      payment_frequency: defaultCoverageItem(),
      pre_existing_conditions: defaultCoverageItem(),
    },
    case_coverages: {
      physiotherapy: defaultCoverageItem(),
      work_related_injuries: defaultCoverageItem(),
      acute_allergy_treatments: defaultCoverageItem(),
      bariatric_surgeries: defaultCoverageItem(),
      breast_reconstruction: defaultCoverageItem(),
      chemotherapy_radiotherapy: defaultCoverageItem(),
      chronic_conditions: defaultCoverageItem(),
      congenital_cases_lifetime: defaultCoverageItem(),
      congenital_tests_thalassemia: defaultCoverageItem(),
      epidural: defaultCoverageItem(),
      epilepsy: defaultCoverageItem(),
      icu: defaultCoverageItem(),
      infertility_impotence_sterility: defaultCoverageItem(),
      laparoscopic_procedures: defaultCoverageItem(),
      migraines: defaultCoverageItem(),
      motorcycling: defaultCoverageItem(),
      organ_transplant: defaultCoverageItem(),
      polysomnography: defaultCoverageItem(),
      prosthesis_due_to_accident: defaultCoverageItem(),
      prosthesis_due_to_sickness: defaultCoverageItem(),
      rehabilitation: defaultCoverageItem(),
      renal_dialysis: defaultCoverageItem(),
      scoliosis: defaultCoverageItem(),
      std_excluding_hiv: defaultCoverageItem(),
      varicocele: defaultCoverageItem(),
      varicose_veins: defaultCoverageItem(),
      morgue_burial_expenses: defaultCoverageItem(),
      genetic_tests: defaultCoverageItem(),
      diagnostic_tests: defaultCoverageItem(),
      ambulatory_laboratory_exams: defaultCoverageItem(),
      doctor_visits_consultations: defaultCoverageItem(),
      prescribed_medicines_drugs: defaultCoverageItem(),
    },
  },
});

// Helper function to create default out-patient criteria data
const defaultOutPatientCriteriaData = (): OutPatientCriteriaData => ({
  out_patient: {
    outpatient_annual_limit: defaultCoverageItem(),
    outpatient_coverage: defaultCoverageItem(),
    outpatient_network: defaultCoverageItem(),
    outpatient_deductible: defaultCoverageItem(),
    diagnostic_tests: defaultCoverageItem(),
    ambulatory_laboratory_exams: defaultCoverageItem(),
    doctor_visits_consultations: defaultCoverageItem(),
    prescribed_medicines_drugs: defaultCoverageItem(),
  },
});

export function PlanCriteriaPage() {
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);
  const [inPatientCriteriaData, setInPatientCriteriaData] = useState<InPatientCriteriaData>(defaultInPatientCriteriaData());
  const [outPatientCriteriaData, setOutPatientCriteriaData] = useState<OutPatientCriteriaData>(defaultOutPatientCriteriaData());
  const [search, setSearch] = useState("");

  const queryClient = useQueryClient();

  const { data: policies } = useQuery({
    queryKey: ["policies"],
    queryFn: () => getPolicies({ page: 1, page_size: 100 }),
  });

  const { data: existingCriteria, isLoading } = useQuery({
    queryKey: ["criteria", selectedPolicyId],
    queryFn: () => getCriteriaByPolicy(selectedPolicyId!),
    enabled: !!selectedPolicyId,
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors (criteria doesn't exist)
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  useEffect(() => {
    if (selectedPolicyId) {
      if (existingCriteria) {
        setInPatientCriteriaData(existingCriteria.criteria_data || defaultInPatientCriteriaData());
        setOutPatientCriteriaData(existingCriteria.outpatient_criteria_data || defaultOutPatientCriteriaData());
      } else {
        setInPatientCriteriaData(defaultInPatientCriteriaData());
        setOutPatientCriteriaData(defaultOutPatientCriteriaData());
      }
    }
  }, [selectedPolicyId, existingCriteria]);

  const saveMutation = useMutation({
    mutationFn: () => createOrUpdateCriteria(selectedPolicyId!, { 
      criteria_data: inPatientCriteriaData,
      outpatient_criteria_data: outPatientCriteriaData
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criteria"] });
      toast.success("Plan criteria saved successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Failed to save criteria");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCriteria(selectedPolicyId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["criteria"] });
      setInPatientCriteriaData(defaultInPatientCriteriaData());
      setOutPatientCriteriaData(defaultOutPatientCriteriaData());
      toast.success("Plan criteria deleted successfully");
    },
  });

  const filteredPolicies = policies?.items.filter((policy) =>
    policy.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!selectedPolicyId) {
      toast.error("Please select a policy first");
      return;
    }
    saveMutation.mutate();
  };

  const handleDelete = () => {
    if (!selectedPolicyId || !existingCriteria) {
      toast.error("No criteria to delete");
      return;
    }
    if (confirm("Are you sure you want to delete the criteria for this policy?")) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Plan Criteria Management</h1>
        <p className="text-muted-foreground">
          Configure coverage criteria for insurance plans
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
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              {isLoading ? (
                <div>Loading criteria...</div>
              ) : existingCriteria ? (
                <div className="text-sm text-muted-foreground">
                  Editing criteria for Policy ID: {selectedPolicyId}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Creating new criteria for Policy ID: {selectedPolicyId}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {existingCriteria && (
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                Save Criteria
              </Button>
            </div>
          </div>

          <CriteriaForm 
            inPatientData={inPatientCriteriaData} 
            outPatientData={outPatientCriteriaData}
            onInPatientChange={setInPatientCriteriaData}
            onOutPatientChange={setOutPatientCriteriaData}
          />
        </div>
      )}
    </div>
  );
}

function CoverageItemInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: CoverageItem;
  onChange: (value: CoverageItem) => void;
}) {
  return (
    <div className="space-y-2 p-4 border rounded-lg">
      <div className="font-semibold text-sm">{label}</div>
      <div>
        <Label>Notes</Label>
        <Textarea
          value={value.notes || ""}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          rows={3}
          placeholder="Enter notes for this coverage item..."
        />
      </div>
    </div>
  );
}

function CriteriaForm({
  inPatientData,
  outPatientData,
  onInPatientChange,
  onOutPatientChange,
}: {
  inPatientData: InPatientCriteriaData;
  outPatientData: OutPatientCriteriaData;
  onInPatientChange: (data: InPatientCriteriaData) => void;
  onOutPatientChange: (data: OutPatientCriteriaData) => void;
}) {
  const updateInPatientGeneral = (key: string, value: CoverageItem) => {
    onInPatientChange({
      ...inPatientData,
      in_patient: {
        ...inPatientData.in_patient,
        general_coverages: {
          ...inPatientData.in_patient.general_coverages,
          [key]: value,
        },
      },
    });
  };

  const updateInPatientCase = (key: string, value: CoverageItem) => {
    onInPatientChange({
      ...inPatientData,
      in_patient: {
        ...inPatientData.in_patient,
        case_coverages: {
          ...inPatientData.in_patient.case_coverages,
          [key]: value,
        },
      },
    });
  };

  const updateOutPatient = (key: string, value: CoverageItem) => {
    onOutPatientChange({
      ...outPatientData,
      out_patient: {
        ...outPatientData.out_patient,
        [key]: value,
      },
    });
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column: In-Patient Coverages */}
      <div className="space-y-6">
        {/* In-Patient General Coverages */}
        <Card>
          <CardHeader>
            <CardTitle>In-Patient - General Coverages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(inPatientData.in_patient.general_coverages).map(([key, value]) => (
              <CoverageItemInput
                key={key}
                label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                value={value}
                onChange={(newValue) => updateInPatientGeneral(key, newValue)}
              />
            ))}
          </CardContent>
        </Card>

        {/* In-Patient Case Coverages */}
        <Card>
          <CardHeader>
            <CardTitle>In-Patient - Case Coverages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(inPatientData.in_patient.case_coverages).map(([key, value]) => (
              <CoverageItemInput
                key={key}
                label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                value={value}
                onChange={(newValue) => updateInPatientCase(key, newValue)}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Out-Patient Coverages */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Out-Patient Coverages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(outPatientData.out_patient).map(([key, value]) => (
              <CoverageItemInput
                key={key}
                label={key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                value={value}
                onChange={(newValue) => updateOutPatient(key, newValue)}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

