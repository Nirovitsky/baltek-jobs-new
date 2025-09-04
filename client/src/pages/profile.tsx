import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ApiClient } from "@/lib/api";
import { Link } from "react-router-dom";
import type { Organization } from "@shared/schema";

import ProfileModal from "@/components/profile-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  MapPin,
  Mail,
  Phone,
  Edit,
  Loader2,
  GraduationCap,
  Briefcase,
  Code2,
  ExternalLink,
  FileText,
  Building2,
  Building,
} from "lucide-react";
import BreadcrumbNavigation from "@/components/breadcrumb-navigation";

// Mock categories for companies since API doesn't provide category data
const MOCK_CATEGORIES = {
  1: "IT & Technology",
  21: "Healthcare",
  22: "Marketing & Advertising",
  23: "Finance & Banking",
  24: "Education",
  25: "Manufacturing",
  26: "Retail & E-commerce",
  27: "Construction",
  28: "Transportation",
  29: "Food & Beverage",
  30: "Media & Entertainment",
  31: "Real Estate",
  32: "Consulting",
  33: "Energy & Utilities",
  34: "Telecommunications",
  35: "Automotive",
  36: "Pharmaceutical",
  37: "Legal Services",
  38: "Tourism & Hospitality",
  39: "Agriculture",
  40: "Fashion & Apparel",
} as const;

