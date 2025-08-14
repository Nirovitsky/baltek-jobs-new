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
  bio: z.string().min(10, "Bio should be at least 10 characters"),
  location: z.string().min(1, "Location is required"),
  linkedin_url: z.string().url("Invalid LinkedIn URL").optional().or(z.literal("")),
  github_url: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  portfolio_url: z.string().url("Invalid Portfolio URL").optional().or(z.literal("")),
});

const skillsSchema = z.object({
  skills: z.array(z.string()).min(3, "Please add at least 3 skills"),
});

const experienceSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().optional(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  description: z.string().min(20, "Description should be at least 20 characters"),
  is_current: z.boolean().optional(),
});

const educationSchema = z.object({
  university: z.number().min(1, "Please select a university"),
  degree: z.string().min(1, "Degree is required"),
  field_of_study: z.string().min(1, "Field of study is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
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
    progress: 20,
  },
  {
    id: 2,
    title: "Skills & Expertise",
    subtitle: "What are you good at?",
    icon: Code2,
    progress: 40,
  },
  {
    id: 3,
    title: "Work Experience",
    subtitle: "Your professional journey",
    icon: Briefcase,
    progress: 60,
  },
  {
    id: 4,
    title: "Education",
    subtitle: "Your academic background",
    icon: GraduationCap,
    progress: 80,
  },
  {
    id: 5,
    title: "Complete Profile",
    subtitle: "You're all set!",
    icon: Star,
    progress: 100,
  },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch universities for education step
  const { data: universities } = useQuery({
    queryKey: ["universities"],
    queryFn: () => ApiClient.getUniversities(),
    enabled: currentStep === 4,
  });

  // Personal info form
  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      bio: user?.bio || "",
      location: user?.location || "",
      linkedin_url: user?.linkedin_url || "",
      github_url: user?.github_url || "",
      portfolio_url: user?.portfolio_url || "",
    },
  });

  // Experience form
  const experienceForm = useForm({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      start_date: "",
      end_date: "",
      description: "",
      is_current: false,
    },
  });

  // Education form
  const educationForm = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      university: 0,
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      grade: "",
      description: "",
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

  const handleAddSkill = () => {
    if (skillInput.trim() && !selectedSkills.includes(skillInput.trim())) {
      setSelectedSkills([...selectedSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      // Validate and save personal info
      const isValid = await personalForm.trigger();
      if (!isValid) return;

      const formData = personalForm.getValues();
      await updateProfileMutation.mutateAsync({
        ...formData,
        linkedin_url: formData.linkedin_url || null,
        github_url: formData.github_url || null,
        portfolio_url: formData.portfolio_url || null,
      });
    } else if (currentStep === 2) {
      // Validate and save skills
      if (selectedSkills.length < 3) {
        toast({
          title: "Skills Required",
          description: "Please add at least 3 skills to continue.",
          variant: "destructive",
        });
        return;
      }
      await updateProfileMutation.mutateAsync({ skills: selectedSkills });
    } else if (currentStep === 3) {
      // Validate and save experience
      const isValid = await experienceForm.trigger();
      if (!isValid) return;

      const formData = experienceForm.getValues();
      await addExperienceMutation.mutateAsync({
        ...formData,
        location: formData.location || null,
        end_date: formData.end_date || null,
        description: formData.description || null,
      });
    } else if (currentStep === 4) {
      // Validate and save education
      const isValid = await educationForm.trigger();
      if (!isValid) return;

      const formData = educationForm.getValues();
      await addEducationMutation.mutateAsync({
        ...formData,
        end_date: formData.end_date || null,
        grade: formData.grade || null,
        description: formData.description || null,
      });
    } else if (currentStep === 5) {
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
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                {...personalForm.register("bio")} 
                placeholder="Tell us about yourself, your interests, and career goals..."
                rows={4}
              />
              {personalForm.formState.errors.bio && (
                <p className="text-sm text-red-500 mt-1">
                  {personalForm.formState.errors.bio.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input 
                {...personalForm.register("location")} 
                placeholder="e.g., Ashgabat, Turkmenistan"
              />
              {personalForm.formState.errors.location && (
                <p className="text-sm text-red-500 mt-1">
                  {personalForm.formState.errors.location.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Professional Links (Optional)</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="linkedin_url">LinkedIn Profile</Label>
                  <Input 
                    {...personalForm.register("linkedin_url")} 
                    placeholder="https://linkedin.com/in/yourname"
                  />
                </div>
                <div>
                  <Label htmlFor="github_url">GitHub Profile</Label>
                  <Input 
                    {...personalForm.register("github_url")} 
                    placeholder="https://github.com/yourname"
                  />
                </div>
                <div>
                  <Label htmlFor="portfolio_url">Portfolio Website</Label>
                  <Input 
                    {...personalForm.register("portfolio_url")} 
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Code2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">What are your superpowers?</h2>
              <p className="text-muted-foreground">Add your skills so employers can find you easily</p>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a skill (e.g., JavaScript, Marketing, Design)"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
                />
                <Button onClick={handleAddSkill} type="button">
                  Add
                </Button>
              </div>

              <div className="min-h-[120px] p-4 border rounded-lg">
                {selectedSkills.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No skills added yet. Start by adding your top skills!</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Added {selectedSkills.length} skills. Minimum 3 required.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Pro Tip
              </h4>
              <p className="text-sm text-muted-foreground">
                Add both technical and soft skills. Include programming languages, tools, 
                frameworks, as well as communication, leadership, and problem-solving abilities.
              </p>
            </div>
          </div>
        );

      case 3:
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
                  <Label htmlFor="title">Job Title</Label>
                  <Input {...experienceForm.register("title")} placeholder="e.g., Software Developer" />
                  {experienceForm.formState.errors.title && (
                    <p className="text-sm text-red-500 mt-1">
                      {experienceForm.formState.errors.title.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input {...experienceForm.register("company")} placeholder="e.g., Tech Corp" />
                  {experienceForm.formState.errors.company && (
                    <p className="text-sm text-red-500 mt-1">
                      {experienceForm.formState.errors.company.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input {...experienceForm.register("location")} placeholder="e.g., Ashgabat, Turkmenistan" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input {...experienceForm.register("start_date")} type="date" />
                  {experienceForm.formState.errors.start_date && (
                    <p className="text-sm text-red-500 mt-1">
                      {experienceForm.formState.errors.start_date.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input {...experienceForm.register("end_date")} type="date" />
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

      case 4:
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree">Degree</Label>
                  <Input {...educationForm.register("degree")} placeholder="e.g., Bachelor's Degree" />
                  {educationForm.formState.errors.degree && (
                    <p className="text-sm text-red-500 mt-1">
                      {educationForm.formState.errors.degree.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="field_of_study">Field of Study</Label>
                  <Input {...educationForm.register("field_of_study")} placeholder="e.g., Computer Science" />
                  {educationForm.formState.errors.field_of_study && (
                    <p className="text-sm text-red-500 mt-1">
                      {educationForm.formState.errors.field_of_study.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input {...educationForm.register("start_date")} type="date" />
                  {educationForm.formState.errors.start_date && (
                    <p className="text-sm text-red-500 mt-1">
                      {educationForm.formState.errors.start_date.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input {...educationForm.register("end_date")} type="date" />
                  <p className="text-xs text-muted-foreground mt-1">Leave empty if still studying</p>
                </div>
              </div>

              <div>
                <Label htmlFor="grade">Grade/GPA (Optional)</Label>
                <Input {...educationForm.register("grade")} placeholder="e.g., 3.8/4.0 or First Class" />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  {...educationForm.register("description")} 
                  placeholder="Mention relevant coursework, achievements, or projects..."
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 5:
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
                  <span>Skills showcased</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Experience documented</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span>Education added</span>
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
              completeOnboardingMutation.isPending
            }
            className="px-6"
          >
            {currentStep === 5 ? (
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