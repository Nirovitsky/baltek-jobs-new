import { AuthService } from "./auth";

const API_BASE = "https://api.baltek.net/api";

// Static enum data for filters (not provided as API endpoints by Baltek)
const STATIC_FILTER_OPTIONS = {
  JOB_TYPES: [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "freelance", label: "Freelance" }
  ],
  WORKPLACE_TYPES: [
    { value: "on_site", label: "On Site" },
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" }
  ],
  CURRENCIES: [
    { value: "TMT", label: "TMT" },
    { value: "USD", label: "USD" }
  ],
  PAYMENT_FREQUENCIES: [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" }
  ],
  EDUCATION_LEVELS: [
    { value: "high_school", label: "High School" },
    { value: "associate", label: "Associate Degree" },
    { value: "bachelor", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "doctorate", label: "Doctorate" }
  ]
};

export class ApiClient {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const url = `${API_BASE}${endpoint}`;
      const token = AuthService.getToken();

      let headers = {
        "Content-Type": "application/json",
        ...AuthService.getAuthHeaders(),
        ...options.headers,
      };

      // Don't set Content-Type for FormData - let browser handle it
      if (options.body instanceof FormData) {
        headers = { ...headers };
        delete headers["Content-Type"];
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401 && token) {
        console.warn('Received 401, attempting token refresh...');
        try {
          await AuthService.refreshToken();
          console.log('Token refresh successful, retrying request...');
          // Retry with new token
          const retryHeaders = {
            ...headers,
            ...AuthService.getAuthHeaders(),
          };
          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });
          
          if (retryResponse.status === 401) {
            console.warn('Still unauthorized after refresh, logging out...');
            AuthService.logout();
            throw new Error("Session expired, please login again");
          }
          
          if (!retryResponse.ok) {
            throw new Error(`API Error: ${retryResponse.status}`);
          }
          
          return retryResponse.json();
        } catch (error) {
          console.warn('Token refresh failed, logging out:', error);
          AuthService.logout();
          throw new Error("Session expired, please login again");
        }
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }



  // Jobs API
  static async getJobs(params: Record<string, any> = {}) {
    const searchParams = new URLSearchParams();
    // Temporarily exclude currency from API params as API currency filter is non-functional
    // We'll handle currency filtering on the client side
    const { currency, ...apiParams } = params;
    
    Object.entries(apiParams).forEach(([key, value]) => {
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

  static async bookmarkJob(id: number, isBookmarked: boolean) {
    return this.makeRequest(`/jobs/${id}/bookmark/`, { 
      method: "POST",
      body: JSON.stringify({ bookmarked: !isBookmarked })
    });
  }

  static async getBookmarkedJobs() {
    return this.makeRequest("/jobs/bookmarks/");
  }

  // Applications API
  static async applyToJob(data: any, resumeFile?: File, selectedResumeId?: string) {
    // Always use FormData since API expects multipart form
    const formData = new FormData();
    formData.append("job", data.job.toString());
    formData.append("cover_letter", data.cover_letter || "");
    
    // Handle resume submission - either file upload or existing resume ID
    if (resumeFile) {
      formData.append("resume", resumeFile);
    } else if (selectedResumeId) {
      formData.append("resume_id", selectedResumeId);
    }

    return this.makeRequest("/jobs/applications/", {
      method: "POST",
      body: formData,
      headers: {}, // Let browser set multipart headers automatically
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
    const response = await this.makeRequest<any[]>("/categories/");
    // The API returns a simple array, not paginated results
    return { results: response };
  }

  // Static filter options that don't come from API endpoints
  static getJobTypes() {
    return Promise.resolve(STATIC_FILTER_OPTIONS.JOB_TYPES);
  }

  static getWorkplaceTypes() {
    return Promise.resolve(STATIC_FILTER_OPTIONS.WORKPLACE_TYPES);
  }

  static getCurrencies() {
    return Promise.resolve(STATIC_FILTER_OPTIONS.CURRENCIES);
  }

  static getPaymentFrequencies() {
    return Promise.resolve(STATIC_FILTER_OPTIONS.PAYMENT_FREQUENCIES);
  }

  static getEducationLevels() {
    return Promise.resolve(STATIC_FILTER_OPTIONS.EDUCATION_LEVELS);
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

  static async saveFilter(data: any) {
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
