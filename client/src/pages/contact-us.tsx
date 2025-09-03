import { useState } from "react";
import { useTranslation } from "react-i18next";
import BreadcrumbNavigation from "@/components/breadcrumb-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Send, MessageCircle, HelpCircle, Briefcase } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ContactUs() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: t('contact.message_sent'),
        description: t('contact.message_sent_desc'),
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: ""
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <BreadcrumbNavigation />
      <div className="layout-container-body py-4">

        <div className="mt-6 space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t('contact.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('contact.description')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-primary" />
                  {t('contact.send_message')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">{t('contact.your_name')} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                        placeholder={t('contact.your_name')}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t('contact.your_email')} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        placeholder={t('contact.your_email')}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">{t('categories.category')}</Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('categories.select_category')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">{t('categories.general_inquiry')}</SelectItem>
                        <SelectItem value="technical">{t('categories.technical_support')}</SelectItem>
                        <SelectItem value="account">{t('categories.account_issues')}</SelectItem>
                        <SelectItem value="jobs">{t('categories.job_posting')}</SelectItem>
                        <SelectItem value="partnership">{t('categories.partnership')}</SelectItem>
                        <SelectItem value="feedback">{t('categories.feedback')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      required
                      placeholder={t('contact.subject_placeholder')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      required
                      placeholder={t('contact.message_placeholder')}
                      rows={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>{t('contact.sending')}</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t('contact.send_message_btn')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('contact_info.get_in_touch')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{t('contact_info.email')}</div>
                      <div className="text-sm text-muted-foreground">support@baltek.net</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{t('contact_info.phone')}</div>
                      <div className="text-sm text-muted-foreground">+993 12 345 678</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{t('contact_info.address')}</div>
                      <div className="text-sm text-muted-foreground">Ashgabat, Turkmenistan</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('contact_info.how_can_help')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium text-sm">{t('contact_info.general_support')}</div>
                      <div className="text-xs text-muted-foreground">{t('contact_info.general_support_desc')}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium text-sm">{t('contact_info.for_employers')}</div>
                      <div className="text-xs text-muted-foreground">{t('contact_info.for_employers_desc')}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium text-sm">{t('contact_info.feedback_option')}</div>
                      <div className="text-xs text-muted-foreground">{t('contact_info.feedback_desc')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Time */}
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold mb-2">{t('contact_info.quick_response')}</h3>
                  <p className="text-sm opacity-90">
                    {t('contact_info.response_time')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}