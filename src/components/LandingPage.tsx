import React from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { translations, Language } from '../lib/translations';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Zap,
  Users,
  Globe,
  History,
  Sun,
  Moon,
} from 'lucide-react';

interface LandingPageProps {
  language: Language;
  onGetStarted: () => void;
  onLanguageChange: (lang: Language) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export function LandingPage({
  language,
  onGetStarted,
  onLanguageChange,
  theme,
  onThemeToggle,
}: LandingPageProps) {
  const t = translations[language];

  return (
    <div
      className="min-h-screen bg-background font-sans overflow-x-hidden"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <Logo className="h-10" />
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              className="rounded-full hover:bg-accent"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLanguageChange(language === 'ar' ? 'en' : 'ar')}
              className="gap-2 text-foreground"
            >
              <Globe className="h-4 w-4" />
              {language === 'ar' ? 'English' : 'العربية'}
            </Button>
            <Button
              onClick={onGetStarted}
              className="rounded-full px-6 shadow-lg shadow-primary/20"
            >
              {t.getStarted}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-secondary rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
              {t.heroTitle}
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="rounded-full px-8 h-14 text-lg shadow-xl shadow-primary/20 gap-2 group"
            >
              {t.getStarted}
              <ArrowRight
                className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`}
              />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 h-14 text-lg border-border text-foreground"
            >
              {t.browseTenders}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section - Placeholders for real data */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: t.activeTenders, value: '...', icon: BarChart3, color: 'text-primary' },
              {
                label: t.totalValue,
                value: '...',
                icon: ShieldCheck,
                color: 'text-secondary-foreground',
              },
              { label: t.registeredVendors, value: '...', icon: Users, color: 'text-primary' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card p-8 rounded-[24px] shadow-sm border border-border flex items-center gap-6"
              >
                <div className={`p-4 rounded-2xl bg-muted ${stat.color}`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-3xl font-black text-foreground">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Waiting for user content */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-bold text-foreground">Platform Capabilities</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Vision Tenders provides a comprehensive suite of tools for professional procurement
              management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Advanced Data Extraction',
                desc: 'Intelligent processing of official gazettes and tender documents.',
                icon: Zap,
              },
              {
                title: 'Strategic Monitoring',
                desc: 'Custom watchlists and alert systems for critical deadlines.',
                icon: History,
              },
              {
                title: 'Enterprise Analytics',
                desc: 'Comprehensive reporting and data visualization for informed decision making.',
                icon: BarChart3,
              },
            ].map((feature, i) => (
              <div key={i} className="space-y-4 group">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-sidebar text-sidebar-foreground border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo className="h-10" />
          <div className="flex gap-8 text-muted-foreground text-sm">
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2026 Vision International. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
