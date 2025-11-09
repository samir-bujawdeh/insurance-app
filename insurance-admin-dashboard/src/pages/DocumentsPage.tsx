import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          View and manage uploaded documents
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Document management interface coming soon. This will display all uploaded user documents.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
