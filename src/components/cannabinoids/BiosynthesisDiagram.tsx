'use client';

import { LocaleLink as Link } from '@/components/LocaleLink';
import { getCannabinoidBySlug, TYPE_META, CANNABINOIDS } from '@/lib/cannabinoids';

/**
 * Visual diagram showing cannabinoid biosynthesis pathways
 * Shows how CBGA is the mother cannabinoid and how others derive from it
 */

interface BiosynthesisNodeProps {
  slug: string;
  articleSlug?: string;
  isMain?: boolean;
  isAcidic?: boolean;
}

function BiosynthesisNode({ slug, articleSlug, isMain, isAcidic }: BiosynthesisNodeProps) {
  const cannabinoid = getCannabinoidBySlug(slug);
  if (!cannabinoid) return null;

  const typeInfo = TYPE_META[cannabinoid.type];
  const href = articleSlug ? `/articles/${articleSlug}` :
               cannabinoid.glossarySlug ? `/glossary/${cannabinoid.glossarySlug}` : '#';

  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center
        rounded-xl border-2 transition-all hover:shadow-lg
        ${isMain ? 'p-4 min-w-[100px]' : 'p-3 min-w-[80px]'}
        ${isAcidic
          ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:border-orange-400'
          : 'bg-white border-gray-200 hover:border-gray-400'}
      `}
    >
      <div className={`
        ${isMain ? 'w-12 h-12 text-sm' : 'w-10 h-10 text-xs'}
        rounded-lg bg-gradient-to-br ${typeInfo.bgGradient}
        flex items-center justify-center text-white font-bold
      `}>
        {cannabinoid.abbreviation}
      </div>
      <span className={`mt-2 font-semibold text-gray-900 ${isMain ? 'text-sm' : 'text-xs'}`}>
        {cannabinoid.abbreviation}
      </span>
      <span className="text-[10px] text-gray-500 text-center line-clamp-1">
        {cannabinoid.fullName.length > 15
          ? cannabinoid.fullName.substring(0, 15) + '...'
          : cannabinoid.fullName}
      </span>
    </Link>
  );
}

function Arrow({ direction = 'down', label }: { direction?: 'down' | 'right'; label?: string }) {
  if (direction === 'right') {
    return (
      <div className="flex items-center gap-1 text-gray-400 px-2">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-lg">→</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-1 text-gray-400">
      <span className="text-lg">↓</span>
      {label && <span className="text-[10px] text-gray-500">{label}</span>}
    </div>
  );
}

interface BiosynthesisDiagramProps {
  articleSlugs?: Record<string, string>;
}

export function BiosynthesisDiagram({ articleSlugs = {} }: BiosynthesisDiagramProps) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 lg:p-8 overflow-x-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Cannabinoid Biosynthesis
        </h2>
        <p className="text-gray-600">
          How cannabinoids are naturally synthesized in the cannabis plant
        </p>
      </div>

      <div className="min-w-[700px]">
        {/* Mother Cannabinoid */}
        <div className="flex justify-center mb-2">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-3">
              <span>🌱</span>
              Mother Cannabinoid
            </div>
            <BiosynthesisNode slug="cbga" articleSlug={articleSlugs['cbga']} isMain isAcidic />
          </div>
        </div>

        {/* Enzyme reactions - branches to three acidic forms */}
        <div className="flex justify-center items-center py-3">
          <div className="flex items-end gap-8 relative">
            {/* Left branch line */}
            <div className="absolute left-1/2 top-0 w-[200px] h-[2px] bg-gray-300 -translate-x-full"></div>
            {/* Right branch line */}
            <div className="absolute left-1/2 top-0 w-[200px] h-[2px] bg-gray-300"></div>
            {/* Center line down */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-[2px] h-6 bg-gray-300"></div>
            {/* Left line down */}
            <div className="absolute left-[calc(50%-200px)] top-0 w-[2px] h-6 bg-gray-300"></div>
            {/* Right line down */}
            <div className="absolute left-[calc(50%+200px)] -translate-x-full top-0 w-[2px] h-6 bg-gray-300"></div>
          </div>
        </div>

        {/* Enzyme labels */}
        <div className="flex justify-center gap-[80px] text-[10px] text-gray-500 mb-3">
          <span className="w-[120px] text-center">THCA Synthase</span>
          <span className="w-[120px] text-center">CBDA Synthase</span>
          <span className="w-[120px] text-center">CBCA Synthase</span>
        </div>

        {/* Three main acidic forms */}
        <div className="flex justify-center gap-8 mb-2">
          <BiosynthesisNode slug="thca" articleSlug={articleSlugs['thca']} isMain isAcidic />
          <BiosynthesisNode slug="cbda" articleSlug={articleSlugs['cbda']} isMain isAcidic />
          <BiosynthesisNode slug="cbca" articleSlug={articleSlugs['cbca']} isAcidic />
        </div>

        {/* Decarboxylation arrows */}
        <div className="flex justify-center gap-8 py-2">
          <div className="w-[100px] flex flex-col items-center">
            <span className="text-lg text-gray-400">↓</span>
            <span className="text-[10px] text-amber-600">Heat/Light</span>
          </div>
          <div className="w-[100px] flex flex-col items-center">
            <span className="text-lg text-gray-400">↓</span>
            <span className="text-[10px] text-amber-600">Heat/Light</span>
          </div>
          <div className="w-[80px] flex flex-col items-center">
            <span className="text-lg text-gray-400">↓</span>
            <span className="text-[10px] text-amber-600">Heat</span>
          </div>
        </div>

        {/* Main decarbed forms */}
        <div className="flex justify-center gap-8 mb-4">
          <BiosynthesisNode slug="thc" articleSlug={articleSlugs['thc']} isMain />
          <BiosynthesisNode slug="cbd" articleSlug={articleSlugs['cbd']} isMain />
          <BiosynthesisNode slug="cbc" articleSlug={articleSlugs['cbc']} />
        </div>

        {/* CBG branch (from CBGA directly) */}
        <div className="flex justify-center items-center gap-6 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <span className="text-[10px] text-gray-500 block mb-1">Direct decarb</span>
            <BiosynthesisNode slug="cbg" articleSlug={articleSlugs['cbg']} />
          </div>

          {/* THC degradation products */}
          <div className="border-l border-gray-200 pl-6 flex items-center gap-4">
            <div className="text-center">
              <span className="text-[10px] text-gray-500 block mb-1">THC + Aging</span>
              <BiosynthesisNode slug="cbn" articleSlug={articleSlugs['cbn']} />
            </div>
            <Arrow direction="right" label="Further" />
            <div className="text-center">
              <span className="text-[10px] text-gray-500 block mb-1">Oxidation</span>
              <BiosynthesisNode slug="cbl" />
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200"></div>
              <span className="text-gray-600">Acidic (raw) forms</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white border-2 border-gray-200"></div>
              <span className="text-gray-600">Neutral (heated) forms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-600 text-xs">Heat/Light</span>
              <span className="text-gray-600">= Decarboxylation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info box */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span>💡</span>
          Understanding Biosynthesis
        </h3>
        <p className="text-sm text-gray-600">
          All cannabinoids start from <strong>CBGA</strong> (cannabigerolic acid), the "mother cannabinoid."
          Enzymes in the plant convert CBGA into the three main acidic cannabinoids: THCA, CBDA, and CBCA.
          When cannabis is heated (smoking, vaping, cooking), these acidic forms lose a CO₂ molecule
          (<em>decarboxylation</em>) and become the active cannabinoids we know: THC, CBD, and CBC.
        </p>
      </div>
    </div>
  );
}
