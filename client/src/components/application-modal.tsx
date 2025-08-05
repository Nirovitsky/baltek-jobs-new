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

interface ApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationModal({ job, isOpen, onClose }: ApplicationModalProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resumes, isLoading: resumesLoading } = useQuery({
    queryKey: ["resumes"],
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
      expected_salary: undefined,
      availability: "",
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: JobApplication) => {
      let resumeUrl = selectedResumeId;
      
      // Upload new file if provided
      if (uploadedFile) {
        const fileData = await ApiClient.uploadFile(uploadedFile);
        resumeUrl = fileData.url;
      }

      return ApiClient.applyToJob({
        ...data,
        resume: resumeUrl || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
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
      toast({
        title: "Application failed",
        description: error instanceof Error ? error.message : "Failed to submit application",
        variant: "destructive",
      });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Apply for {job.title}</DialogTitle>
              <DialogDescription>
                {job.organization?.display_name || job.organization?.name} • {job.location?.name}, {job.location?.country}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Cover Letter */}
          <div className="space-y-2">
            <Label htmlFor="cover_letter">Cover Letter</Label>
            <Textarea
              id="cover_letter"
              rows={4}
              {...register("cover_letter")}
              placeholder="Tell the employer why you're a great fit for this role..."
              className="resize-none"
            />
            {errors.cover_letter && (
              <p className="text-sm text-red-600">{errors.cover_letter.message}</p>
            )}
          </div>

          {/* Resume Selection */}
          <div className="space-y-4">
            <Label>Resume</Label>
            
            {/* Existing Resumes */}
            {!resumesLoading && (resumes as any)?.results?.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Select from your resumes:</Label>
                <Select value={selectedResumeId} onValueChange={setSelectedResumeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a resume" />
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

            {!selectedResumeId && !uploadedFile && (
              <p className="text-sm text-amber-600">
                Please select a resume or upload a new one to proceed with your application.
              </p>
            )}
          </div>

          {/* Expected Salary */}
          <div className="space-y-2">
            <Label htmlFor="expected_salary">Expected Salary (Optional)</Label>
            <Input
              id="expected_salary"
              type="number"
              {...register("expected_salary", {
                setValueAs: (value) => value === "" ? undefined : parseInt(value),
              })}
              placeholder="e.g., 120000"
            />
            {errors.expected_salary && (
              <p className="text-sm text-red-600">{errors.expected_salary.message}</p>
            )}
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Select value={watch("availability") || ""} onValueChange={(value) => setValue("availability", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Available immediately</SelectItem>
                <SelectItem value="2weeks">2 weeks notice</SelectItem>
                <SelectItem value="1month">1 month notice</SelectItem>
                <SelectItem value="3months">3 months notice</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.availability && (
              <p className="text-sm text-red-600">{errors.availability.message}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={applicationMutation.isPending || (!selectedResumeId && !uploadedFile)}
            >
              {applicationMutation.isPending ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
