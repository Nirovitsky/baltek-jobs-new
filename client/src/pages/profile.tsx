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
    <div className="h-full overflow-y-auto bg-gradient-to-br from-background via-background to-muted/20">
      <BreadcrumbNavigation />
      
      {/* Enhanced LinkedIn-style Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Main Profile Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Header Card - Enhanced LinkedIn Style */}
            <Card className="overflow-hidden shadow-xl border-0 bg-card/80 backdrop-blur-sm">
              {/* Cover Photo Area */}
              <div className="h-48 bg-gradient-to-r from-primary via-primary/90 to-primary/80 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50"></div>
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
              </div>
              
              <CardContent className="relative pt-0 px-8 pb-8">
                {/* Profile Picture positioned over cover */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start space-x-6 -mt-20 relative z-10">
                    <Avatar className="w-40 h-40 ring-4 ring-background shadow-2xl bg-background">
                      {displayProfile.avatar ? (
                        <AvatarImage
                          src={displayProfile.avatar}
                          alt={`${displayProfile.first_name} ${displayProfile.last_name}`}
                          className="object-cover"
                        />
                      ) : (
                        <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary/10 to-primary/20 text-primary border-2 border-primary/20">
                          {(displayProfile.first_name?.[0] || "") +
                            (displayProfile.last_name?.[0] || "")}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="pt-20 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h1 className="text-4xl font-bold text-foreground mb-2 tracking-tight">
                            {displayProfile.first_name} {displayProfile.last_name}
                          </h1>
                          {displayProfile.profession && (
                            <p className="text-xl text-muted-foreground mb-4 font-medium">
                              {displayProfile.profession}
                            </p>
                          )}
                          {displayProfile.location && (
                            <div className="flex items-center mb-3">
                              <MapPin className="w-5 h-5 mr-2 text-muted-foreground" />
                              <p className="text-base text-muted-foreground font-medium">
                                {typeof displayProfile.location === "string"
                                  ? displayProfile.location
                                  : displayProfile.location?.name ||
                                    displayProfile.location}
                              </p>
                            </div>
                          )}
                          
                          {/* Contact Info */}
                          {displayProfile.email && (
                            <div className="flex items-center gap-6 mt-4">
                              <div className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                                <Mail className="w-4 h-4 mr-2" />
                                <span>{t('profile.contact_info')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit Profile Button - Right Corner */}
                  <div className="flex justify-end -mt-16 relative z-10">
                    <Button
                      onClick={() => {
                        setModalTab("personal");
                        setIsProfileModalOpen(true);
                      }}
                      className="shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <Edit className="w-4 h-4 mr-2" />
{t('profile.edit_profile')}
                    </Button>
                  </div>
                </div>

                {/* Contact Information - Enhanced LinkedIn Style */}
                <div className="pt-6 border-t border-border/50">
                  <div className="flex flex-wrap gap-8">
                    {displayProfile.email && (
                      <div className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                          <Mail className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{displayProfile.email}</span>
                      </div>
                    )}
                    {displayProfile.phone && (
                      <div className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                          <Phone className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{displayProfile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About Section - Enhanced LinkedIn Style */}
            {displayProfile.bio && (
              <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
{t('profile.about')}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setModalTab("personal");
                        setIsProfileModalOpen(true);
                      }}
                      className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap text-base">
                    {displayProfile.bio}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Experience Section - Enhanced LinkedIn Style */}
            {(fullProfile as any)?.experiences &&
              (fullProfile as any).experiences.length > 0 && (
                <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-primary" />
                        </div>
{t('profile.experience')}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setModalTab("experience");
                          setIsProfileModalOpen(true);
                        }}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-8">
                      {(fullProfile as any).experiences.map((experience: any, index: number) => (
                        <div key={experience.id} className="flex gap-6 group">
                          <div className="flex flex-col items-center">
                            <Avatar className="w-16 h-16 border-2 border-border shadow-sm group-hover:shadow-md transition-all duration-200">
                              <AvatarImage src={experience.organization?.logo} />
                              <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-primary/10 to-primary/20 text-primary border-2 border-primary/20">
                                {(experience.organization?.display_name || experience.organization?.official_name || experience.organization_name || "CO")
                                  .split(" ")
                                  .map((word: string) => word.charAt(0))
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {index < (fullProfile as any).experiences.length - 1 && (
                              <div className="w-0.5 h-20 bg-border/50 mt-3"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-foreground text-xl group-hover:text-primary transition-colors">
                                {experience.title || experience.position}
                              </h3>
                            </div>
                            
                            <p className="text-muted-foreground font-semibold mb-2 text-lg">
                              {experience.organization?.display_name ||
                                experience.organization?.official_name ||
                                experience.organization_name}
                            </p>
                            
                            <div className="flex items-center text-sm text-muted-foreground mb-4">
                              <span className="font-medium">
                                {experience.date_started} - {experience.date_finished || t('profile.present')}
                              </span>
                            </div>
                            
                            {experience.description && (
                              <p className="text-muted-foreground leading-relaxed text-base">
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

            {/* Education Section - Enhanced LinkedIn Style */}
            {(fullProfile as any)?.educations &&
              (fullProfile as any).educations.length > 0 && (
                <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
{t('profile.education')}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setModalTab("education");
                          setIsProfileModalOpen(true);
                        }}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-8">
                      {(fullProfile as any).educations.map((education: any, index: number) => (
                        <div key={education.id} className="flex gap-6 group">
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200 border-2 border-primary/20">
                              <GraduationCap className="w-8 h-8 text-primary" />
                            </div>
                            {index < (fullProfile as any).educations.length - 1 && (
                              <div className="w-0.5 h-20 bg-border/50 mt-3"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-foreground text-xl group-hover:text-primary transition-colors">
                                {education.university?.name || education.university_name}
                              </h3>
                            </div>
                            
                            <p className="text-muted-foreground font-semibold mb-2 text-lg">
                              {education.level === 'master' ? t('profile.masters_degree') : 
                               education.level === 'bachelor' ? t('profile.bachelors_degree') :
                               education.level === 'doctorate' ? t('profile.doctorate_degree') :
                               education.level === 'undergraduate' ? t('profile.undergraduate_degree') :
                               education.level === 'secondary' ? t('profile.high_school') :
                               education.level}
                            </p>
                            
                            <div className="flex items-center text-sm text-muted-foreground mb-4">
                              <span className="font-medium">
                                {education.date_started} - {education.date_finished || t('profile.present')}
                              </span>
                            </div>
                            
                            {education.description && (
                              <p className="text-muted-foreground leading-relaxed text-base">
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

            {/* Projects Section - Enhanced LinkedIn Style */}
            {(fullProfile as any)?.projects &&
              (fullProfile as any).projects.length > 0 && (
                <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Code2 className="w-5 h-5 text-primary" />
                        </div>
{t('profile.projects')}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setModalTab("projects");
                          setIsProfileModalOpen(true);
                        }}
                        className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      {(fullProfile as any).projects.map((project: any) => (
                        <div
                          key={project.id}
                          className="border-l-4 border-primary/30 pl-6 py-4 bg-gradient-to-r from-primary/5 to-transparent rounded-r-lg hover:from-primary/10 transition-all duration-200 group"
                        >
                          <h4 className="font-bold text-foreground text-xl group-hover:text-primary transition-colors mb-2">
                            {project.title}
                          </h4>
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 text-sm flex items-center mt-2 font-medium"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
{t('profile.view_project')}
                            </a>
                          )}
                          <p className="text-sm text-muted-foreground mt-2 font-medium">
                            {project.date_started} -{" "}
                            {project.date_finished || t('profile_modal.ongoing')}
                          </p>
                          <p className="text-foreground mt-3 leading-relaxed">
                            {project.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Resumes Section - Enhanced LinkedIn Style */}
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
{t('profile.resumes')}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setModalTab("resumes");
                      setIsProfileModalOpen(true);
                    }}
                    className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {resumesList.length > 0 ? (
                  <div className="space-y-4">
                    {resumesList.map((resume: any) => (
                      <div
                        key={resume.id}
                        className="flex items-center justify-between p-4 border border-border/50 rounded-xl hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-200">
                            <FileText className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{resume.title}</h4>
                            <p className="text-sm text-muted-foreground font-medium">
                              {t('profile.uploaded')}{" "}
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
                              className="shadow-sm hover:shadow-md transition-all duration-200"
                            >
{t('profile.view')}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl border-2 border-dashed border-border/50">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground font-semibold text-lg mb-2">
                      {t('profile.no_resumes_uploaded')}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                      {t('profile.upload_resume_description')}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="shadow-sm hover:shadow-md transition-all duration-200"
                      onClick={() => {
                        setModalTab("resumes");
                        setIsProfileModalOpen(true);
                      }}
                    >
{t('profile.upload_resume')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Company Suggestions - Enhanced */}
            <div className="transform hover:scale-[1.02] transition-all duration-300">
              <CompanySuggestions />
            </div>
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
