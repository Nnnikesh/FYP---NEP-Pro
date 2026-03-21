import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.jsx'
import { useLanguage } from '@/components/LanguageToggle.jsx'
import { Search, Book, Video, MessageCircle, Mail, Phone, HelpCircle, ChevronDown, ChevronUp, X, PhoneCall, Send } from 'lucide-react'

const tutorialContent = [
  {
    steps: [
      'Click "Sign Up" in the navigation bar to create your free account.',
      'Choose your role: Event Host (planning an event) or Vendor (offering services).',
      'Fill in your name, email, and a strong password.',
      'After registering, you will be logged in automatically.',
      'Explore the Marketplace to browse verified vendors right away.',
    ],
  },
  {
    steps: [
      'Go to the Marketplace page from the navigation bar.',
      'Use the Cultural Specialization filters (Newari, Brahmin, Thakuri, etc.) to narrow results.',
      'Type in the search bar to find vendors by name, location, or service.',
      'Click "Message" on any vendor card to open the booking inquiry form.',
      'Fill in your event date, location, and requirements, then click Send Inquiry.',
    ],
  },
  {
    steps: [
      'Log in to your account and go to your profile or bookings section.',
      'View all your pending, confirmed, and completed bookings in one place.',
      'Vendors will confirm or respond to your inquiry — check back for updates.',
      'You can cancel a pending booking if your plans change.',
      'After your event, leave a review for your vendor to help other hosts.',
    ],
  },
  {
    steps: [
      'Vendors must register with the Vendor role and provide a business name.',
      'After registration, the vendor profile is submitted for admin approval.',
      'Once approved, your profile appears in the Marketplace for hosts to find.',
      'Upload portfolio photos of past events to attract more clients.',
      'Manage incoming booking inquiries from your vendor dashboard.',
    ],
  },
]

