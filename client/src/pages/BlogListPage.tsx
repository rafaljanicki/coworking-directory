import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { BlogPost } from '@shared/schema'; // Adjust path if needed
import { apiRequest } from '@/lib/queryClient';
import { API_BASE_URL } from '@/lib/config';
import { Helmet } from 'react-helmet-async';
// Import the actual BlogPostCard
import BlogPostCard from '@/components/BlogPostCard';
import Header from '@/components/Header'; // Import Header
import Footer from '@/components/Footer'; // Import Footer

// Define the expected response structure for /posts
interface GetPostsResponse {
  posts: BlogPost[];
}

const fetchBlogPosts = async (): Promise<BlogPost[]> => {
  const url = `${API_BASE_URL}/posts`;
  const response = await apiRequest('GET', url);
  const data: GetPostsResponse = await response.json();
  return data.posts;
};

const BlogListPage: React.FC = () => {
  const { data: posts, isLoading, error } = useQuery<BlogPost[], Error>({
    queryKey: ['blogPosts'],
    queryFn: fetchBlogPosts,
  });

  return (
    <>
      <Helmet>
        <title>Blog | Coworking Directory</title>
        <meta name="description" content="Read the latest news and articles about coworking spaces on our blog." />
      </Helmet>
      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Blog</h1>
          
          {isLoading && <p>Loading posts...</p>}
          {error && <p className="text-red-500">Error loading posts: {error.message}</p>}
          
          {posts && posts.length > 0 && (
            <div>
              {posts.map((post) => (
                // Use the actual BlogPostCard component
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>
          )}
          
          {posts && posts.length === 0 && (
            <p>No blog posts found yet.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogListPage; 