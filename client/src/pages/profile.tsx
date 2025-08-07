import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api";

import ProfileModal from "@/components/profile-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, MapPin, Mail, Phone, Edit, Loader2, GraduationCap, Briefcase, Code2, ExternalLink, FileText } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Fetch complete user profile from API
  const { data: fullProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["user", "profile", user?.id],
    queryFn: () => ApiClient.getProfile(user!.id),
    enabled: !!user?.id,
  });



  // Fetch user applications for stats
  const { data: applications } = useQuery({
    queryKey: ["user", "applications"],
    queryFn: () => ApiClient.getMyApplications(),
    enabled: !!user?.id,
  });

  // Fetch user resumes
  const { data: resumes } = useQuery({
    queryKey: ["user", "resumes"],
    queryFn: () => ApiClient.getResumes(),
    enabled: !!user?.id,
  });

  if (!user) {
    return null;
  }

  if (profileLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Profile Header Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-20 h-20 rounded-full" />
                    <div>
                      <Skeleton className="h-8 w-48 mb-2" />
                      <Skeleton className="h-5 w-32 mb-2" />
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-20" />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats Section Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Skeleton className="w-8 h-8 rounded mr-3" />
                    <div>
                      <Skeleton className="h-8 w-12 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Skeleton className="w-8 h-8 rounded mr-3" />
                    <div>
                      <Skeleton className="h-8 w-12 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <Skeleton className="w-8 h-8 rounded mr-3" />
                    <div>
                      <Skeleton className="h-8 w-12 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content Sections Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Education Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-36 mb-1" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Experience Skeleton */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <div key={i}>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Projects Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <Skeleton className="h-5 w-36 mb-2" />
                      <Skeleton className="h-16 w-full mb-3" />
                      <div className="flex gap-2">
                        {[...Array(3)].map((_, j) => (
                          <Skeleton key={j} className="h-5 w-16" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resumes Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-8 h-8" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (profileError) {
    console.error("Profile loading error:", profileError);
  }

  // Use API data if available, fallback to user data from auth
  const profileData = fullProfile || user;
  
  // Type assertion for the profile data to avoid TypeScript errors
  const typedProfile = profileData as any;

  // Add profession and additional profile fields from API
  const displayProfile = {
    ...typedProfile,
    profession: (fullProfile as any)?.profession || '',
    date_of_birth: (fullProfile as any)?.date_of_birth || '',
    gender: (fullProfile as any)?.gender || '',
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Personal Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Profile Header with Avatar */}
                <div className="flex items-center space-x-4 pb-4 border-b">
                  <Avatar className="w-16 h-16">
                    {displayProfile.avatar ? (
                      <AvatarImage src={displayProfile.avatar} alt={`${displayProfile.first_name} ${displayProfile.last_name}`} />
                    ) : (
                      <AvatarFallback className="text-lg bg-gradient-to-br from-blue-400 to-indigo-500 text-white">
                        {(displayProfile.first_name?.[0] || "") + (displayProfile.last_name?.[0] || "")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-foreground">
                      {displayProfile.first_name} {displayProfile.last_name}
                    </h1>
                    {displayProfile.profession && (
                      <p className="text-muted-foreground">{displayProfile.profession}</p>
                    )}
                    {displayProfile.bio && (
                      <p className="text-sm text-gray-600 mt-1">{displayProfile.bio}</p>
                    )}
                  </div>
                </div>

                {/* Personal Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <p className="text-foreground flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {displayProfile.email || "Not provided"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Phone</label>
                    <p className="text-foreground flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {displayProfile.phone || "Not provided"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Location</label>
                    <p className="text-foreground flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {displayProfile.location || "Not provided"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">LinkedIn</label>
                    <p className="text-foreground">
                      {displayProfile.linkedin_url ? (
                        <a 
                          href={displayProfile.linkedin_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Profile
                        </a>
                      ) : "Not provided"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">GitHub</label>
                    <p className="text-foreground">
                      {displayProfile.github_url ? (
                        <a 
                          href={displayProfile.github_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Profile
                        </a>
                      ) : "Not provided"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Portfolio</label>
                    <p className="text-foreground">
                      {displayProfile.portfolio_url ? (
                        <a 
                          href={displayProfile.portfolio_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Portfolio
                        </a>
                      ) : "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Skills Section */}
                {displayProfile.skills && displayProfile.skills.length > 0 && (
                  <div className="pt-4 border-t">
                    <label className="text-sm font-medium text-foreground mb-3 block">Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {displayProfile.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Experience Section */}
          {(fullProfile as any)?.experiences && (fullProfile as any).experiences.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Work Experience</CardTitle>
                      <CardDescription>Professional experience and career history</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(fullProfile as any).experiences.map((experience: any) => (
                    <div key={experience.id} className="border-l-2 border-blue-200 pl-4">
                      <h4 className="font-semibold text-foreground">{experience.position}</h4>
                      <p className="text-primary font-medium">{experience.organization_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {experience.date_started} - {experience.date_finished || "Present"}
                      </p>
                      {experience.description && (
                        <p className="text-foreground mt-2">{experience.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education Section */}
          {(fullProfile as any)?.educations && (fullProfile as any).educations.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Education</CardTitle>
                      <CardDescription>Educational background and qualifications</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(fullProfile as any).educations.map((education: any) => (
                    <div key={education.id} className="border-l-2 border-green-200 pl-4">
                      <h4 className="font-semibold text-foreground capitalize">{education.level}</h4>
                      <p className="text-green-600 font-medium">{education.university_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {education.date_started} - {education.date_finished || "Present"}
                      </p>
                      {education.description && (
                        <p className="text-foreground mt-2">{education.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects Section */}
          {(fullProfile as any)?.projects && (fullProfile as any).projects.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Code2 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>Projects</CardTitle>
                      <CardDescription>Personal and professional projects</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(fullProfile as any).projects.map((project: any) => (
                    <div key={project.id} className="border-l-2 border-purple-200 pl-4">
                      <h4 className="font-semibold text-foreground">{project.title}</h4>
                      {project.url && (
                        <a 
                          href={project.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 text-sm flex items-center mt-1"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Project
                        </a>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.date_started} - {project.date_finished || "Ongoing"}
                      </p>
                      <p className="text-foreground mt-2">{project.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumes Section */}
          {(resumes as any)?.results && (resumes as any).results.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle>Resumes</CardTitle>
                      <CardDescription>Uploaded resume documents</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(resumes as any).results.map((resume: any) => (
                    <div key={resume.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-primary" />
                        <div>
                          <h4 className="font-medium">{resume.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {resume.file && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(resume.file, '_blank')}
                          >
                            View
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}


        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}
