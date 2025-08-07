import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { Organization } from "@shared/schema";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Building2, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Clock,
  FolderOpen,
  ExternalLink,
  Calendar,
  Briefcase
} from "lucide-react";

// Company Suggestions Component
function CompanySuggestions({ currentCompanyId }: { currentCompanyId: string | undefined }) {
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ["/api/organizations"],
    queryFn: () => fetch("/api/organizations?limit=5").then(res => res.json()),
  });

  // Handle both array and paginated response formats
  const allCompanies = Array.isArray(companiesData) ? companiesData : (companiesData?.results || []);
  const suggestions = allCompanies.filter((org: Organization) => 
    org.id.toString() !== currentCompanyId
  ).slice(0, 4) || [];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        Other Companies
      </h3>
      
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-20 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map((company: Organization) => (
            <Link key={company.id} href={`/company/${company.id}`}>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-primary/20">
                    <AvatarImage src={company.logo} alt={company.display_name || company.official_name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {(company.display_name || company.official_name || 'CO')
                        .split(' ')
                        .map(word => word.charAt(0))
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-primary transition-colors">
                      {company.display_name || company.official_name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Building2 className="h-3 w-3 text-blue-500" />
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {company.category?.name || 'Company'}
                      </p>
                    </div>
                    {company.location?.name && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-400 truncate">
                          {company.location.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {suggestions.length === 0 && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
              <Building2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                No other companies available
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Check back later for more companies
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Loading Skeleton
function CompanyProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start gap-6">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-8 w-64 mb-2" />
                    <Skeleton className="h-4 w-48 mb-2" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompanyProfile() {
  const [match, params] = useRoute("/company/:id");
  const companyId = params?.id;

  const { data: company, isLoading: companyLoading, error: companyError } = useQuery({
    queryKey: ["/api/organizations", companyId],
    enabled: !!companyId,
  });

  if (companyLoading) {
    return <CompanyProfileSkeleton />;
  }

  if (companyError || !company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Company Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The company you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/jobs">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const organizationData = company as Organization;

  // Get company initials for avatar fallback
  const getCompanyInitials = (name?: string) => {
    if (!name) return 'CO';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Company Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={organizationData?.logo} alt={organizationData?.display_name || organizationData?.official_name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                    {getCompanyInitials(organizationData?.display_name || organizationData?.official_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    {organizationData?.display_name || organizationData?.official_name}
                  </h1>
                  
                  {organizationData?.official_name && organizationData?.display_name && 
                   organizationData?.official_name !== organizationData?.display_name && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                      {organizationData.official_name}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {(organizationData?.industry || organizationData?.category?.name) && (
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>{organizationData.industry || organizationData.category?.name}</span>
                      </div>
                    )}
                    
                    {(organizationData?.address || organizationData?.location?.name) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {organizationData.address || organizationData.location?.name}
                          {organizationData.postal_code && `, ${organizationData.postal_code}`}
                        </span>
                      </div>
                    )}
                    
                    {organizationData?.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={organizationData.website.startsWith('http') ? organizationData.website : `https://${organizationData.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          {organizationData.website}
                        </a>
                      </div>
                    )}
                    
                    {organizationData?.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <a href={`mailto:${organizationData.email}`} className="text-primary hover:text-primary/80">
                          {organizationData.email}
                        </a>
                      </div>
                    )}
                    
                    {organizationData?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <a href={`tel:${organizationData.phone}`} className="text-primary hover:text-primary/80">
                          {organizationData.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* About Us Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                About Us
              </h2>
              
              {(organizationData?.description || organizationData?.about_us) ? (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {organizationData?.description || organizationData?.about_us}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
                    <Clock className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Coming Soon</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Company information will be available soon.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Projects Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Projects
              </h2>
              
              {organizationData?.projects && organizationData.projects.length > 0 ? (
                <div className="grid gap-4">
                  {organizationData.projects.map((project: any) => (
                    <div key={project.id} className="border rounded-lg p-4 dark:border-gray-700">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{project.title}</h4>
                        {project.link && (
                          <a
                            href={project.link.startsWith('http') ? project.link : `https://${project.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      
                      {project.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {project.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {project.date_started}
                          {project.date_finished && ` - ${project.date_finished}`}
                          {!project.date_finished && ' - Present'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6">
                    <Clock className="h-8 w-8 mx-auto text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Coming Soon</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Project portfolio will be available soon.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Open Positions Button */}
            <div className="text-center">
              <Link href={`/jobs?organization=${companyId}`}>
                <Button className="px-8 py-3 text-lg">
                  <Briefcase className="h-5 w-5 mr-2" />
                  Open Positions
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column - Suggested Companies */}
          <div className="lg:col-span-1">
            <CompanySuggestions currentCompanyId={companyId} />
          </div>
        </div>
      </div>
    </div>
  );
}