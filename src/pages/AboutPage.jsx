import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { useLanguage } from '@/components/LanguageToggle.jsx'
import { Target, Users, Lightbulb, TrendingUp, Heart, Globe } from 'lucide-react'

export default function AboutPage() {
  const { t } = useLanguage()

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-muted/20 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              {t('about_hero_title')}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
              {t('about_hero_subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">{t('our_mission')}</h2>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>{t('mission_para_1')}</p>
                <p>{t('mission_para_2')}</p>
                <p>{t('mission_para_3')}</p>
              </div>
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
              <img
                src="/nepali-wedding-planning-discussion-family.jpg"
                alt="Event Planning"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">{t('visualization_crisis')}</h2>
              <p className="text-lg text-muted-foreground">{t('crisis_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { pct: '40%', title: t('miscommunication'), desc: t('miscomm_desc') },
                { pct: '30%', title: t('budget_overruns'), desc: t('budget_desc') },
                { pct: '25%', title: t('execution_errors'), desc: t('exec_desc') },
              ].map((item) => (
                <Card key={item.title} className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <div className="text-2xl font-bold text-destructive">{item.pct}</div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Lightbulb className="h-4 w-4" />
                {t('the_nep_pro_solution')}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">{t('how_we_solve')}</h2>
            </div>

            <div className="space-y-6">
              {[
                { step: '1', title: t('step_1_title'), desc: t('step_1_desc') },
                { step: '2', title: t('step_2_title'), desc: t('step_2_desc') },
                { step: '3', title: t('step_3_title'), desc: t('step_3_desc') },
                { step: '4', title: t('step_4_title'), desc: t('step_4_desc') },
              ].map((item) => (
                <Card key={item.step} className="border-2 border-primary/20">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <div className="text-lg font-bold text-primary">{item.step}</div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Target Users Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">{t('who_we_serve')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('who_serve_subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardContent className="pt-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{t('event_hosts')}</h3>
                    <p className="text-sm text-muted-foreground">{t('event_hosts_subtitle')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{t('primary_use_cases')}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {[t('use_case_1'), t('use_case_2'), t('use_case_3'), t('use_case_4')].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">{t('key_benefits')}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {[t('host_key_benefit_1'), t('host_key_benefit_2'), t('host_key_benefit_3')].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Heart className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-lg bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{t('vendors_label')}</h3>
                    <p className="text-sm text-muted-foreground">{t('vendors_subtitle')}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">{t('vendor_types')}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {[t('vendor_type_1'), t('vendor_type_2'), t('vendor_type_3'), t('vendor_type_4')].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">{t('key_benefits')}</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {[t('vendor_key_benefit_1'), t('vendor_key_benefit_2'), t('vendor_key_benefit_3')].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Heart className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">{t('our_values')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t('values_subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: Globe, title: t('cultural_authenticity'), desc: t('cultural_auth_desc') },
              { icon: Target, title: t('precision_engineering'), desc: t('precision_desc') },
              { icon: Users, title: t('accessibility_first'), desc: t('accessibility_desc') },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-2 text-center">
                <CardContent className="pt-8 space-y-4">
                  <div className="mx-auto h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-7 w-7 text-primary" />
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

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-primary/50 bg-primary/5 max-w-3xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('join_digital_revolution')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t('about_cta_subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button asChild size="lg" className="text-base">
                  <Link to="/designer">{t('start_designing')}</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base bg-transparent">
                  <Link to="/marketplace">{t('explore_vendors')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}
