import React from 'react'
import AboutHeroSection from '../components/About-Page/AboutHeroSection'
import HowItWorks from '../components/About-Page/HowItWorks'
import BuildForSection from '../components/About-Page/BuildForSection'
import ReadySection from '../components/About-Page/ReadySection'

export default function AboutUsPage() {
  return (
    <div>
      <AboutHeroSection></AboutHeroSection>
      <HowItWorks></HowItWorks>
      <BuildForSection></BuildForSection>
      <ReadySection></ReadySection>
    </div>
  )
}
