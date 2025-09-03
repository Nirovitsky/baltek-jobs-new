import BreadcrumbNavigation from "@/components/breadcrumb-navigation";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Terms() {
  const { t } = useTranslation();
  return (
    <div className="h-full overflow-y-auto bg-background">
      <BreadcrumbNavigation />
      <div className="layout-container-body py-4">

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{t('terms.title')}</CardTitle>
              <p className="text-sm text-muted-foreground">{t('terms.last_updated', { date: 'August 12, 2025' })}</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">1. {t('terms.acceptance')}</h3>
                  <p className="text-foreground leading-relaxed">
                    {t('terms.acceptance_text')}
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">2. {t('terms_content.use_license_title')}</h3>
                  <p className="text-foreground leading-relaxed mb-3">
                    {t('terms_content.use_license_intro')}
                  </p>
                  <ul className="list-disc pl-6 text-foreground space-y-1">
                    <li>{t('terms_content.use_license_list.modify_copy')}</li>
                    <li>{t('terms_content.use_license_list.commercial_use')}</li>
                    <li>{t('terms_content.use_license_list.reverse_engineer')}</li>
                    <li>{t('terms_content.use_license_list.remove_copyright')}</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">3. {t('terms_content.user_accounts_title')}</h3>
                  <p className="text-foreground leading-relaxed">
                    {t('terms_content.user_accounts_text')}
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">4. Job Postings and Applications</h3>
                  <p className="text-foreground leading-relaxed mb-3">
                    Baltek Jobs serves as a platform connecting job seekers with employers. We do not guarantee:
                  </p>
                  <ul className="list-disc pl-6 text-foreground space-y-1">
                    <li>The accuracy of job postings</li>
                    <li>The legitimacy of employers</li>
                    <li>Successful job placement</li>
                    <li>The quality of employment opportunities</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">5. User Content</h3>
                  <p className="text-foreground leading-relaxed">
                    By uploading content (including but not limited to resumes, cover letters, and profile information), 
                    you grant Baltek Jobs a non-exclusive, royalty-free license to use, reproduce, and distribute your content 
                    for the purpose of providing our services.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">6. Privacy Policy</h3>
                  <p className="text-foreground leading-relaxed">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                    to understand our practices.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">7. Prohibited Uses</h3>
                  <p className="text-foreground leading-relaxed mb-3">You may not use our service:</p>
                  <ul className="list-disc pl-6 text-foreground space-y-1">
                    <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                    <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                    <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                    <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                    <li>To submit false or misleading information</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">8. Disclaimer</h3>
                  <p className="text-foreground leading-relaxed">
                    The materials on Baltek Jobs are provided on an 'as is' basis. Baltek Jobs makes no warranties, 
                    expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, 
                    implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
                    of intellectual property or other violation of rights.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">9. Limitations</h3>
                  <p className="text-foreground leading-relaxed">
                    In no event shall Baltek Jobs or its suppliers be liable for any damages (including, without limitation, 
                    damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                    to use the materials on Baltek Jobs, even if Baltek Jobs or an authorized representative has been notified 
                    orally or in writing of the possibility of such damage.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">10. Revisions and Errata</h3>
                  <p className="text-foreground leading-relaxed">
                    The materials appearing on Baltek Jobs could include technical, typographical, or photographic errors. 
                    Baltek Jobs does not warrant that any of the materials on its website are accurate, complete, or current. 
                    Baltek Jobs may make changes to the materials contained on its website at any time without notice.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">11. Termination</h3>
                  <p className="text-foreground leading-relaxed">
                    We may terminate or suspend your account and bar access to the Service immediately, without prior notice 
                    or liability, under our sole discretion, for any reason whatsoever and without limitation, including but 
                    not limited to a breach of the Terms.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">12. Governing Law</h3>
                  <p className="text-foreground leading-relaxed">
                    Any claim relating to Baltek Jobs shall be governed by the laws of Turkmenistan without regard to its 
                    conflict of law provisions.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3 text-foreground">13. {t('terms_content.contact_info_title')}</h3>
                  <p className="text-foreground leading-relaxed">
                    {t('terms_content.contact_info_text')}
                  </p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}