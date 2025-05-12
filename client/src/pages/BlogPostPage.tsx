import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useRoute } from 'wouter';
import { BlogPost } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { API_BASE_URL } from '@/lib/config';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const fetchPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  // Basic slug validation (optional, but good practice)
  if (!slug || typeof slug !== 'string' || !/^[a-z0-9-]+$/.test(slug)) {
    console.error('Invalid slug format:', slug);
    return undefined; // Or throw an error
  }
  const url = `${API_BASE_URL}/posts/${slug}`;
  try {
    const response = await apiRequest('GET', url);
    // Check for 404 specifically, as apiRequest might throw on other errors
    if (response.status === 404) {
      return undefined; 
    }
    const data: BlogPost = await response.json();
    return data;
  } catch (error) {
     // Handle cases where apiRequest throws (e.g., network error, 500)
     // Or if response.json() fails
    if (error instanceof Error && error.message.includes('404')) {
      // apiRequest might throw a 404 error string
      return undefined;
    } 
    console.error(`Error fetching post with slug ${slug}:`, error);
    throw error; // Re-throw other errors for react-query to handle
  }
};

const BlogPostPage: React.FC = () => {
  // Use wouter's useRoute hook to get route parameters
  const [, params] = useRoute<{ slug: string }>("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, error, isError } = useQuery<BlogPost | undefined, Error>({
    // Use slug in the queryKey so it refetches when the slug changes
    queryKey: ['blogPost', slug], 
    queryFn: () => fetchPostBySlug(slug!),
    enabled: !!slug, // Only run query if slug is available
    retry: (failureCount: number, error: Error) => {
       // Don't retry on 404s which might be represented as errors
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return false;
      }
      // Default retry behavior for other errors
      return failureCount < 3; 
    },
  });

  if (!slug) {
    // Consider rendering Header/Footer even for invalid URL state
    return (
      <>
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto p-4">Invalid blog post URL.</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* Helmet goes first but applies to the whole page */}
      {post && (
        <Helmet>
          {/* --- SEO Meta Tags --- */}
          <title>{post.metaTitle || post.title}</title>
          <meta name="description" content={post.metaDescription} />
          {post.keywords && <meta name="keywords" content={post.keywords.join(', ')} />}
          <meta property="og:title" content={post.metaTitle || post.title} />
          <meta property="og:description" content={post.metaDescription} />
          {post.featuredImageUrl && <meta property="og:image" content={post.featuredImageUrl} />}
          {/* --- End SEO Meta Tags --- */}
        </Helmet>
      )}

      <Header />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {isLoading && <p>Ładowanie wpisu...</p>}
          
          {isError && !isLoading && (
            <div className="text-center py-10">
              <h2 className="text-2xl font-semibold mb-4">Nie znaleziono wpisu</h2>
              <p className="text-gray-600 mb-4">
                Przepraszamy, nie udało się znaleźć szukanego wpisu.
                {error?.message && !error.message.includes('404') && 
                  <span className="block text-red-500 text-sm mt-2">Błąd: {error.message}</span>
                }
              </p>
              <Link href="/blog">
                <a className="text-blue-500 hover:underline">Powrót do listy wpisów</a>
              </Link>
            </div>
          )}

          {!isLoading && !isError && post && (
            <article>
              <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
              <p className="text-gray-500 text-sm mb-8">
                Autor: {post.author} | Data publikacji: {new Date(post.createdAt).toLocaleDateString('pl-PL')}
                {post.updatedAt !== post.createdAt && (
                  <span> (Aktualizacja: {new Date(post.updatedAt).toLocaleDateString('pl-PL')})</span>
                )}
              </p>

              {post.featuredImageUrl && (
                <img 
                  src={post.featuredImageUrl}
                  alt={post.title}
                  className="w-full h-auto max-h-96 object-cover rounded mb-8"
                />
              )}

              <div 
                className="prose lg:prose-xl max-w-none" 
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              <div className="mt-10 pt-6 border-t">
                 <Link href="/blog">
                  <a className="text-blue-500 hover:underline">&larr; Wróć do listy wpisów</a>
                </Link>
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogPostPage; 