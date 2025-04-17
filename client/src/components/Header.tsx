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
          <div className="text-2xl font-bold flex items-center">
            <Link href="/" className="flex items-center">
              <div className="bg-primary text-white px-3 py-1 rounded">CoWork</div>
              <div className="bg-red-600 text-white px-3 py-1 rounded-md ml-1">Poland</div>
            </Link>
          </div>
        </div>
        
        <nav className="hidden md:flex space-x-6 text-sm font-medium">
          <div>
            <Link href="/" className="hover:text-primary transition-colors">
              Browse Spaces
            </Link>
          </div>
          <div>
            <Link href="/#about" className="hover:text-primary transition-colors">
              About
            </Link>
          </div>
          <div>
            <Link href="/#business" className="hover:text-primary transition-colors">
              For Business Owners
            </Link>
          </div>
          <div>
            <Link href="/#contact" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white hidden md:inline-flex font-medium"
          >
            Log in
          </Button>
          <Button 
            className="border-primary bg-primary text-white hover:bg-primary/90"
          >
            Sign up
          </Button>
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
                Browse Spaces
              </Link>
            </div>
            <div>
              <Link href="/#about" className="text-gray-800 font-medium hover:text-primary py-2 block">
                About
              </Link>
            </div>
            <div>
              <Link href="/#business" className="text-gray-800 font-medium hover:text-primary py-2 block">
                For Business Owners
              </Link>
            </div>
            <div>
              <Link href="/#contact" className="text-gray-800 font-medium hover:text-primary py-2 block">
                Contact
              </Link>
            </div>
            <Button 
              variant="outline" 
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-full font-medium"
            >
              Log in
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
