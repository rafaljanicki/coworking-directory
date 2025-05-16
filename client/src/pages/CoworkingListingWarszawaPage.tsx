import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SpacesList from '@/components/SpacesList'; // Assuming SpacesList can be filtered or we adapt its usage
import { useSpaces } from '@/hooks/useSpaces'; // Assuming this hook can fetch/filter by city
import { CoworkingSpace } from '@shared/schema';
import SEO from '@/components/SEO'; // For meta tags

const CoworkingListingWarszawaPage: React.FC = () => {
  const { spaces, isLoading, error } = useSpaces(); // This hook likely fetches all spaces
  const [warsawSpaces, setWarsawSpaces] = useState<CoworkingSpace[]>([]);

  useEffect(() => {
    if (spaces) {
      setWarsawSpaces(spaces.filter(space => space.city.toLowerCase() === 'warszawa'));
    }
  }, [spaces]);

  // Placeholder for content from Content Creator
  const seoIntroText = `
    <p>Odkryj najlepsze przestrzenie coworkingowe w Warszawie. Nasz katalog biur coworkingowych pomoże Ci znaleźć idealne miejsce do pracy, 
    dostosowane do Twoich potrzeb – niezależnie czy jesteś freelancerem, startupem, czy większą firmą szukającą elastycznych rozwiązań biurowych. 
    Warszawa oferuje szeroki wybór nowoczesnych biur do wynajęcia, od hot desków po prywatne gabinety.</p>
    <p>Poniżej znajdziesz listę dostępnych biur coworkingowych w Warszawie. Szczegółowe opisy, zdjęcia i ceny pomogą Ci podjąć najlepszą decyzję.</p>
  `;

  const pageTitle = "Coworking Warszawa - Lista Biur i Przestrzeni Coworkingowych";
  const pageDescription = "Znajdź najlepsze biura coworkingowe w Warszawie. Przeglądaj oferty, porównuj ceny i udogodnienia. Idealne przestrzenie dla freelancerów i firm.";

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        // canonicalUrl={`https://biuracoworking.pl/coworking-warszawa`} // To be uncommented when domain is live
      />
      <Header />
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <a href="/" className="hover:underline">Strona Główna</a>
              <svg className="fill-current w-3 h-3 mx-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10.293 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4z"/></svg>
            </li>
            <li>
              <span className="text-gray-700">Coworking w Warszawie</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          {pageTitle}
        </h1>
        
        {/* Placeholder for SEO content from Content Creator */}
        <div
          className="prose prose-lg max-w-none text-gray-600 mb-8"
          dangerouslySetInnerHTML={{ __html: seoIntroText }}
        />

        {isLoading && <p>Ładowanie przestrzeni...</p>}
        {error && <p>Wystąpił błąd podczas ładowania przestrzeni: {error.message}</p>}
        {!isLoading && !error && warsawSpaces.length > 0 && (
          <SpacesList spaces={warsawSpaces} />
        )}
        {!isLoading && !error && warsawSpaces.length === 0 && (
          <p>Obecnie nie znaleziono żadnych przestrzeni coworkingowych w Warszawie w naszej bazie.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default CoworkingListingWarszawaPage;
