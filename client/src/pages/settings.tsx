import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  User,
  Bell,
  Shield,
  Mail,
  Smartphone,
  Globe,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // Fetch user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => user?.id ? ApiClient.getProfile(user.id) : null,
    enabled: !!user?.id,
  });

  // Settings form states
  const [profileSettings, setProfileSettings] = useState({
    phone: (profile as any)?.phone || "",
    bio: (profile as any)?.bio || "",
    location: (profile as any)?.location || "",
    website: (profile as any)?.website || "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailJobs: true,
    emailApplications: true,
    emailMessages: true,
    pushNotifications: true,
    weeklyDigest: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    allowMessages: true,
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!user?.id) throw new Error("User ID not found");
      return ApiClient.updateProfile(user.id, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: {
      currentPassword: string;
      newPassword: string;
    }) => {
      return ApiClient.changePassword(data.currentPassword, data.newPassword);
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description:
          "Failed to change password. Please check your current password.",
        variant: "destructive",
      });
    },
  });

  // Account deletion mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User ID not found");
      return ApiClient.deleteAccount(user.id);
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      logout();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileSettings);
  };

  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const exportData = async () => {
    try {
      const response = await ApiClient.exportUserData();
      const blob = new Blob([JSON.stringify(response, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-data.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (profileLoading) {
    return (
      <div>
        <BreadcrumbNavigation />
        <div className="layout-container-narrow py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <BreadcrumbNavigation />
      <div className="layout-container-narrow py-8" data-testid="settings-page">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" data-testid="tab-notifications">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" data-testid="tab-privacy">
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="account" data-testid="tab-account">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileSettings.phone}
                      onChange={(e) =>
                        setProfileSettings({
                          ...profileSettings,
                          phone: e.target.value,
                        })
                      }
                      placeholder="+1 (555) 123-4567"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileSettings.location}
                      onChange={(e) =>
                        setProfileSettings({
                          ...profileSettings,
                          location: e.target.value,
                        })
                      }
                      placeholder="City, Country"
                      data-testid="input-location"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={profileSettings.website}
                    onChange={(e) =>
                      setProfileSettings({
                        ...profileSettings,
                        website: e.target.value,
                      })
                    }
                    placeholder="https://yourwebsite.com"
                    data-testid="input-website"
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileSettings.bio}
                    onChange={(e) =>
                      setProfileSettings({
                        ...profileSettings,
                        bio: e.target.value,
                      })
                    }
                    placeholder="Tell us about yourself..."
                    rows={4}
                    data-testid="input-bio"
                  />
                </div>

                <Button
                  onClick={handleProfileSave}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfileMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how and when you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <Label>Email Notifications for New Jobs</Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Get notified when new jobs match your preferences
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailJobs}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailJobs: checked,
                        })
                      }
                      data-testid="switch-email-jobs"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <Label>Application Status Updates</Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Receive updates about your job applications
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailApplications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailApplications: checked,
                        })
                      }
                      data-testid="switch-email-applications"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-gray-500" />
                        <Label>Push Notifications</Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          pushNotifications: checked,
                        })
                      }
                      data-testid="switch-push-notifications"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <Label>Weekly Job Digest</Label>
                      </div>
                      <p className="text-sm text-gray-500">
                        Get a weekly summary of new opportunities
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyDigest}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          weeklyDigest: checked,
                        })
                      }
                      data-testid="switch-weekly-digest"
                    />
                  </div>
                </div>

                <Button data-testid="button-save-notifications">
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Visibility</CardTitle>
                <CardDescription>
                  Control who can see your profile and contact you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <Select
                    value={privacySettings.profileVisibility}
                    onValueChange={(value) =>
                      setPrivacySettings({
                        ...privacySettings,
                        profileVisibility: value,
                      })
                    }
                  >
                    <SelectTrigger data-testid="select-profile-visibility">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        Public - Visible to everyone
                      </SelectItem>
                      <SelectItem value="recruiters">
                        Recruiters Only
                      </SelectItem>
                      <SelectItem value="private">Private - Only me</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Email Address</Label>
                      <p className="text-sm text-gray-500">
                        Display your email on your public profile
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.showEmail}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          showEmail: checked,
                        })
                      }
                      data-testid="switch-show-email"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Show Phone Number</Label>
                      <p className="text-sm text-gray-500">
                        Display your phone number on your public profile
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.showPhone}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          showPhone: checked,
                        })
                      }
                      data-testid="switch-show-phone"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow Messages from Recruiters</Label>
                      <p className="text-sm text-gray-500">
                        Let recruiters contact you directly
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.allowMessages}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          allowMessages: checked,
                        })
                      }
                      data-testid="switch-allow-messages"
                    />
                  </div>
                </div>

                <Button data-testid="button-save-privacy">
                  <Save className="w-4 h-4 mr-2" />
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account">
            <div className="space-y-6">
              {/* Change Password */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your account password for better security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          name="currentPassword"
                          type={isPasswordVisible ? "text" : "password"}
                          required
                          data-testid="input-current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setIsPasswordVisible(!isPasswordVisible)
                          }
                          data-testid="button-toggle-password"
                        >
                          {isPasswordVisible ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        name="newPassword"
                        type="password"
                        required
                        data-testid="input-new-password"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        required
                        data-testid="input-confirm-password"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                      data-testid="button-change-password"
                    >
                      {changePasswordMutation.isPending
                        ? "Changing..."
                        : "Change Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Export or manage your account data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Export Your Data</h4>
                      <p className="text-sm text-gray-500">
                        Download a copy of all your account data
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={exportData}
                      data-testid="button-export-data"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-red-800">
                          Delete Account
                        </h4>
                        <p className="text-sm text-red-600">
                          Permanently delete your account and all associated
                          data
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            data-testid="button-delete-account"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete your account and remove all
                              your data from our servers, including:
                              <br />
                              <br />
                              • Your profile and personal information
                              <br />
                              • All job applications and history
                              <br />
                              • Saved jobs and preferences
                              <br />• Messages and communications
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteAccountMutation.mutate()}
                              className="bg-red-600 hover:bg-red-700"
                              data-testid="button-confirm-delete"
                            >
                              Yes, delete my account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
