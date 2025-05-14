import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Link } from "wouter";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [offersMenuOpen, setOffersMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Biura Coworking" className="h-12" />
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-6 text-sm font-medium items-center">
          <div>
            <Link href="/" className="hover:text-primary transition-colors">
              Przeglądaj Biura
            </Link>
          </div>
          <div className="relative">
            <button 
              onClick={() => setOffersMenuOpen(!offersMenuOpen)}
              className="hover:text-primary transition-colors flex items-center"
            >
              Oferty Lokalne <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${offersMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {offersMenuOpen && (
              <div className="absolute mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                <Link href="/oferta/warszawa" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary">
                  Warszawa
                </Link>
                <Link href="/oferta/krakow" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary">
                  Kraków
                </Link>
                <Link href="/oferta/gdansk" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary">
                  Gdańsk
                </Link>
              </div>
            )}
          </div>
          <div>
            <Link href="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
          </div>
          <div>
            <Link href="/dla-wlascicieli" className="hover:text-primary transition-colors">
              Dla Właścicieli
            </Link>
          </div>
        </nav>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />} 
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */} 
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <div>
              <Link href="/" className="text-gray-800 font-medium hover:text-primary py-2 block" onClick={() => setMobileMenuOpen(false)}>
                Przeglądaj Biura
              </Link>
            </div>
            <div>
              <p className="text-gray-600 font-medium py-2 block">Oferty Lokalne:</p>
              <Link href="/oferta/warszawa" className="text-gray-700 hover:text-primary py-1 block pl-4" onClick={() => setMobileMenuOpen(false)}>
                - Warszawa
              </Link>
              <Link href="/oferta/krakow" className="text-gray-700 hover:text-primary py-1 block pl-4" onClick={() => setMobileMenuOpen(false)}>
                - Kraków
              </Link>
              <Link href="/oferta/gdansk" className="text-gray-700 hover:text-primary py-1 block pl-4" onClick={() => setMobileMenuOpen(false)}>
                - Gdańsk
              </Link>
            </div>
            <div>
              <Link href="/blog" className="text-gray-800 font-medium hover:text-primary py-2 block" onClick={() => setMobileMenuOpen(false)}>
                Blog
              </Link>
            </div>
            <div>
              <Link href="/dla-wlascicieli" className="text-gray-800 font-medium hover:text-primary py-2 block" onClick={() => setMobileMenuOpen(false)}>
                Dla Właścicieli
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
