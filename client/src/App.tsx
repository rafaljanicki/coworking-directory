import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import DetailPage from "@/pages/DetailPage";
import ForOwnersPage from "@/pages/ForOwnersPage";
import BlogListPage from "@/pages/BlogListPage";
import BlogPostPage from "@/pages/BlogPostPage";
import OfertaWarszawaPage from "@/pages/OfertaWarszawaPage";
import OfertaKrakowPage from "@/pages/OfertaKrakowPage";
import OfertaGdanskPage from "@/pages/OfertaGdanskPage";
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from 'react';

// Renamed from Router to AppRouter to avoid confusion with wouter's own <Router>
// and to encapsulate the useLocation hook for the Switch.
function AppRouter() {
  const [location] = useLocation();

  // Diagnostic log to observe what wouter perceives as the current location.
  // This would be visible in the browser's console during development/testing.
  console.log("[AppRouter] Current location from wouter:", location);

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/blog" component={BlogListPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/space/:id" component={DetailPage} />
      <Route path="/dla-wlascicieli" component={ForOwnersPage} />
      <Route path="/oferta/warszawa" component={OfertaWarszawaPage} />
      <Route path="/oferta/krakow" component={OfertaKrakowPage} />
      <Route path="/oferta/gdansk" component={OfertaGdanskPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // It's good for components that need location (like analytics) 
  // to have their own instance of useLocation if they are separate from the router tree.
  const [appLocationForAnalytics] = useLocation(); 

  useEffect(() => {
    // console.log('App useEffect: GoatCounter location changed to', appLocationForAnalytics);
    if (window.goatcounter) {
      // console.log('GoatCounter script loaded, attempting to count page view for path:', appLocationForAnalytics);
      window.goatcounter.count({
        path: appLocationForAnalytics, // Explicitly pass the path to GoatCounter
      });
    } else {
      // console.log('GoatCounter script not loaded (window.goatcounter is undefined)');
    }
  }, [appLocationForAnalytics]); // Re-run effect when location changes

  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col">
        <AppRouter /> {/* Use the new AppRouter component */}
        <Toaster />
      </div>
    </HelmetProvider>
  );
}

export default App;
