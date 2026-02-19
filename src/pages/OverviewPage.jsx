import React from 'react'
import OverviewHeroSection from '../components/Overview-Page/OverviewHeroSection'
import IdeaSection from '../components/Overview-Page/IdeaSection'
import WhySection from '../components/Overview-Page/WhySection'
import PoweredSection from '../components/Overview-Page/PoweredSection'

export default function OverviewPage() {
  return (
    <div>
      <OverviewHeroSection></OverviewHeroSection>
      <IdeaSection></IdeaSection>
      <WhySection></WhySection>
      <PoweredSection></PoweredSection>
    </div>
  )
}
