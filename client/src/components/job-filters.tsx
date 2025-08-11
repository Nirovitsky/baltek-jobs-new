import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { JobFilters, Location, Category, SavedFilter, CreateSavedFilter } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Save, Star, Trash2, Filter } from "lucide-react";

interface JobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
}

export default function JobFiltersComponent({ filters, onFiltersChange }: JobFiltersProps) {
  const [saveFilterDialogOpen, setSaveFilterDialogOpen] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved filters
  const { data: savedFilters, isLoading: savedFiltersLoading } = useQuery({
    queryKey: ["savedFilters"],
    queryFn: () => ApiClient.getSavedFilters(),
  });

  console.log("Saved filters data:", savedFilters);

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => ApiClient.getLocations(),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => ApiClient.getCategories(),
  });

  // Single query for all filter options to reduce API calls
  const { data: filterOptions } = useQuery({
    queryKey: ["filterOptions"],
    queryFn: () => ApiClient.fetchFilterOptions(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Extract individual filter arrays from the combined response
  const jobTypes = filterOptions?.jobTypes;
  const workplaceTypes = filterOptions?.workplaceTypes;
  const currencies = filterOptions?.currencies;
  const paymentFrequencies = filterOptions?.paymentFrequencies;

  const { data: educationLevels } = useQuery({
    queryKey: ["educationLevels"],
    queryFn: () => ApiClient.getEducationLevels(),
  });

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === "" || value === "all" ? undefined : value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== "");

  // Save filter mutation
  const saveFilterMutation = useMutation({
    mutationFn: (data: CreateSavedFilter) => ApiClient.saveFilter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedFilters"] });
      queryClient.refetchQueries({ queryKey: ["savedFilters"] });
      setSaveFilterDialogOpen(false);
      setSaveFilterName("");
      toast({
        title: "Filter saved",
        description: "Your filter has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Save filter error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save filter",
        variant: "destructive",
      });
    },
  });

  // Delete filter mutation
  const deleteFilterMutation = useMutation({
    mutationFn: (id: number) => ApiClient.deleteSavedFilter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savedFilters"] });
      queryClient.refetchQueries({ queryKey: ["savedFilters"] });
      toast({
        title: "Filter deleted",
        description: "Your saved filter has been deleted.",
      });
    },
    onError: (error) => {
      console.error("Delete filter error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete filter",
        variant: "destructive",
      });
    },
  });

  const handleSaveFilter = () => {
    if (!saveFilterName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a filter name",
        variant: "destructive",
      });
      return;
    }

    saveFilterMutation.mutate({
      name: saveFilterName.trim(),
      filters,
    });
  };

  const handleLoadSavedFilter = (savedFilter: SavedFilter) => {
    // API might return filters in 'data' field instead of 'filters'
    const filtersToApply = (savedFilter as any).data || savedFilter.filters || {};
    onFiltersChange(filtersToApply);
    toast({
      title: "Filter loaded",
      description: `Loaded filter: ${savedFilter.name}`,
    });
  };

  const handleDeleteSavedFilter = (id: number) => {
    deleteFilterMutation.mutate(id);
  };

  return (
    <div className="filter-bar sticky top-0 z-40 bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
          <Select
            value={filters.location?.toString() || "all"}
            onValueChange={(value) => handleFilterChange("location", value !== "all" ? parseInt(value) : undefined)}
          >
            <SelectTrigger className="w-[110px] h-8 text-xs focus:border-ring focus-visible:ring-0">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Location</SelectItem>
              {!locationsLoading && (locations as any)?.results?.map((location: Location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name} {location.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category?.toString() || "all"}
            onValueChange={(value) => handleFilterChange("category", value !== "all" ? parseInt(value) : undefined)}
          >
            <SelectTrigger className="w-[100px] h-8 text-xs focus:border-ring focus-visible:ring-0">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Category</SelectItem>
              {!categoriesLoading && (categories as any)?.results?.map((category: Category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.job_type || "all"}
            onValueChange={(value) => handleFilterChange("job_type", value)}
          >
            <SelectTrigger className="w-[75px] h-8 text-xs focus:border-ring focus-visible:ring-0">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Type</SelectItem>
              {jobTypes?.map((jobType: any) => (
                <SelectItem key={jobType.value} value={jobType.value}>
                  {jobType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.workplace_type || "all"}
            onValueChange={(value) => handleFilterChange("workplace_type", value)}
          >
            <SelectTrigger className="w-[75px] h-8 text-xs focus:border-ring focus-visible:ring-0">
              <SelectValue placeholder="Remote" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Work</SelectItem>
              {workplaceTypes?.map((workplaceType: any) => (
                <SelectItem key={workplaceType.value} value={workplaceType.value}>
                  {workplaceType.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.salary_min || ""}
              onChange={(e) => handleFilterChange("salary_min", e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-[80px] h-8 text-xs focus-visible:ring-0"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.salary_max || ""}
              onChange={(e) => handleFilterChange("salary_max", e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-[80px] h-8 text-xs focus-visible:ring-0"
            />
          </div>

          <Select
            value={filters.currency || "all"}
            onValueChange={(value) => handleFilterChange("currency", value)}
          >
            <SelectTrigger className="w-[95px] h-8 text-xs focus:border-ring focus-visible:ring-0">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Currency</SelectItem>
              {currencies?.map((currency: any) => (
                <SelectItem key={currency.value} value={currency.value}>
                  {currency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.payment_frequency || "all"}
            onValueChange={(value) => handleFilterChange("payment_frequency", value)}
          >
            <SelectTrigger className="w-[105px] h-8 text-xs focus:border-ring focus-visible:ring-0">
              <SelectValue placeholder="Per Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Frequency</SelectItem>
              {paymentFrequencies?.map((frequency: any) => (
                <SelectItem key={frequency.value} value={frequency.value}>
                  {frequency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.min_education_level || "all"}
            onValueChange={(value) => handleFilterChange("min_education_level", value)}
          >
            <SelectTrigger className="w-[100px] h-8 text-xs focus:border-ring focus-visible:ring-0">
              <SelectValue placeholder="Education" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Education</SelectItem>
              {educationLevels?.map((level: any) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          </div>

          <div className="flex items-center gap-2">
            {/* Saved Filters Dropdown */}
            {!savedFiltersLoading && savedFilters && (
              (Array.isArray(savedFilters) && savedFilters.length > 0) || 
              ((savedFilters as any)?.results && (savedFilters as any).results.length > 0)
            ) && (
              <Select onValueChange={(value) => {
                // Handle both direct array and paginated response
                const filtersArray = Array.isArray(savedFilters) ? savedFilters : (savedFilters as any)?.results || [];
                const savedFilter = filtersArray.find((f: SavedFilter) => f.id.toString() === value);
                if (savedFilter) {
                  handleLoadSavedFilter(savedFilter);
                }
              }}>
                <SelectTrigger className="w-[120px] h-8 text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Saved Filters" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(savedFilters) ? savedFilters : (savedFilters as any)?.results || []).map((savedFilter: SavedFilter) => (
                    <SelectItem key={savedFilter.id} value={savedFilter.id.toString()}>
                      <div className="flex items-center justify-between w-full group">
                        <span className="flex-1 truncate pr-2" title={savedFilter.name}>
                          {savedFilter.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteSavedFilter(savedFilter.id);
                          }}
                          className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
                          disabled={deleteFilterMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Save Filter Dialog */}
            <Dialog open={saveFilterDialogOpen} onOpenChange={setSaveFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="bg-primary hover:bg-primary/90 h-8 text-xs px-3"
                  disabled={!hasActiveFilters}
                >
                  <Save className="h-3 w-3 mr-1" />
                  Save
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Save Filter</DialogTitle>
                  <DialogDescription>
                    Give your filter a name to save it for later use.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="filter-name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="filter-name"
                      value={saveFilterName}
                      onChange={(e) => setSaveFilterName(e.target.value)}
                      className="col-span-3"
                      placeholder="e.g., Remote Developer Jobs"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSaveFilterDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSaveFilter}
                    disabled={saveFilterMutation.isPending || !saveFilterName.trim()}
                  >
                    {saveFilterMutation.isPending ? "Saving..." : "Save Filter"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="ghost"
                className="text-gray-700 hover:text-gray-900 h-8 w-8 p-0 border-0"
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
