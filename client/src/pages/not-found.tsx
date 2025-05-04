import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  return (
    <>
      <Header />
      <main className="flex-grow flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
        <p className="text-gray-600 mb-8">Sorry, the page you are looking for does not exist.</p>
        <Link href="/">
          <a className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition-colors">
            Go Home
          </a>
        </Link>
      </main>
      <Footer />
    </>
  );
};

export default NotFound;
