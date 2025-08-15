import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

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
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  Star,
  Upload,
  Camera,
  Plus,
  X,
} from "lucide-react";

import { ApiClient } from "@/lib/api";

// Schemas - name fields required, others optional for flexible onboarding
const personalInfoSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  profession: z.string().optional(),
  gender: z.enum(["m", "f"]).optional(),
  date_of_birth: z.string().optional(),
  location: z.coerce.number().optional(),
  profile_picture: z.any().optional(),
});

const experienceSchema = z.object({
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

// MUI Date Picker Component
const MUIDatePicker = ({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (date: string) => void;
  label: string;
}) => {
  const selectedDate = value
    ? (() => {
        if (value.includes(".")) {
          // DD.MM.YYYY format
          const [day, month, year] = value.split(".");
          return dayjs(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)));
        } else {
          return dayjs(value);
        }
      })()
    : null;

  const handleDateChange = (date: any) => {
    if (date) {
      // Format as DD.MM.YYYY for API compatibility
      const jsDate = date.toDate();
      const year = jsDate.getFullYear();
      const month = String(jsDate.getMonth() + 1).padStart(2, "0");
      const day = String(jsDate.getDate()).padStart(2, "0");
      onChange(`${day}.${month}.${year}`);
    } else {
      onChange("");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={selectedDate}
        onChange={handleDateChange}
        slotProps={{
          textField: {
            fullWidth: true,
            variant: "outlined",
            size: "small"
          }
        }}
      />
    </LocalizationProvider>
  );
};

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

  // Experience and education lists
  const [experiences, setExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showEducationForm, setShowEducationForm] = useState(false);

  // Fetch data for forms
  const { data: universities } = useQuery({
    queryKey: ["universities"],
    queryFn: () => ApiClient.getUniversities(),
    enabled: currentStep === 3,
  });

  const { data: locations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: () => ApiClient.getLocations(),
    enabled: currentStep === 1,
  });

  // Debug locations data
  useEffect(() => {
    if (locations) {
      console.log("Locations data received:", locations);
      console.log("Is locations an array?", Array.isArray(locations));
      console.log(
        "Locations structure:",
        typeof locations,
        Object.keys(locations || {}),
      );
    }
  }, [locations]);

  // Date formatting is now handled directly in DatePicker component

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

  // Experience form
  const experienceForm = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
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

  // Handle date of birth change
  const handleDateChange = (date: Date | undefined) => {
    setBirthDate(date);
    if (date) {
      // Manually format as DD.MM.YYYY to ensure correct format
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const dateString = `${day}.${month}.${year}`;

      personalForm.setValue("date_of_birth", dateString);
    }
  };

  useEffect(() => {
    if (user?.date_of_birth) {
      const [day, month, year] = user.date_of_birth.split(".");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      setBirthDate(date);
    }
  }, [user?.date_of_birth]);

  // Handle adding experience to local list
  const handleAddExperience = (data: any) => {
    if (!data.organization_name && !data.position) return;

    const newExperience = {
      id: Date.now(), // temporary ID
      ...data,
      // dates are already in DD.MM.YYYY format from DatePicker
    };

    setExperiences([...experiences, newExperience]);
    experienceForm.reset();
    setShowExperienceForm(false);

    toast({
      title: "Experience added",
      description: "Experience added to your profile",
    });
  };

  // Handle adding education to local list
  const handleAddEducation = (data: any) => {
    if (!data.university && !data.level) return;

    const newEducation = {
      id: Date.now(), // temporary ID
      ...data,
      // dates are already in DD.MM.YYYY format from DatePicker
    };

    setEducations([...educations, newEducation]);
    educationForm.reset();
    setShowEducationForm(false);

    toast({
      title: "Education added",
      description: "Education added to your profile",
    });
  };

  // Remove experience
  const removeExperience = (id: number) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  // Remove education
  const removeEducation = (id: number) => {
    setEducations(educations.filter((edu) => edu.id !== id));
  };

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

  // Complete onboarding mutation
  const completeOnboardingMutation = useMutation({
    mutationFn: () => ApiClient.completeOnboarding(),
    onSuccess: (data) => {
      console.log("Onboarding completed successfully:", data);
      console.log("Redirecting to /jobs page...");

      // Force invalidate auth queries and wait a moment for cache to update
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });

      // Small delay to ensure state updates before redirect
      setTimeout(() => {
        setLocation("/jobs");
        toast({
          title: "Welcome aboard!",
          description:
            "Your profile is now complete. Let's find you amazing opportunities!",
        });
      }, 100);
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

  const handleNext = async () => {
    if (currentStep === 1) {
      // Handle personal info
      const formData = personalForm.getValues();
      if (Object.values(formData).some((value) => value)) {
        try {
          const profileData = { ...formData };
          delete profileData.profile_picture;

          // Only include date_of_birth if it's not empty
          if (
            !profileData.date_of_birth ||
            profileData.date_of_birth.trim() === ""
          ) {
            delete (profileData as any).date_of_birth;
          }

          await updateProfileMutation.mutateAsync(profileData);

          if (profilePicture) {
            await ApiClient.uploadProfilePicture(profilePicture);
          }
        } catch (error) {
          console.error("Profile update failed:", error);
          toast({
            title: "Update failed",
            description:
              "Failed to update profile. Please check your connection.",
            variant: "destructive",
          });
          return;
        }
      }
    } else if (currentStep === 2) {
      // Submit all experiences to API
      for (const experience of experiences) {
        try {
          await addExperienceMutation.mutateAsync(experience);
        } catch (error) {
          console.error("Experience submission failed:", error);
        }
      }
    } else if (currentStep === 3) {
      // Submit all educations to API
      for (const education of educations) {
        try {
          await addEducationMutation.mutateAsync(education);
        } catch (error) {
          console.error("Education submission failed:", error);
        }
      }
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboardingMutation.mutate();
    }
  };

  const handlePrevious = () => {
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
              <h2 className="text-2xl font-bold mb-2">Personal Information</h2>
              <p className="text-muted-foreground">Tell us about yourself</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                Name fields are required - other fields are optional
              </p>
            </div>

            <div className="space-y-4">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage
                      src={profilePicturePreview || user?.profile_picture}
                      alt="Profile"
                    />
                    <AvatarFallback>
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-4 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90"
                  >
                    <Camera className="w-4 h-4" />
                  </label>
                  <input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a profile photo
                </p>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    {...personalForm.register("first_name")}
                    placeholder="First name"
                    className={personalForm.formState.errors.first_name ? "border-red-500" : ""}
                  />
                  {personalForm.formState.errors.first_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {personalForm.formState.errors.first_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    {...personalForm.register("last_name")}
                    placeholder="Last name"
                    className={personalForm.formState.errors.last_name ? "border-red-500" : ""}
                  />
                  {personalForm.formState.errors.last_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {personalForm.formState.errors.last_name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Profession */}
              <div>
                <Label htmlFor="profession">Profession</Label>
                <Input
                  {...personalForm.register("profession")}
                  placeholder="Your profession"
                />
              </div>

              {/* Gender */}
              <div>
                <Label>Gender</Label>
                <Select
                  value={personalForm.watch("gender") || ""}
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
              </div>

              {/* Date of Birth */}
              <div>
                <Label>Date of Birth</Label>
                <MUIDatePicker
                  value={
                    birthDate
                      ? `${String(birthDate.getDate()).padStart(2, "0")}.${String(birthDate.getMonth() + 1).padStart(2, "0")}.${birthDate.getFullYear()}`
                      : ""
                  }
                  onChange={(dateString) => {
                    if (dateString) {
                      // Parse DD.MM.YYYY format
                      const [day, month, year] = dateString.split(".");
                      const date = new Date(
                        parseInt(year),
                        parseInt(month) - 1,
                        parseInt(day),
                      );
                      handleDateChange(date);
                    } else {
                      handleDateChange(undefined);
                    }
                  }}
                  label="Date of Birth (optional)"
                />
              </div>

              {/* Location */}
              <div>
                <Label>Location</Label>
                <Select
                  value={personalForm.watch("location")?.toString() || ""}
                  onValueChange={(value) =>
                    personalForm.setValue("location", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your location (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationsLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading locations...
                      </SelectItem>
                    ) : locations && Array.isArray(locations) ? (
                      locations.map((location: any) => (
                        <SelectItem
                          key={location.id}
                          value={location.id.toString()}
                        >
                          {location.name}
                        </SelectItem>
                      ))
                    ) : locations &&
                      (locations as any).results &&
                      Array.isArray((locations as any).results) ? (
                      (locations as any).results.map((location: any) => (
                        <SelectItem
                          key={location.id}
                          value={location.id.toString()}
                        >
                          {location.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-data" disabled>
                        No locations available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
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
              <h2 className="text-2xl font-bold mb-2">Work Experience</h2>
              <p className="text-muted-foreground">
                Add your professional experience
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-2">
                All fields are optional - add what you want to share
              </p>
            </div>

            {/* Experience List */}
            <div className="space-y-4">
              {experiences.map((exp, index) => (
                <Card key={exp.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {exp.position || "Position"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {exp.organization_name || "Company"}
                      </p>
                      {(exp.date_started || exp.date_finished) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {exp.date_started || "Start"} -{" "}
                          {exp.date_finished || "Present"}
                        </p>
                      )}
                      {exp.description && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          {exp.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(exp.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Add Experience Button */}
            {!showExperienceForm && (
              <Button
                variant="outline"
                onClick={() => setShowExperienceForm(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            )}

            {/* Experience Form */}
            {showExperienceForm && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="organization_name">Company Name</Label>
                      <Input
                        {...experienceForm.register("organization_name")}
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input
                        {...experienceForm.register("position")}
                        placeholder="Job title"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <MUIDatePicker
                        value={experienceForm.watch("date_started")}
                        onChange={(date) =>
                          experienceForm.setValue("date_started", date)
                        }
                        label="Start Date (optional)"
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <MUIDatePicker
                        value={experienceForm.watch("date_finished")}
                        onChange={(date) =>
                          experienceForm.setValue("date_finished", date)
                        }
                        label="End Date (optional)"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      {...experienceForm.register("description")}
                      placeholder="What did you do in this role?"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        handleAddExperience(experienceForm.getValues())
                      }
                    >
                      Add Experience
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowExperienceForm(false);
                        experienceForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Education</h2>
              <p className="text-muted-foreground">
                Add your academic background
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                All fields are optional - add what you want to share
              </p>
            </div>

            {/* Education List */}
            <div className="space-y-4">
              {educations.map((edu, index) => (
                <Card key={edu.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {edu.level || "Education Level"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {(universities as any)?.results?.find(
                          (u: any) => u.id === edu.university,
                        )?.name || "University"}
                      </p>
                      {(edu.date_started || edu.date_finished) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {edu.date_started || "Start"} -{" "}
                          {edu.date_finished || "Present"}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(edu.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Add Education Button */}
            {!showEducationForm && (
              <Button
                variant="outline"
                onClick={() => setShowEducationForm(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            )}

            {/* Education Form */}
            {showEducationForm && (
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="university">University</Label>
                      <select
                        {...educationForm.register("university", {
                          valueAsNumber: true,
                          setValueAs: (value) =>
                            value === 0 ? undefined : value,
                        })}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select a university</option>
                        {universities &&
                        typeof universities === "object" &&
                        "results" in universities &&
                        Array.isArray(universities.results)
                          ? universities.results.map((uni: any) => (
                              <option key={uni.id} value={uni.id}>
                                {uni.name}
                              </option>
                            ))
                          : null}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="level">Education Level</Label>
                      <select
                        {...educationForm.register("level")}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select education level</option>
                        <option value="secondary">Secondary</option>
                        <option value="undergraduate">Undergraduate</option>
                        <option value="master">Master</option>
                        <option value="doctorate">Doctorate</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <MUIDatePicker
                        value={educationForm.watch("date_started")}
                        onChange={(date) =>
                          educationForm.setValue("date_started", date)
                        }
                        label="Start Date (optional)"
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <MUIDatePicker
                        value={educationForm.watch("date_finished")}
                        onChange={(date) =>
                          educationForm.setValue("date_finished", date)
                        }
                        label="End Date (optional)"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() =>
                        handleAddEducation(educationForm.getValues())
                      }
                    >
                      Add Education
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowEducationForm(false);
                        educationForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
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
                  <span className="text-sm">
                    {experiences.length > 0
                      ? `${experiences.length} work experience${experiences.length > 1 ? "s" : ""} added`
                      : "Experience section completed"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    {educations.length > 0
                      ? `${educations.length} education entr${educations.length > 1 ? "ies" : "y"} added`
                      : "Education section completed"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Click "Complete Profile" to start exploring job opportunities
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                B
              </span>
            </div>
            <span className="font-semibold">Baltek Jobs</span>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                Step {currentStep} of {ONBOARDING_STEPS.length}
              </span>
              <span className="text-sm text-muted-foreground">
                {ONBOARDING_STEPS[currentStep - 1]?.progress}% complete
              </span>
            </div>
            <Progress
              value={ONBOARDING_STEPS[currentStep - 1]?.progress}
              className="h-2"
            />
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-8">
            {ONBOARDING_STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    currentStep >= step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/30 text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                {index < ONBOARDING_STEPS.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      currentStep > step.id
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <Card className="mb-8">
          <CardContent className="p-8">{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={
              updateProfileMutation.isPending ||
              addExperienceMutation.isPending ||
              addEducationMutation.isPending ||
              completeOnboardingMutation.isPending
            }
          >
            {currentStep === 4 ? (
              completeOnboardingMutation.isPending ? (
                "Completing..."
              ) : (
                "Complete Profile"
              )
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
