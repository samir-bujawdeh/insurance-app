import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClaims, approveClaim, rejectClaim } from "@/api/claims";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Claim } from "@/types";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

function StatusBadge({ status }: { status: Claim["status"] }) {
  const variants: Record<Claim["status"], { label: string; className: string }> = {
    submitted: { label: "Submitted", className: "bg-yellow-100 text-yellow-800" },
    in_review: { label: "In Review", className: "bg-blue-100 text-blue-800" },
    approved: { label: "Approved", className: "bg-green-100 text-green-800" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
  };

  const variant = variants[status];
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variant.className}`}>
      {variant.label}
    </span>
  );
}

export function ClaimsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["claims"],
    queryFn: () => getClaims({ page: 1, page_size: 50 }),
    placeholderData: {
      items: [
        {
          claim_id: 1,
          user_policy_id: 1,
          date_filed: "2024-01-15",
          claim_amount: 5000,
          status: "submitted" as const,
          description: "Auto accident claim",
        },
        {
          claim_id: 2,
          user_policy_id: 2,
          date_filed: "2024-01-20",
          claim_amount: 3000,
          status: "in_review" as const,
          description: "Property damage claim",
        },
      ],
      total: 2,
      page: 1,
      page_size: 50,
      total_pages: 1,
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      toast.success("Claim approved");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      toast.success("Claim rejected");
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Claims Management</h1>
        <p className="text-muted-foreground">
          Review and manage insurance claims
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading claims...</div>
          ) : (
            <div className="space-y-4">
              {data?.items.map((claim) => (
                <div key={claim.claim_id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Claim #{claim.claim_id}</h3>
                      <StatusBadge status={claim.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">{claim.description}</p>
                    <p className="text-sm">
                      Amount: ${claim.claim_amount?.toLocaleString()} | 
                      Filed: {new Date(claim.date_filed).toLocaleDateString()}
                    </p>
                  </div>
                  {claim.status === "submitted" || claim.status === "in_review" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(claim.claim_id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => rejectMutation.mutate(claim.claim_id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
