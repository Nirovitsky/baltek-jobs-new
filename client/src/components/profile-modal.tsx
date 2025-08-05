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
  Camera
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
  const [activeTab, setActiveTab] = useState<"personal" | "education" | "experience" | "projects">("personal");
  const [editingEducation, setEditingEducation] = useState<any>(null);
  const [editingExperience, setEditingExperience] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);

  // Fetch additional data
  const { data: universities, isLoading: universitiesLoading } = useQuery({
    queryKey: ["universities"],
    queryFn: () => ApiClient.getUniversities(),
    enabled: isOpen,
  });

  const { data: userEducation, isLoading: educationLoading } = useQuery({
    queryKey: ["user", user?.id, "education"],
    queryFn: () => ApiClient.getProfile(user!.id),
    enabled: isOpen && !!user?.id,
    select: (data: any) => data.education || [],
  });

  const { data: userExperience, isLoading: experienceLoading } = useQuery({
    queryKey: ["user", user?.id, "experience"],
    queryFn: () => ApiClient.getProfile(user!.id),
    enabled: isOpen && !!user?.id,
    select: (data: any) => data.experience || [],
  });

  const { data: userProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ["user", user?.id, "projects"],
    queryFn: () => ApiClient.getProfile(user!.id),
    enabled: isOpen && !!user?.id,
    select: (data: any) => data.projects || [],
  });

  // Personal info form
  const personalForm = useForm<Partial<UserProfile>>({
    resolver: zodResolver(userProfileSchema.partial()),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
      location: user?.location || "",
      skills: user?.skills || [],
      linkedin_url: user?.linkedin_url || "",
      github_url: user?.github_url || "",
      portfolio_url: user?.portfolio_url || "",
    },
  });

  // Education form
  const educationForm = useForm<EducationFormData>({
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

  // Experience form
  const experienceForm = useForm<ExperienceFormData>({
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

  // Project form
  const projectForm = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      technologies: [],
      url: "",
      github_url: "",
      start_date: "",
      end_date: "",
    },
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => ApiClient.updateProfile(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
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
    mutationFn: (data: EducationFormData) => ApiClient.addEducation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", user?.id, "education"] });
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
    mutationFn: ({ id, data }: { id: number; data: EducationFormData }) => 
      ApiClient.updateEducation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", user?.id, "education"] });
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
      queryClient.invalidateQueries({ queryKey: ["user", user?.id, "education"] });
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
    mutationFn: (data: ExperienceFormData) => ApiClient.addExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", user?.id, "experience"] });
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
    mutationFn: ({ id, data }: { id: number; data: ExperienceFormData }) => 
      ApiClient.updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", user?.id, "experience"] });
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
      queryClient.invalidateQueries({ queryKey: ["user", user?.id, "experience"] });
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
    mutationFn: (data: ProjectFormData) => ApiClient.addProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", user?.id, "projects"] });
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
    mutationFn: ({ id, data }: { id: number; data: ProjectFormData }) => 
      ApiClient.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", user?.id, "projects"] });
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
      queryClient.invalidateQueries({ queryKey: ["user", user?.id, "projects"] });
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

  // Form handlers
  const handlePersonalSubmit = (data: Partial<UserProfile>) => {
    updateProfileMutation.mutate(data);
  };

  const handleEducationSubmit = (data: EducationFormData) => {
    if (editingEducation) {
      updateEducationMutation.mutate({ id: editingEducation.id, data });
    } else {
      addEducationMutation.mutate(data);
    }
  };

  const handleExperienceSubmit = (data: ExperienceFormData) => {
    if (editingExperience) {
      updateExperienceMutation.mutate({ id: editingExperience.id, data });
    } else {
      addExperienceMutation.mutate(data);
    }
  };

  const handleProjectSubmit = (data: ProjectFormData) => {
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data });
    } else {
      addProjectMutation.mutate(data);
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
                    <p className="text-gray-600">@{user.username}</p>
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

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="degree">Degree</Label>
                          <Input
                            id="degree"
                            {...educationForm.register("degree")}
                            placeholder="Bachelor of Science"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="field_of_study">Field of Study</Label>
                          <Input
                            id="field_of_study"
                            {...educationForm.register("field_of_study")}
                            placeholder="Computer Science"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start_date">Start Date</Label>
                          <Input
                            id="start_date"
                            type="date"
                            {...educationForm.register("start_date")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_date">End Date</Label>
                          <Input
                            id="end_date"
                            type="date"
                            {...educationForm.register("end_date")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="grade">Grade (Optional)</Label>
                          <Input
                            id="grade"
                            {...educationForm.register("grade")}
                            placeholder="3.8 GPA"
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
                {!educationLoading && userEducation?.map((edu: any) => (
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
                            onClick={() => {
                              setEditingEducation(edu);
                              educationForm.reset(edu);
                            }}
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Job Title</Label>
                          <Input
                            id="title"
                            {...experienceForm.register("title")}
                            placeholder="Senior Frontend Developer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            {...experienceForm.register("company")}
                            placeholder="TechCorp Inc."
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="exp_location">Location</Label>
                        <Input
                          id="exp_location"
                          {...experienceForm.register("location")}
                          placeholder="San Francisco, CA"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="exp_start_date">Start Date</Label>
                          <Input
                            id="exp_start_date"
                            type="date"
                            {...experienceForm.register("start_date")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="exp_end_date">End Date</Label>
                          <Input
                            id="exp_end_date"
                            type="date"
                            {...experienceForm.register("end_date")}
                            disabled={experienceForm.watch("is_current")}
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_current"
                          {...experienceForm.register("is_current")}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="is_current">I currently work here</Label>
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
                {!experienceLoading && userExperience?.map((exp: any) => (
                  <Card key={exp.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{exp.title}</h4>
                          <p className="text-gray-600">{exp.company}</p>
                          {exp.location && <p className="text-sm text-gray-500">{exp.location}</p>}
                          <p className="text-sm text-gray-500">
                            {exp.start_date} - {exp.is_current ? "Present" : exp.end_date}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingExperience(exp);
                              experienceForm.reset(exp);
                            }}
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
                          <Label htmlFor="proj_start_date">Start Date</Label>
                          <Input
                            id="proj_start_date"
                            type="date"
                            {...projectForm.register("start_date")}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="proj_end_date">End Date</Label>
                          <Input
                            id="proj_end_date"
                            type="date"
                            {...projectForm.register("end_date")}
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
                {!projectsLoading && userProjects?.map((project: any) => (
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
                          {(project.start_date || project.end_date) && (
                            <p className="text-sm text-gray-500 mt-1">
                              {project.start_date} - {project.end_date || "Ongoing"}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingProject(project);
                              projectForm.reset(project);
                            }}
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
