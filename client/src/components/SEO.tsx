import { Helmet } from 'react-helmet-async';
import { Space } from '@/lib/types';

interface BaseSEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
}

export function BaseSEO({
  title = 'CoWork Poland - Znajdź Przestrzenie Coworkingowe w Polsce',
  description = 'Znajdź najlepsze przestrzenie coworkingowe w Polsce. Filtruj według lokalizacji, ceny, ocen i udogodnień, aby odkryć idealną przestrzeń do pracy.',
  canonicalUrl = 'https://biuracoworking.pl',
  ogImage = '/coworking_directory_thumbnail.png',
}: BaseSEOProps) {
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
    </Helmet>
  );
}

interface HomePageSEOProps {
  spaces?: number;
  cities?: string[];
}

export function HomePageSEO({ spaces = 0, cities = [] }: HomePageSEOProps) {
  const citiesText = cities.length > 0 
    ? `w miastach ${cities.slice(0, 3).join(', ')}${cities.length > 3 ? ' i innych' : ''}`
    : 'w Polsce';
  
  const description = `Znajdź najlepsze przestrzenie coworkingowe ${citiesText}. Przeglądaj ${spaces}+ opcji i filtruj według lokalizacji, ceny, ocen i udogodnień.`;
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CoWork Poland',
    url: 'https://biuracoworking.pl',
    description: description,
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://biuracoworking.pl/?search={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <>
      <BaseSEO 
        title="CoWork Poland - Znajdź Przestrzenie Coworkingowe w Polsce"
        description={description}
      />
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </>
  );
}

interface SpacePageSEOProps {
  space: Space;
}

export function SpacePageSEO({ space }: SpacePageSEOProps) {
  const title = `${space.name} - Przestrzeń Coworkingowa w ${space.city}`;
  const description = `${space.name} to przestrzeń coworkingowa w ${space.city}${space.description ? ` oferująca ${space.description.substring(0, 100)}...` : ''}. Sprawdź szczegóły, ceny i dostępne usługi.`;
  const canonicalUrl = `https://biuracoworking.pl/space/${space.id}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: space.name,
    description: space.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: space.city,
      addressRegion: 'Polska',
      streetAddress: space.address
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: space.latitude,
      longitude: space.longitude
    },
    image: space.images && space.images.length > 0 ? space.images[0] : '',
    telephone: space.phone || '',
    url: canonicalUrl,
    priceRange: space.pricePerDay ? `${space.pricePerDay} PLN/dzień` : 'Skontaktuj się, aby uzyskać ceny'
  };

  return (
    <>
      <BaseSEO 
        title={title}
        description={description}
        canonicalUrl={canonicalUrl}
        ogImage={space.images && space.images.length > 0 ? space.images[0] : ''}
      />
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </>
  );
}