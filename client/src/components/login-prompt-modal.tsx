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
            {t('auth.want_to_see_more_jobs')}
          </DialogTitle>
          <DialogDescription className="text-left space-y-3 pt-2">
            <p>
              {t('auth.guest_limit_description')}
            </p>
            
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">{t('auth.benefits_title')}:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{t('auth.benefit_unlimited_browse')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span>{t('auth.benefit_save_apply')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{t('auth.benefit_track_applications')}</span>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 pt-4">
          <Button onClick={handleLogin} className="w-full">
            <LogIn className="h-4 w-4 mr-2" />
            {t('auth.sign_in_to_continue')}
          </Button>
          <Button variant="outline" onClick={handleContinueBrowsing} className="w-full">
            {t('auth.continue_browsing')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}