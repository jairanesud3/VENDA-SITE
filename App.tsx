import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { HowItWorks } from './components/HowItWorks';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { Pricing } from './components/Pricing';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { Dashboard } from './components/Dashboard';

// Simple Auth & Loader State Management
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    // Simulate Google Login Delay
    setTimeout(() => {
      setIsLoading(false);
      setIsLoggedIn(true);
      window.scrollTo(0,0);
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    window.scrollTo(0,0);
  };

  // Custom Hook for Scroll Animations (Only for Landing Page)
  useEffect(() => {
    if (isLoggedIn) return; // Don't run observer on dashboard

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    const hiddenElements = document.querySelectorAll('.reveal');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => {
      hiddenElements.forEach((el) => observer.unobserve(el));
    };
  }, [isLoggedIn]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center z-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-xs font-bold text-white">G</span>
          </div>
        </div>
        <p className="mt-4 text-slate-400 font-medium animate-pulse">Conectando Conta Google...</p>
      </div>
    );
  }

  if (isLoggedIn) {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white overflow-hidden">
      <Header onLogin={handleLogin} />
      <main>
        <Hero onLogin={handleLogin} />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;