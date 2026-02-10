import React from "react";
import HeroSection from "../components/Home-Page/HeroSection";
import AboutSection from "../components/Home-Page/AboutSection";
import ServiceSection from "../components/Home-Page/ServiceSection";
import PlatformSection from "../components/Home-Page/PlatformSection";
import TestimonialsSection from "../components/Home-Page/TestimonialsSection";

export default function HomePage() {
  return (
    <div>
      <HeroSection></HeroSection>
      <AboutSection></AboutSection>
      <ServiceSection></ServiceSection>
      <PlatformSection></PlatformSection>
      <TestimonialsSection></TestimonialsSection>
    </div>
  );
}
