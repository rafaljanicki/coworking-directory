import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Biura Coworking" className="h-12" />
          </Link>
        </div>
        
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <div>
            <Link href="/" className="hover:text-primary transition-colors">
              Przeglądaj Biura
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
              <Link href="/" className="text-gray-800 font-medium hover:text-primary py-2 block">
                Przeglądaj Biura
              </Link>
            </div>
            <div>
              <Link href="/dla-wlascicieli" className="text-gray-800 font-medium hover:text-primary py-2 block">
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
