import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ImageCacheContextType {
  getCachedImage: (url: string) => string | null;
  loadAndCacheImage: (url: string) => Promise<string>;
  isLoading: (url: string) => boolean;
}

const ImageCacheContext = createContext<ImageCacheContextType | undefined>(undefined);

// Global cache to persist across component remounts
const imageCache = new Map<string, string>();
const loadingImages = new Set<string>();

export function ImageCacheProvider({ children }: { children: ReactNode }) {
  const getCachedImage = useCallback((url: string): string | null => {
    return imageCache.get(url) || null;
  }, []);

  const isLoading = useCallback((url: string): boolean => {
    return loadingImages.has(url);
  }, []);

  const loadAndCacheImage = useCallback(async (url: string): Promise<string> => {
    // Return cached version if available
    const cached = imageCache.get(url);
    if (cached) {
      return cached;
    }

    // Return existing promise if already loading
    if (loadingImages.has(url)) {
      // Wait for the existing load to complete
      return new Promise((resolve) => {
        const checkCache = () => {
          const cached = imageCache.get(url);
          if (cached) {
            resolve(cached);
          } else if (loadingImages.has(url)) {
            setTimeout(checkCache, 50);
          } else {
            // If not loading anymore but no cache, something went wrong, try again
            loadAndCacheImage(url).then(resolve);
          }
        };
        checkCache();
      });
    }

    // Start loading
    loadingImages.add(url);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      // Cache the blob URL
      imageCache.set(url, objectUrl);
      loadingImages.delete(url);
      
      return objectUrl;
    } catch (error) {
      loadingImages.delete(url);
      throw error;
    }
  }, []);

  const value = {
    getCachedImage,
    loadAndCacheImage,
    isLoading,
  };

  return (
    <ImageCacheContext.Provider value={value}>
      {children}
    </ImageCacheContext.Provider>
  );
}

export function useImageCache() {
  const context = useContext(ImageCacheContext);
  if (context === undefined) {
    throw new Error('useImageCache must be used within an ImageCacheProvider');
  }
  return context;
}

// Cleanup function to revoke object URLs when needed
export function cleanupImageCache() {
  imageCache.forEach((objectUrl) => {
    URL.revokeObjectURL(objectUrl);
  });
  imageCache.clear();
}