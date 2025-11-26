import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Tests from "./pages/Tests";
import Chat from "./pages/Chat";
import TreeHole from "./pages/TreeHole";
import Profile from "./pages/Profile";
import MBTITest from "./pages/MBTITest";
import LearningTest from "./pages/LearningTest";
import Mood from "./pages/Mood";
import SandTray from "./pages/SandTray";
import Auth from "./pages/Auth";
import KnowledgeSearch from "./pages/KnowledgeSearch";
import Entertainment from "./pages/Entertainment";
import SafetyQuiz from "./pages/SafetyQuiz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/test/mbti" element={<MBTITest />} />
          <Route path="/test/learning" element={<LearningTest />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/tree-hole" element={<TreeHole />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/sandtray" element={<SandTray />} />
          <Route path="/knowledge-search" element={<KnowledgeSearch />} />
          <Route path="/entertainment" element={<Entertainment />} />
          <Route path="/safety-quiz" element={<SafetyQuiz />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
