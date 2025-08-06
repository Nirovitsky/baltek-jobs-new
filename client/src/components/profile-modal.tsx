import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api";
import { 
  userProfileSchema, 
  educationSchema, 
  experienceSchema, 
  projectSchema,
  type UserProfile,
  type Education,
  type Experience,
  type Project
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FileUpload from "@/components/file-upload";
import { 
  User, 
  X, 
  Plus, 
  Trash2, 
  Edit,
  GraduationCap,
  Briefcase,
  Code,
  Save,
  Camera,
  FileText,
  Upload,
  Download
} from "lucide-react";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EducationFormData extends Omit<Education, 'university'> {
  university: number;
}

interface ExperienceFormData extends Experience {}

interface ProjectFormData extends Project {}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"personal" | "education" | "experience" | "projects" | "resumes">("personal");
  const [editingEducation, setEditingEducation] = useState<any>(null);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [uploadingResume, setUploadingResume] = useState<File | null>(null);

  // Fetch additional data
  const { data: universities, isLoading: universitiesLoading } = useQuery({
    queryKey: ["universities"],
    queryFn: () => ApiClient.getUniversities(),
    enabled: isOpen,
  });

  const { data: organizations, isLoading: organizationsLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => ApiClient.getOrganizations(),
    enabled: isOpen,
  });

  // Use cached profile data from the profile page (avoids duplicate API call)
  const { data: fullProfile } = useQuery({
    queryKey: ["user", "profile", user?.id],
    enabled: false, // Don't fetch - use cached data from profile page
  });

  const userEducation = (fullProfile as any)?.educations || [];
  const userExperience = (fullProfile as any)?.experiences || [];
  const userProjects = (fullProfile as any)?.projects || [];

  // Fetch user resumes
  const { data: userResumes, isLoading: resumesLoading } = useQuery({
    queryKey: ["user", "resumes", user?.id],
    queryFn: () => ApiClient.getResumes(),
    enabled: isOpen && !!user?.id,
  });

  // Personal info form - use cached profile data if available, fallback to user
  const profileData = fullProfile || user;
  const personalForm = useForm<any>({
    defaultValues: {
      first_name: (profileData as any)?.first_name || "",
      last_name: (profileData as any)?.last_name || "",
      email: (profileData as any)?.email || "",
      phone: (profileData as any)?.phone || "",
      profession: (profileData as any)?.profession || "",
      bio: (profileData as any)?.bio || "",
      location: (profileData as any)?.location || "",
      skills: (profileData as any)?.skills || [],
      linkedin_url: (profileData as any)?.linkedin_url || "",
      github_url: (profileData as any)?.github_url || "",
      portfolio_url: (profileData as any)?.portfolio_url || "",
    },
  });

  // Education form - updated for API structure
  const educationForm = useForm<any>({
    defaultValues: {
      university: 0,
      level: "",
      date_started: "",
      date_finished: "",
      description: "",
    },
  });

  // Experience form - updated for API structure
  const experienceForm = useForm<any>({
    defaultValues: {
      organization: 0,
      organization_name: "",
      position: "",
      date_started: "",
      date_finished: "",
      description: "",
    },
  });

  // Project form - updated for API structure
  const projectForm = useForm<any>({
    defaultValues: {
      title: "",
      description: "",
      technologies: [],
      url: "",
      github_url: "",
      date_started: "",
      date_finished: "",
    },
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => ApiClient.updateProfile(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["user", "profile", user?.id] });
      toast({ title: "Profile updated", description: "Your profile has been updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const addEducationMutation = useMutation({
    mutationFn: (data: any) => ApiClient.addEducation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", user?.id] });
      educationForm.reset();
      toast({ title: "Education added", description: "Education record added successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to add education",
        description: error instanceof Error ? error.message : "Failed to add education",
        variant: "destructive",
      });
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      ApiClient.updateEducation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", user?.id] });
      setEditingEducation(null);
      educationForm.reset();
      toast({ title: "Education updated", description: "Education record updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update education",
        description: error instanceof Error ? error.message : "Failed to update education",
        variant: "destructive",
      });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: (id: number) => ApiClient.deleteEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", user?.id] });
      toast({ title: "Education deleted", description: "Education record deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete education",
        description: error instanceof Error ? error.message : "Failed to delete education",
        variant: "destructive",
      });
    },
  });

  const addExperienceMutation = useMutation({
    mutationFn: (data: any) => ApiClient.addExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", user?.id] });
      experienceForm.reset();
      toast({ title: "Experience added", description: "Work experience added successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to add experience",
        description: error instanceof Error ? error.message : "Failed to add experience",
        variant: "destructive",
      });
    },
  });

  const updateExperienceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      ApiClient.updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", user?.id] });
      setEditingExperience(null);
      experienceForm.reset();
      toast({ title: "Experience updated", description: "Work experience updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update experience",
        description: error instanceof Error ? error.message : "Failed to update experience",
        variant: "destructive",
      });
    },
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: (id: number) => ApiClient.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", user?.id] });
      toast({ title: "Experience deleted", description: "Work experience deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete experience",
        description: error instanceof Error ? error.message : "Failed to delete experience",
        variant: "destructive",
      });
    },
  });

  const addProjectMutation = useMutation({
    mutationFn: (data: any) => ApiClient.addProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", user?.id] });
      projectForm.reset();
      toast({ title: "Project added", description: "Project added successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to add project",
        description: error instanceof Error ? error.message : "Failed to add project",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      ApiClient.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", user?.id] });
      setEditingProject(null);
      projectForm.reset();
      toast({ title: "Project updated", description: "Project updated successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to update project",
        description: error instanceof Error ? error.message : "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => ApiClient.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile", user?.id] });
      toast({ title: "Project deleted", description: "Project deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete project",
        description: error instanceof Error ? error.message : "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  // Resume mutations
  const uploadResumeMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      // Add required title field (use filename without extension)
      const title = file.name.replace(/\.[^/.]+$/, "");
      formData.append("title", title);
      return ApiClient.uploadResume(formData);
    },
    onSuccess: () => {
      // Invalidate and refetch resumes immediately
      queryClient.invalidateQueries({ queryKey: ["user", "resumes", user?.id] });
      queryClient.refetchQueries({ queryKey: ["user", "resumes", user?.id] });
      setUploadingResume(null);
      toast({ title: "Resume uploaded", description: "Resume uploaded successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to upload resume",
        description: error instanceof Error ? error.message : "Failed to upload resume",
        variant: "destructive",
      });
    },
  });

  const deleteResumeMutation = useMutation({
    mutationFn: (id: number) => ApiClient.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "resumes", user?.id] });
      toast({ title: "Resume deleted", description: "Resume deleted successfully" });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete resume",
        description: error instanceof Error ? error.message : "Failed to delete resume",
        variant: "destructive",
      });
    },
  });

  // Form handlers
  const handlePersonalSubmit = (data: any) => {
    updateProfileMutation.mutate(data);
  };

  const handleEducationSubmit = (data: any) => {
    // Convert date format for API
    const formattedData = {
      ...data,
      date_started: formatDateForAPI(data.date_started),
      date_finished: formatDateForAPI(data.date_finished),
    };
    
    if (editingEducation) {
      updateEducationMutation.mutate({ id: editingEducation.id, data: formattedData });
    } else {
      addEducationMutation.mutate(formattedData);
    }
  };

  const formatDateForAPI = (dateString: string) => {
    if (!dateString) return "";
    // Convert from YYYY-MM-DD to DD.MM.YYYY
    const [year, month, day] = dateString.split("-");
    return `${day}.${month}.${year}`;
  };

  const formatDateForForm = (dateString: string) => {
    if (!dateString) return "";
    // Convert from DD.MM.YYYY to YYYY-MM-DD
    const [day, month, year] = dateString.split(".");
    return `${year}-${month}-${day}`;
  };

  const handleExperienceSubmit = (data: any) => {
    // Convert date format for API
    const formattedData = {
      ...data,
      date_started: formatDateForAPI(data.date_started),
      date_finished: formatDateForAPI(data.date_finished),
    };

    // If organization ID is set (user selected from suggestions), use it
    // If not, send organization_name for custom entry
    if (!data.organization || data.organization === 0) {
      formattedData.organization_name = data.organization_name;
      delete formattedData.organization;
    }
    
    if (editingExperience) {
      updateExperienceMutation.mutate({ id: editingExperience.id, data: formattedData });
    } else {
      addExperienceMutation.mutate(formattedData);
    }
  };

  const handleProjectSubmit = (data: any) => {
    // Convert date format for API
    const formattedData = {
      ...data,
      date_started: formatDateForAPI(data.date_started),
      date_finished: formatDateForAPI(data.date_finished),
    };
    
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data: formattedData });
    } else {
      addProjectMutation.mutate(formattedData);
    }
  };

  const handleSkillsChange = (skillsString: string) => {
    const skills = skillsString.split(",").map(skill => skill.trim()).filter(Boolean);
    personalForm.setValue("skills", skills);
  };

  const handleTechnologiesChange = (techString: string) => {
    const technologies = techString.split(",").map(tech => tech.trim()).filter(Boolean);
    projectForm.setValue("technologies", technologies);
  };

  // Resume handlers
  const handleResumeUpload = (file: File) => {
    if ((userResumes?.results || []).length >= 3) {
      toast({
        title: "Upload limit reached",
        description: "You can only upload up to 3 resumes",
        variant: "destructive",
      });
      return;
    }
    setUploadingResume(file);
    uploadResumeMutation.mutate(file);
  };

  const handleResumeDelete = (resumeId: number) => {
    deleteResumeMutation.mutate(resumeId);
  };

  // Handle form population when editing
  const handleEditEducation = (edu: any) => {
    setEditingEducation(edu);
    educationForm.reset({
      university: edu.university?.id || 0,
      level: edu.level || "",
      date_started: formatDateForForm(edu.date_started || ""),
      date_finished: formatDateForForm(edu.date_finished || ""),
      description: edu.description || "",
    });
  };

  const handleEditExperience = (exp: any) => {
    setEditingExperience(exp);
    experienceForm.reset({
      organization: exp.organization?.id || 0,
      organization_name: exp.organization_name || (exp.organization?.official_name || exp.organization?.display_name) || "",
      position: exp.position || "",
      date_started: formatDateForForm(exp.date_started || ""),
      date_finished: formatDateForForm(exp.date_finished || ""),
      description: exp.description || "",
    });
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    projectForm.reset({
      title: project.title || "",
      description: project.description || "",
      technologies: project.technologies || [],
      url: project.url || "",
      github_url: project.github_url || "",
      date_started: formatDateForForm(project.date_started || ""),
      date_finished: formatDateForForm(project.date_finished || ""),
    });
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">My Profile</DialogTitle>
              <DialogDescription>Manage your professional profile and career information</DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex h-[70vh]">
          {/* Sidebar Navigation */}
          <div className="w-48 border-r pr-4 space-y-2">
            <Button
              variant={activeTab === "personal" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("personal")}
            >
              <User className="w-4 h-4 mr-2" />
              Personal
            </Button>
            <Button
              variant={activeTab === "education" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("education")}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Education
            </Button>
            <Button
              variant={activeTab === "experience" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("experience")}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Experience
            </Button>
            <Button
              variant={activeTab === "projects" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("projects")}
            >
              <Code className="w-4 h-4 mr-2" />
              Projects
            </Button>
            <Button
              variant={activeTab === "resumes" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("resumes")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Resumes ({(userResumes?.results || []).length}/3)
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1 pl-6 overflow-y-auto">
            {/* Personal Information Tab */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center relative group cursor-pointer">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user.first_name} {user.last_name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>

                <form onSubmit={personalForm.handleSubmit(handlePersonalSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        {...personalForm.register("first_name")}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        {...personalForm.register("last_name")}
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...personalForm.register("email")}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...personalForm.register("phone")}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...personalForm.register("location")}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession</Label>
                    <Input
                      id="profession"
                      {...personalForm.register("profession")}
                      placeholder="Software Engineer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={3}
                      {...personalForm.register("bio")}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      defaultValue={user.skills?.join(", ") || ""}
                      onChange={(e) => handleSkillsChange(e.target.value)}
                      placeholder="React, TypeScript, Node.js"
                    />
                    {personalForm.watch("skills") && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {personalForm.watch("skills")?.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Professional Links</Label>
                    <div className="grid grid-cols-1 gap-2">
                      <Input
                        {...personalForm.register("linkedin_url")}
                        placeholder="LinkedIn URL"
                      />
                      <Input
                        {...personalForm.register("github_url")}
                        placeholder="GitHub URL"
                      />
                      <Input
                        {...personalForm.register("portfolio_url")}
                        placeholder="Portfolio URL"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === "education" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Education</h3>
                  <Button
                    onClick={() => {
                      setEditingEducation(null);
                      educationForm.reset();
                    }}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                </div>

                {/* Education Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {editingEducation ? "Edit Education" : "Add Education"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={educationForm.handleSubmit(handleEducationSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="university">University</Label>
                        <Select
                          value={educationForm.watch("university")?.toString() || ""}
                          onValueChange={(value) => educationForm.setValue("university", parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select university" />
                          </SelectTrigger>
                          <SelectContent>
                            {!universitiesLoading && (universities as any)?.results?.map((uni: any) => (
                              <SelectItem key={uni.id} value={uni.id.toString()}>
                                {uni.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="level">Education Level</Label>
                        <Input
                          id="level"
                          {...educationForm.register("level")}
                          placeholder="Bachelor of Science in Computer Science"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date_started">Start Date</Label>
                          <Input
                            id="date_started"
                            type="date"
                            {...educationForm.register("date_started")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date_finished">End Date</Label>
                          <Input
                            id="date_finished"
                            type="date"
                            {...educationForm.register("date_finished")}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edu_description">Description (Optional)</Label>
                        <Textarea
                          id="edu_description"
                          rows={2}
                          {...educationForm.register("description")}
                          placeholder="Relevant coursework, achievements, etc."
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={addEducationMutation.isPending || updateEducationMutation.isPending}
                        >
                          {editingEducation ? "Update" : "Add"} Education
                        </Button>
                        {editingEducation && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingEducation(null);
                              educationForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Education List */}
                {userEducation?.map((edu: any) => (
                  <Card key={edu.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{edu.degree}</h4>
                          <p className="text-gray-600">{edu.university_name}</p>
                          <p className="text-sm text-gray-500">{edu.field_of_study}</p>
                          <p className="text-sm text-gray-500">
                            {edu.start_date} - {edu.end_date || "Present"}
                            {edu.grade && ` • ${edu.grade}`}
                          </p>
                          {edu.description && (
                            <p className="text-sm text-gray-700 mt-2">{edu.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEducation(edu)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteEducationMutation.mutate(edu.id)}
                            disabled={deleteEducationMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === "experience" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Work Experience</h3>
                  <Button
                    onClick={() => {
                      setEditingExperience(null);
                      experienceForm.reset();
                    }}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </div>

                {/* Experience Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {editingExperience ? "Edit Experience" : "Add Experience"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={experienceForm.handleSubmit(handleExperienceSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="organization">Organization</Label>
                        <div className="relative">
                          <Input
                            placeholder="Type organization name (select from suggestions or add new)"
                            value={experienceForm.watch("organization_name") || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              experienceForm.setValue("organization_name", value);
                              experienceForm.setValue("organization", 0);
                              
                              // Find matching organization
                              const matchingOrg = (organizations as any)?.results?.find((org: any) => 
                                (org.official_name || org.display_name).toLowerCase() === value.toLowerCase()
                              );
                              if (matchingOrg) {
                                experienceForm.setValue("organization", matchingOrg.id);
                              }
                            }}
                          />
                          
                          {/* Show suggestions when typing */}
                          {experienceForm.watch("organization_name") && 
                           experienceForm.watch("organization_name").length > 0 && 
                           !organizationsLoading && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                              {(organizations as any)?.results
                                ?.filter((org: any) => 
                                  (org.official_name || org.display_name)
                                    .toLowerCase()
                                    .includes(experienceForm.watch("organization_name").toLowerCase())
                                )
                                ?.slice(0, 5)
                                ?.map((org: any) => (
                                  <div
                                    key={org.id}
                                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                    onClick={() => {
                                      experienceForm.setValue("organization_name", org.official_name || org.display_name);
                                      experienceForm.setValue("organization", org.id);
                                    }}
                                  >
                                    {org.official_name || org.display_name}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          {...experienceForm.register("position")}
                          placeholder="Senior Frontend Developer"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="exp_date_started">Start Date</Label>
                          <Input
                            id="exp_date_started"
                            type="date"
                            {...experienceForm.register("date_started")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exp_date_finished">End Date</Label>
                          <Input
                            id="exp_date_finished"
                            type="date"
                            {...experienceForm.register("date_finished")}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exp_description">Description</Label>
                        <Textarea
                          id="exp_description"
                          rows={3}
                          {...experienceForm.register("description")}
                          placeholder="Describe your role and achievements..."
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={addExperienceMutation.isPending || updateExperienceMutation.isPending}
                        >
                          {editingExperience ? "Update" : "Add"} Experience
                        </Button>
                        {editingExperience && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingExperience(null);
                              experienceForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Experience List */}
                {userExperience?.map((exp: any) => (
                  <Card key={exp.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{exp.position}</h4>
                          <p className="text-gray-600">{exp.organization_name}</p>
                          <p className="text-sm text-gray-500">
                            {exp.date_started} - {exp.date_finished || "Present"}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditExperience(exp)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteExperienceMutation.mutate(exp.id)}
                            disabled={deleteExperienceMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Projects</h3>
                  <Button
                    onClick={() => {
                      setEditingProject(null);
                      projectForm.reset();
                    }}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                </div>

                {/* Project Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {editingProject ? "Edit Project" : "Add Project"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={projectForm.handleSubmit(handleProjectSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="proj_title">Project Title</Label>
                        <Input
                          id="proj_title"
                          {...projectForm.register("title")}
                          placeholder="E-commerce Platform"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="proj_description">Description</Label>
                        <Textarea
                          id="proj_description"
                          rows={3}
                          {...projectForm.register("description")}
                          placeholder="Describe your project..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                        <Input
                          id="technologies"
                          defaultValue={projectForm.watch("technologies")?.join(", ") || ""}
                          onChange={(e) => handleTechnologiesChange(e.target.value)}
                          placeholder="React, Node.js, MongoDB"
                        />
                        {projectForm.watch("technologies") && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {projectForm.watch("technologies")?.map((tech, index) => (
                              <Badge key={index} variant="secondary">{tech}</Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="proj_url">Project URL</Label>
                          <Input
                            id="proj_url"
                            {...projectForm.register("url")}
                            placeholder="https://myproject.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proj_github_url">GitHub URL</Label>
                          <Input
                            id="proj_github_url"
                            {...projectForm.register("github_url")}
                            placeholder="https://github.com/user/project"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="proj_date_started">Start Date</Label>
                          <Input
                            id="proj_date_started"
                            type="date"
                            {...projectForm.register("date_started")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proj_date_finished">End Date</Label>
                          <Input
                            id="proj_date_finished"
                            type="date"
                            {...projectForm.register("date_finished")}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={addProjectMutation.isPending || updateProjectMutation.isPending}
                        >
                          {editingProject ? "Update" : "Add"} Project
                        </Button>
                        {editingProject && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingProject(null);
                              projectForm.reset();
                            }}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Projects List */}
                {userProjects?.map((project: any) => (
                  <Card key={project.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{project.title}</h4>
                          <p className="text-sm text-gray-700 mt-1">{project.description}</p>
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {project.technologies.map((tech: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-4 mt-2 text-sm">
                            {project.url && (
                              <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                View Project
                              </a>
                            )}
                            {project.github_url && (
                              <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                View Code
                              </a>
                            )}
                          </div>
                          {(project.date_started || project.date_finished) && (
                            <p className="text-sm text-gray-500 mt-1">
                              {project.date_started} - {project.date_finished || "Ongoing"}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProjectMutation.mutate(project.id)}
                            disabled={deleteProjectMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Resumes Tab */}
            {activeTab === "resumes" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Upload Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(userResumes?.results || []).length < 3 ? (
                      <FileUpload
                        onFileSelect={handleResumeUpload}
                        accept=".pdf,.doc,.docx"
                        maxSize={10 * 1024 * 1024} // 10MB
                        selectedFile={uploadingResume}
                      />
                    ) : (
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">Resume limit reached</p>
                        <p className="text-sm text-gray-500">You can upload up to 3 resumes. Delete one to upload another.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Resume List */}
                {(userResumes?.results || []).length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">My Resumes</h3>
                    {(userResumes?.results || []).map((resume: any) => (
                      <Card key={resume.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-8 h-8 text-primary" />
                              <div>
                                <h4 className="font-medium">{resume.filename || resume.file}</h4>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span>Uploaded: {new Date(resume.created_at).toLocaleDateString()}</span>
                                  {resume.file_size && (
                                    <span>
                                      Size: {Math.round(resume.file_size / 1024)} KB
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {resume.file && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(resume.file, '_blank')}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResumeDelete(resume.id)}
                                disabled={deleteResumeMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {resumesLoading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading resumes...</p>
                  </div>
                )}

                {!resumesLoading && (userResumes?.results || []).length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No resumes uploaded</p>
                    <p className="text-sm text-gray-500">Upload your first resume to get started.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
