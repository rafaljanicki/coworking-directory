import { useQuery } from '@tanstack/react-query';
import { BlogPost } from '@shared/schema';
import { API_BASE_URL } from '@/lib/config';
import { apiRequest } from '@/lib/queryClient';

// API response type (assuming the API returns an array of posts directly)
type PostsApiResponse = BlogPost[];

export const usePosts = () => {
  const { 
    data: posts,
    isLoading, 
    error, 
  } = useQuery<PostsApiResponse, Error>({
    queryKey: ['blogPosts'], // Unique query key for blog posts
    queryFn: async () => {
      const url = `${API_BASE_URL}/posts`;
      
      // Use apiRequest to handle fetching and error checking
      const res = await apiRequest('GET', url);
      
      return res.json(); // apiRequest returns Response, so call json()
    },
    refetchOnWindowFocus: false, 
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  return { 
    posts: posts || [], // Return posts, default to empty array
    isLoading, 
    error,
  };
};