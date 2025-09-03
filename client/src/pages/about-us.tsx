import BreadcrumbNavigation from "@/components/breadcrumb-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Award, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AboutUs() {
  const { t } = useTranslation();
  return (
    <div className="h-full overflow-y-auto bg-background">
      <BreadcrumbNavigation />
      <div className="layout-container-body py-4">

        <div className="mt-6 space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t('about.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  {t('about.our_mission')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.mission_text')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  {t('about.our_vision')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {t('about.vision_text')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                {t('about.our_values')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{t('about.people_first')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('about.people_first_desc')}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{t('about.innovation')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('about.innovation_desc')}
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{t('about_stats.excellence')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('about_stats.excellence_desc')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t('about_stats.by_the_numbers')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-sm text-muted-foreground">{t('about_stats.active_job_seekers')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">5K+</div>
                  <div className="text-sm text-muted-foreground">{t('about_stats.partner_companies')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">100K+</div>
                  <div className="text-sm text-muted-foreground">{t('about_stats.job_placements')}</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">95%</div>
                  <div className="text-sm text-muted-foreground">{t('about_stats.satisfaction_rate')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technology */}
          <Card>
            <CardHeader>
              <CardTitle>{t('about_stats.our_technology')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t('about_stats.technology_description')}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{t('technology_badges.ai_powered_matching')}</Badge>
                <Badge variant="secondary">{t('technology_badges.real_time_notifications')}</Badge>
                <Badge variant="secondary">{t('technology_badges.advanced_filtering')}</Badge>
                <Badge variant="secondary">{t('technology_badges.mobile_optimized')}</Badge>
                <Badge variant="secondary">{t('technology_badges.secure_private')}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Contact CTA */}
          <Card className="text-center bg-primary text-primary-foreground">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-2">{t('cta.career_journey_title')}</h3>
              <p className="mb-4 opacity-90">
                {t('cta.career_journey_desc')}
              </p>
              <div className="space-x-4">
                <a href="/" className="inline-block bg-background text-primary px-6 py-2 rounded-lg font-medium hover:bg-muted transition-colors">
                  {t('cta.browse_jobs')}
                </a>
                <a href="/contact-us" className="inline-block border border-white px-6 py-2 rounded-lg font-medium hover:bg-background/10 transition-colors">
                  {t('cta.contact_us')}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}