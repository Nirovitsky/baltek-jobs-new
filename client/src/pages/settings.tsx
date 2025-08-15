import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { ApiClient } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import BreadcrumbNavigation from "@/components/breadcrumb-navigation";
import {
  Trash2,
  Info,
  Mail,
  FileText,
  Shield,
  ExternalLink,
} from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleDeleteAccount = async () => {
    try {
      if (!user?.id) throw new Error("User ID not found");
      await ApiClient.deleteAccount(user.id);
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      logout();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-background">
      <BreadcrumbNavigation />
      <div className="layout-container-body py-4">
        <div className="space-y-6">
          {/* Single Card containing all settings */}
          <Card>
            <CardContent className="p-6 space-y-8">
              {/* Information & Support Links */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">
                    Information & Support
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Learn more about Baltek Jobs and get help
                </p>
                <div className="space-y-2">
                  <Link href="/about-us">
                    <Button variant="ghost" className="w-full justify-start">
                      <Info className="h-4 w-4 mr-2" />
                      About Us
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>

                  <Link href="/contact-us">
                    <Button variant="ghost" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact Us
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>

                  <Link href="/terms">
                    <Button variant="ghost" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Terms and Agreement
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>

                  <Link href="/privacy-policy">
                    <Button variant="ghost" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Privacy Policy
                      <ExternalLink className="h-4 w-4 ml-auto" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Delete Account - moved to bottom */}
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-3">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  <h2 className="text-lg font-semibold text-destructive">
                    Delete Account
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your account and remove all your data from our
                        servers including your profile, applications, and chat
                        history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
