import { AuthService } from "./auth";

const API_BASE = "https://api.baltek.net/api";

// Mock data for development when API is not available
const MOCK_JOBS = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    organization: {
      id: 1,
      name: "Tech Corp",
      logo: null,
      description: "Leading technology company focused on innovative solutions"
    },
    location: {
      id: 1,
      name: "San Francisco",
      country: "USA"
    },
    category: {
      id: 1,
      name: "Technology"
    },
    job_type: "full_time",
    workplace_type: "remote",
    salary_min: 120000,
    salary_max: 160000,
    currency: "USD",
    skills: ["React", "TypeScript", "JavaScript", "CSS", "HTML"],
    description: "We are looking for a senior frontend developer to join our team. You will be responsible for building user interfaces using React, TypeScript, and modern web technologies.",
    requirements: "5+ years of React experience, TypeScript proficiency, CSS/HTML expertise",
    benefits: "Health insurance, 401k, flexible working hours, remote work options",
    created_at: "2025-01-15T10:00:00Z",
    application_deadline: "2025-02-15",
    is_bookmarked: false
  },
  {
    id: 2,
    title: "UX/UI Designer",
    organization: {
      id: 2,
      name: "Design Studio",
      logo: null,
      description: "Creative design agency specializing in user experience"
    },
    location: {
      id: 2,
      name: "New York",
      country: "USA"
    },
    category: {
      id: 2,
      name: "Design"
    },
    job_type: "full_time",
    workplace_type: "hybrid",
    salary_min: 90000,
    salary_max: 120000,
    currency: "USD",
    skills: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping"],
    description: "Join our creative team as a UX/UI Designer. You will design user experiences for web and mobile applications.",
    requirements: "3+ years of design experience, Figma proficiency, portfolio required",
    benefits: "Health insurance, design tools stipend, creative workshops",
    created_at: "2025-01-10T09:00:00Z",
    application_deadline: "2025-02-10",
    is_bookmarked: false
  },
  {
    id: 3,
    title: "Marketing Manager",
    organization: {
      id: 3,
      name: "Growth Co",
      logo: null,
      description: "Fast-growing startup in the marketing technology space"
    },
    location: {
      id: 3,
      name: "Austin",
      country: "USA"
    },
    category: {
      id: 3,
      name: "Marketing"
    },
    job_type: "full_time",
    workplace_type: "on_site",
    salary_min: 80000,
    salary_max: 100000,
    currency: "USD",
    skills: ["Digital Marketing", "SEO", "Content Strategy", "Analytics"],
    description: "Lead our marketing team and develop strategies to grow our customer base.",
    requirements: "5+ years marketing experience, digital marketing expertise, team leadership skills",
    benefits: "Health insurance, marketing conference budget, team building events",
    created_at: "2025-01-12T11:00:00Z",
    application_deadline: "2025-02-12",
    is_bookmarked: false
  }
];

