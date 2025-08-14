import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Zap
} from "lucide-react";

// Onboarding step schemas
const personalInfoSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  profession: z.string().min(1, "Profession is required"),
  gender: z.enum(["m", "f"], { required_error: "Please select gender" }),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  location: z.number().min(1, "Please select a location"),
});

const experienceSchema = z.object({
  organization: z.number().min(1, "Please select an organization"),
  organization_name: z.string().min(1, "Organization name is required"),
  position: z.string().min(1, "Position is required"),
  description: z.string().min(20, "Description should be at least 20 characters"),
  date_started: z.string().min(1, "Start date is required"),
  date_finished: z.string().optional(),
});

const educationSchema = z.object({
  university: z.number().min(1, "Please select a university"),
  level: z.enum(["secondary", "undergraduate", "master", "doctorate"], { 
    required_error: "Please select education level" 
  }),
  date_started: z.string().min(1, "Start date is required"),
  date_finished: z.string().optional(),
});

const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().min(20, "Description should be at least 20 characters"),
  link: z.string().url("Invalid project URL").optional().or(z.literal("")),
  date_started: z.string().min(1, "Start date is required"),
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
      gender: user?.gender || "m",
      date_of_birth: user?.date_of_birth || "",
      location: user?.location || 0,
    },
  });

  // Experience form
  const experienceForm = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      organization: 0,
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
      university: 0,
      level: "secondary",
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
    mutationFn: () => 
      ApiClient.updateProfile(user!.id, { is_jobs_onboarding_completed: true }),
    onSuccess: () => {
      toast({
        title: "Welcome aboard! 🎉",
        description: "Your profile is now complete. Let's find you amazing opportunities!",
      });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      setLocation("/jobs");
    },
  });



  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate and save personal info
      const isValid = await personalForm.trigger();
      if (!isValid) return;

      const formData = personalForm.getValues();
      await updateProfileMutation.mutateAsync(formData);
    } else if (currentStep === 2) {
      // Validate and save experience
      const isValid = await experienceForm.trigger();
      if (!isValid) return;

      const formData = experienceForm.getValues();
      await addExperienceMutation.mutateAsync({
        ...formData,
        date_finished: formData.date_finished || null,
      });
    } else if (currentStep === 3) {
      // Validate and save education
      const isValid = await educationForm.trigger();
      if (!isValid) return;

      const formData = educationForm.getValues();
      await addEducationMutation.mutateAsync({
        ...formData,
        date_finished: formData.date_finished || null,
      });
    } else if (currentStep === 4) {
      // Complete onboarding
      await completeOnboardingMutation.mutateAsync();
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
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Let's get to know you!</h2>
              <p className="text-muted-foreground">Tell us about yourself so we can find the perfect opportunities</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input {...personalForm.register("first_name")} />
                {personalForm.formState.errors.first_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {personalForm.formState.errors.first_name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input {...personalForm.register("last_name")} />
                {personalForm.formState.errors.last_name && (
                  <p className="text-sm text-red-500 mt-1">
                    {personalForm.formState.errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="profession">Profession</Label>
              <Input {...personalForm.register("profession")} placeholder="e.g., Software Developer, Marketing Manager" />
              {personalForm.formState.errors.profession && (
                <p className="text-sm text-red-500 mt-1">
                  {personalForm.formState.errors.profession.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select 
                  {...personalForm.register("gender")}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                </select>
                {personalForm.formState.errors.gender && (
                  <p className="text-sm text-red-500 mt-1">
                    {personalForm.formState.errors.gender.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input {...personalForm.register("date_of_birth")} type="date" />
                {personalForm.formState.errors.date_of_birth && (
                  <p className="text-sm text-red-500 mt-1">
                    {personalForm.formState.errors.date_of_birth.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <select 
                {...personalForm.register("location", { valueAsNumber: true })}
                className="w-full p-2 border rounded-md"
              >
                <option value={0}>Select a location</option>
                {locations && Array.isArray(locations) ? locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                )) : null}
              </select>
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
              <h2 className="text-2xl font-bold mb-2">Your professional journey</h2>
              <p className="text-muted-foreground">Add your most recent or relevant work experience</p>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organization">Organization</Label>
                  <select 
                    {...experienceForm.register("organization", { valueAsNumber: true })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={0}>Select an organization</option>
                    {organizations && organizations.results && Array.isArray(organizations.results) ? organizations.results.map((org: any) => (
                      <option key={org.id} value={org.id}>
                        {org.display_name || org.official_name}
                      </option>
                    )) : null}
                  </select>
                  {experienceForm.formState.errors.organization && (
                    <p className="text-sm text-red-500 mt-1">
                      {experienceForm.formState.errors.organization.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="organization_name">Organization Name</Label>
                  <Input {...experienceForm.register("organization_name")} placeholder="e.g., Tech Corp" />
                  {experienceForm.formState.errors.organization_name && (
                    <p className="text-sm text-red-500 mt-1">
                      {experienceForm.formState.errors.organization_name.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="position">Position</Label>
                <Input {...experienceForm.register("position")} placeholder="e.g., Software Developer" />
                {experienceForm.formState.errors.position && (
                  <p className="text-sm text-red-500 mt-1">
                    {experienceForm.formState.errors.position.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date_started">Start Date</Label>
                  <Input {...experienceForm.register("date_started")} type="date" />
                  {experienceForm.formState.errors.date_started && (
                    <p className="text-sm text-red-500 mt-1">
                      {experienceForm.formState.errors.date_started.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="date_finished">End Date (Optional)</Label>
                  <Input {...experienceForm.register("date_finished")} type="date" />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty if this is your current job</p>
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
              <h2 className="text-2xl font-bold mb-2">Your academic background</h2>
              <p className="text-muted-foreground">Tell us about your education to complete your profile</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="university">University</Label>
                  <select 
                    {...educationForm.register("university", { valueAsNumber: true })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value={0}>Select a university</option>
                    {universities && Array.isArray(universities) ? universities.map((uni: any) => (
                      <option key={uni.id} value={uni.id}>
                        {uni.name}
                      </option>
                    )) : null}
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
                  <Input {...educationForm.register("date_started")} type="date" />
                  {educationForm.formState.errors.date_started && (
                    <p className="text-sm text-red-500 mt-1">
                      {educationForm.formState.errors.date_started.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="date_finished">End Date (Optional)</Label>
                  <Input {...educationForm.register("date_finished")} type="date" />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty if still studying</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Congratulations! 🎉</h2>
              <p className="text-lg text-muted-foreground">
                Your profile is now 100% complete and ready to attract amazing opportunities!
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-8 rounded-xl">
              <div className="grid grid-cols-2 gap-6 text-left mb-6">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Personal information added</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Experience documented</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Education added</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Profile completed</span>
                </div>
              </div>

              <div className="text-center">
                <Award className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-xl font-semibold mb-2">Profile Completion Badge Earned!</h3>
                <p className="text-muted-foreground">
                  You're now ready to discover and apply for amazing job opportunities
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Complete Your Profile</h1>
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {ONBOARDING_STEPS.length}
            </div>
          </div>
          
          <Progress 
            value={ONBOARDING_STEPS[currentStep - 1]?.progress || 0} 
            className="h-2 mb-6"
          />

          {/* Step indicators */}
          <div className="flex justify-between">
            {ONBOARDING_STEPS.map((step) => {
              const StepIcon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div 
                  key={step.id} 
                  className={`flex flex-col items-center text-center ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 
                    isCompleted ? 'text-green-600 dark:text-green-400' : 
                    'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    isActive ? 'bg-blue-100 dark:bg-blue-900' :
                    isCompleted ? 'bg-green-100 dark:bg-green-900' :
                    'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-xs font-medium hidden sm:block">{step.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6"
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
            className="px-6"
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