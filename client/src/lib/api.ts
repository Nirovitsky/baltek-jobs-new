import { AuthService } from "./auth";

const API_BASE = "https://api.baltek.net/api";

// Static enum data for filters (not provided as API endpoints by Baltek)
const STATIC_FILTER_OPTIONS = {
  JOB_TYPES: [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "freelance", label: "Freelance" },
  ],
  WORKPLACE_TYPES: [
    { value: "on_site", label: "On Site" },
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" },
  ],
  CURRENCIES: [
    { value: "TMT", label: "TMT" },
    { value: "USD", label: "USD" },
  ],
  PAYMENT_FREQUENCIES: [
    { value: "hourly", label: "Hourly" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ],
  EDUCATION_LEVELS: [
    { value: "secondary", label: "Secondary" },
    { value: "undergraduate", label: "Undergraduate" },
    { value: "master", label: "Master" },
    { value: "doctorate", label: "Doctorate" },
  ],
};

export class ApiClient {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true,
  ): Promise<T> {
    try {
      const url = `${API_BASE}${endpoint}`;
      const token = AuthService.getToken();

      let headers = {
        "Content-Type": "application/json",
        ...(requireAuth || token ? AuthService.getAuthHeaders() : {}),
        ...options.headers,
      };

      // Don't set Content-Type for FormData - let browser handle it
      if (options.body instanceof FormData) {
        const filteredHeaders = Object.fromEntries(
          Object.entries(headers).filter(([key]) => key !== "Content-Type"),
        );
        headers = filteredHeaders as typeof headers;
      }

      let response: Response;
      try {
        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch (error) {
        throw error;
      }

      // Handle token expiration with automatic refresh (only if auth was required)
      if (response.status === 401 && token && requireAuth) {
        try {
          const newToken = await AuthService.refreshToken();
          
          // Retry with new token - ensure proper headers
          let retryHeaders = {
            ...headers,
            ...AuthService.getAuthHeaders(),
          };

          // Handle FormData case for retry
          if (options.body instanceof FormData) {
            const filteredRetryHeaders = Object.fromEntries(
              Object.entries(retryHeaders).filter(([key]) => key !== "Content-Type"),
            );
            retryHeaders = filteredRetryHeaders as typeof retryHeaders;
          }
          
          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });

          if (retryResponse.status === 401) {
            AuthService.logout();
            throw new Error("Session expired, please login again");
          }

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            throw new Error(`API Error: ${retryResponse.status} - ${retryErrorText}`);
          }

          return retryResponse.json();
        } catch (refreshError) {
          AuthService.logout();
          throw new Error("Session expired, please login again");
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      return response.json();
    } catch (error) {
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
    return this.makeRequest(`/jobs/${query ? `?${query}` : ""}`, {}, false); // Allow public access
  }

  static async getJob(id: number) {
    return this.makeRequest(`/jobs/${id}/`, {}, false); // Allow public access
  }

  static async bookmarkJob(id: number, isBookmarked: boolean) {
    return this.makeRequest(`/jobs/${id}/bookmark/`, {
      method: "POST",
      body: JSON.stringify({ bookmarked: !isBookmarked }),
    });
  }

  static async getBookmarkedJobs() {
    return this.makeRequest("/jobs/bookmarks/");
  }

  // Applications API
  static async applyToJob(
    data: any,
    resumeFile?: File,
    selectedResumeId?: string,
  ) {
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
    // Use dedicated applications endpoint instead of fetching all jobs
    return this.makeRequest("/jobs/applications/");
  }

  static async getApplicationDetails(applicationId: number) {
    return this.makeRequest(`/jobs/applications/${applicationId}/`);
  }

  // Profile API
  static async getProfile(id: number) {
    return this.makeRequest(`/users/${id}/`);
  }

  static async getCurrentUser() {
    // Try different endpoint patterns for getting current user
    try {
      return this.makeRequest("/users/me/", {}, true);
    } catch (error: any) {
      if (error.message?.includes('404')) {
        // If /users/me/ doesn't exist, try /profile/
        try {
          return this.makeRequest("/profile/", {}, true);
        } catch (profileError: any) {
          if (profileError.message?.includes('404')) {
            // If /profile/ doesn't exist, try /auth/user/
            return this.makeRequest("/auth/user/", {}, true);
          }
          throw profileError;
        }
      }
      throw error;
    }
  }

  static async updateProfile(id: number, data: any) {
    return this.makeRequest(`/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  static async completeOnboarding() {
    console.log('API: Completing onboarding...');
    
    try {
      // Get the current user first to verify current status and get user ID
      const currentUser = await this.getCurrentUser() as any;
      console.log('API: Current user from /users/short/:', currentUser);
      console.log('API: Current onboarding status:', currentUser.is_jobs_onboarding_completed);
      console.log('API: User ID:', currentUser.id);
      
      // Update the onboarding status using PATCH on users/{id} endpoint
      const updateData = { 
        is_jobs_onboarding_completed: true
      };
      console.log('API: Sending update data to /users/' + currentUser.id + '/:', updateData);
      
      const result = await this.makeRequest(`/users/${currentUser.id}/`, {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      });
      console.log('API: PATCH response from /users/' + currentUser.id + '/:', result);
      
      // Verify the update by fetching user again
      const updatedUser = await this.getCurrentUser() as any;
      console.log('API: User after update:', updatedUser);
      console.log('API: Updated onboarding status:', updatedUser.is_jobs_onboarding_completed);
      
      return result;
    } catch (error) {
      console.error('API: Onboarding completion failed:', error);
      throw error;
    }
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

  static async deleteResume(id: number) {
    return this.makeRequest(`/users/resumes/${id}/`, {
      method: "DELETE",
    });
  }

  // Profile picture upload
  static async uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.makeRequest('/users/short/', {
      method: 'PATCH',
      body: formData,
    });
  }

  // Chat API
  static async getChatRooms() {
    return this.makeRequest("/chat/rooms/");
  }

  static async getChatMessages(
    roomId: number,
    params: Record<string, any> = {},
  ) {
    const searchParams = new URLSearchParams();
    searchParams.append("room", roomId.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const query = searchParams.toString();
    return this.makeRequest(`/chat/messages/?${query}`);
  }

  static async sendMessage(roomId: number, content: string) {
    return this.makeRequest("/chat/messages/", {
      method: "POST",
      body: JSON.stringify({ room: roomId, content }),
    });
  }

  // Universities API
  static async getUniversities() {
    return this.makeRequest("/universities/", {}, false);
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

  // Auth API
  static async changePassword(currentPassword: string, newPassword: string) {
    return this.makeRequest("/change-password/", {
      method: "POST",
      body: JSON.stringify({ 
        current_password: currentPassword, 
        new_password: newPassword 
      }),
    });
  }

  static async deleteAccount(userId: number) {
    return this.makeRequest(`/users/${userId}/`, {
      method: "DELETE",
    });
  }

  static async exportUserData() {
    return this.makeRequest("/users/export/");
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

  // Use static filter options to avoid unnecessary API calls
  static async fetchFilterOptions() {
    return {
      jobTypes: STATIC_FILTER_OPTIONS.JOB_TYPES,
      workplaceTypes: STATIC_FILTER_OPTIONS.WORKPLACE_TYPES,
      currencies: STATIC_FILTER_OPTIONS.CURRENCIES,
      paymentFrequencies: STATIC_FILTER_OPTIONS.PAYMENT_FREQUENCIES,
    };
  }

  // Individual getter methods that return static options
  static async getJobTypes() {
    return STATIC_FILTER_OPTIONS.JOB_TYPES;
  }

  static async getWorkplaceTypes() {
    return STATIC_FILTER_OPTIONS.WORKPLACE_TYPES;
  }

  static async getCurrencies() {
    return STATIC_FILTER_OPTIONS.CURRENCIES;
  }

  static async getPaymentFrequencies() {
    return STATIC_FILTER_OPTIONS.PAYMENT_FREQUENCIES;
  }

  static async getEducationLevels() {
    // Use static education levels as specified: Secondary, Undergraduate, Master, Doctorate
    return STATIC_FILTER_OPTIONS.EDUCATION_LEVELS;
  }



  static async getLanguages() {
    return this.makeRequest("/languages/");
  }

  // File upload API
  static uploadFile(file: File, onProgress?: (progress: number) => void): { promise: Promise<{ id: number; file_url?: string; url?: string; path?: string }>; abort: () => void } {
    let xhr: XMLHttpRequest;
    
    const promise = new Promise<{ id: number; file_url?: string; url?: string; path?: string }>((resolve, reject) => {
      xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("path", file);


      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.detail || errorData.message || "File upload failed"));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      // Open the request first
      xhr.open('POST', `${API_BASE}/files/`);
      
      // Set headers after opening but before sending
      const authHeaders = AuthService.getAuthHeaders();
      Object.entries(authHeaders).forEach(([key, value]) => {
        if (key !== 'Content-Type') { // Don't set Content-Type for FormData
          xhr.setRequestHeader(key, value);
        }
      });

      xhr.send(formData);
    });

    return {
      promise,
      abort: () => {
        if (xhr) {
          xhr.abort();
        }
      }
    };
  }

  // Helper to construct file URL from ID
  static getFileUrl(fileId: number | string): string {
    return `${API_BASE}/files/${fileId}/`;
  }

  // Saved filters API
  static async getSavedFilters() {
    return this.makeRequest("/jobs/saved_filters/");
  }

  static async saveFilter(data: any) {
    return this.makeRequest("/jobs/saved_filters/", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        data: data.filters, // API expects filters to be in 'data' field
      }),
    });
  }

  static async deleteSavedFilter(id: number) {
    return this.makeRequest(`/jobs/saved_filters/${id}/`, {
      method: "DELETE",
    });
  }

  // ===== Notifications =====
  static async getNotifications(params?: {
    page?: number;
    page_size?: number;
    is_read?: boolean;
  }): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: Array<{
      id: number;
      date_created: number;
      event: {
        type: string;
        date_created: number;
        content_type: string;
        object_id: number;
      };
      title: string;
      is_read: boolean;
    }>;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
    if (params?.is_read !== undefined) queryParams.append("is_read", params.is_read.toString());

    const endpoint = `/notifications/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return this.makeRequest<{
      count: number;
      next: string | null;
      previous: string | null;
      results: Array<{
        id: number;
        date_created: number;
        event: {
          type: string;
          date_created: number;
          content_type: string;
          object_id: number;
        };
        title: string;
        is_read: boolean;
      }>;
    }>(endpoint);
  }

  static async markNotificationAsRead(notificationId: number): Promise<{
    id: number;
    date_created: number;
    event: any;
    title: string;
    is_read: boolean;
  }> {
    return this.makeRequest<{
      id: number;
      date_created: number;
      event: any;
      title: string;
      is_read: boolean;
    }>(`/notifications/${notificationId}/`, {
      method: "PATCH",
      body: JSON.stringify({ is_read: true }),
    });
  }

  // Mark all notifications as read - API doesn't provide bulk endpoint, so we'll handle this client-side
  static async markAllNotificationsAsRead(): Promise<{ message: string }> {
    // Since the API doesn't provide a bulk mark-as-read endpoint, this will be handled in the UI
    throw new Error("Bulk mark as read not supported by API. Handle individually on client side.");
  }

  static async deleteNotification(notificationId: number): Promise<void> {
    return this.makeRequest<void>(`/notifications/${notificationId}/`, {
      method: "DELETE",
    });
  }
}
