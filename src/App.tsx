import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/useTheme";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import Playground from "./pages/Playground";
import Voices from "./pages/Voices";
import Docs from "./pages/Docs";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Personas from "./pages/Personas";
import Lab from "./pages/Lab";
import Reader from "./pages/Reader";
import Projects from "./pages/Projects";
import Share from "./pages/Share";
import Status from "./pages/Status";
import NotFound from "./pages/NotFound";

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } } });

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/playground" element={<Playground />} />
                <Route path="/lab" element={<Lab />} />
                <Route path="/personas" element={<Personas />} />
                <Route path="/voices" element={<Voices />} />
                <Route path="/reader" element={<Reader />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/share/:slug" element={<Share />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/status" element={<Status />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
