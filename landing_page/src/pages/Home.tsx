import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
// Use a static asset served from public/ for compatibility
const backgroundImg = '/frame1_background.jpg';

// Define interface for the landing page content
interface LandingPageContent {
  title: string;
  highlightText: string;
  subtitle: string;
  ctaText: string;
  backgroundImage: string;
}

// Mock data for the landing page
const landingPageData: LandingPageContent = {
  title: "A new way to see and choose your very own",
  highlightText: "Loomis Chaffee",
  subtitle: "experience.",
  ctaText: "Get Started→",
  backgroundImage: backgroundImg
};

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  // Handle scroll events for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with logo */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-[#323e48] bg-opacity-95 py-3" : "bg-transparent py-5"
      )}>
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="text-white font-serif text-xl md:text-2xl">Loomis Chaffee</div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen w-full">
        {/* Background Image with blur effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>
          <img 
            src={landingPageData.backgroundImage} 
            alt="Campus scenery" 
            className="w-full h-full object-cover blur-sm"
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 md:px-6 max-w-5xl mx-auto">
          <h1 className="font-['Adobe_Caslon_Pro'] text-[clamp(2.5rem,8vw,5rem)] tracking-tight leading-tight mb-8">
            <span className="block text-white">{landingPageData.title}</span>
            <span className="text-[#a33c41]">{landingPageData.highlightText}</span>
            <span className="block text-white">{landingPageData.subtitle}</span>
          </h1>

          {/* CTA Button */}
          <button 
            onClick={handleGetStarted}
            className="inline-block bg-[#98252b] hover:bg-[#a33c41] text-white font-bold text-lg md:text-xl px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#98252b] focus:ring-offset-black"
          >
            {landingPageData.ctaText}
          </button>
        </div>
      </section>
    </div>
  );
}
