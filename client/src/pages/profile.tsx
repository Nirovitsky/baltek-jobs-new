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
import { User, MapPin, Mail, Phone, Edit, Loader2, GraduationCap, Briefcase, Code2, ExternalLink } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Fetch complete user profile from API
  const { data: fullProfile, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ["user", "profile", user?.id],
    queryFn: () => ApiClient.getProfile(user!.id),
    enabled: !!user?.id,
  });

  // Log the profile data for debugging
  console.log("Full Profile Data:", fullProfile);

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
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading profile...</span>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={() => {}} searchQuery="" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                    {typedProfile.avatar ? (
                      <img
                        src={typedProfile.avatar}
                        alt={`${typedProfile.first_name} ${typedProfile.last_name}`}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {typedProfile.first_name} {typedProfile.last_name}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {typedProfile.email}
                    </CardDescription>
                    {typedProfile.location && (
                      <div className="flex items-center text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{typedProfile.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  onClick={() => setIsProfileModalOpen(true)}
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>{typedProfile.email}</span>
                </div>
                {typedProfile.phone && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{typedProfile.phone}</span>
                  </div>
                )}
              </div>

              {/* Professional Links */}
              {(typedProfile.linkedin_url || typedProfile.github_url || typedProfile.portfolio_url) && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="font-semibold mb-2">Professional Links</h3>
                    <div className="flex flex-wrap gap-3">
                      {typedProfile.linkedin_url && (
                        <a
                          href={typedProfile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          LinkedIn
                        </a>
                      )}
                      {typedProfile.github_url && (
                        <a
                          href={typedProfile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          GitHub
                        </a>
                      )}
                      {typedProfile.portfolio_url && (
                        <a
                          href={typedProfile.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-green-600 hover:text-green-800"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Portfolio
                        </a>
                      )}
                    </div>
                  </div>
                </>
              )}
              
              {typedProfile.bio && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="font-semibold mb-2">About</h3>
                    <p className="text-gray-700">{typedProfile.bio}</p>
                  </div>
                </>
              )}

              {typedProfile.skills && typedProfile.skills.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <h3 className="font-semibold mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {typedProfile.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

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
                    ((typedProfile.first_name ? 1 : 0) +
                    (typedProfile.last_name ? 1 : 0) +
                    (typedProfile.email ? 1 : 0) +
                    (typedProfile.phone ? 1 : 0) +
                    (typedProfile.bio ? 1 : 0) +
                    (typedProfile.location ? 1 : 0) +
                    (typedProfile.skills && typedProfile.skills.length > 0 ? 1 : 0) +
                    (typedProfile.linkedin_url || typedProfile.github_url || typedProfile.portfolio_url ? 1 : 0)) / 8 * 100
                  )}%
                </div>
                <p className="text-xs text-gray-500">Complete your profile</p>
              </CardContent>
            </Card>
          </div>

          {/* Debug Info */}
          {user && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-800">Debug Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-yellow-700">User ID: {user.id}</p>
                <p className="text-xs text-yellow-700">Profile Loading: {profileLoading ? 'Yes' : 'No'}</p>
                <p className="text-xs text-yellow-700">Profile Error: {profileError ? 'Yes' : 'No'}</p>
                <p className="text-xs text-yellow-700">Profile Data Available: {fullProfile ? 'Yes' : 'No'}</p>
                {fullProfile && (
                  <p className="text-xs text-yellow-700">
                    Profile Keys: {Object.keys(fullProfile).join(', ')}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Experience Section */}
          {(fullProfile as any)?.experience && (fullProfile as any).experience.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Briefcase className="w-6 h-6 mr-3 text-primary" />
                  Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(fullProfile as any).experience.map((exp: any, index: number) => (
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
                            {exp.title}
                          </h3>
                          <p className="text-primary font-medium mt-1">
                            {exp.company}
                          </p>
                          {exp.location && (
                            <p className="text-sm text-gray-600 mt-1 flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {exp.location}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-700">
                            {new Date(exp.start_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })} - {exp.is_current || !exp.end_date ? 'Present' : new Date(exp.end_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(() => {
                              const startDate = new Date(exp.start_date);
                              const endDate = exp.is_current || !exp.end_date ? new Date() : new Date(exp.end_date);
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
          {(fullProfile as any)?.education && (fullProfile as any).education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <GraduationCap className="w-6 h-6 mr-3 text-primary" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(fullProfile as any).education.map((edu: any, index: number) => (
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
                          <p className="text-primary font-medium mt-1">
                            {edu.degree} in {edu.field_of_study}
                          </p>
                          {edu.grade && (
                            <p className="text-sm text-gray-600 mt-1">
                              Grade: {edu.grade}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm font-medium text-gray-700">
                            {new Date(edu.start_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })} - {edu.end_date ? new Date(edu.end_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            }) : 'Present'}
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
