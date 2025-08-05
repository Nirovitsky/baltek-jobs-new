import React, { useState } from "react";
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

  const { data: jobTypes } = useQuery({
    queryKey: ["jobTypes"],
    queryFn: () => ApiClient.getJobTypes(),
  });

  const { data: workplaceTypes } = useQuery({
    queryKey: ["workplaceTypes"],
    queryFn: () => ApiClient.getWorkplaceTypes(),
  });

  const { data: currencies } = useQuery({
    queryKey: ["currencies"],
    queryFn: () => ApiClient.getCurrencies(),
  });

  const { data: paymentFrequencies } = useQuery({
    queryKey: ["paymentFrequencies"],
    queryFn: () => ApiClient.getPaymentFrequencies(),
  });

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
                  {location.name}, {location.country}
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
            <SelectTrigger className="w-[95px] h-8 text-xs focus:border-ring focus-visible:ring-0">
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
            <SelectTrigger className="w-[90px] h-8 text-xs focus:border-ring focus-visible:ring-0">
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
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="text-gray-700 h-8 text-xs px-2"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}

          <Button
            variant="default"
            className="bg-primary hover:bg-primary/90 h-8 text-xs px-3"
          >
            Save
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
