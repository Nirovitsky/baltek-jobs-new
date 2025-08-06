import { z } from "zod";

// Authentication schemas
export const loginSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

// User profile schemas
export const userProfileSchema = z.object({
  id: z.number(),
  phone: z.string(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  bio: z.string().optional(),
  location: z.string().optional(),
  avatar: z.string().optional(),
  skills: z.array(z.string()).optional(),
  linkedin_url: z.string().optional(),
  github_url: z.string().optional(),
  portfolio_url: z.string().optional(),
});

// Job schemas
export const jobSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  payment_from: z.number().nullable().optional(),
  payment_to: z.number().nullable().optional(),
  salary_min: z.number().optional(), // Keep for backward compatibility
  salary_max: z.number().optional(), // Keep for backward compatibility
  currency: z.string().optional(),
  payment_frequency: z.string().optional(),
  job_type: z.string(),
  workplace_type: z.string(),
  location: z.object({
    id: z.number(),
    name: z.string(),
    country: z.string().optional(),
  }).optional(),
  category: z.object({
    id: z.number(),
    name: z.string(),
  }).optional(),
  organization: z.object({
    id: z.number(),
    official_name: z.string().optional(),
    display_name: z.string().optional(),
    name: z.string().optional(), // Keep for backward compatibility
    logo: z.string().optional(),
    description: z.string().optional(),
  }),
  skills: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
  is_public: z.boolean().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  is_bookmarked: z.boolean().optional(),
  my_application_id: z.number().nullable().optional(),
  applications_count: z.number().nullable().optional(),
});

// Job application schemas
export const jobApplicationSchema = z.object({
  job: z.number(),
  cover_letter: z.string().optional(),
  resume: z.string().optional(),
});

// Education schema
export const educationSchema = z.object({
  university: z.number(),
  degree: z.string(),
  field_of_study: z.string(),
  start_date: z.string(),
  end_date: z.string().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
});

// Experience schema
export const experienceSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string().optional(),
  start_date: z.string(),
  end_date: z.string().optional(),
  description: z.string().optional(),
  is_current: z.boolean().optional(),
});

// Project schema
export const projectSchema = z.object({
  title: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
  url: z.string().optional(),
  github_url: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// Resume schema
export const resumeSchema = z.object({
  title: z.string(),
  file: z.string(),
  is_primary: z.boolean().optional(),
});

// Chat schemas
export const chatRoomSchema = z.object({
  id: z.number(),
  name: z.string(),
  participants: z.array(z.object({
    id: z.number(),
    username: z.string(),
    first_name: z.string(),
    last_name: z.string(),
  })),
  last_message: z.object({
    content: z.string(),
    timestamp: z.string(),
    sender: z.object({
      id: z.number(),
      username: z.string(),
    }),
  }).optional(),
});

export const messageSchema = z.object({
  id: z.number(),
  content: z.string(),
  sender: z.object({
    id: z.number(),
    username: z.string(),
    first_name: z.string(),
    last_name: z.string(),
  }),
  timestamp: z.string(),
  status: z.string(),
});

// Filter schemas
export const jobFiltersSchema = z.object({
  search: z.string().optional(),
  location: z.number().optional(),
  category: z.number().optional(),
  job_type: z.string().optional(),
  workplace_type: z.string().optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  currency: z.string().optional(),
  payment_frequency: z.string().optional(),
  min_education_level: z.string().optional(),
  organization: z.number().optional(),
});

export const savedFilterSchema = z.object({
  name: z.string(),
  filters: jobFiltersSchema,
});

// Organization schema
export const organizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  logo: z.string().optional(),
  website: z.string().optional(),
  location: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  founded: z.number().optional(),
});

// Location and category schemas
export const locationSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string(),
});

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
});

// Type exports
export type LoginRequest = z.infer<typeof loginSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type Job = z.infer<typeof jobSchema>;
export type JobApplication = z.infer<typeof jobApplicationSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Resume = z.infer<typeof resumeSchema>;
export type ChatRoom = z.infer<typeof chatRoomSchema>;
export type Message = z.infer<typeof messageSchema>;
export type JobFilters = z.infer<typeof jobFiltersSchema>;
export type SavedFilter = z.infer<typeof savedFilterSchema>;
export type Organization = z.infer<typeof organizationSchema>;
export type Location = z.infer<typeof locationSchema>;
export type Category = z.infer<typeof categorySchema>;

export const universitySchema = z.object({
  id: z.number(),
  name: z.string(),
  country: z.string().optional(),
});

export const languageSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
});

export type University = z.infer<typeof universitySchema>;
export type Language = z.infer<typeof languageSchema>;
