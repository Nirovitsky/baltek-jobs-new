import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const phoneSchema = z.string().min(1, 'Phone number is required');
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
export const nameSchema = z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters');
export const urlSchema = z.string().url('Invalid URL').optional().or(z.literal(''));

// Profile validation schemas
export const profileUpdateSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.union([z.string(), z.number()]).optional(),
  profession: z.string().max(100, 'Profession must be less than 100 characters').optional(),
  gender: z.enum(['m', 'f']).optional(),
  date_of_birth: z.string().optional(),
  skills: z.array(z.string()).optional(),
  linkedin_url: urlSchema,
  github_url: urlSchema,
  portfolio_url: urlSchema,
});

// Job application validation
export const jobApplicationSchema = z.object({
  cover_letter: z.string().max(2000, 'Cover letter must be less than 2000 characters').optional(),
  resume: z.string().optional(),
});

// Experience validation
export const experienceSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(100, 'Title must be less than 100 characters'),
  company: z.string().min(1, 'Company name is required').max(100, 'Company name must be less than 100 characters'),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  is_current: z.boolean().optional(),
});

// Education validation
export const educationSchema = z.object({
  university: z.number().min(1, 'University is required'),
  degree: z.string().min(1, 'Degree is required').max(100, 'Degree must be less than 100 characters'),
  field_of_study: z.string().min(1, 'Field of study is required').max(100, 'Field of study must be less than 100 characters'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  grade: z.string().max(20, 'Grade must be less than 20 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
});

// Project validation
export const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Project description is required').max(1000, 'Description must be less than 1000 characters'),
  technologies: z.array(z.string()).min(1, 'At least one technology is required'),
  url: urlSchema,
  github_url: urlSchema,
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// Resume validation
export const resumeSchema = z.object({
  title: z.string().min(1, 'Resume title is required').max(100, 'Title must be less than 100 characters'),
  file: z.string().min(1, 'Resume file is required'),
  is_primary: z.boolean().optional(),
});

// Utility function to validate and return errors
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

// Sanitize input data
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

// Validate file upload
export function validateFile(file: File, options: {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
} = {}): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'] } = options;

  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  return { valid: true };
}

// Type exports
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type JobApplicationData = z.infer<typeof jobApplicationSchema>;
export type ExperienceData = z.infer<typeof experienceSchema>;
export type EducationData = z.infer<typeof educationSchema>;
export type ProjectData = z.infer<typeof projectSchema>;
export type ResumeData = z.infer<typeof resumeSchema>;
