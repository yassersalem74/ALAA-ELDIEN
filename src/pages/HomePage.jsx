import React from "react";
import HeroSection from "../components/Home-Page/HeroSection";
import AboutSection from "../components/Home-Page/AboutSection";
import ServiceSection from "../components/Home-Page/ServiceSection";

export default function HomePage() {
  return (
    <div>
      <HeroSection></HeroSection>
      <AboutSection></AboutSection>
      <ServiceSection></ServiceSection>
    </div>
  );
}