export default function HelpPage() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [status, setStatus] = useState(null)
  const [expandedTutorial, setExpandedTutorial] = useState(null)
  const [showCallPopup, setShowCallPopup] = useState(false)
  const [showEmailPopup, setShowEmailPopup] = useState(false)
  const [emailForm, setEmailForm] = useState({ subject: '', message: '' })

  const faqRef = useRef(null)
  const tutorialsRef = useRef(null)
  const contactRef = useRef(null)

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const faqCategories = [
    {
      title: t('faq_cat_1'),
      icon: Book,
      items: [
        { question: 'Do I need an account to use NEP-Pro?', answer: "You can browse the Marketplace without an account. However, to send booking inquiries to vendors you will need to register as an Event Host. Click 'Sign Up' in the navigation bar — it's free." },
        { question: 'What is the difference between a Host and a Vendor?', answer: "A Host is someone planning an event (wedding, bratabandha, birthday, etc.) who browses the marketplace and books vendors. A Vendor is a business or individual offering event services (mandap setup, catering, photography, etc.) who creates a profile and receives bookings." },
        { question: 'How do I register as a vendor?', answer: "Click 'Sign Up', select the Vendor role, and provide your business name. After registering, your profile is submitted for admin review. Once approved, your business appears in the Marketplace for hosts to discover." },
      ],
    },
    {
      title: t('faq_cat_2'),
      icon: Video,
      items: [
        { question: 'How do I find a vendor for my event?', answer: "Go to the Marketplace page. Use the Cultural Specialization filters (Newari, Brahmin, Thakuri, Corporate, etc.) to narrow down vendors. You can also search by name, location, or service type using the search bar at the top." },
        { question: 'How do I send a booking inquiry?', answer: "On the Marketplace, click the 'Message' button on any vendor card. A form will appear where you fill in your event date, location, and any requirements. Submit the form and the vendor will receive your inquiry." },
        { question: 'Can I call a vendor directly?', answer: "Yes. Each vendor card shows a 'Call' button if the vendor has provided a phone number. Clicking it will open your phone dialer with the vendor's number pre-filled." },
      ],
    },
    {
      title: t('faq_cat_3'),
      icon: HelpCircle,
      items: [
        { question: 'How are vendor prices shown?', answer: "Each vendor profile displays a price range (e.g. NPR 50,000 – 1,50,000). These are indicative ranges. The final agreed amount is negotiated directly with the vendor after you send an inquiry." },
        { question: 'Are the vendors on NEP-Pro verified?', answer: "Vendors with a 'Verified' badge have been reviewed and approved by the NEP-Pro admin team. Non-verified vendors are still visible but have not yet completed the verification process." },
        { question: 'Can I cancel a booking?', answer: 'Yes. You can cancel a booking as long as it is still in Pending status. Once a vendor confirms the booking, cancellation policies depend on your agreement with the vendor.' },
      ],
    },
    {
      title: t('faq_cat_4'),
      icon: MessageCircle,
      items: [
        { question: 'How do I find vendors for my specific cultural tradition?', answer: "Use the Cultural Specialization filters on the Marketplace page. Select tags like 'Newari', 'Brahmin', 'Thakuri', or 'Corporate' to find vendors who specialize in your tradition. Each vendor profile lists their services and cultural expertise." },
        { question: "What does the 'Verified' badge mean?", answer: 'Verified vendors have been approved by our team and confirmed their business credentials. While non-verified vendors may also provide excellent service, the verified badge offers additional confidence when choosing.' },
        { question: 'Can I leave a review for a vendor?', answer: 'Yes. After your event is completed, you can leave a star rating and written review on the vendor profile. Reviews are visible to all users and help other hosts make informed decisions.' },
      ],
    },
    {
      title: t('faq_cat_5'),
      icon: HelpCircle,
      items: [
        { question: 'I cannot log in. What should I do?', answer: "Double-check your email and password. If you have forgotten your password, contact our support team via the form below and we will help you reset it. Make sure you are using the same email you registered with." },
        { question: "The Marketplace is not showing any vendors.", answer: "Make sure you have an internet connection and the backend server is running. If you are a developer, start the backend with 'npm run dev' inside the backend folder. If you are a user, try refreshing the page or contact support." },
        { question: "The language toggle isn't working correctly.", answer: 'The language toggle switches between English and Nepali (नेपाली). Some features may have incomplete translations. If you notice missing translations, please report them via the contact form below.' },
      ],
    },
  ]

  const tutorials = [
    { title: t('tut_1_title'), description: t('tut_1_desc'), duration: t('tut_1_dur') },
    { title: t('tut_2_title'), description: t('tut_2_desc'), duration: t('tut_2_dur') },
    { title: t('tut_3_title'), description: t('tut_3_desc'), duration: t('tut_3_dur') },
    { title: t('tut_4_title'), description: t('tut_4_desc'), duration: t('tut_4_dur') },
  ]

  // Filter FAQs by search query
  const filteredCategories = faqCategories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          searchQuery === '' ||
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((cat) => cat.items.length > 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('http://localhost:5001/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  const SUPPORT_PHONE = '+977 123-456-789'
  const SUPPORT_EMAIL = 'support@nep-pro.com'

  return (
    <>
      {/* Phone Call Popup */}
      {showCallPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowCallPopup(false)}>
          <div className="bg-background rounded-2xl shadow-xl p-6 w-80 space-y-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Call Support</h3>
              <button onClick={() => setShowCallPopup(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm text-center">NEP-Pro Support Team</p>
              <p className="text-xl font-bold tracking-wide">{SUPPORT_PHONE}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowCallPopup(false)}>Cancel</Button>
              <Button className="flex-1 gap-2" onClick={() => { window.location.href = `tel:${SUPPORT_PHONE.replace(/\s/g, '')}` }}>
                <PhoneCall className="h-4 w-4" /> Call Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Email Popup */}
      {showEmailPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowEmailPopup(false)}>
          <div className="bg-background rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Send Email</h3>
              <button onClick={() => setShowEmailPopup(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">To</p>
              <p className="font-medium">{SUPPORT_EMAIL}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="What do you need help with?"
                value={emailForm.subject}
                onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Describe your issue or question..."
                rows={4}
                value={emailForm.message}
                onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowEmailPopup(false)}>Cancel</Button>
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(emailForm.subject)}&body=${encodeURIComponent(emailForm.message)}`
                  setShowEmailPopup(false)
                }}
              >
                <Send className="h-4 w-4" /> Open in Mail
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-muted/20 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">{t('help_title')}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{t('help_subtitle')}</p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t('search_help_placeholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value) scrollTo(faqRef)
                }}
                className="pl-12 h-12 text-base"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                {filteredCategories.reduce((acc, c) => acc + c.items.length, 0)} result(s) found for "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-12 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Book, title: t('browse_faqs'), desc: t('browse_faqs_desc'), label: t('view_all_faqs'), color: 'primary', action: () => scrollTo(faqRef) },
              { icon: Video, title: t('video_tutorials'), desc: t('video_tutorials_desc'), label: t('watch_tutorials'), color: 'accent', action: () => scrollTo(tutorialsRef) },
              { icon: MessageCircle, title: t('contact_support'), desc: t('contact_support_desc'), label: t('send_message_btn'), color: 'primary', action: () => scrollTo(contactRef) },
            ].map(({ icon: Icon, title, desc, label, color, action }) => (
              <Card key={title} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className={`h-14 w-14 rounded-lg bg-${color}/10 flex items-center justify-center mx-auto`}>
                    <Icon className={`h-7 w-7 text-${color}`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  <Button variant="outline" size="sm" className="bg-transparent" onClick={action}>{label}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tutorials Section */}
      <section ref={tutorialsRef} className="py-16 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">{t('popular_tutorials')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tutorials.map((tutorial, index) => (
                <Card key={tutorial.title} className="hover:border-primary/50 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{tutorial.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{tutorial.description}</p>
                        <div className="text-xs text-muted-foreground">{tutorial.duration}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedTutorial(expandedTutorial === index ? null : index)}
                        className="flex items-center gap-1 shrink-0"
                      >
                        {t('read_btn')}
                        {expandedTutorial === index ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </Button>
                    </div>
                    {expandedTutorial === index && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <ol className="space-y-2">
                          {tutorialContent[index].steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                              <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold">
                                {i + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section ref={faqRef} className="py-16 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">{t('faq_title')}</h2>

            {filteredCategories.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="h-10 w-10 mx-auto mb-4 opacity-30" />
                <p>No results found for "{searchQuery}"</p>
                <Button variant="ghost" className="mt-4" onClick={() => setSearchQuery('')}>Clear search</Button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCategories.map((category) => (
                  <Card key={category.title}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <category.icon className="h-5 w-5 text-primary" />
                        </div>
                        {category.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {category.items.map((item, index) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section ref={contactRef} className="py-16 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">{t('still_need_help')}</CardTitle>
                <p className="text-muted-foreground">{t('still_need_help_subtitle')}</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('name_label')}</label>
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={t('name_placeholder')}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('email_label')}</label>
                      <Input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={t('email_placeholder')}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('subject_label')}</label>
                    <Input
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder={t('subject_placeholder_help')}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('message_label')}</label>
                    <Textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t('message_placeholder_help')}
                      rows={6}
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={status === 'loading'}>
                    {status === 'loading' ? t('sending') : t('send_message')}
                  </Button>
                  {status === 'success' && (
                    <p className="text-sm text-green-600 text-center">{t('success_message')}</p>
                  )}
                  {status === 'error' && (
                    <p className="text-sm text-destructive text-center">{t('error_message')}</p>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Contact Cards */}
            <div className="mt-10 rounded-2xl overflow-hidden" style={{ background: '#FDF6EE' }}>
              <div className="px-8 pt-8 pb-6 text-center">
                <h3 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>We'd love to hear from you</h3>
                <p className="text-sm mt-1" style={{ color: '#888' }}>Reach out through any channel — we're happy to help.</p>
              </div>

              <div className="px-8 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Card */}
                <div
                  className="group bg-white rounded-xl p-6 cursor-pointer shadow-sm border border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-orange-200"
                  onClick={() => setShowEmailPopup(true)}
                >
                  <div className="flex flex-col gap-3">
                    <div
                      className="h-11 w-11 rounded-lg flex items-center justify-center"
                      style={{ background: '#FEF0E6' }}
                    >
                      <Mail className="h-5 w-5" style={{ color: '#C2570B' }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#C2570B' }}>
                        Email Us
                      </p>
                      <p
                        className="font-semibold text-sm underline underline-offset-2 break-all"
                        style={{ color: '#C2570B' }}
                      >
                        {SUPPORT_EMAIL}
                      </p>
                      <p className="text-xs mt-1.5" style={{ color: '#aaa' }}>We reply within 24 hours</p>
                    </div>
                  </div>
                </div>

                {/* Phone Card */}
                <div
                  className="group bg-white rounded-xl p-6 cursor-pointer shadow-sm border border-transparent transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-orange-200"
                  onClick={() => setShowCallPopup(true)}
                >
                  <div className="flex flex-col gap-3">
                    <div
                      className="h-11 w-11 rounded-lg flex items-center justify-center"
                      style={{ background: '#FEF0E6' }}
                    >
                      <Phone className="h-5 w-5" style={{ color: '#C2570B' }} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#C2570B' }}>
                        Call Us
                      </p>
                      <p
                        className="font-semibold text-sm underline underline-offset-2"
                        style={{ color: '#C2570B' }}
                      >
                        {SUPPORT_PHONE}
                      </p>
                      <p className="text-xs mt-1.5" style={{ color: '#aaa' }}>Sun – Fri, 9 AM – 6 PM (NST)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Online Status Bar */}
              <div className="flex items-center justify-center gap-2 py-3 px-8 rounded-b-2xl" style={{ background: '#F0FDF4' }}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <p className="text-xs font-medium" style={{ color: '#16a34a' }}>Support team is online and ready to help</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
