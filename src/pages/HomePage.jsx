import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { useLanguage } from '@/components/LanguageToggle.jsx'
import { Images, FileText, Wallet, Library, Shield, Users } from 'lucide-react'

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-muted/20" />

        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                  {t('hero_title')}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                  {t('hero_subtitle')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-base">
                  <Link to="/marketplace">{t('get_started')}</Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">{t('stat_assets')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">200+</div>
                  <div className="text-sm text-muted-foreground">{t('stat_vendors')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-muted-foreground">{t('stat_events')}</div>
                </div>
              </div>
            </div>

            <div className="relative aspect-square lg:aspect-auto lg:h-[600px]">
              <div className="absolute inset-0 rounded-lg bg-primary/10 backdrop-blur-3xl" />
              <img
                src="/traditional-nepali-mandap-wedding-decoration-setup.jpg"
                alt="Nepali Event Decoration"
                className="relative z-10 h-full w-full object-cover rounded-lg shadow-2xl"
              />
              <div className="absolute bottom-8 left-8 right-8 z-20 bg-card/95 backdrop-blur-sm rounded-lg border border-border p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                    <Images className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{t('live_3d_preview')}</div>
                    <div className="text-xs text-muted-foreground">{t('design_with_precision')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('features_title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('features_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Images, title: t('feature_1_title'), desc: t('feature_1_desc'), color: 'primary' },
              { icon: FileText, title: t('feature_2_title'), desc: t('feature_2_desc'), color: 'accent' },
              { icon: Wallet, title: t('feature_3_title'), desc: t('feature_3_desc'), color: 'primary' },
              { icon: Library, title: t('feature_4_title'), desc: t('feature_4_desc'), color: 'accent' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <Card key={title} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6 space-y-4">
                  <div className={`h-12 w-12 rounded-lg bg-${color}/10 flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 text-${color}`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cultural Showcase Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('cultural_library_title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('cultural_library_subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: '/traditional-nepali-mandap-wedding-structure.jpg', label: t('mandaps') },
              { src: '/nepali-pooja-thali-setup-religious-ceremony.jpg', label: t('pooja_setups') },
              { src: '/nepali-floral-decoration-arch-marigold.jpg', label: t('floral_arches') },
              { src: '/traditional-nepali-stage-decoration-cultural.jpg', label: t('stage_decor') },
            ].map((item) => (
              <div key={item.label} className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors">
                <img src={item.src} alt={item.label} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/60 flex items-end p-4">
                  <span className="text-white font-semibold">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="border-2">
              <CardContent className="pt-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">{t('for_event_hosts')}</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  {[
                    t('host_benefit_1'),
                    t('host_benefit_2'),
                    t('host_benefit_3'),
                    t('host_benefit_4'),
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link to="/marketplace">{t('start_your_design')}</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Shield className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold">{t('for_vendors')}</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  {[
                    t('vendor_benefit_1'),
                    t('vendor_benefit_2'),
                    t('vendor_benefit_3'),
                    t('vendor_benefit_4'),
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <div className="h-2 w-2 rounded-full bg-accent" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link to="/marketplace">{t('join_marketplace')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-primary/50 bg-primary/5">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                {t('cta_title')}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('cta_subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="text-base">
                  <Link to="/marketplace">{t('launch_designer')}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base bg-transparent">
                  <Link to="/about">{t('learn_more')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}
