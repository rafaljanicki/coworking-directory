import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SpacesList from '@/components/SpacesList';
import { useSpaces } from '@/hooks/useSpaces';
import { CoworkingSpace } from '@shared/schema';
import { BaseSEO as SEO } from '@/components/SEO';
import { Link } from 'wouter';

interface CityListingPageProps {
  cityName: string;
  citySlug: string;
}

const CityListingPage: React.FC<CityListingPageProps> = ({ cityName, citySlug }) => {
  // The useSpaces hook might need adjustment if citySlug is not directly usable as 'location'
  // or if the API expects a different format for city filtering.
  // For now, assuming it works similarly to the 'warszawa' example.
  const { spaces, isLoading, error } = useSpaces(
    { location: citySlug, services: [] }, 
    null 
  );

  const pageTitle = `Coworking ${cityName} - Znajdź Biuro | BiuraCoworking.pl`;
  const metaDescription = `Szukasz coworkingu w ${cityName}? Przeglądaj najlepsze biura coworkingowe, elastyczne biurka i przestrzenie do pracy w ${cityName}. Filtruj, porównuj i znajdź idealne miejsce!`;
  const h1Title = `Coworking ${cityName}: Najlepsze Przestrzenie Coworkingowe`;
  const canonicalUrl = `https://biuracoworking.pl/coworking-${citySlug}`;

  // Placeholder for introductory content from Content Creator
  const introText = `
    <p>Odkryj najlepsze przestrzenie coworkingowe w mieście ${cityName}. Nasz katalog pomoże Ci znaleźć idealne miejsce do pracy, 
    dostosowane do Twoich potrzeb. ${cityName} oferuje szeroki wybór nowoczesnych biur do wynajęcia.</p>
    <p>Poniżej znajdziesz listę dostępnych biur coworkingowych w ${cityName}. Filtruj wyniki, aby dopasować je do swoich wymagań.</p>
  `;

  return (
    <>
      <SEO
        title={pageTitle}
        description={metaDescription}
        canonicalUrl={canonicalUrl}
      />
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs - SEO Specialist: Strona Główna > Coworking > Coworking [Miasto] */}
        <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex items-center">
            <li className="flex items-center">
              <Link href="/" className="hover:underline">Strona Główna</Link>
              <svg className="fill-current w-3 h-3 mx-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
            </li>
            {/* Ideally, there would be a generic "Miasta" or "Coworking" page in between */}
            {/* For now, linking directly to the concept of city listings */}
            <li className="flex items-center">
              {/* <Link href="/miasta" className="hover:underline">Miasta</Link> */}
              {/* For now, let's assume the dropdown "Miasta" is the conceptual parent */}
              <span className="text-gray-500">Miasta</span> 
              <svg className="fill-current w-3 h-3 mx-2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
            </li>
            <li>
              <span className="text-gray-700">Coworking w {cityName}</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          {h1Title}
        </h1>
        
        {/* Introductory Content from SEO/Content Creator */}
        <div
          className="prose prose-gray max-w-none mb-8 text-gray-700"
          dangerouslySetInnerHTML={{ __html: introText }}
        />

        {/* TODO: Add Interactive Map section (SEO Specialist Recommendation) */}
        {/* <div className="mb-8">[Placeholder for Interactive Map]</div> */}

        {isLoading && <p className="text-center py-8">Ładowanie przestrzeni dla miasta {cityName}...</p>}
        {error && <p className="text-center py-8 text-red-600">Wystąpił błąd podczas ładowania przestrzeni: {error.message}</p>}
        {!isLoading && !error && (
          <SpacesList 
            spaces={spaces || []} 
            isLoading={isLoading} 
            error={error} 
            onSpaceClick={(id) => console.log(`Space clicked: ${id}`)} // Basic click handler
          />
        )}
        {!isLoading && !error && spaces && spaces.length === 0 && (
          <p className="text-center py-8">Obecnie nie znaleziono żadnych przestrzeni coworkingowych w {cityName} w naszej bazie.</p>
        )}

        {/* TODO: Add City-Specific Information section (SEO Specialist Recommendation) */}
        {/* <div className="mt-12">[Placeholder for Brief City-Specific Information]</div> */}

        {/* TODO: Add FAQ Section (SEO Specialist Recommendation) */}
        {/* <div className="mt-12">[Placeholder for FAQ Section]</div> */}

      </div>
      <Footer />
    </>
  );
};

export default CityListingPage;
