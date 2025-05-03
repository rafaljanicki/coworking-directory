import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import DetailPage from "@/pages/DetailPage";
import ForOwnersPage from "@/pages/ForOwnersPage";
import BlogListPage from "@/pages/BlogListPage";
import BlogPostPage from "@/pages/BlogPostPage";
import { HelmetProvider } from 'react-helmet-async';

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
