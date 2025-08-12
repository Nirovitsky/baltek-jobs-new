import BreadcrumbNavigation from "@/components/breadcrumb-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Award, Heart } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="layout-container-body py-6">
        <BreadcrumbNavigation
          items={[
            { label: "Home", href: "/" },
            { label: "About Us" },
          ]}
        />

        <div className="mt-6 space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">About Baltek Jobs</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connecting talented professionals with exceptional career opportunities through innovative job matching technology.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To revolutionize the job search experience by creating meaningful connections between job seekers and employers, 
                  making career advancement accessible, efficient, and rewarding for everyone.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  To become the leading global platform where talent meets opportunity, fostering professional growth and 
                  building thriving careers across all industries and skill levels.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Our Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">People First</h3>
                  <p className="text-sm text-muted-foreground">
                    Every decision we make prioritizes the success and well-being of our users.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Innovation</h3>
                  <p className="text-sm text-muted-foreground">
                    We continuously evolve our technology to provide the best job matching experience.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Excellence</h3>
                  <p className="text-sm text-muted-foreground">
                    We strive for the highest quality in everything we do, from our platform to our support.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Stats */}
          <Card>
            <CardHeader>
              <CardTitle>By the Numbers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-sm text-muted-foreground">Active Job Seekers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">5K+</div>
                  <div className="text-sm text-muted-foreground">Partner Companies</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">100K+</div>
                  <div className="text-sm text-muted-foreground">Job Placements</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology */}
          <Card>
            <CardHeader>
              <CardTitle>Our Technology</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Built with cutting-edge technology, Baltek Jobs leverages advanced algorithms and machine learning 
                to deliver personalized job recommendations and streamline the hiring process.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">AI-Powered Matching</Badge>
                <Badge variant="secondary">Real-time Notifications</Badge>
                <Badge variant="secondary">Advanced Filtering</Badge>
                <Badge variant="secondary">Mobile Optimized</Badge>
                <Badge variant="secondary">Secure & Private</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card className="text-center bg-primary text-primary-foreground">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-2">Ready to Start Your Career Journey?</h3>
              <p className="mb-4 opacity-90">
                Join thousands of professionals who have found their dream jobs through Baltek Jobs.
              </p>
              <div className="space-x-4">
                <a href="/" className="inline-block bg-background text-primary px-6 py-2 rounded-lg font-medium hover:bg-muted transition-colors">
                  Browse Jobs
                </a>
                <a href="/contact-us" className="inline-block border border-white px-6 py-2 rounded-lg font-medium hover:bg-background/10 transition-colors">
                  Contact Us
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}