import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { 
  Building, 
  MapPin, 
  Globe, 
  Users, 
  Calendar, 
  Briefcase, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin as LocationIcon,
  Award,
  Target,
  Eye,
  Heart,
  Star,
  ExternalLink,
  Linkedin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  CheckCircle,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Organization, Job } from "@shared/schema";

function CompanyProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-32 mb-4" />
        </div>
        
        {/* Company info skeleton */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start gap-4">
              <Skeleton className="h-20 w-20 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Jobs skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-2">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
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

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return <Linkedin className="h-4 w-4" />;
      case 'facebook': return <Facebook className="h-4 w-4" />;
      case 'twitter': return <Twitter className="h-4 w-4" />;
      case 'instagram': return <Instagram className="h-4 w-4" />;
      case 'youtube': return <Youtube className="h-4 w-4" />;
      default: return <ExternalLink className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      {/* Hero Section with Banner */}
      {organizationData?.banner_image && (
        <div 
          className="h-64 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${organizationData.banner_image})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">


        {/* Company Profile - Single Card Layout */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 mb-8 -mt-32 relative z-10" style={organizationData?.banner_image ? {} : { marginTop: '0' }}>
          {/* Company Header */}
          <div className="p-8 pb-6">
            <div className="flex items-start gap-6 mb-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage 
                  src={organizationData.logo} 
                  alt={`${organizationData?.display_name} logo`}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                  {getCompanyInitials(organizationData?.display_name || organizationData?.official_name || organizationData?.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                    {organizationData?.display_name || 'Company Name'}
                  </h1>
                  {organizationData?.is_verified && (
                    <CheckCircle className="h-6 w-6 text-blue-500" />
                  )}
                  {organizationData?.is_featured && (
                    <Star className="h-6 w-6 text-yellow-500" />
                  )}
                </div>
                
                {organizationData?.short_description && (
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                    {organizationData.short_description}
                  </p>
                )}
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {(organizationData?.industry || organizationData?.category?.name) && (
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      <span>{organizationData.industry || organizationData.category?.name}</span>
                    </div>
                  )}
                  
                  {(organizationData?.location?.name || organizationData?.city) && (
                    <div className="flex items-center gap-1">
                      <LocationIcon className="h-4 w-4" />
                      <span>{organizationData.location?.name || `${organizationData.city}${organizationData.country ? `, ${organizationData.country}` : ''}`}</span>
                    </div>
                  )}
                  
                  {(organizationData?.size || organizationData?.employee_count) && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>
                        {organizationData.employee_count 
                          ? `${organizationData.employee_count} employees` 
                          : organizationData.size}
                      </span>
                    </div>
                  )}
                  
                  {(organizationData?.founded || organizationData?.founded_year) && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Founded {organizationData.founded || organizationData.founded_year}</span>
                    </div>
                  )}
                  
                  {organizationData?.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{organizationData.rating}/5</span>
                      {organizationData.review_count && (
                        <span className="text-xs">({organizationData.review_count} reviews)</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Contact Information */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {organizationData?.website && (
                    <a
                      href={organizationData.website.startsWith('http') ? organizationData.website : `https://${organizationData.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span>Website</span>
                    </a>
                  )}
                  
                  {organizationData?.email && (
                    <a
                      href={`mailto:${organizationData.email}`}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Contact</span>
                    </a>
                  )}
                  
                  {organizationData?.phone && (
                    <a
                      href={`tel:${organizationData.phone}`}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      <span>{organizationData.phone}</span>
                    </a>
                  )}
                </div>

                {/* Social Media Links */}
                {organizationData?.social_media && (
                  <div className="flex items-center gap-3">
                    {Object.entries(organizationData.social_media).map(([platform, url]) => 
                      url ? (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-600 hover:text-primary transition-colors"
                          title={platform}
                        >
                          {getSocialIcon(platform)}
                        </a>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Company Statistics */}
            <div className="border-t dark:border-gray-700 pt-6 mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                
                {organizationData?.employee_count && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {organizationData.employee_count.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Employees
                    </div>
                  </div>
                )}
                
                {organizationData?.founded_year && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {new Date().getFullYear() - organizationData.founded_year}+
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Years
                    </div>
                  </div>
                )}
                
                {organizationData?.rating && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {organizationData.rating}/5
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Rating
                    </div>
                  </div>
                )}
                
                {organizationData?.active_jobs_count && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {organizationData.active_jobs_count}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Total Jobs
                    </div>
                  </div>
                )}
                
                {organizationData?.revenue && (
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-lg font-bold text-primary mb-1">
                      {organizationData.revenue}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Revenue
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="border-t dark:border-gray-700 pt-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">About {organizationData?.display_name}</h2>
                
                {(organizationData?.description || organizationData?.about_us) ? (
                  <div className="space-y-6">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {organizationData.description || organizationData.about_us}
                    </p>

                    {/* Mission, Vision, Culture */}
                    {(organizationData?.mission || organizationData?.vision || organizationData?.culture) && (
                      <div className="space-y-4">
                        {organizationData?.mission && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              Mission
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300">{organizationData.mission}</p>
                          </div>
                        )}
                        
                        {organizationData?.vision && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                              <Eye className="h-4 w-4" />
                              Vision
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300">{organizationData.vision}</p>
                          </div>
                        )}
                        
                        {organizationData?.culture && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                              <Heart className="h-4 w-4" />
                              Culture
                            </h4>
                            <p className="text-gray-700 dark:text-gray-300">{organizationData.culture}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Company Values */}
                    {organizationData?.values && organizationData.values.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Our Values
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {organizationData.values.map((value, index) => (
                            <Badge key={index} variant="secondary" className="justify-center py-2">
                              {value}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    {organizationData?.benefits && organizationData.benefits.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Benefits & Perks
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {organizationData.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Company Information
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {organizationData?.display_name} is a professional organization in the {organizationData?.category?.name || 'business'} sector.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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
    </div>
  );
}