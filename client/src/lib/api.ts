import { AuthService } from "./auth";

const API_BASE = "https://api.baltek.net/api";

// Mock data for development when API is not available
const MOCK_JOBS = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "Tech Corp",
    location: "San Francisco, CA",
    job_type: "Full-time",
    workplace_type: "Remote",
    salary_range: "$120,000 - $160,000",
    category: "Technology",
    description: "We are looking for a senior frontend developer to join our team. You will be responsible for building user interfaces using React, TypeScript, and modern web technologies.",
    requirements: "5+ years of React experience, TypeScript proficiency, CSS/HTML expertise",
    posted_date: "2025-01-15",
    application_deadline: "2025-02-15",
    is_bookmarked: false
  },
  {
    id: 2,
    title: "UX/UI Designer",
    company: "Design Studio",
    location: "New York, NY",
    job_type: "Full-time",
    workplace_type: "Hybrid",
    salary_range: "$90,000 - $120,000",
    category: "Design",
    description: "Join our creative team as a UX/UI Designer. You will design user experiences for web and mobile applications.",
    requirements: "3+ years of design experience, Figma proficiency, portfolio required",
    posted_date: "2025-01-10",
    application_deadline: "2025-02-10",
    is_bookmarked: false
  },
  {
    id: 3,
    title: "Marketing Manager",
    company: "Growth Co",
    location: "Austin, TX",
    job_type: "Full-time",
    workplace_type: "On-site",
    salary_range: "$80,000 - $100,000",
    category: "Marketing",
    description: "Lead our marketing team and develop strategies to grow our customer base.",
    requirements: "5+ years marketing experience, digital marketing expertise, team leadership skills",
    posted_date: "2025-01-12",
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
        phone: '',
        location: 'Demo City',
        avatar: '',
        skills: ['React', 'TypeScript', 'Node.js'],
        linkedin_url: '',
        github_url: '',
        portfolio_url: ''
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
