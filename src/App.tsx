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
import DepressionTest from "./pages/DepressionTest";
import AnxietyTest from "./pages/AnxietyTest";
import StressTest from "./pages/StressTest";
import AnimalPersonalityTest from "./pages/AnimalPersonalityTest";
import MentalAgeTest from "./pages/MentalAgeTest";
import StrengthsFinderTest from "./pages/StrengthsFinderTest";
import EnneagramTest from "./pages/EnneagramTest";
import HollandTest from "./pages/HollandTest";
import Mood from "./pages/Mood";
import SandTray from "./pages/SandTray";
import Auth from "./pages/Auth";
import KnowledgeSearch from "./pages/KnowledgeSearch";
import Entertainment from "./pages/Entertainment";
import About from "./pages/About";

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
          <Route path="/test/depression" element={<DepressionTest />} />
          <Route path="/test/anxiety" element={<AnxietyTest />} />
          <Route path="/test/stress" element={<StressTest />} />
          <Route path="/test/animal-personality" element={<AnimalPersonalityTest />} />
          <Route path="/test/mental-age" element={<MentalAgeTest />} />
          <Route path="/test/strengths-finder" element={<StrengthsFinderTest />} />
          <Route path="/test/enneagram" element={<EnneagramTest />} />
          <Route path="/test/holland" element={<HollandTest />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/tree-hole" element={<TreeHole />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/sandtray" element={<SandTray />} />
          <Route path="/knowledge-search" element={<KnowledgeSearch />} />
          <Route path="/entertainment" element={<Entertainment />} />
          <Route path="/about" element={<About />} />
          
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
