import React from 'react';
import { Link } from 'wouter';
import { BlogPost } from '@shared/schema';

interface BlogPostCardProps {
  post: BlogPost;
}

const getDisplayBlogImageUrl = (imageUrl: string | undefined | null): string => {
  const placeholderStock = '/img/stock/generic-blog-placeholder.jpg'; // Generic stock for blog when via.placeholder.com is used
  const defaultFallback = '/img/stock/generic-blog-placeholder.jpg'; // Fallback if no image or invalid

  if (imageUrl && imageUrl.includes('via.placeholder.com')) {
    return placeholderStock;
  }
  if (imageUrl) {
    return imageUrl;
  }
  return defaultFallback;
};

const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const displayImageUrl = getDisplayBlogImageUrl(post.featuredImageUrl);
  const imageAltText = (post.featuredImageUrl && !post.featuredImageUrl.includes('via.placeholder.com') && displayImageUrl !== '/img/stock/generic-blog-placeholder.jpg')
    ? `Zdjęcie wyróżniające dla wpisu: ${post.title}`
    : `Placeholder dla wpisu: ${post.title}`;

  return (
    <article className="mb-8 overflow-hidden rounded-lg border bg-card text-card-foreground shadow transition-shadow hover:shadow-lg">
      {(post.featuredImageUrl || displayImageUrl === '/img/stock/generic-blog-placeholder.jpg') && ( // Show image container if there is an original URL or we are showing the placeholder
        <Link href={`/blog/${post.slug}`}>
          <a className="block aspect-video overflow-hidden">
            <img
              src={displayImageUrl}
              alt={imageAltText}
              className="h-full w-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
            />
          </a>
        </Link>
      )}
      <div className="p-6">
        <h2 className="mb-2 text-2xl font-semibold leading-tight tracking-tight">
          <Link href={`/blog/${post.slug}`}>
            <a className="hover:text-primary hover:underline">
              {post.title}
            </a>
          </Link>
        </h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Autor: <span className="font-medium">{post.author ?? 'Zespół Biuracoworking.pl'}</span> | Data publikacji: {new Date(post.createdAt).toLocaleDateString('pl-PL')}
        </p>
        {post.excerpt && (
          <p className="mb-4 text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
        )}
        <Link href={`/blog/${post.slug}`}>
          <a className="inline-flex items-center font-medium text-primary hover:underline">
            Czytaj więcej
            <svg className="ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </a>
        </Link>
      </div>
    </article>
  );
};

export default BlogPostCard;
