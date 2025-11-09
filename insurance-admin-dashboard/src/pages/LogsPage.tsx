import { useQuery } from "@tanstack/react-query";
import { getAdminLogs } from "@/api/logs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: () => getAdminLogs({ page: 1, page_size: 50 }),
    placeholderData: {
      items: [
        {
          log_id: 1,
          admin_user_id: 1,
          action: "UPDATE",
          resource_type: "user",
          resource_id: 123,
          details: "Updated user profile",
          created_at: "2024-01-15T10:00:00Z",
        },
      ],
      total: 1,
      page: 1,
      page_size: 50,
      total_pages: 1,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Logs</h1>
        <p className="text-muted-foreground">
          View admin activity and system logs
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading logs...</div>
          ) : (
            <div className="space-y-2">
              {data?.items.map((log) => (
                <div key={log.log_id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{log.action}</span> on{" "}
                      <span className="font-medium">{log.resource_type}</span>
                      {log.resource_id && ` #${log.resource_id}`}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-sm text-muted-foreground mt-1">{log.details}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
