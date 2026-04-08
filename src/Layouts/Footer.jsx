import { Link } from 'react-router-dom'
import { useLanguage } from '@/components/LanguageToggle.jsx'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
                <svg width="22" height="22" viewBox="0 0 20 20" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <rect x="9.3" y="0.5" width="1.4" height="2.5" rx="0.7"/>
                  <polygon points="10,3 5.5,7.5 14.5,7.5"/>
                  <rect x="8.5" y="7.5" width="3" height="2.5"/>
                  <polygon points="10,10 3,15.5 17,15.5"/>
                  <rect x="6" y="15.5" width="8" height="3" rx="1"/>
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight">
                  <span className="text-primary">NEP</span>
                  <span className="text-foreground">-Pro</span>
                </span>
                <span className="text-[9px] text-muted-foreground tracking-widest uppercase">Event Planner</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('footer_desc')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">{t('quick_links')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">{t('home')}</Link></li>
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">{t('about')}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">{t('services')}</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/marketplace" className="text-muted-foreground hover:text-primary transition-colors">{t('marketplace')}</Link></li>
              <li><Link to="/help" className="text-muted-foreground hover:text-primary transition-colors">{t('help')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">{t('contact')}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Kathmandu, Nepal</li>
              <li>support@nep-pro.com</li>
              <li>+977 123-456-789</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()}{' '}
            <span className="font-semibold text-primary">NEP-Pro</span>. {t('all_rights_reserved')}
          </p>
        </div>
      </div>
    </footer>
  )
}
