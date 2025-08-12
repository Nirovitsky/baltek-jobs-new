import BreadcrumbNavigation from "@/components/breadcrumb-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Terms() {
  return (
    <div className="bg-background">
      <div className="layout-container-body py-6">
        <BreadcrumbNavigation />

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Terms and Agreement</CardTitle>
              <p className="text-sm text-muted-foreground">Last updated: August 12, 2025</p>
            </CardHeader>
            <CardContent className="prose max-w-none">
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
                  <p className="text-foreground leading-relaxed">
                    By accessing and using Baltek Jobs ("the Service"), you accept and agree to be bound by the terms 
                    and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">2. Use License</h3>
                  <p className="text-foreground leading-relaxed mb-3">
                    Permission is granted to temporarily access Baltek Jobs for personal, non-commercial transitory viewing only. 
                    This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc pl-6 text-foreground space-y-1">
                    <li>modify or copy the materials</li>
                    <li>use the materials for any commercial purpose or for any public display</li>
                    <li>attempt to reverse engineer any software contained on the website</li>
                    <li>remove any copyright or other proprietary notations from the materials</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">3. User Accounts</h3>
                  <p className="text-foreground leading-relaxed">
                    When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
                    You are responsible for safeguarding the password and for all activities that occur under your account.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">4. Job Postings and Applications</h3>
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
                  <h3 className="text-lg font-semibold mb-3">5. User Content</h3>
                  <p className="text-foreground leading-relaxed">
                    By uploading content (including but not limited to resumes, cover letters, and profile information), 
                    you grant Baltek Jobs a non-exclusive, royalty-free license to use, reproduce, and distribute your content 
                    for the purpose of providing our services.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">6. Privacy Policy</h3>
                  <p className="text-foreground leading-relaxed">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                    to understand our practices.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">7. Prohibited Uses</h3>
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
                  <h3 className="text-lg font-semibold mb-3">8. Disclaimer</h3>
                  <p className="text-foreground leading-relaxed">
                    The materials on Baltek Jobs are provided on an 'as is' basis. Baltek Jobs makes no warranties, 
                    expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, 
                    implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement 
                    of intellectual property or other violation of rights.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">9. Limitations</h3>
                  <p className="text-foreground leading-relaxed">
                    In no event shall Baltek Jobs or its suppliers be liable for any damages (including, without limitation, 
                    damages for loss of data or profit, or due to business interruption) arising out of the use or inability 
                    to use the materials on Baltek Jobs, even if Baltek Jobs or an authorized representative has been notified 
                    orally or in writing of the possibility of such damage.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">10. Revisions and Errata</h3>
                  <p className="text-foreground leading-relaxed">
                    The materials appearing on Baltek Jobs could include technical, typographical, or photographic errors. 
                    Baltek Jobs does not warrant that any of the materials on its website are accurate, complete, or current. 
                    Baltek Jobs may make changes to the materials contained on its website at any time without notice.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">11. Termination</h3>
                  <p className="text-foreground leading-relaxed">
                    We may terminate or suspend your account and bar access to the Service immediately, without prior notice 
                    or liability, under our sole discretion, for any reason whatsoever and without limitation, including but 
                    not limited to a breach of the Terms.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">12. Governing Law</h3>
                  <p className="text-foreground leading-relaxed">
                    Any claim relating to Baltek Jobs shall be governed by the laws of Turkmenistan without regard to its 
                    conflict of law provisions.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">13. Contact Information</h3>
                  <p className="text-foreground leading-relaxed">
                    If you have any questions about these Terms and Agreement, please contact us at support@baltek.net
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