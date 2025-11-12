import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { uploadPolicies, uploadTariffs, uploadCriteria, UploadType } from "@/api/upload";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>("policies");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getUploadFunction = () => {
    switch (uploadType) {
      case "policies":
        return uploadPolicies;
      case "tariffs":
        return uploadTariffs;
      case "criteria":
        return uploadCriteria;
      default:
        return uploadPolicies;
    }
  };

  const uploadMutation = useMutation({
    mutationFn: getUploadFunction(),
    onMutate: () => {
      // Reset progress when starting upload
      setUploadProgress(0);
      setEstimatedTimeRemaining(null);
      startTimeRef.current = Date.now();
      
      // Start progress simulation with a realistic logarithmic curve
      // Uses exponential decay: progress = max * (1 - e^(-k*t))
      // This naturally slows down as it approaches the maximum
      const maxProgress = 90; // Cap at 90% to leave room for final processing
      const k = 0.02; // Rate constant - lower = slower progress
      
      progressIntervalRef.current = setInterval(() => {
        if (!startTimeRef.current) return;
        
        const elapsed = (Date.now() - startTimeRef.current) / 1000; // seconds
        
        // Calculate progress using exponential growth formula
        // This naturally slows down as it approaches maxProgress
        const progress = maxProgress * (1 - Math.exp(-k * elapsed));
        
        setUploadProgress(progress);
        
        // Calculate estimated time remaining using a conservative approach
        // Only show estimate after 3 seconds
        if (elapsed > 3 && progress > 5) {
          // Use a conservative multiplier: assume we're only 70% through actual processing
          // This accounts for the fact that database operations can be slow
          const conservativeProgress = progress * 0.7;
          if (conservativeProgress > 0) {
            const estimatedTotal = elapsed / (conservativeProgress / 100);
            const remaining = estimatedTotal - elapsed;
            setEstimatedTimeRemaining(Math.max(0, Math.round(remaining)));
          }
        }
      }, 500); // Update every 500ms
    },
    onSuccess: (data) => {
      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Set progress to 100%
      setUploadProgress(100);
      setEstimatedTimeRemaining(0);
      
      const updatedCount = data.records_updated || 0;
      const createdCount = data.records_created || 0;
      let message = `Upload completed! ${data.records_processed} records processed.`;
      if (createdCount > 0) {
        message += ` ${createdCount} new records created.`;
      }
      if (updatedCount > 0) {
        message += ` ${updatedCount} existing records updated.`;
      }
      if (data.errors && data.errors.length > 0) {
        message += ` ${data.errors.length} errors occurred.`;
        // Log errors to console for debugging
        console.group("Upload Errors");
        console.log("Total errors:", data.errors.length);
        if (data.message && data.message.includes("Error Summary:")) {
          console.log("Error Summary:", data.message);
        }
        console.log("Sample errors:", data.errors.slice(0, 20));
        console.groupEnd();
      }
      if (createdCount > 0 || updatedCount > 0) {
        toast.success(message);
      } else if (data.errors && data.errors.length > 0) {
        toast.warning(message);
      } else {
        toast.info(message);
      }
      setFile(null);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setEstimatedTimeRemaining(null);
        startTimeRef.current = null;
      }, 2000);
    },
    onError: (error: any) => {
      // Clear progress interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setUploadProgress(0);
      setEstimatedTimeRemaining(null);
      startTimeRef.current = null;
      
      toast.error(error.response?.data?.detail || "Upload failed");
      if (error.response?.data?.errors) {
        console.error("Upload errors:", error.response.data.errors);
      }
    },
  });

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    // Criteria uploads accept JSON and Excel files
    if (uploadType === "criteria") {
      const validExtensions = [".json", ".xlsx"];
      const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (!validExtensions.includes(fileExtension)) {
        toast.error("Plan criteria uploads accept JSON or Excel (.xlsx) files.");
        return false;
      }
    } else if (uploadType === "tariffs") {
      // Tariffs accept CSV, JSON, and Excel files
      const validExtensions = [".csv", ".json", ".xlsx"];
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        toast.error("Invalid file type. Please upload a CSV, JSON, or Excel (.xlsx) file.");
        return false;
      }
    } else {
      // Policies accept CSV and JSON
      const validExtensions = [".csv", ".json"];
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        toast.error("Invalid file type. Please upload a CSV or JSON file.");
        return false;
      }
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size exceeds 10MB limit.");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    // In a real implementation, you might want to preview the file first
    // For now, we'll proceed with the upload
    uploadMutation.mutate(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Upload</h1>
        <p className="text-muted-foreground">
          Upload insurance plans, tariff data, and plan criteria to keep the database updated
        </p>
      </div>

      {/* Upload Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Type</CardTitle>
          <CardDescription>
            Select what type of data you're uploading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => {
                setUploadType("policies");
                setFile(null); // Reset file when changing type
              }}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                uploadType === "policies"
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <div className="font-semibold mb-1">Insurance Plans</div>
              <div className="text-sm text-muted-foreground">
                Upload insurance plans (CSV or JSON)
              </div>
            </button>
            <button
              onClick={() => {
                setUploadType("tariffs");
                setFile(null); // Reset file when changing type
              }}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                uploadType === "tariffs"
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <div className="font-semibold mb-1">Tariff Data</div>
              <div className="text-sm text-muted-foreground">
                Upload pricing tariffs for policies (CSV or JSON)
              </div>
            </button>
            <button
              onClick={() => {
                setUploadType("criteria");
                setFile(null); // Reset file when changing type
              }}
              className={`p-4 border-2 rounded-lg text-left transition-colors ${
                uploadType === "criteria"
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
            >
              <div className="font-semibold mb-1">Plan Criteria</div>
              <div className="text-sm text-muted-foreground">
                Upload coverage criteria (JSON only)
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* File Format Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>File Format Requirements</AlertTitle>
        <AlertDescription className="mt-2">
          {uploadType === "policies" ? (
            <div className="space-y-1 text-sm">
              <p>
                <strong>CSV Format:</strong> Must include columns: name, type_id,
                provider_id, duration (optional), description (optional),
                status (optional), contract_pdf_url (optional)
              </p>
              <p>
                <strong>JSON Format:</strong> Array of policy objects with required fields:
                name, type_id, provider_id. Optional: duration, description, status, contract_pdf_url
              </p>
            </div>
          ) : uploadType === "tariffs" ? (
            <div className="space-y-1 text-sm">
              <p>
                <strong>CSV/Excel Format:</strong> Must include columns: policy_id (or plan_id), age_min, age_max,
                class_type, family_min, family_max. Optional: family_type (display label), inpatient_usd, total_usd, outpatient_coverage_percentage, outpatient_price_usd.
                Column names are case-insensitive and spaces/underscores are normalized (e.g., "Policy ID", "policy_id", or "plan_id" all work).
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                <strong>Note on outpatient_coverage_percentage:</strong> You can input percentage values (1-100) or decimal values (0-1). 
                Values greater than 1 will be automatically converted to decimal format (e.g., 85 → 0.85, 100 → 1.0).
              </p>
              <p>
                <strong>JSON Format:</strong> Array of tariff objects with required fields:
                policy_id, age_min, age_max, class_type, family_min, family_max. Optional: family_type, inpatient_usd, total_usd, outpatient_coverage_percentage, outpatient_price_usd.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                <strong>Note:</strong> The tariff_id field should be omitted from the file as it will be auto-assigned by the database.
              </p>
            </div>
          ) : (
            <div className="space-y-1 text-sm">
              <p>
                <strong>JSON Format Only:</strong> Array of objects with required fields:
                policy_id, criteria_data (nested structure with in_patient and out_patient coverage).
              </p>
              <p className="mt-2">
                <strong>Example structure:</strong> Each object should have:
                <code className="block mt-1 p-2 bg-muted rounded text-xs">
                  {`{`}<br />
                  {`  "policy_id": 1,`}<br />
                  {`  "criteria_data": {`}<br />
                  {`    "in_patient": { ... },`}<br />
                  {`    "out_patient": { ... }`}<br />
                  {`  }`}<br />
                  {`}`}
                </code>
              </p>
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            Drag and drop a CSV or JSON file, or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept={
                uploadType === "criteria" 
                  ? ".json" 
                  : uploadType === "tariffs"
                  ? ".csv,.json,.xlsx"
                  : ".csv,.json"
              }
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {uploadType === "criteria" 
                  ? "JSON files only (max 10MB)" 
                  : uploadType === "tariffs"
                  ? "CSV, JSON, or Excel (.xlsx) files only (max 10MB)"
                  : "CSV or JSON files only (max 10MB)"}
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium block">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={uploadMutation.isPending}
                >
                  Remove
                </Button>
              </div>

              {/* Preview Note */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Ready to Upload</AlertTitle>
                <AlertDescription className="text-sm">
                  Click the upload button below to process this file. The system will
                  validate the data and show a summary of changes before applying them.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleSubmit}
                disabled={uploadMutation.isPending}
                className="w-full"
                size="lg"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading and Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload and Process File
                  </>
                )}
              </Button>

              {/* Progress Bar */}
              {uploadMutation.isPending && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Processing file...
                    </span>
                    <span className="text-muted-foreground">
                      {Math.round(uploadProgress)}%
                      {estimatedTimeRemaining !== null && estimatedTimeRemaining > 0 && (
                        <span className="ml-2">
                          (~{estimatedTimeRemaining}s remaining)
                        </span>
                      )}
                    </span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                </div>
              )}

              {/* Success Summary (if available) */}
              {uploadMutation.isSuccess && uploadMutation.data && (
                <Alert className={uploadMutation.data.errors && uploadMutation.data.errors.length > 0 ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"}>
                  <CheckCircle2 className={`h-4 w-4 ${uploadMutation.data.errors && uploadMutation.data.errors.length > 0 ? "text-yellow-600" : "text-green-600"}`} />
                  <AlertTitle className={uploadMutation.data.errors && uploadMutation.data.errors.length > 0 ? "text-yellow-800" : "text-green-800"}>
                    {uploadMutation.data.errors && uploadMutation.data.errors.length > 0 ? "Upload Completed with Errors" : "Upload Successful"}
                  </AlertTitle>
                  <AlertDescription className={`text-sm mt-1 ${uploadMutation.data.errors && uploadMutation.data.errors.length > 0 ? "text-yellow-700" : "text-green-700"}`}>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <p>
                          <strong>{uploadMutation.data.records_processed}</strong> records processed
                        </p>
                        {uploadMutation.data.records_created !== undefined && uploadMutation.data.records_created > 0 && (
                          <p>
                            <strong>{uploadMutation.data.records_created}</strong> records created
                          </p>
                        )}
                        {uploadMutation.data.records_updated !== undefined && uploadMutation.data.records_updated > 0 && (
                          <p>
                            <strong>{uploadMutation.data.records_updated}</strong> records updated
                          </p>
                        )}
                      </div>
                      {uploadMutation.data.message && uploadMutation.data.message.includes("Error Summary:") && (
                        <div className="mt-2 p-2 bg-white/50 rounded border border-current/20">
                          <pre className="text-xs whitespace-pre-wrap font-mono">
                            {uploadMutation.data.message}
                          </pre>
                        </div>
                      )}
                      {uploadMutation.data.errors && uploadMutation.data.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">Sample Errors (showing first {Math.min(uploadMutation.data.errors.length, 10)}):</p>
                          <ul className="list-disc list-inside text-xs max-h-32 overflow-y-auto mt-1">
                            {uploadMutation.data.errors.slice(0, 10).map((error, idx) => (
                              <li key={idx} className="break-words">{error}</li>
                            ))}
                            {uploadMutation.data.errors.length > 10 && (
                              <li className="text-yellow-600 font-semibold">... see error summary above for complete details</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Summary */}
              {uploadMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Upload Failed</AlertTitle>
                  <AlertDescription className="text-sm mt-1">
                    Please check the file format and try again. Ensure all required
                    columns/fields are present.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-1">
            <li>
              Ensure your file matches the required format for the selected upload type
            </li>
            {uploadType === "policies" && (
              <>
                <li>type_id and provider_id must exist in the system before uploading plans</li>
                <li>Plans with the same name and provider will be updated instead of creating duplicates</li>
              </>
            )}
            {uploadType === "tariffs" && (
              <>
                <li>Plan IDs must exist in the system before uploading tariffs</li>
                <li>All pricing amounts should be in numeric format (no currency symbols)</li>
                <li>family_min and family_max are required (defaults to 1 if not provided)</li>
                <li>family_type is optional and used as a display label (e.g., "Family (2–4)")</li>
                <li>Multiple tariff entries can exist for the same plan (different age ranges, family sizes, etc.)</li>
                <li><strong>Duplicate Detection:</strong> If a tariff with the same policy_id, age range, class type, family range, and outpatient coverage already exists, it will be updated with new values instead of creating a duplicate</li>
              </>
            )}
            {uploadType === "criteria" && (
              <>
                <li>Plan IDs must exist in the system before uploading criteria</li>
                <li>Only JSON format is supported due to the nested structure</li>
                <li>Criteria for existing plans will be updated, otherwise new entries will be created</li>
              </>
            )}
            <li>Large files may take several minutes to process</li>
            <li>Check the upload summary for any errors that occurred during processing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
