import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { jobApplicationSchema, type JobApplication, type Job } from "@shared/schema";
import { ApiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
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
import { Send, X } from "lucide-react";
import baltekIcon from "@/assets/baltek-icon.svg";

interface ApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  isQuickApply?: boolean;
}

export default function ApplicationModal({ job, isOpen, onClose, isQuickApply = false }: ApplicationModalProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resumes, isLoading: resumesLoading } = useQuery({
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
      
      console.log("Submitting application:", applicationData);
      console.log("Resume file:", uploadedFile);
      console.log("Selected resume ID:", selectedResumeId);
      
      // Pass the file or selected resume ID to the application API (both optional now)
      const result = await ApiClient.applyToJob(applicationData, uploadedFile || undefined, selectedResumeId || undefined);
      console.log("Application submission result:", result);
      return result;
    },
    onSuccess: () => {
      // Invalidate job details query to refresh the my_application_id field
      queryClient.invalidateQueries({ queryKey: ["job", job.id] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["user", "applications"] });
      queryClient.invalidateQueries({ queryKey: ["user", "resumes", "current"] });
      toast({
        title: "Application submitted",
        description: "Your application has been sent successfully!",
      });
      onClose();
      reset();
      setSelectedResumeId("");
      setUploadedFile(null);
    },
    onError: (error) => {
      console.error("Application submission error:", error);
      toast({
        title: "Application failed",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: JobApplication) => {
    console.log("Form submitted with data:", data);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isQuickApply ? "Quick Apply for" : "Apply for"} {job.title}
          </DialogTitle>
          <DialogDescription>
            {job.organization?.display_name || job.organization?.name} • {job.location?.name}, {job.location?.country}
            {isQuickApply && <span className="block text-sm text-blue-600 mt-1">Quick application - no cover letter or resume required</span>}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cover Letter */}
          {!isQuickApply && (
            <div className="space-y-2">
              <Label htmlFor="cover_letter">Cover Letter <span className="text-sm text-gray-500">(Optional)</span></Label>
              <Textarea
                id="cover_letter"
                rows={6}
                {...register("cover_letter")}
                placeholder="Write a compelling cover letter explaining why you're the perfect fit for this role. Highlight your relevant experience, skills, and enthusiasm for the position..."
                className="resize-none"
              />
              {errors.cover_letter && (
                <p className="text-sm text-red-600">{errors.cover_letter.message}</p>
              )}
            </div>
          )}

          {/* Resume Selection */}
          {!isQuickApply && (
            <div className="space-y-4">
              <Label>Resume/CV <span className="text-sm text-gray-500">(Optional)</span></Label>
              
              {/* Existing Resumes */}
              {!resumesLoading && (resumes as any)?.results?.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Select from your resumes:</Label>
                  <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a resume (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {(resumes as any).results.map((resume: any) => (
                        <SelectItem key={resume.id} value={resume.id.toString()}>
                          {resume.title}
                          {resume.is_primary && " (Primary)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* File Upload */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Or upload a new resume:</Label>
                <FileUpload
                  onFileSelect={handleFileUpload}
                  accept=".pdf,.doc,.docx"
                  maxSize={10 * 1024 * 1024} // 10MB
                  selectedFile={uploadedFile}
                />
              </div>

              <p className="text-sm text-gray-500">
                You can apply without a resume, but including one improves your chances.
              </p>
            </div>
          )}

          {isQuickApply && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <img src={baltekIcon} alt="" className="w-5 h-5" />
                <span className="font-medium">Quick Apply</span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Your application will be submitted immediately without additional documents. 
                You can always add a cover letter and resume later.
              </p>
            </div>
          )}



          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={applicationMutation.isPending}
            >
              {applicationMutation.isPending ? (
                "Submitting..."
              ) : (
                <>
                  {isQuickApply ? <img src={baltekIcon} alt="" className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  {isQuickApply ? "Quick Apply" : "Submit Application"}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
