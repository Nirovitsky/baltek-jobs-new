import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Code2,
  Globe,
  Github,
  Linkedin,
  ChevronRight,
  ChevronLeft,
  Check,
  Star,
  Target,
  BookOpen,
  Award,
  Zap,
  Upload,
  Camera,
} from "lucide-react";

// Onboarding step schemas - all fields are optional for flexible onboarding
const personalInfoSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  profession: z.string().optional(),
  gender: z.enum(["m", "f"]).optional(),
  date_of_birth: z.string().optional(),
  location: z.coerce.number().optional(),
  profile_picture: z.any().optional(),
});

const experienceSchema = z.object({
  organization: z.number().optional(),
  organization_name: z.string().optional(),
  position: z.string().optional(),
  description: z.string().optional(),
  date_started: z.string().optional(),
  date_finished: z.string().optional(),
});

const educationSchema = z.object({
  university: z.number().optional(),
  level: z
    .enum(["secondary", "undergraduate", "master", "doctorate"])
    .optional(),
  date_started: z.string().optional(),
  date_finished: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  link: z.string().url("Invalid project URL").optional().or(z.literal("")),
  date_started: z.string().optional(),
  date_finished: z.string().optional(),
});

type OnboardingStep = {
  id: number;
  title: string;
  subtitle: string;
  icon: any;
  progress: number;
};

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: "Personal Information",
    subtitle: "Tell us about yourself",
    icon: User,
    progress: 25,
  },
  {
    id: 2,
    title: "Work Experience",
    subtitle: "Your professional journey",
    icon: Briefcase,
    progress: 50,
  },
  {
    id: 3,
    title: "Education",
    subtitle: "Your academic background",
    icon: GraduationCap,
    progress: 75,
  },
  {
    id: 4,
    title: "Complete Profile",
    subtitle: "You're all set!",
    icon: Star,
    progress: 100,
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] =
    useState<string>("");
  const [birthDate, setBirthDate] = useState<Date>();

  // Fetch data for forms
  const { data: universities } = useQuery({
    queryKey: ["universities"],
    queryFn: () => ApiClient.getUniversities(),
    enabled: currentStep === 3,
  });

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => ApiClient.getLocations(),
    enabled: currentStep === 1,
  });

  // Debug locations data
  console.log("Locations data:", locations);
  console.log("Locations loading state:", { isLoading: false, isError: false });

  const { data: organizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => ApiClient.getOrganizations({ limit: 100 }),
    enabled: currentStep === 2,
  });

  // Personal info form
  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      profession: user?.profession || "",
      gender: user?.gender || undefined,
      date_of_birth: user?.date_of_birth || "",
      location: user?.location || undefined,
      profile_picture: undefined,
    },
  });

  // Handle profile picture upload
  const handleProfilePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setProfilePicture(file);
      const previewUrl = URL.createObjectURL(file);
      setProfilePicturePreview(previewUrl);
    }
  };

  // Handle date of birth change
  const handleDateChange = (date: Date | undefined) => {
    setBirthDate(date);
    if (date) {
      // Format as DD.MM.YYYY as required by the API
      personalForm.setValue("date_of_birth", format(date, "dd.MM.yyyy"));
    }
  };

  // Initialize birth date from user data
  useEffect(() => {
    if (user?.date_of_birth) {
      const date = new Date(user.date_of_birth);
      setBirthDate(date);
    }
  }, [user?.date_of_birth]);

  // Experience form
  const experienceForm = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      organization: undefined,
      organization_name: "",
      position: "",
      description: "",
      date_started: "",
      date_finished: "",
    },
  });

  // Education form
  const educationForm = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      university: undefined,
      level: undefined,
      date_started: "",
      date_finished: "",
    },
  });

  // Project form
  const projectForm = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      link: "",
      date_started: "",
      date_finished: "",
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => ApiClient.updateProfile(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });

  // Add experience mutation
  const addExperienceMutation = useMutation({
    mutationFn: (data: any) => ApiClient.addExperience(data),
  });

  // Add education mutation
  const addEducationMutation = useMutation({
    mutationFn: (data: any) => ApiClient.addEducation(data),
  });

  // Add project mutation
  const addProjectMutation = useMutation({
    mutationFn: (data: any) => ApiClient.addProject(data),
  });

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: () => {
      console.log("Completing onboarding for user:", user!.id);
      return ApiClient.completeOnboarding();
    },
    onSuccess: (data) => {
      console.log("Onboarding completion successful:", data);

      // Multiple redirect attempts to ensure it works
      console.log("Attempting redirect to /jobs page");

      // Method 1: Direct setLocation
      setLocation("/jobs");

      // Method 2: Backup with window.location (if setLocation fails)
      setTimeout(() => {
        console.log("Backup redirect attempt using window.location");
        if (window.location.pathname === "/onboarding") {
          window.location.href = "/jobs";
        }
      }, 200);

      // Show success toast
      setTimeout(() => {
        toast({
          title: "Welcome aboard! 🎉",
          description:
            "Your profile is now complete. Let's find you amazing opportunities!",
        });
      }, 600);

      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    onError: (error) => {
      console.error("Onboarding completion failed:", error);
      toast({
        title: "Completion failed",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = async () => {
    if (currentStep === 1) {
      // Save personal info if any data is provided
      const formData = personalForm.getValues();

      // Check if user has filled any personal information
      const hasPersonalData =
        formData.first_name ||
        formData.last_name ||
        formData.profession ||
        formData.gender ||
        formData.date_of_birth ||
        (formData.location && Number(formData.location) > 0);

      if (hasPersonalData) {
        // Clean up data before sending to API
        const profileData: any = {};

        if (formData.first_name) profileData.first_name = formData.first_name;
        if (formData.last_name) profileData.last_name = formData.last_name;
        if (formData.profession) profileData.profession = formData.profession;
        if (formData.gender) profileData.gender = formData.gender;
        if (formData.date_of_birth)
          profileData.date_of_birth = formData.date_of_birth;
        if (formData.location && Number(formData.location) > 0)
          profileData.location = formData.location;

        console.log("Submitting profile data:", profileData);

        try {
          // Update profile data
          await updateProfileMutation.mutateAsync(profileData);
          console.log("Profile update successful");
        } catch (error) {
          console.error("Profile update failed:", error);
          toast({
            title: "Update failed",
            description:
              "Failed to update profile. Please check your connection and try again.",
            variant: "destructive",
          });
          return;
        }

        // Upload profile picture if selected
        if (profilePicture) {
          try {
            await ApiClient.uploadProfilePicture(profilePicture);
            toast({
              title: "Profile picture uploaded",
              description: "Your profile picture has been updated successfully",
            });
          } catch (error) {
            console.error("Profile picture upload failed:", error);
            toast({
              title: "Upload failed",
              description:
                "Failed to upload profile picture, but your other information was saved",
              variant: "destructive",
            });
          }
        }
      }
    } else if (currentStep === 2) {
      // Save experience if any data is provided
      const formData = experienceForm.getValues();

      // Check if user has filled any experience information
      const hasExperienceData =
        (formData.organization && Number(formData.organization) > 0) ||
        formData.organization_name ||
        formData.position ||
        formData.description ||
        formData.date_started;

      if (hasExperienceData) {
        try {
          // Clean up experience data
          const experienceData: any = {};

          if (formData.organization && Number(formData.organization) > 0)
            experienceData.organization = formData.organization;
          if (formData.organization_name)
            experienceData.organization_name = formData.organization_name;
          if (formData.position) experienceData.position = formData.position;
          if (formData.description)
            experienceData.description = formData.description;
          if (formData.date_started)
            experienceData.date_started = formData.date_started;
          if (formData.date_finished)
            experienceData.date_finished = formData.date_finished;

          await addExperienceMutation.mutateAsync(experienceData);
        } catch (error) {
          console.error("Experience save failed:", error);
          toast({
            title: "Save failed",
            description: "Failed to save experience. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (currentStep === 3) {
      // Save education if any data is provided
      const formData = educationForm.getValues();

      // Check if user has filled any education information
      const hasEducationData =
        (formData.university && Number(formData.university) > 0) ||
        formData.level ||
        formData.date_started;

      if (hasEducationData) {
        try {
          // Clean up education data
          const educationData: any = {};

          if (formData.university && Number(formData.university) > 0)
            educationData.university = formData.university;
          if (formData.level) educationData.level = formData.level;
          if (formData.date_started)
            educationData.date_started = formData.date_started;
          if (formData.date_finished)
            educationData.date_finished = formData.date_finished;

          await addEducationMutation.mutateAsync(educationData);
        } catch (error) {
          console.error("Education save failed:", error);
          toast({
            title: "Save failed",
            description: "Failed to save education. Please try again.",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (currentStep === 4) {
      // Complete onboarding
      console.log("Step 4 - Completing onboarding...");
      console.log("Button clicked, triggering completion mutation");

      try {
        console.log("About to call completeOnboardingMutation.mutateAsync()");
        const result = await completeOnboardingMutation.mutateAsync();
        console.log(
          "Onboarding completion call finished successfully:",
          result,
        );
      } catch (error) {
        console.error("Error in completion step:", error);
        // Don't return here - let the error be handled by the mutation's onError
      }

      // Always return to prevent step increment
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Let's get to know you!
              </h2>
              <p className="text-muted-foreground">
                Tell us about yourself so we can find the perfect opportunities
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                All fields are optional - fill only what you'd like to share
              </p>
            </div>

            {/* Profile Picture Upload */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="w-24 h-24 cursor-pointer border-4 border-blue-200 dark:border-blue-700">
                  <AvatarImage
                    src={profilePicturePreview || user?.profile_picture}
                  />
                  <AvatarFallback className="text-lg">
                    {user?.first_name?.[0]}
                    {user?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  {...personalForm.register("first_name")}
                  placeholder="Enter your first name"
                />
                {personalForm.formState.errors.first_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {personalForm.formState.errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  {...personalForm.register("last_name")}
                  placeholder="Enter your last name"
                />
                {personalForm.formState.errors.last_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {personalForm.formState.errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="profession">Profession</Label>
              <Input
                {...personalForm.register("profession")}
                placeholder="e.g., Software Developer, Marketing Manager"
              />
              {personalForm.formState.errors.profession && (
                <p className="text-sm text-red-500 mt-1">
                  {personalForm.formState.errors.profession.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={personalForm.watch("gender")}
                  onValueChange={(value) =>
                    personalForm.setValue("gender", value as "m" | "f")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="m">Male</SelectItem>
                    <SelectItem value="f">Female</SelectItem>
                  </SelectContent>
                </Select>
                {personalForm.formState.errors.gender && (
                  <p className="text-sm text-red-500 mt-1">
                    {personalForm.formState.errors.gender.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Select
                      value={birthDate ? birthDate.getDate().toString() : ""}
                      onValueChange={(value) => {
                        const currentYear = birthDate
                          ? birthDate.getFullYear()
                          : 2000;
                        const currentMonth = birthDate
                          ? birthDate.getMonth()
                          : 0;
                        const newDate = new Date(
                          currentYear,
                          currentMonth,
                          parseInt(value),
                        );
                        handleDateChange(newDate);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={
                        birthDate ? (birthDate.getMonth() + 1).toString() : ""
                      }
                      onValueChange={(value) => {
                        const currentYear = birthDate
                          ? birthDate.getFullYear()
                          : 2000;
                        const currentDay = birthDate ? birthDate.getDate() : 1;
                        const newDate = new Date(
                          currentYear,
                          parseInt(value) - 1,
                          currentDay,
                        );
                        handleDateChange(newDate);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                          "July",
                          "August",
                          "September",
                          "October",
                          "November",
                          "December",
                        ].map((month, index) => (
                          <SelectItem
                            key={index + 1}
                            value={(index + 1).toString()}
                          >
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={
                        birthDate ? birthDate.getFullYear().toString() : ""
                      }
                      onValueChange={(value) => {
                        const currentMonth = birthDate
                          ? birthDate.getMonth()
                          : 0;
                        const currentDay = birthDate ? birthDate.getDate() : 1;
                        const newDate = new Date(
                          parseInt(value),
                          currentMonth,
                          currentDay,
                        );
                        handleDateChange(newDate);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 80 }, (_, i) => {
                          const year = new Date().getFullYear() - i - 10;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {personalForm.formState.errors.date_of_birth && (
                  <p className="text-sm text-red-500 mt-1">
                    {personalForm.formState.errors.date_of_birth.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Select
                value={personalForm.watch("location")?.toString() || ""}
                onValueChange={(value) => {
                  if (value && value !== "0") {
                    personalForm.setValue("location", parseInt(value));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a location (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {locations ? (
                    Array.isArray(locations) ? (
                      locations.map((loc: any) => (
                        <SelectItem key={loc.id} value={loc.id.toString()}>
                          {loc.name}
                        </SelectItem>
                      ))
                    ) : (locations as any)?.results &&
                      Array.isArray((locations as any).results) ? (
                      (locations as any).results.map((loc: any) => (
                        <SelectItem key={loc.id} value={loc.id.toString()}>
                          {loc.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="error" disabled>
                        Error loading locations
                      </SelectItem>
                    )
                  ) : (
                    <SelectItem value="loading" disabled>
                      Loading locations...
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {personalForm.formState.errors.location && (
                <p className="text-sm text-red-500 mt-1">
                  {personalForm.formState.errors.location.message}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Your professional journey
              </h2>
              <p className="text-muted-foreground">
                Add your most recent or relevant work experience
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                Skip this step if you prefer to add experience later
              </p>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organization">Organization</Label>
                  <select
                    {...experienceForm.register("organization", {
                      valueAsNumber: true,
                      setValueAs: (value) => (value === 0 ? undefined : value),
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select an organization (optional)</option>
                    {organizations &&
                    typeof organizations === "object" &&
                    "results" in organizations &&
                    Array.isArray(organizations.results)
                      ? organizations.results.map((org: any) => (
                          <option key={org.id} value={org.id}>
                            {org.display_name || org.official_name}
                          </option>
                        ))
                      : null}
                  </select>
                  {experienceForm.formState.errors.organization && (
                    <p className="text-sm text-red-500 mt-1">
                      {experienceForm.formState.errors.organization.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="organization_name">Organization Name</Label>
                  <Input
                    {...experienceForm.register("organization_name")}
                    placeholder="e.g., Tech Corp"
                  />
                  {experienceForm.formState.errors.organization_name && (
                    <p className="text-sm text-red-500 mt-1">
                      {
                        experienceForm.formState.errors.organization_name
                          .message
                      }
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  {...experienceForm.register("position")}
                  placeholder="e.g., Software Developer"
                />
                {experienceForm.formState.errors.position && (
                  <p className="text-sm text-red-500 mt-1">
                    {experienceForm.formState.errors.position.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_started">Start Date</Label>
                  <Input
                    {...experienceForm.register("date_started")}
                    type="date"
                  />
                  {experienceForm.formState.errors.date_started && (
                    <p className="text-sm text-red-500 mt-1">
                      {experienceForm.formState.errors.date_started.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="date_finished">End Date (Optional)</Label>
                  <Input
                    {...experienceForm.register("date_finished")}
                    type="date"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty if this is your current job
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  {...experienceForm.register("description")}
                  placeholder="Describe your responsibilities, achievements, and key projects..."
                  rows={4}
                />
                {experienceForm.formState.errors.description && (
                  <p className="text-sm text-red-500 mt-1">
                    {experienceForm.formState.errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                Your academic background
              </h2>
              <p className="text-muted-foreground">
                Tell us about your education to complete your profile
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                Feel free to skip if you'd like to add education details later
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="university">University</Label>
                  <select
                    {...educationForm.register("university", {
                      valueAsNumber: true,
                      setValueAs: (value) => (value === 0 ? undefined : value),
                    })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select a university (optional)</option>
                    {universities && Array.isArray(universities)
                      ? universities.map((uni: any) => (
                          <option key={uni.id} value={uni.id}>
                            {uni.name}
                          </option>
                        ))
                      : null}
                  </select>
                  {educationForm.formState.errors.university && (
                    <p className="text-sm text-red-500 mt-1">
                      {educationForm.formState.errors.university.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="level">Education Level</Label>
                  <select
                    {...educationForm.register("level")}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select education level (optional)</option>
                    <option value="secondary">Secondary</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="master">Master</option>
                    <option value="doctorate">Doctorate</option>
                  </select>
                  {educationForm.formState.errors.level && (
                    <p className="text-sm text-red-500 mt-1">
                      {educationForm.formState.errors.level.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_started">Start Date</Label>
                  <Input
                    {...educationForm.register("date_started")}
                    type="date"
                  />
                  {educationForm.formState.errors.date_started && (
                    <p className="text-sm text-red-500 mt-1">
                      {educationForm.formState.errors.date_started.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="date_finished">End Date (Optional)</Label>
                  <Input
                    {...educationForm.register("date_finished")}
                    type="date"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty if still studying
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Profile Complete</h2>
              <p className="text-muted-foreground">
                Your profile is ready for job opportunities
              </p>
            </div>

            <div className="bg-muted/30 p-6 rounded-lg">
              <div className="space-y-3 text-left mb-4">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">Personal information added</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">Experience documented</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">Education added</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">Profile completed</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Simple Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold">Complete Your Profile</h1>
            <div className="text-sm text-muted-foreground">
              {currentStep} of {ONBOARDING_STEPS.length}
            </div>
          </div>

          <Progress
            value={ONBOARDING_STEPS[currentStep - 1]?.progress || 0}
            className="h-1"
          />
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-6">{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={
              updateProfileMutation.isPending ||
              addExperienceMutation.isPending ||
              addEducationMutation.isPending ||
              addProjectMutation.isPending ||
              completeOnboardingMutation.isPending
            }
            data-testid={
              currentStep === 4
                ? "button-complete-onboarding"
                : "button-continue"
            }
          >
            {currentStep === 4 ? (
              completeOnboardingMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completing...
                </>
              ) : (
                <>
                  Complete Profile
                  <Star className="w-4 h-4 ml-2" />
                </>
              )
            ) : (
              <>
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
