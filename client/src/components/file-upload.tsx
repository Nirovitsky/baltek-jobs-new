import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileText, CheckCircle } from "lucide-react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  selectedFile?: File | null;
}

export default function FileUpload({ 
  onFileSelect, 
  accept = ".pdf,.doc,.docx", 
  maxSize = 10 * 1024 * 1024, // 10MB
  selectedFile 
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setIsDragActive(false);
      
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors.some((e: any) => e.code === "file-too-large")) {
          toast({
            title: "File too large",
            description: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`,
            variant: "destructive",
          });
        } else if (rejection.errors.some((e: any) => e.code === "file-invalid-type")) {
          toast({
            title: "Invalid file type",
            description: "Please upload a PDF, DOC, or DOCX file",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Upload failed",
            description: "Please try again with a valid file",
            variant: "destructive",
          });
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
        toast({
          title: "File selected",
          description: `${acceptedFiles[0].name} is ready to upload`,
        });
      }
    },
    [onFileSelect, maxSize, toast]
  );

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize,
    multiple: false,
    noClick: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
  });

  const removeFile = () => {
    onFileSelect(null as any);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (selectedFile) {
    return (
      <div className="border-2 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-900 dark:text-green-100">{selectedFile.name}</p>
              <p className="text-sm text-green-700 dark:text-green-300">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 dark:text-green-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-input hover:border-primary"
      }`}
    >
      <input {...getInputProps()} />
      
      <div className="space-y-3">
        <div className="flex justify-center">
          <Upload className={`w-8 h-8 ${isDragActive ? "text-primary" : "text-muted-foreground/60"}`} />
        </div>
        
        <div>
          <p className="text-muted-foreground">
            Drag and drop your resume here, or{" "}
            <button
              type="button"
              onClick={open}
              className="text-primary font-semibold hover:underline"
            >
              browse files
            </button>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            PDF, DOC, DOCX up to {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      </div>
    </div>
  );
}
