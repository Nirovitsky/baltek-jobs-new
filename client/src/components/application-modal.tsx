import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobApplicationSchema, type JobApplication, type Job } from "@shared/schema";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import FileUpload from "@/components/file-upload";
import { Send, X, FileText } from "lucide-react";
import baltekIcon from "@/assets/baltek-icon.svg";

interface ApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  isQuickApply?: boolean;
}

export default function ApplicationModal({ job, isOpen, onClose, isQuickApply = false }: ApplicationModalProps) {
  const { t } = useTranslation();
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resumes, isLoading: resumesLoading, error: resumesError } = useQuery({
    queryKey: ["user", "resumes", "current"],
    queryFn: () => ApiClient.getResumes(),
    enabled: isOpen,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<JobApplication>({
    resolver: zodResolver(jobApplicationSchema.extend({
      job: jobApplicationSchema.shape.job.default(job.id),
    })),
    defaultValues: {
      job: job.id,
      cover_letter: "",
      resume: "",
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: JobApplication) => {
      // For regular apply, don't require resume anymore (made optional)
      // For quick apply, skip resume requirement entirely
      const applicationData = {
        job: data.job,
        cover_letter: data.cover_letter || "",
      };
      
      
      // Pass the file or selected resume ID to the application API (both optional now)
      const result = await ApiClient.applyToJob(applicationData, uploadedFile || undefined, selectedResumeId || undefined);
      return result;
    },
    onMutate: async (data: JobApplication) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["job", job.id] });
      await queryClient.cancelQueries({ queryKey: ["jobs"] });
      await queryClient.cancelQueries({ queryKey: ["user", "applications"] });

      // Snapshot the previous value
      const previousJob = queryClient.getQueryData(["job", job.id]);
      const previousJobs = queryClient.getQueryData(["jobs"]);
      const previousApplications = queryClient.getQueryData(["user", "applications"]);

      // Optimistically update the job to show as applied
      queryClient.setQueryData(["job", job.id], (old: any) => {
        if (!old) return old;
        return { ...old, my_application_id: "temp-optimistic" };
      });

      // Optimistically update the jobs list
      queryClient.setQueryData(["jobs"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages?.map((page: any) => ({
            ...page,
            data: page.data?.map((jobItem: any) =>
              jobItem.id === job.id ? { ...jobItem, my_application_id: "temp-optimistic" } : jobItem,
            ),
          })),
        };
      });

      // Show immediate feedback toast
      toast({
        title: t('application_modal.submitting'),
        description: t('application_modal.processing'),
      });

      // Return a context object with the snapshotted values
      return { previousJob, previousJobs, previousApplications };
    },
    onSuccess: () => {
      // Invalidate job details query to refresh the my_application_id field
      queryClient.invalidateQueries({ queryKey: ["job", job.id] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["user", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["user", "resumes", "current"] });
      toast({
        title: t('application_modal.application_submitted'),
        description: t('application_modal.application_success'),
      });
      onClose();
      reset();
      setSelectedResumeId("");
      setUploadedFile(null);
    },
    onError: (error, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJob) {
        queryClient.setQueryData(["job", job.id], context.previousJob);
      }
      if (context?.previousJobs) {
        queryClient.setQueryData(["jobs"], context.previousJobs);
      }
      if (context?.previousApplications) {
        queryClient.setQueryData(["user", "applications"], context.previousApplications);
      }
      
      toast({
        title: t('application_modal.application_error'),
        description: error instanceof Error ? error.message : t('application_modal.application_error'),
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have up-to-date data
      queryClient.invalidateQueries({ queryKey: ["job", job.id] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["user", "applications"] });
    },
  });

  const onSubmit = (data: JobApplication) => {
    applicationMutation.mutate(data);
  };

  const handleClose = () => {
    onClose();
    reset();
    setSelectedResumeId("");
    setUploadedFile(null);
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setSelectedResumeId(""); // Clear selected resume when uploading new file
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isQuickApply ? t('application_modal.quick_apply_for') : t('application_modal.apply_for')} {job.title}
          </DialogTitle>
          <DialogDescription>
            {job.organization?.display_name || job.organization?.name} • {job.location?.name}, {job.location?.country}
            {isQuickApply && <span className="block text-sm text-primary mt-1">{t('application_modal.quick_apply_description')}</span>}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cover Letter */}
          {!isQuickApply && (
            <div className="space-y-2">
              <Label htmlFor="cover_letter">{t('application_modal.cover_letter')} <span className="text-sm text-muted-foreground">({t('common.optional')})</span></Label>
              <Textarea
                id="cover_letter"
                rows={6}
                {...register("cover_letter")}
                placeholder={t('application_modal.cover_letter_placeholder')}
                className="resize-none"
              />
              {errors.cover_letter && (
                <p className="text-sm text-destructive">{errors.cover_letter.message}</p>
              )}
            </div>
          )}

          {/* Resume Selection */}
          {!isQuickApply && (
            <div className="space-y-4">
              <Label>{t('application_modal.resume_upload')} <span className="text-sm text-muted-foreground">({t('common.optional')})</span></Label>
              
              {/* Existing Resumes */}
              {!resumesLoading && (
                // Handle different response formats: direct array, results array, or count > 0
                ((Array.isArray(resumes) && resumes.length > 0) || 
                 ((resumes as any)?.results && Array.isArray((resumes as any).results) && (resumes as any).results.length > 0) ||
                 ((resumes as any)?.count > 0))
              ) && (
                <div className="space-y-3">
                  <Label className="text-sm text-muted-foreground">{t('application_modal.select_resume')}:</Label>
                  <div className="grid gap-2">
                    {(() => {
                      let resumeList = [];
                      if (Array.isArray(resumes)) {
                        resumeList = resumes;
                      } else if ((resumes as any)?.results && Array.isArray((resumes as any).results)) {
                        resumeList = (resumes as any).results;
                      }
                      
                      return resumeList.map((resume: any) => (
                        <div
                          key={resume.id}
                          onClick={() => {
                            setSelectedResumeId(selectedResumeId === resume.id.toString() ? "" : resume.id.toString());
                            if (uploadedFile) setUploadedFile(null); // Clear uploaded file when selecting existing resume
                          }}
                          className={`
                            relative p-4 border rounded-xl cursor-pointer transition-all duration-200 min-h-[80px]
                            ${selectedResumeId === resume.id.toString() 
                              ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                              : 'border-input bg-background hover:border-primary/50 hover:bg-muted/30'
                            }
                          `}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`
                              flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                              ${selectedResumeId === resume.id.toString()
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted/50 text-muted-foreground'
                              }
                            `}>
                              <FileText className="w-5 h-5" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm text-foreground truncate">
                                    {resume.title || resume.name || `Resume ${resume.id}`}
                                  </h4>
                                  <div className="flex items-center space-x-2 mt-1">
                                    {resume.is_primary && (
                                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                        {t('common.primary')}
                                      </span>
                                    )}
                                    {resume.updated_at && (
                                      <p className="text-xs text-muted-foreground">
                                        {t('common.updated')} {new Date(resume.updated_at).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className={`
                                  flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 ml-3
                                  ${selectedResumeId === resume.id.toString()
                                    ? 'border-primary bg-primary'
                                    : 'border-input'
                                  }
                                `}>
                                  {selectedResumeId === resume.id.toString() && (
                                    <div className="w-full h-full rounded-full bg-white scale-50" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {selectedResumeId === resume.id.toString() && (
                            <div className="absolute inset-0 rounded-xl border-2 border-primary opacity-15 pointer-events-none" />
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t('application_modal.upload_new_resume')}:</Label>
                <FileUpload
                  onFileSelect={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                  maxSize={10 * 1024 * 1024} // 10MB
                  selectedFile={uploadedFile}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                {t('application_modal.resume_optional_note')}
              </p>
            </div>
          )}

          {isQuickApply && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-primary">
                <img src={baltekIcon} alt="" className="w-5 h-5" />
                <span className="font-medium">{t('application_modal.quick_apply')}</span>
              </div>
              <p className="text-sm text-primary mt-1">
                {t('application_modal.quick_apply_info')}
              </p>
            </div>
          )}



          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={applicationMutation.isPending}
            >
              {applicationMutation.isPending ? (
                t('application_modal.submitting')
              ) : (
                <>
                  {isQuickApply ? <img src={baltekIcon} alt="" className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  {isQuickApply ? t('application_modal.quick_apply') : t('application_modal.submit_application')}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
