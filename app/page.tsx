import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { TryOnTool } from "@/components/try-on-tool"
import { HowItWorks } from "@/components/how-it-works"
import { Features } from "@/components/features"
import { Showcase } from "@/components/showcase"
import { ApiSection } from "@/components/api-section"
import { Pricing } from "@/components/pricing"
import { Faq } from "@/components/faq"
import { Cta } from "@/components/cta"
import { SiteFooter } from "@/components/site-footer"
import { Reveal } from "@/components/reveal"

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <Hero />
        <TryOnTool />
        <Reveal>
          <HowItWorks />
        </Reveal>
        <Reveal>
          <Features />
        </Reveal>
        <Reveal>
          <Showcase />
        </Reveal>
        <ApiSection />
        <Reveal>
          <Pricing />
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
        <Reveal>
          <Cta />
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  )
}
