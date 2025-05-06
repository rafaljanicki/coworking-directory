import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import DetailPage from "@/pages/DetailPage";
import ForOwnersPage from "@/pages/ForOwnersPage";
import BlogListPage from "@/pages/BlogListPage";
import BlogPostPage from "@/pages/BlogPostPage";
import { HelmetProvider } from 'react-helmet-async';
import { useEffect } from 'react';

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/blog" component={BlogListPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/space/:id" component={DetailPage} />
      <Route path="/dla-wlascicieli" component={ForOwnersPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();

  useEffect(() => {
    console.log('App useEffect: location changed to', location);
    if (window.goatcounter) {
      console.log('GoatCounter script loaded, attempting to count page view');
      window.goatcounter.count();
    } else {
      console.log('GoatCounter script not loaded (window.goatcounter is undefined)');
    }
  }, [location]); // Re-run effect when location changes

  return (
    <HelmetProvider>
      <div className="min-h-screen flex flex-col">
        <Router />
        <Toaster />
      </div>
    </HelmetProvider>
  );
}

export default App;
