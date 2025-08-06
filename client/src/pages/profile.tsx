import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api";
import Navbar from "@/components/navbar";
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
      <div className="min-h-screen bg-gray-50">
        <Navbar onSearch={() => {}} searchQuery="" />
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
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={() => {}} searchQuery="" />
      
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

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Applications Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(applications as any)?.results?.length || 0}</div>
                <p className="text-xs text-gray-500">Total job applications</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Resumes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(resumes as any)?.results?.length || 0}</div>
                <p className="text-xs text-gray-500">Uploaded documents</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    ((displayProfile.first_name ? 1 : 0) +
                    (displayProfile.last_name ? 1 : 0) +
                    (displayProfile.email ? 1 : 0) +
                    (displayProfile.phone ? 1 : 0) +
                    (displayProfile.bio ? 1 : 0) +
                    (displayProfile.location ? 1 : 0) +
                    (displayProfile.profession ? 1 : 0) +
                    (displayProfile.skills && displayProfile.skills.length > 0 ? 1 : 0) +
                    (displayProfile.linkedin_url || displayProfile.github_url || displayProfile.portfolio_url ? 1 : 0)) / 9 * 100
                  )}%
                </div>
                <p className="text-xs text-gray-500">Complete your profile</p>
              </CardContent>
            </Card>
          </div>

          {/* Experience Section */}
          {(fullProfile as any)?.experiences && (fullProfile as any).experiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Briefcase className="w-6 h-6 mr-3 text-primary" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(fullProfile as any).experiences.map((exp: any, index: number) => (
                  <div key={index} className="flex gap-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {exp.position}
                          </h3>
                          <p className="text-primary font-medium mt-1">
                            {exp.organization_name}
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-700">
                            {exp.date_started} - {exp.date_finished || 'Present'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(() => {
                              // Parse DD.MM.YYYY format
                              const parseDate = (dateStr: string) => {
                                const [day, month, year] = dateStr.split('.');
                                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                              };
                              
                              const startDate = parseDate(exp.date_started);
                              const endDate = exp.date_finished ? parseDate(exp.date_finished) : new Date();
                              const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                              const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
                              const years = Math.floor(diffMonths / 12);
                              const months = diffMonths % 12;
                              
                              if (years > 0 && months > 0) {
                                return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
                              } else if (years > 0) {
                                return `${years} yr${years > 1 ? 's' : ''}`;
                              } else {
                                return `${months} mo${months > 1 ? 's' : ''}`;
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                      {exp.description && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {exp.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education Section */}
          {(fullProfile as any)?.educations && (fullProfile as any).educations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <GraduationCap className="w-6 h-6 mr-3 text-primary" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(fullProfile as any).educations.map((edu: any, index: number) => (
                  <div key={index} className="flex gap-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {edu.university?.name || 'University'}
                          </h3>
                          <p className="text-primary font-medium mt-1 capitalize">
                            {edu.level}
                          </p>
                          {edu.university?.location?.name && (
                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {edu.university.location.name}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-700">
                            {edu.date_started} - {edu.date_finished || 'Present'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(() => {
                              // Parse DD.MM.YYYY format  
                              const parseDate = (dateStr: string) => {
                                const [day, month, year] = dateStr.split('.');
                                return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                              };
                              
                              const startDate = parseDate(edu.date_started);
                              const endDate = edu.date_finished ? parseDate(edu.date_finished) : new Date();
                              const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                              const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
                              const years = Math.floor(diffMonths / 12);
                              
                              if (years > 0) {
                                return `${years} year${years > 1 ? 's' : ''}`;
                              } else {
                                return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
                              }
                            })()}
                          </p>
                        </div>
                      </div>
                      {edu.description && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                            {edu.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Projects Section */}
          {(fullProfile as any)?.projects && (fullProfile as any).projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Code2 className="w-6 h-6 mr-3 text-primary" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(fullProfile as any).projects.map((project: any, index: number) => (
                  <div key={index} className="flex gap-4 pb-6 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                        <Code2 className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-start gap-2">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                              {project.title}
                            </h3>
                            <div className="flex gap-2 flex-shrink-0">
                              {project.url && (
                                <a
                                  href={project.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="View Project"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              {project.github_url && (
                                <a
                                  href={project.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-700 hover:text-gray-900 transition-colors"
                                  title="View Source Code"
                                >
                                  <Code2 className="w-4 h-4" />
                                </a>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mt-2 leading-relaxed whitespace-pre-line">
                            {project.description}
                          </p>
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {project.technologies.map((tech: string, techIndex: number) => (
                                <Badge key={techIndex} variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-700">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {(project.start_date || project.end_date) && (
                          <div className="flex-shrink-0 text-right">
                            <p className="text-sm font-medium text-gray-700">
                              {project.start_date && new Date(project.start_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                              {project.start_date && project.end_date && ' - '}
                              {project.end_date && new Date(project.end_date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Recent Applications */}
          {(applications as any)?.results && (applications as any).results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Briefcase className="w-6 h-6 mr-3 text-primary" />
                  Recent Applications
                </CardTitle>
                <CardDescription>Your latest job applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(applications as any).results.slice(0, 3).map((app: any, index: number) => (
                    <div key={app.id}>
                      <div className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium">{app.job?.title || 'Job Application'}</p>
                          <p className="text-sm text-gray-500">
                            {app.job?.organization?.display_name || app.job?.organization?.name || 'Unknown Company'}
                          </p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                      {index < 2 && <Separator />}
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
