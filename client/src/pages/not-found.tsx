import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, SearchX, ArrowLeft, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-2xl mx-auto text-center">
        {/* Large 404 Number with Icon */}
        <div className="mb-8 relative">
          <h1 className="text-9xl font-bold text-primary/20 leading-none select-none">
            404
          </h1>
          <div className="flex justify-center mt-4">
            <SearchX className="h-12 w-12 text-muted-foreground/60" />
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="theme-transition">
          <CardContent className="pt-8 pb-8">
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              {t('errors.page_not_found')}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-2">
              {t('errors.page_not_found_description')}
            </p>
            
            <p className="text-sm text-muted-foreground mb-8">
              {t('errors.page_not_found_details')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                asChild 
                size="lg" 
                className="w-full sm:w-auto min-w-[160px]"
              >
                <Link to="/jobs">
                  <Home className="h-4 w-4 mr-2" />
                  {t('errors.go_home')}
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto min-w-[160px]"
              >
                <Link to="/jobs">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {t('errors.browse_jobs')}
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                size="lg" 
                onClick={() => {
                  if (window.history.length > 1) {
                    window.history.back();
                  } else {
                    navigate('/jobs');
                  }
                }}
                className="w-full sm:w-auto min-w-[160px]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('errors.go_back')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Links */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {t('errors.looking_for_something')}
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link 
              to="/jobs" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {t('jobs.title')}
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/profile" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {t('navbar.profile')}
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/applications" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {t('navbar.applications')}
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/contact-us" 
              className="text-primary hover:text-primary/80 transition-colors"
            >
              {t('errors.contact_support')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
