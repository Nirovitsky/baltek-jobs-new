import { useQuery } from "@tanstack/react-query";
import { ApiClient } from "@/lib/api";
import type { JobFilters, Location, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface JobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
}

export default function JobFiltersComponent({ filters, onFiltersChange }: JobFiltersProps) {
  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => ApiClient.getLocations(),
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => ApiClient.getCategories(),
  });

  const { data: jobTypes, isLoading: jobTypesLoading } = useQuery({
    queryKey: ["jobTypes"],
    queryFn: () => ApiClient.getJobTypes(),
  });

  const { data: workplaceTypes, isLoading: workplaceTypesLoading } = useQuery({
    queryKey: ["workplaceTypes"],
    queryFn: () => ApiClient.getWorkplaceTypes(),
  });

  const { data: currencies, isLoading: currenciesLoading } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => ApiClient.getCurrencies(),
  });

  const { data: paymentFrequencies, isLoading: paymentFrequenciesLoading } = useQuery({
    queryKey: ["paymentFrequencies"],
    queryFn: () => ApiClient.getPaymentFrequencies(),
  });

  const { data: educationLevels, isLoading: educationLevelsLoading } = useQuery({
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

  return (
    <div className="filter-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap items-center gap-4">
          
          <Select
            value={filters.location?.toString() || "all"}
            onValueChange={(value) => handleFilterChange("location", value !== "all" ? parseInt(value) : undefined)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {!locationsLoading && (locations as any)?.results?.map((location: Location) => (
                <SelectItem key={location.id} value={location.id.toString()}>
                  {location.name}, {location.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.category?.toString() || "all"}
            onValueChange={(value) => handleFilterChange("category", value !== "all" ? parseInt(value) : undefined)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
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
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {!jobTypesLoading && (jobTypes as any)?.results?.map((jobType: any) => (
                <SelectItem key={jobType.id} value={jobType.value}>
                  {jobType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.workplace_type || "all"}
            onValueChange={(value) => handleFilterChange("workplace_type", value)}
          >
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="Work" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Work Types</SelectItem>
              {!workplaceTypesLoading && (workplaceTypes as any)?.results?.map((workplaceType: any) => (
                <SelectItem key={workplaceType.id} value={workplaceType.value}>
                  {workplaceType.name}
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
              className="w-[80px]"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.salary_max || ""}
              onChange={(e) => handleFilterChange("salary_max", e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-[80px]"
            />
          </div>

          <Select
            value={filters.currency || "all"}
            onValueChange={(value) => handleFilterChange("currency", value)}
          >
            <SelectTrigger className="w-[60px]">
              <SelectValue placeholder="$" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              {!currenciesLoading && (currencies as any)?.results?.map((currency: any) => (
                <SelectItem key={currency.id} value={currency.value}>
                  {currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.payment_frequency || "all"}
            onValueChange={(value) => handleFilterChange("payment_frequency", value)}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder="Per" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              {!paymentFrequenciesLoading && (paymentFrequencies as any)?.results?.map((frequency: any) => (
                <SelectItem key={frequency.id} value={frequency.value}>
                  {frequency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.min_education_level || "all"}
            onValueChange={(value) => handleFilterChange("min_education_level", value)}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Edu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Education</SelectItem>
              {!educationLevelsLoading && (educationLevels as any)?.results?.map((level: any) => (
                <SelectItem key={level.id} value={level.value}>
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>



          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
