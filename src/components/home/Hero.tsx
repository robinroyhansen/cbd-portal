'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';
import { HomePageStats } from '@/lib/stats';
import { SearchBar } from './SearchBar';
import { useEffect, useState } from 'react';
import { useLocale } from '@/hooks/useLocale';

interface HeroProps {
  stats: HomePageStats;
}

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // Optimized: Reduced from 2000ms/60 steps to 1200ms/30 steps for better performance
    const duration = 1200;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display.toLocaleString()}{suffix}</>;
}

export function Hero({ stats }: HeroProps) {
  const [loaded, setLoaded] = useState(false);
  const { t } = useLocale();

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Dynamic gradient background */}
      <div className="absolute inset-0 bg-[#0a1f1a]">
        {/* Gradient orbs */}
        <div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(20,184,166,0.5) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Grain texture */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left column - Main content */}
          {/* Optimized: Consolidated to single animation group for better performance */}
          <div
            className={`lg:col-span-7 space-y-8 transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            {/* Eyebrow */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                {t('hero.badge')}
              </span>
            </div>

            {/* Main headline */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.05] tracking-tight">
                {t('hero.title')}
                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300">
                  {t('hero.titleHighlight')}
                </span>
              </h1>
            </div>

            {/* Subheadline */}
            <div>
              <p className="text-xl text-emerald-100/70 max-w-xl leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/conditions"
                className="btn btn-white btn-lg group"
              >
                {t('hero.exploreConditions')}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/research"
                className="btn btn-outline-white btn-lg group"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('hero.browseStudies')}
              </Link>
            </div>

            {/* Search */}
            <div className="max-w-xl">
              <SearchBar />
            </div>
          </div>

          {/* Right column - Stats card */}
          {/* Optimized: Simplified animation - removed rotate, reduced duration */}
          <div className="lg:col-span-5">
            <div
              className={`relative transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: '150ms' }}
            >
              {/* Decorative ring */}
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20 rounded-3xl blur-xl" />

              {/* Main card */}
              <div className="relative bg-white/[0.03] backdrop-blur-xl rounded-3xl border border-white/10 p-8 overflow-hidden">
                {/* Inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />

                <div className="relative">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-semibold text-white">{t('stats.researchDatabase')}</h2>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
                      {t('stats.liveStats')}
                    </span>
                  </div>

                  {/* Big number */}
                  <div className="mb-8">
                    <div className="text-6xl lg:text-7xl font-bold text-white font-mono tracking-tight">
                      <AnimatedNumber value={stats.researchStudies} />
                    </div>
                    <p className="text-emerald-400/80 mt-2">{t('stats.peerReviewedStudies')}</p>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-2xl font-bold text-white font-mono">
                        <AnimatedNumber value={stats.healthConditions} />
                      </div>
                      <p className="text-sm text-white/50 mt-1">{t('stats.healthConditions')}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-2xl font-bold text-white font-mono">
                        <AnimatedNumber value={stats.studySubjectDistribution.human + stats.studySubjectDistribution.review} />
                      </div>
                      <p className="text-sm text-white/50 mt-1">{t('stats.humanStudies')}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-2xl font-bold text-white font-mono">
                        <AnimatedNumber value={stats.glossaryTerms} />
                      </div>
                      <p className="text-sm text-white/50 mt-1">{t('stats.termsExplained')}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4">
                      <div className="text-2xl font-bold text-white font-mono">
                        {stats.yearRange}
                      </div>
                      <p className="text-sm text-white/50 mt-1">{t('stats.yearsOfResearch')}</p>
                    </div>
                  </div>

                  {/* Data sources */}
                  <div className="pt-6 border-t border-white/10">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-3">{t('stats.trustedSources')}</p>
                    <div className="flex flex-wrap gap-2">
                      {['PubMed', 'Cochrane', 'ClinicalTrials.gov', 'Europe PMC'].map((source) => (
                        <span
                          key={source}
                          className="px-3 py-1.5 bg-white/5 text-white/60 text-xs rounded-lg"
                        >
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10">
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400/80">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t('stats.noProductsSold')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400/80">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t('stats.independent')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400/80">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {t('stats.transparent')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom scroll indicator */}
        {/* Optimized: Reduced delay from 800ms to 400ms */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="flex flex-col items-center gap-2 text-white/40">
            <span className="text-xs uppercase tracking-wider">{t('common.scrollToExplore')}</span>
            <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
