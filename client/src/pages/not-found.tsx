import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft, Briefcase } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Large 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary/20 leading-none select-none">
            404
          </h1>
          <div className="relative -mt-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-16 w-16 text-muted-foreground/50" />
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="theme-transition">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              Page Not Found
            </h2>
            
            <p className="text-lg text-muted-foreground mb-2">
              Oops! The page you're looking for doesn't exist.
            </p>
            
            <p className="text-sm text-muted-foreground mb-8">
              It might have been moved, deleted, or you entered the wrong URL.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="w-full sm:w-auto min-w-[160px]"
              >
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto min-w-[160px]"
              >
                <Link href="/jobs">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Browse Jobs
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto min-w-[160px]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Looking for something specific?
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              href="/jobs" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Job Listings
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/profile" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              My Profile
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/applications" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Applications
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              href="/contact-us" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
