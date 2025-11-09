import { useState } from "react";
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
import { Upload, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>("policies");

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
    onSuccess: (data) => {
      const updatedCount = data.records_updated || 0;
      const createdCount = data.records_created || 0;
      let message = `Upload successful! ${data.records_processed} records processed.`;
      if (createdCount > 0) {
        message += ` ${createdCount} records created.`;
      }
      if (updatedCount > 0) {
        message += ` ${updatedCount} records updated.`;
      }
      if (data.errors && data.errors.length > 0) {
        message += ` ${data.errors.length} errors occurred.`;
      }
      toast.success(message);
      setFile(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Upload failed");
      if (error.response?.data?.errors) {
        console.error("Upload errors:", error.response.data.errors);
      }
    },
  });

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
    // Criteria uploads only accept JSON files
    if (uploadType === "criteria") {
      const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      if (fileExtension !== ".json") {
        toast.error("Plan criteria uploads only accept JSON files due to the nested structure.");
        return false;
      }
    } else {
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
                Upload insurance policies (CSV or JSON)
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
                <strong>CSV Format:</strong> Must include columns: policy_id, age_min, age_max,
                class_type, family_min, family_max. Optional: family_type (display label), inpatient_usd, total_usd, outpatient_coverage_percentage, outpatient_price_usd
              </p>
              <p>
                <strong>JSON Format:</strong> Array of tariff objects with required fields:
                policy_id, age_min, age_max, class_type, family_min, family_max. Optional: family_type, inpatient_usd, total_usd, outpatient_coverage_percentage, outpatient_price_usd.
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
              accept={uploadType === "criteria" ? ".json" : ".csv,.json"}
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

              {/* Success Summary (if available) */}
              {uploadMutation.isSuccess && uploadMutation.data && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Upload Successful</AlertTitle>
                  <AlertDescription className="text-green-700 text-sm mt-1">
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
                      {uploadMutation.data.errors && uploadMutation.data.errors.length > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold">Errors ({uploadMutation.data.errors.length}):</p>
                          <ul className="list-disc list-inside text-xs max-h-32 overflow-y-auto">
                            {uploadMutation.data.errors.slice(0, 10).map((error, idx) => (
                              <li key={idx}>{error}</li>
                            ))}
                            {uploadMutation.data.errors.length > 10 && (
                              <li>... and {uploadMutation.data.errors.length - 10} more errors</li>
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
                <li>type_id and provider_id must exist in the system before uploading policies</li>
                <li>Policies with the same name and provider will be updated instead of creating duplicates</li>
              </>
            )}
            {uploadType === "tariffs" && (
              <>
                <li>Policy IDs must exist in the system before uploading tariffs</li>
                <li>All pricing amounts should be in numeric format (no currency symbols)</li>
                <li>family_min and family_max are required (defaults to 1 if not provided)</li>
                <li>family_type is optional and used as a display label (e.g., "Family (2–4)")</li>
                <li>Multiple tariff entries can exist for the same policy (different age ranges, family sizes, etc.)</li>
              </>
            )}
            {uploadType === "criteria" && (
              <>
                <li>Policy IDs must exist in the system before uploading criteria</li>
                <li>Only JSON format is supported due to the nested structure</li>
                <li>Criteria for existing policies will be updated, otherwise new entries will be created</li>
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
