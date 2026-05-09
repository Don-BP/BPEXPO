import React, { useEffect } from 'react';
import LandingNav from '../components/landing/LandingNav';
import SparkleBackground from '../components/common/SparkleBackground';
import HeroSection from '../components/landing/HeroSection';
import PillarsSection from '../components/landing/PillarsSection';
import FreeVsProTeaser from '../components/landing/FreeVsProTeaser';
import PricingSnapshot from '../components/landing/PricingSnapshot';
import LandingFooter from '../components/landing/LandingFooter';

const LandingPage: React.FC = () => {
  useEffect(() => {
    document.documentElement.style.overflowY = 'auto';
    document.body.style.overflowY = 'auto';
    return () => {
      document.documentElement.style.overflowY = '';
      document.body.style.overflowY = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#1e3875] text-white">
      <SparkleBackground />
      <LandingNav />
      <main className="relative z-10 pt-16">
        <HeroSection />
        <PillarsSection />
        <FreeVsProTeaser />
        <PricingSnapshot />
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