// Company Suggestions Component
function CompanySuggestions() {
  const { t } = useTranslation();
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ["organizations", "suggestions"],
    queryFn: () => ApiClient.getOrganizations({ limit: 15 }),
  });

  // Handle both array and paginated response formats
  const allCompanies = Array.isArray(companiesData)
    ? companiesData
    : ((companiesData &&
      typeof companiesData === "object" &&
      "results" in companiesData
        ? (companiesData as any).results
        : []) as Organization[]);

  // Add mock categories to companies
  const companiesWithCategories = allCompanies.map((company: Organization) => ({
    ...company,
    mockCategory:
      MOCK_CATEGORIES[company.id as keyof typeof MOCK_CATEGORIES] ||
      "Business Services",
  }));

  const suggestions = companiesWithCategories.slice(0, 10) || [];

  return (
    <div className="bg-background dark:bg-background rounded-xl shadow-sm border border-border dark:border-border overflow-hidden w-full">
      <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-900/20 border-b border-border dark:border-border">
        <h3 className="text-lg font-semibold text-foreground dark:text-foreground flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          {t('companies.suggested_companies')}
        </h3>
      </div>

      {isLoading ? (
        <div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-center gap-4 p-4">
                <Skeleton className="h-12 w-12 rounded-full ring-2 ring-border" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
              {i < 9 && <hr className="border-border dark:border-border" />}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {suggestions.map((company: Organization, index: number) => (
            <div key={company.id}>
              <Link to={`/company/${company.id}`}>
                <div className="flex items-center gap-4 p-4 hover:bg-muted dark:hover:bg-muted/50 transition-all duration-200 cursor-pointer group">
                  <Avatar className="h-12 w-12 ring-2 ring-border group-hover:ring-primary/30 transition-all duration-200">
                    <AvatarImage
                      src={company.logo}
                      alt={company.display_name || company.official_name}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary text-sm font-bold border border-primary/20">
                      {(company.display_name || company.official_name || "CO")
                        .split(" ")
                        .map((word) => word.charAt(0))
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground dark:text-foreground truncate group-hover:text-primary transition-colors text-sm">
                      {company.display_name || company.official_name}
                    </h4>

                    <div className="flex items-center gap-1 mt-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground dark:text-muted-foreground/60 font-medium">
                        {(company as any).mockCategory}
                      </span>
                    </div>

                    {company.location?.name && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-xs text-muted-foreground/60 truncate">
                          {company.location.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <ExternalLink className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                </div>
              </Link>
              {index < suggestions.length - 1 && (
                <hr className="border-border dark:border-border" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<
    "personal" | "education" | "experience" | "projects" | "resumes"
  >("personal");

  // Use cached user profile from auth hook (avoids duplicate API call)
  const {
    data: fullProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["auth", "user"],
    enabled: false, // Don't fetch - use cached data from useAuth hook
  });

  // Fetch user applications for stats
  const { data: applications } = useQuery({
    queryKey: ["user", "applications"],
    queryFn: () => ApiClient.getMyApplications(user!.id),
    enabled: !!user?.id,
  });

  // Use cached resumes data from profile modal (if available) or fetch fresh data
  const { data: resumes } = useQuery({
    queryKey: ["user", "resumes", "current"],
    queryFn: () => ApiClient.getResumes(),
    enabled: !!user?.id,
  });

  // Handle different API response structures - resumes might be in 'results' array or direct array
  const resumesList = (resumes as any)?.results || resumes || [];

  if (!user) {
    return null;
  }

  if (profileLoading) {
    return (
      <div className="h-full overflow-y-auto">
        <BreadcrumbNavigation />
        <div className="layout-container-body py-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Sections Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information Skeleton */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4 pb-4 border-b mb-6">
                    <Skeleton className="w-16 h-16 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t">
                    <Skeleton className="h-4 w-12 mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-6 w-20" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Company Suggestions Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-background dark:bg-background rounded-xl shadow-sm border border-border dark:border-border overflow-hidden w-full">
                <div className="px-6 py-4 bg-gradient-to-r from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-900/20 border-b border-border dark:border-border">
                  <Skeleton className="h-6 w-40" />
                </div>
                <div>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-4 p-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24 mb-2" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <Skeleton className="h-4 w-4" />
                      </div>
                      {i < 9 && (
                        <hr className="border-border dark:border-border" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
    profession: (fullProfile as any)?.profession || "",
    date_of_birth: (fullProfile as any)?.date_of_birth || "",
    gender: (fullProfile as any)?.gender || "",
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <BreadcrumbNavigation />
      
      {/* LinkedIn-style Layout */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Main Profile Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Header Card - LinkedIn Style */}
            <Card className="overflow-hidden">
              {/* Cover Photo Area */}
              <div className="h-32 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-90"></div>
              </div>
              
              <CardContent className="relative pt-0 px-6 pb-6">
                {/* Profile Picture positioned over cover */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 -mt-16 relative z-10">
                    <Avatar className="w-32 h-32 ring-4 ring-white dark:ring-gray-800 bg-white">
                      {displayProfile.avatar ? (
                        <AvatarImage
                          src={displayProfile.avatar}
                          alt={`${displayProfile.first_name} ${displayProfile.last_name}`}
                        />
                      ) : (
                        <AvatarFallback className="text-2xl font-semibold bg-white text-gray-800">
                          {(displayProfile.first_name?.[0] || "") +
                            (displayProfile.last_name?.[0] || "")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="pt-16 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h1 className="text-3xl font-bold text-foreground mb-1">
                            {displayProfile.first_name} {displayProfile.last_name}
                          </h1>
                          {displayProfile.profession && (
                            <p className="text-xl text-muted-foreground mb-3 font-medium">
                              {displayProfile.profession}
                            </p>
                          )}
                          {displayProfile.location && (
                            <div className="flex items-center mb-2">
                              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {typeof displayProfile.location === "string"
                                  ? displayProfile.location
                                  : displayProfile.location?.name ||
                                    displayProfile.location}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          onClick={() => {
                            setModalTab("personal");
                            setIsProfileModalOpen(true);
                          }}
                          className="ml-4 mt-16"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information - LinkedIn Style */}
                <div className="pt-4 border-t border-border">
                  <div className="flex flex-wrap gap-6">
                    {displayProfile.email && (
                      <div className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{displayProfile.email}</span>
                      </div>
                    )}
                    {displayProfile.phone && (
                      <div className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{displayProfile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section - LinkedIn Style */}
            {displayProfile.bio && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                      <User className="w-5 h-5" />
                      About
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setModalTab("personal");
                        setIsProfileModalOpen(true);
                      }}
                      className="text-muted-foreground hover:text-primary"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">
                    {displayProfile.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Experience Section - LinkedIn Style */}
            {(fullProfile as any)?.experiences &&
              (fullProfile as any).experiences.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Experience
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setModalTab("experience");
                          setIsProfileModalOpen(true);
                        }}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {(fullProfile as any).experiences.map((experience: any, index: number) => (
                        <div key={experience.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <Avatar className="w-12 h-12 border-2 border-border">
                              <AvatarImage src={experience.organization?.logo} />
                              <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                {(experience.organization?.display_name || experience.organization?.official_name || experience.organization_name || "CO")
                                  .split(" ")
                                  .map((word: string) => word.charAt(0))
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {index < (fullProfile as any).experiences.length - 1 && (
                              <div className="w-0.5 h-16 bg-border mt-2"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-foreground text-lg">
                                {experience.title || experience.position}
                              </h3>
                            </div>
                            
                            <p className="text-muted-foreground font-medium mb-1">
                              {experience.organization?.display_name ||
                                experience.organization?.official_name ||
                                experience.organization_name}
                            </p>
                            
                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                              <span>
                                {experience.date_started} - {experience.date_finished || "Present"}
                              </span>
                            </div>
                            
                            {experience.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {experience.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Education Section - LinkedIn Style */}
            {(fullProfile as any)?.educations &&
              (fullProfile as any).educations.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Education
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setModalTab("education");
                          setIsProfileModalOpen(true);
                        }}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {(fullProfile as any).educations.map((education: any, index: number) => (
                        <div key={education.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <GraduationCap className="w-6 h-6 text-primary" />
                            </div>
                            {index < (fullProfile as any).educations.length - 1 && (
                              <div className="w-0.5 h-16 bg-border mt-2"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-foreground text-lg">
                                {education.university?.name || education.university_name}
                              </h3>
                            </div>
                            
                            <p className="text-muted-foreground font-medium mb-1">
                              {education.level === 'master' ? 'Master\'s degree' : 
                               education.level === 'bachelor' ? 'Bachelor\'s degree' :
                               education.level === 'doctorate' ? 'Doctorate degree' :
                               education.level === 'undergraduate' ? 'Undergraduate degree' :
                               education.level === 'secondary' ? 'High School' :
                               education.level}
                            </p>
                            
                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                              <span>
                                {education.date_started} - {education.date_finished || "Present"}
                              </span>
                            </div>
                            
                            {education.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {education.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Projects Section */}
            {(fullProfile as any)?.projects &&
              (fullProfile as any).projects.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <CardTitle>Projects</CardTitle>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setModalTab("projects");
                          setIsProfileModalOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(fullProfile as any).projects.map((project: any) => (
                        <div
                          key={project.id}
                          className="border-l-2 border-purple-200 pl-4"
                        >
                          <h4 className="font-semibold text-foreground">
                            {project.title}
                          </h4>
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
                            {project.date_started} -{" "}
                            {project.date_finished || "Ongoing"}
                          </p>
                          <p className="text-foreground mt-2">
                            {project.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Resumes Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <CardTitle>Resumes</CardTitle>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setModalTab("resumes");
                      setIsProfileModalOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {resumesList.length > 0 ? (
                  <div className="space-y-3">
                    {resumesList.map((resume: any) => (
                      <div
                        key={resume.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-primary" />
                          <div>
                            <h4 className="font-medium">{resume.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Uploaded:{" "}
                              {new Date(resume.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {resume.file && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(resume.file, "_blank")}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-muted rounded-lg">
                    <FileText className="w-12 h-12 text-muted-foreground/60 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">
                      No resumes uploaded
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Upload your resume to showcase your experience to
                      employers.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        setModalTab("resumes");
                        setIsProfileModalOpen(true);
                      }}
                    >
                      Upload Resume
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Job Applications</span>
                  <span className="font-semibold text-primary">
                    {Array.isArray(applications) ? applications.length : 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Resumes</span>
                  <span className="font-semibold text-green-600">
                    {resumesList.length}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Education</span>
                  <span className="font-semibold text-blue-600">
                    {(fullProfile as any)?.educations?.length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Experience</span>
                  <span className="font-semibold text-purple-600">
                    {(fullProfile as any)?.experiences?.length || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">Projects</span>
                  <span className="font-semibold text-orange-600">
                    {(fullProfile as any)?.projects?.length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Company Suggestions */}
            <CompanySuggestions />
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        initialTab={modalTab}
      />
    </div>
  );
}