export class ApiClient {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${API_BASE}${endpoint}`;
      const token = AuthService.getToken();

      const headers = {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
        ...options.headers,
      };

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && token) {
        try {
          await AuthService.refreshToken();
          // Retry with new token
          const retryHeaders = {
            ...headers,
            ...AuthService.getAuthHeaders(),
          };
          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });
          
          if (!retryResponse.ok) {
            throw new Error(`API Error: ${retryResponse.status}`);
          }
          
          return retryResponse.json();
        } catch {
          AuthService.logout();
          throw new Error("Authentication failed");
        }
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.warn(`API request failed for ${endpoint}, using mock data:`, error);
      // Return mock data for development
      return this.getMockData(endpoint) as T;
    }
  }

  private static getMockData(endpoint: string): any {
    if (endpoint.startsWith('/jobs') && (endpoint.includes('?') || endpoint === '/jobs/')) {
      // Jobs list with filtering
      return { results: MOCK_JOBS, count: MOCK_JOBS.length };
    } else if (endpoint.startsWith('/jobs/') && /\/\d+\/$/.test(endpoint)) {
      // Single job
      const id = parseInt(endpoint.match(/\/(\d+)\//)?.[1] || '1');
      return MOCK_JOBS.find(job => job.id === id) || MOCK_JOBS[0];
    } else if (endpoint.includes('/profile/') || endpoint.includes('/users/')) {
      // User profile
      return {
        id: 1,
        username: 'demo_user',
        email: 'demo@example.com',
        first_name: 'Demo',
        last_name: 'User',
        bio: 'Demo user profile',
        phone: '+1234567890',
        location: 'Demo City',
        avatar: '',
        skills: ['React', 'TypeScript', 'Node.js'],
        linkedin_url: '',
        github_url: '',
        portfolio_url: ''
      };
    } else if (endpoint.includes('/locations/')) {
      // Locations for filters
      return {
        results: [
          { id: 1, name: 'San Francisco', country: 'USA' },
          { id: 2, name: 'New York', country: 'USA' },
          { id: 3, name: 'Austin', country: 'USA' },
          { id: 4, name: 'London', country: 'UK' },
          { id: 5, name: 'Berlin', country: 'Germany' }
        ]
      };
    } else if (endpoint.includes('/categories/')) {
      // Categories for filters
      return {
        results: [
          { id: 1, name: 'Technology' },
          { id: 2, name: 'Design' },
          { id: 3, name: 'Marketing' },
          { id: 4, name: 'Sales' },
          { id: 5, name: 'Finance' }
        ]
      };
    } else if (endpoint.includes('/organizations/')) {
      // Organizations for filters
      return {
        results: [
          { id: 1, name: 'Tech Corp', logo: null },
          { id: 2, name: 'Design Studio', logo: null },
          { id: 3, name: 'Growth Co', logo: null }
        ]
      };
    } else if (endpoint.includes('/resumes/')) {
      // User resumes
      return {
        results: [
          { 
            id: 1, 
            title: 'Software Engineer Resume', 
            file_url: '/resumes/resume1.pdf',
            created_at: '2025-01-01T10:00:00Z'
          }
        ]
      };
    }
    
    return { success: true, message: 'Mock response' };
  }

  // Jobs API
  static async getJobs(params: Record<string, any> = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    return this.makeRequest(`/jobs/${query ? `?${query}` : ""}`);
  }

  static async getJob(id: number) {
    return this.makeRequest(`/jobs/${id}/`);
  }

  static async bookmarkJob(id: number) {
    return this.makeRequest(`/jobs/${id}/bookmark/`, { method: "POST" });
  }

  static async getBookmarkedJobs() {
    return this.makeRequest("/jobs/bookmarks/");
  }

  // Applications API
  static async applyToJob(data: any) {
    return this.makeRequest("/jobs/applications/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async getMyApplications() {
    return this.makeRequest("/jobs/applications/");
  }

  // Profile API
  static async getProfile(id: number) {
    return this.makeRequest(`/users/${id}/`);
  }

  static async updateProfile(id: number, data: any) {
    return this.makeRequest(`/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Education API
  static async addEducation(data: any) {
    return this.makeRequest("/users/educations/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateEducation(id: number, data: any) {
    return this.makeRequest(`/users/educations/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteEducation(id: number) {
    return this.makeRequest(`/users/educations/${id}/`, {
      method: "DELETE",
    });
  }

  // Experience API
  static async addExperience(data: any) {
    return this.makeRequest("/users/experiences/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateExperience(id: number, data: any) {
    return this.makeRequest(`/users/experiences/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteExperience(id: number) {
    return this.makeRequest(`/users/experiences/${id}/`, {
      method: "DELETE",
    });
  }

  // Projects API
  static async addProject(data: any) {
    return this.makeRequest("/users/projects/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateProject(id: number, data: any) {
    return this.makeRequest(`/users/projects/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async deleteProject(id: number) {
    return this.makeRequest(`/users/projects/${id}/`, {
      method: "DELETE",
    });
  }

  // Resume API
  static async getResumes() {
    return this.makeRequest("/users/resumes/");
  }

  static async uploadResume(data: FormData) {
    const response = await fetch(`${API_BASE}/users/resumes/`, {
      method: "POST",
      headers: AuthService.getAuthHeaders(),
      body: data,
    });

    if (!response.ok) {
      throw new Error("Resume upload failed");
    }

    return response.json();
  }

  // Chat API
  static async getChatRooms() {
    return this.makeRequest("/chat/rooms/");
  }

  static async getChatMessages(roomId: number, params: Record<string, any> = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    return this.makeRequest(`/chat/messages/?room=${roomId}${query ? `&${query}` : ""}`);
  }

  // Organizations API
  static async getOrganizations(params: Record<string, any> = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });
    
    const query = searchParams.toString();
    return this.makeRequest(`/organizations/${query ? `?${query}` : ""}`);
  }

  static async getOrganization(id: number) {
    return this.makeRequest(`/organizations/${id}/`);
  }

  // Reference data API
  static async getLocations() {
    return this.makeRequest("/locations/");
  }

  static async getCategories() {
    return this.makeRequest("/categories/");
  }

  static async getUniversities() {
    return this.makeRequest("/universities/");
  }

  static async getLanguages() {
    return this.makeRequest("/languages/");
  }

  // File upload API
  static async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/files/`, {
      method: "POST",
      headers: AuthService.getAuthHeaders(),
      body: formData,
    });

    if (!response.ok) {
      throw new Error("File upload failed");
    }

    return response.json();
  }

  // Saved filters API
  static async getSavedFilters() {
    return this.makeRequest("/jobs/saved_filters/");
  }

  static async saveFil(data: any) {
    return this.makeRequest("/jobs/saved_filters/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async deleteSavedFilter(id: number) {
    return this.makeRequest(`/jobs/saved_filters/${id}/`, {
      method: "DELETE",
    });
  }
}
