import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, Eye, Clock, Filter } from "lucide-react";
import { AuthService } from "@/lib/auth";
import { useTranslation } from "react-i18next";

interface LoginPromptModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginPromptModal({ isOpen, onOpenChange }: LoginPromptModalProps) {
  const { t } = useTranslation();

  const handleLogin = () => {
    AuthService.startOAuthLogin();
  };

  const handleContinueBrowsing = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Want to see more jobs?
          </DialogTitle>
          <DialogDescription className="text-left space-y-3 pt-2">
            <p>
              You've viewed 20 jobs as a guest. To see more opportunities and access additional features, please sign in to your account.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Benefits of signing in:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>Browse unlimited job listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span>Save jobs and apply with one click</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Track your applications</span>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={handleLogin} className="w-full">
            <LogIn className="h-4 w-4 mr-2" />
            Sign in to continue
          </Button>
          <Button variant="outline" onClick={handleContinueBrowsing} className="w-full">
            Continue browsing (limited view)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}