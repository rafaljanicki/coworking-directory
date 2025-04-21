import { useState } from "react";
import Header from "@/components/Header";
import { BaseSEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Building, Mail, MapPin, Star, Sparkles, TrendingUp, CheckCircle2 } from "lucide-react";

const ForOwnersPage = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'example'>('info');

  return (
    <>
      <BaseSEO 
        title="Dla Właścicieli Biur Coworkingowych - Biura Coworking" 
        description="Profesjonalna promocja Twojego biura coworkingowego. Zwiększ widoczność i przyciągnij więcej klientów dzięki wyróżnionym ofertom na biuracoworking.pl."
      />
      <Header />
      
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Rozwiń swoją przestrzeń coworkingową
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Zwiększ widoczność swojego biura i przyciągnij nowych klientów dzięki naszej platformie
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.location.href = 'mailto:kontakt@biuracoworking.pl?subject=Kontakt%20ze%20strony%20biuracoworking.pl'}
            >
              <Mail className="mr-2 h-4 w-4" />
              Skontaktuj się z nami
            </Button>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="md:w-2/3">
            <div className="mb-8">
              <div className="flex space-x-2 border-b mb-6">
                <button 
                  className={`py-3 px-6 font-medium ${activeTab === 'info' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('info')}
                >
                  Informacje
                </button>
                <button 
                  className={`py-3 px-6 font-medium ${activeTab === 'example' ? 'border-b-2 border-primary text-primary' : 'text-gray-600'}`}
                  onClick={() => setActiveTab('example')}
                >
                  Przykład
                </button>
              </div>
              
              {activeTab === 'info' && (
                <div className="prose max-w-none">
                  <h2 className="text-2xl font-semibold mb-4">O platformie Biura Coworking</h2>
                  <p className="mb-4">
                    Platforma Biura Coworking została stworzona, aby pomóc osobom poszukującym przestrzeni do pracy znaleźć
                    idealne miejsce w swojej okolicy. Jednocześnie pomagamy właścicielom biur coworkingowych w
                    skutecznej promocji swoich przestrzeni i dotarciu do potencjalnych klientów.
                  </p>
                  
                  <h3 className="text-xl font-semibold mt-8 mb-4">Dlaczego warto promować swoje biuro na naszej platformie?</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Zwiększ swoją widoczność</h4>
                        <p className="text-gray-600">Trafiaj do osób aktywnie poszukujących przestrzeni coworkingowych w Twojej okolicy.</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <Star className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Wyróżnij swoją ofertę</h4>
                        <p className="text-gray-600">Skorzystaj z opcji promowania, aby Twoje biuro wyróżniało się na tle konkurencji.</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Zwiększ obłożenie</h4>
                        <p className="text-gray-600">Przyciągnij nowych klientów i maksymalizuj wykorzystanie swojej przestrzeni.</p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <Building className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">Pełna kontrola nad profilem</h4>
                        <p className="text-gray-600">Zarządzaj swoim profilem, aktualizuj informacje i zdjęcia w dowolnym momencie.</p>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mt-10 mb-4">Jak wygląda promocja biura?</h3>
                  <p className="mb-4">
                    Promowane biura coworkingowe otrzymują szereg korzyści, które zwiększają ich widoczność i atrakcyjność:
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Wyróżnione tło z elegancką ramką złotą/premium</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Oznaczenie "Promowane" ze specjalną ikoną</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Pozycjonowanie na samej górze wyników wyszukiwania</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Dodatkowe zdjęcia i szczegółowe opisy usług</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Wyróżnione miejsce na mapie z większym znacznikiem</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span>Dodatkowe statystyki i informacje o odwiedzających</span>
                    </li>
                  </ul>
                  
                  <div className="bg-primary/5 p-6 rounded-lg border border-primary/20 mt-10">
                    <h3 className="text-xl font-semibold mb-3">Skontaktuj się, aby uzyskać ofertę</h3>
                    <p className="mb-4">
                      Jeśli jesteś zainteresowany promocją swojego biura coworkingowego na naszej platformie, 
                      skontaktuj się z nami, aby uzyskać spersonalizowaną ofertę cenową:
                    </p>
                    <div className="flex items-center mb-2">
                      <Mail className="h-5 w-5 text-primary mr-2" />
                      <a 
                        href="mailto:kontakt@biuracoworking.pl?subject=Kontakt%20ze%20strony%20biuracoworking.pl" 
                        className="font-medium text-primary hover:underline"
                      >
                        kontakt@biuracoworking.pl
                      </a>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Odpowiemy na Twoje zapytanie w ciągu 24 godzin i przedstawimy szczegółową ofertę promocji 
                      dopasowaną do Twoich potrzeb.
                    </p>
                  </div>
                </div>
              )}
              
              {activeTab === 'example' && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Przykład promowanego biura</h2>
                  
                  <div className="relative bg-white rounded-lg shadow-md overflow-hidden border-2 border-amber-400 mb-10">
                    
                    
                    <div className="md:flex">
                      <div className="md:w-1/3 relative h-48 md:h-auto">
                        <img 
                          src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" 
                          alt="Premium Coworking Space" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-2 right-2 bg-white rounded-full p-1">
                          <BadgeCheck className="h-5 w-5 text-amber-500" />
                        </div>
                      </div>
                      <div className="p-6 md:w-2/3 bg-gradient-to-r from-amber-50 to-white">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-gray-900">Premium Workspace</h3>
                          <div className="flex items-center gap-2">
                            <div className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Promowane
                            </div>
                            <div className="flex items-center bg-amber-100 px-2 py-1 rounded text-amber-800 text-sm">
                              <Star className="h-4 w-4 mr-1 fill-amber-500 text-amber-500" />
                              <span>4.9</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600 mb-4">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>Warszawa, Centrum</span>
                        </div>
                        <p className="text-gray-700 mb-4">
                          Ekskluzywna przestrzeń coworkingowa w centrum Warszawy. Nowoczesne wnętrza, 
                          profesjonalna obsługa i pełne wyposażenie. Idealne miejsce dla freelancerów i małych zespołów.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Dostęp 24/7</span>
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Szybkie WiFi</span>
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Sale konferencyjne</span>
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Kawa i herbata</span>
                          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-medium">Biurka prywatne</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-primary">od 50 PLN / dzień</span>
                          <Button variant="outline" className="text-primary border-primary hover:bg-primary/5">
                            Zobacz szczegóły
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-4">Co wyróżnia promowane biuro?</h3>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Złota ramka premium</strong> - natychmiast przyciąga uwagę użytkowników</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Oznaczenie "Promowane"</strong> - buduje prestiż i wiarygodność</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Tło premium</strong> - subtelny gradient nadający elegancji</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Weryfikacja jakości</strong> - znacznik potwierdzający wysoką jakość usług</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                      <span><strong>Pozycjonowanie na górze listy</strong> - promowane biura wyświetlane są jako pierwsze</span>
                    </li>
                  </ul>
                  
                  <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                    <h3 className="text-xl font-semibold mb-3">Zainteresowany promocją swojego biura?</h3>
                    <p className="mb-4">
                      Skontaktuj się z nami już dziś, aby dowiedzieć się więcej o możliwościach promocji i uzyskać indywidualną ofertę:
                    </p>
                    <Button 
                      size="lg" 
                      className="bg-primary hover:bg-primary/90 w-full md:w-auto"
                      onClick={() => window.location.href = 'mailto:kontakt@biuracoworking.pl?subject=Kontakt%20ze%20strony%20biuracoworking.pl'}
                    >
                      <Mail className="mr-2 h-4 w-4" />
                      Napisz do nas
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="md:w-1/3 bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h3 className="text-xl font-semibold mb-4">Pakiety promocyjne</h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gradient-to-r from-amber-50 to-white">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Pakiet Premium</h4>
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">Najpopularniejszy</span>
                </div>
                <ul className="text-sm space-y-2 mb-4">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Złota ramka premium</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Pozycja na górze wyników</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Wyróżnienie na mapie</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Nieograniczona ilość zdjęć</span>
                  </li>
                </ul>
                <Button 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={() => window.location.href = 'mailto:kontakt@biuracoworking.pl?subject=Wycena%20pakietu%20Premium%20-%20biuracoworking.pl'}
                >
                  Uzyskaj wycenę
                </Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Pakiet Standard</h4>
                <ul className="text-sm space-y-2 mb-4">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Wyróżnienie na liście</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Priorytetowa pozycja</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Do 10 zdjęć w galerii</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = 'mailto:kontakt@biuracoworking.pl?subject=Wycena%20pakietu%20Standard%20-%20biuracoworking.pl'}
                >
                  Uzyskaj wycenę
                </Button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Pakiet Basic</h4>
                <ul className="text-sm space-y-2 mb-4">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Wyróżnienie na liście</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary mr-2" />
                    <span>Do 5 zdjęć w galerii</span>
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = 'mailto:kontakt@biuracoworking.pl?subject=Wycena%20pakietu%20Basic%20-%20biuracoworking.pl'}
                >
                  Uzyskaj wycenę
                </Button>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-2">
                Potrzebujesz spersonalizowanej oferty?
              </p>
              <div className="flex items-center justify-center">
                <Mail className="h-4 w-4 mr-1 text-primary" />
                <a 
                  href="mailto:kontakt@biuracoworking.pl?subject=Kontakt%20ze%20strony%20biuracoworking.pl" 
                  className="font-medium text-primary hover:underline"
                >
                  kontakt@biuracoworking.pl
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForOwnersPage;