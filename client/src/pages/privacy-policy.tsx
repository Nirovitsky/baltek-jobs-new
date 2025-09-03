import BreadcrumbNavigation from "@/components/breadcrumb-navigation";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  const { t } = useTranslation();
  return (
    <div className="h-full overflow-y-auto bg-background">
      <BreadcrumbNavigation />
      <div className="layout-container-body py-4">

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('privacy.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('privacy.last_updated', { date: 'August 12, 2025' })}</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">1. {t('privacy.information_collected')}</h3>
                  <p className="text-foreground leading-relaxed mb-3">
                    {t('privacy.info_text')}
                  </p>
                  <ul className="list-disc pl-6 text-foreground space-y-1">
                    <li>{t('privacy_content.personal_info_list.personal_info')}</li>
                    <li>{t('privacy_content.personal_info_list.professional_info')}</li>
                    <li>{t('privacy_content.personal_info_list.account_credentials')}</li>
                    <li>{t('privacy_content.personal_info_list.communications')}</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">2. {t('privacy_content.how_we_use_title')}</h3>
                  <p className="text-foreground leading-relaxed mb-3">{t('privacy_content.how_we_use_intro')}</p>
                  <ul className="list-disc pl-6 text-foreground space-y-1">
                    <li>{t('privacy_content.how_we_use_list.provide_services')}</li>
                    <li>{t('privacy_content.how_we_use_list.process_applications')}</li>
                    <li>{t('privacy_content.how_we_use_list.send_notifications')}</li>
                    <li>{t('privacy_content.how_we_use_list.respond_questions')}</li>
                    <li>{t('privacy_content.how_we_use_list.analyze_usage')}</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">3. {t('privacy_content.info_sharing_title')}</h3>
                  <p className="text-foreground leading-relaxed mb-3">
                    {t('privacy_content.info_sharing_intro')}
                  </p>
                  <ul className="list-disc pl-6 text-foreground space-y-1">
                    <li>{t('privacy_content.info_sharing_list.with_employers')}</li>
                    <li>{t('privacy_content.info_sharing_list.service_providers')}</li>
                    <li>{t('privacy_content.info_sharing_list.legal_requirements')}</li>
                    <li>{t('privacy_content.info_sharing_list.business_transfer')}</li>
                  </ul>
                  <p className="text-foreground leading-relaxed mt-3">
                    {t('privacy_content.no_sell_policy')}
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">4. {t('privacy_content.data_security_title')}</h3>
                  <p className="text-foreground leading-relaxed">
                    {t('privacy_content.data_security_text')}
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">5. Data Retention</h3>
                  <p className="text-foreground leading-relaxed">
                    We retain your personal information for as long as your account is active or as needed to provide services. 
                    We will delete your information when you request account deletion, subject to legal obligations that may 
                    require us to retain certain information.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">6. Cookies and Tracking</h3>
                  <p className="text-foreground leading-relaxed mb-3">
                    We use cookies and similar tracking technologies to:
                  </p>
                  <ul className="list-disc pl-6 text-foreground space-y-1">
                    <li>Remember your preferences and settings</li>
                    <li>Analyze site traffic and usage patterns</li>
                    <li>Personalize content and advertisements</li>
                    <li>Improve our services</li>
                  </ul>
                  <p className="text-foreground leading-relaxed mt-3">
                    You can control cookies through your browser settings, but disabling them may affect site functionality.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">7. Your Rights and Choices</h3>
                  <p className="text-foreground leading-relaxed mb-3">You have the right to:</p>
                  <ul className="list-disc pl-6 text-foreground space-y-1">
                    <li>Access and update your personal information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Request a copy of your data</li>
                    <li>Object to processing of your personal information</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">8. Third-Party Links</h3>
                  <p className="text-foreground leading-relaxed">
                    Our service may contain links to third-party websites. We are not responsible for the privacy practices 
                    or content of these external sites. We encourage you to review the privacy policies of any third-party 
                    sites you visit.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">9. Children's Privacy</h3>
                  <p className="text-foreground leading-relaxed">
                    Our service is not intended for children under 16 years of age. We do not knowingly collect personal 
                    information from children under 16. If you are a parent or guardian and believe your child has provided 
                    us with personal information, please contact us.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">10. International Transfers</h3>
                  <p className="text-foreground leading-relaxed">
                    Your information may be transferred to and processed in countries other than your own. We ensure that 
                    such transfers comply with applicable data protection laws and implement appropriate safeguards.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">11. Changes to This Policy</h3>
                  <p className="text-foreground leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                    new Privacy Policy on this page and updating the "Last updated" date. Changes are effective immediately 
                    upon posting.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">12. {t('privacy_content.contact_title')}</h3>
                  <p className="text-foreground leading-relaxed">
                    {t('privacy_content.contact_intro')}
                  </p>
                  <div className="mt-3 p-4 bg-muted rounded-lg">
                    <p className="text-foreground">
                      <strong className="text-foreground">{t('privacy_content.contact_email')}</strong> privacy@baltek.net<br />
                      <strong className="text-foreground">{t('privacy_content.contact_address')}</strong> Ashgabat, Turkmenistan
                    </p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}