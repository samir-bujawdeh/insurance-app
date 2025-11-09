import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProviders, createProvider, updateProvider, deleteProvider, ProviderCreate } from "@/api/providers";
import { Provider } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ProvidersPage() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    contact_info: string;
    rating: string;
    logo_url: string;
  }>({
    name: "",
    contact_info: "",
    rating: "",
    logo_url: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
    placeholderData: [
      {
        provider_id: 1,
        name: "Acme Insurance",
        contact_info: "1-800-ACME-123",
        rating: 4.5,
      },
      {
        provider_id: 2,
        name: "Blue Shield Co.",
        contact_info: "1-800-BLUE-456",
        rating: 4.2,
      },
    ],
  });

  const createMutation = useMutation({
    mutationFn: createProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider created successfully");
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        contact_info: "",
        rating: "",
        logo_url: "",
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to create provider");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ providerId, data }: { providerId: number; data: Partial<ProviderCreate> }) =>
      updateProvider(providerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider updated successfully");
      setIsEditDialogOpen(false);
      setSelectedProvider(null);
      setFormData({
        name: "",
        contact_info: "",
        rating: "",
        logo_url: "",
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to update provider");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["providers"] });
      toast.success("Provider deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedProvider(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Failed to delete provider");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Provider name is required");
      return;
    }

    let rating: number | undefined;
    if (formData.rating.trim()) {
      const parsedRating = parseFloat(formData.rating);
      if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        toast.error("Rating must be a number between 0 and 5");
        return;
      }
      rating = parsedRating;
    }

    const submitData: ProviderCreate = {
      name: formData.name.trim(),
      contact_info: formData.contact_info?.trim() || undefined,
      rating,
      logo_url: formData.logo_url?.trim() || undefined,
    };

    createMutation.mutate(submitData);
  };

  const handleEdit = (provider: Provider) => {
    setSelectedProvider(provider);
    setFormData({
      name: provider.name,
      contact_info: provider.contact_info || "",
      rating: provider.rating?.toString() || "",
      logo_url: provider.logo_url || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Provider name is required");
      return;
    }

    if (!selectedProvider) return;

    let rating: number | undefined;
    if (formData.rating.trim()) {
      const parsedRating = parseFloat(formData.rating);
      if (isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        toast.error("Rating must be a number between 0 and 5");
        return;
      }
      rating = parsedRating;
    }

    const updateData: Partial<ProviderCreate> = {
      name: formData.name.trim(),
      contact_info: formData.contact_info?.trim() || undefined,
      rating,
      logo_url: formData.logo_url?.trim() || undefined,
    };

    updateMutation.mutate({ providerId: selectedProvider.provider_id, data: updateData });
  };

  const handleDeleteClick = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedProvider) {
      deleteMutation.mutate(selectedProvider.provider_id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Providers Management</h1>
          <p className="text-muted-foreground">
            Manage insurance providers
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Add New Provider</DialogTitle>
                <DialogDescription>
                  Create a new insurance provider. Fill in the details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Provider Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Acme Insurance"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contact_info">Contact Information</Label>
                  <Input
                    id="contact_info"
                    placeholder="e.g., 1-800-ACME-123 or email@example.com"
                    value={formData.contact_info || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_info: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="e.g., 4.5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo_url || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, logo_url: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Provider"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Provider</DialogTitle>
              <DialogDescription>
                Update the provider information. Make changes to the fields below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">
                  Provider Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  placeholder="e.g., Acme Insurance"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-contact_info">Contact Information</Label>
                <Input
                  id="edit-contact_info"
                  placeholder="e.g., 1-800-ACME-123 or email@example.com"
                  value={formData.contact_info || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, contact_info: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-rating">Rating (0-5)</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="e.g., 4.5"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rating: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-logo_url">Logo URL</Label>
                <Input
                  id="edit-logo_url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedProvider(null);
                  setFormData({
                    name: "",
                    contact_info: "",
                    rating: "",
                    logo_url: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Provider"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProvider?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedProvider(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Providers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading providers...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data?.map((provider) => (
                <div key={provider.provider_id} className="p-4 border rounded-lg">
                  <h3 className="font-semibold">{provider.name}</h3>
                  <p className="text-sm text-muted-foreground">{provider.contact_info || "No contact info"}</p>
                  <p className="text-sm">Rating: {provider.rating ? `${provider.rating}/5.0` : "Not rated"}</p>
                  {provider.logo_url && (
                    <div className="mt-2">
                      <img
                        src={provider.logo_url}
                        alt={`${provider.name} logo`}
                        className="h-8 w-auto object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(provider)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(provider)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
