import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Biura Coworking. All rights reserved.</p>
        {/* Optional: Add more links like privacy policy, terms, etc. */}
        {/* <nav className="mt-2">
          <Link href="/privacy"><a className="hover:underline mx-2">Privacy Policy</a></Link>
          <Link href="/terms"><a className="hover:underline mx-2">Terms of Service</a></Link>
        </nav> */}
      </div>
    </footer>
  );
};

export default Footer; 