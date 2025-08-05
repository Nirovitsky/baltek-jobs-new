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
          <Label className="text-sm font-medium text-gray-700">Filters:</Label>
          
          <Select
            value={filters.location?.toString() || "all"}
            onValueChange={(value) => handleFilterChange("location", value !== "all" ? parseInt(value) : undefined)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Locations" />
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
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
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
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="FULL_TIME">Full-time</SelectItem>
              <SelectItem value="PART_TIME">Part-time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="FREELANCE">Freelance</SelectItem>
              <SelectItem value="INTERNSHIP">Internship</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.workplace_type || "all"}
            onValueChange={(value) => handleFilterChange("workplace_type", value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Work Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Work Types</SelectItem>
              <SelectItem value="REMOTE">Remote</SelectItem>
              <SelectItem value="ON_SITE">On-site</SelectItem>
              <SelectItem value="HYBRID">Hybrid</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min salary"
              value={filters.salary_min || ""}
              onChange={(e) => handleFilterChange("salary_min", e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-[120px]"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Max salary"
              value={filters.salary_max || ""}
              onChange={(e) => handleFilterChange("salary_max", e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-[120px]"
            />
          </div>

          <Select
            value={filters.currency || "all"}
            onValueChange={(value) => handleFilterChange("currency", value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Currencies</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="CAD">CAD</SelectItem>
              <SelectItem value="AUD">AUD</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.payment_frequency || "all"}
            onValueChange={(value) => handleFilterChange("payment_frequency", value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Frequencies</SelectItem>
              <SelectItem value="HOURLY">Hourly</SelectItem>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.min_education_level || "all"}
            onValueChange={(value) => handleFilterChange("min_education_level", value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Education" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Education</SelectItem>
              <SelectItem value="HIGH_SCHOOL">High School</SelectItem>
              <SelectItem value="ASSOCIATE">Associate</SelectItem>
              <SelectItem value="BACHELOR">Bachelor's</SelectItem>
              <SelectItem value="MASTER">Master's</SelectItem>
              <SelectItem value="DOCTORATE">Doctorate</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Payment from"
              value={filters.payment_from || ""}
              onChange={(e) => handleFilterChange("payment_from", e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-[120px]"
            />
            <span className="text-gray-500">-</span>
            <Input
              type="number"
              placeholder="Payment to"
              value={filters.payment_to || ""}
              onChange={(e) => handleFilterChange("payment_to", e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-[120px]"
            />
          </div>

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
