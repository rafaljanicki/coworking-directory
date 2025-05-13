import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Mail, Image as ImageIcon, ExternalLink } from 'lucide-react';

const OfferTemplatePage: React.FC = () => {
  const offer = {
    city: 'Warszawa',
    title: 'Nowoczesne Biuro Coworkingowe w Centrum Warszawy',
    description: `
      <p>Witamy w naszym nowoczesnym centrum coworkingowym zlokalizowanym w samym sercu Warszawy. Oferujemy elastyczne rozwiązania biurowe dla freelancerów, startupów i firm każdej wielkości.</p>
      <p>Nasza przestrzeň została zaprojektowana z myślą o produktywności i komforcie. Znajdziesz tu wszystko, czego potrzebujesz do efektywnej pracy: szybki internet, ergonomiczne meble, w pełni wyposażone sale konferencyjne oraz strefy relaksu.</p>
      <h3 class="text-xl font-semibold mt-4 mb-2">Co oferujemy:</h3>
      <ul class="list-disc list-inside space-y-1">
        <li>Dostęp 24/7</li>
        <li>Szybkie Wi-Fi</li>
        <li>Drukarki i skanery</li>
        <li>Sale konferencyjne</li>
        <li>W pełni wyposażona kuchnia (kawa, herbata w cenie)</li>
        <li>Wydarzenia networkingowe</li>
        <li>Recepcja i obsługa poczty</li>
      </ul>
    `,
    images: [
      'https://via.placeholder.com/600x400.png?text=Biuro+1',
      'https://via.placeholder.com/600x400.png?text=Biuro+2',
      'https://via.placeholder.com/600x400.png?text=Strefa+Relaksu',
    ],
    address: 'ul. Przykładowa 123, 00-001 Warszawa',
    phone: '+48 123 456 789',
    email: 'kontakt@przykladowy-cowork.pl',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2443.773647986263!2d21.01032001579637!3d52.22967597975979!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecc669a869f61%3A0x7db3d1f0e0b0a6f3!2sPa%C5%82ac%20Kultury%20i%20Nauki!5e0!3m2!1spl!2spl!4v1616161616161!5m2!1spl!2spl',
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-4 text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <a href="/" className="hover:underline">Strona Główna</a>
              <svg className="fill-current w-3 h-3 mx-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10.293 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4z"/></svg>
            </li>
            <li className="flex items-center">
              <a href="/oferty" className="hover:underline">Oferty</a> {/* This link might need to be dynamic or removed if no /oferty page exists yet */}
              <svg className="fill-current w-3 h-3 mx-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10.293 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4z"/></svg>
            </li>
            <li>
              <span className="text-gray-700">{offer.city}</span>
            </li>
          </ol>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
          {offer.title}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Galeria Zdjęć</h2>
              {offer.images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {offer.images.map((src, index) => (
                    <img key={index} src={src} alt={`Zdjęcie oferty ${index + 1}`} className="w-full h-48 object-cover rounded-lg shadow-md" />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                  <p className="ml-2 text-gray-500">Brak zdjęć do wyświetlenia.</p>
                </div>
              )}
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Opis</h2>
              <div
                className="prose prose-lg max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: offer.description }}
              />
            </section>
          </div>

          <aside className="md:col-span-1 space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Lokalizacja</h2>
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden shadow-md">
                {offer.mapEmbedUrl ? (
                  <iframe
                    src={offer.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa lokalizacji"
                  ></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <MapPin className="w-10 h-10 text-gray-400" />
                    <p className="ml-2 text-gray-500">Mapa wkrótce</p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-1 inline-block" /> {offer.address}
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-700 mb-3">Kontakt i Rezerwacja</h2>
              <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                {offer.phone && (
                  <p className="text-gray-700 mb-2 flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-primary" /> {offer.phone}
                  </p>
                )}
                {offer.email && (
                  <p className="text-gray-700 mb-3 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-primary" /> <a href={`mailto:${offer.email}`} className="hover:underline">{offer.email}</a>
                  </p>
                )}
                <Button className="w-full bg-primary hover:bg-primary-dark">
                  <ExternalLink className="w-4 h-4 mr-2" /> Zapytaj o Ofertę / Strona Obiektu
                </Button>
                <p className="mt-3 text-xs text-gray-500 text-center">
                  Kliknięcie przekieruje na stronę obiektu lub otworzy formularz kontaktowy.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OfferTemplatePage;
