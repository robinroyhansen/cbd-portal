import { Metadata } from 'next';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { getHreflangAlternates } from '@/components/HreflangTags';
import { getLanguage } from '@/lib/get-language';
import { getLocaleSync, createTranslator } from '@/../locales';
import type { LanguageCode } from '@/lib/translation-service';

interface Props {
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  return {
    title: t('editorialPolicy.metaTitle') || 'Editorial Policy | CBD Portal',
    description: t('editorialPolicy.metaDescription') || 'Learn about CBD Portal editorial standards and research methodology.',
    alternates: getHreflangAlternates('/editorial-policy'),
  };
}

export default async function EditorialPolicyPage({ searchParams }: Props) {
  const { lang: langParam } = await searchParams;
  const lang = (langParam || await getLanguage()) as LanguageCode;
  const locale = getLocaleSync(lang);
  const t = createTranslator(locale);

  const getLangUrl = (path: string) => {
    if (lang === 'en') return path;
    return path.includes('?') ? `${path}&lang=${lang}` : `${path}?lang=${lang}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">{t('editorialPolicy.title')}</h1>
      <p className="text-xl text-gray-600 mb-8">
        {t('editorialPolicy.subtitle')}
      </p>

      <div className="prose prose-green max-w-none">
        <h2>{t('editorialPolicy.commitmentTitle')}</h2>
        <p>
          {t('editorialPolicy.commitmentText')}
        </p>

        <h2>{t('editorialPolicy.writersTitle')}</h2>
        <p>
          {t('editorialPolicy.writersText').split('verified industry experts')[0]}
          <Link href={getLangUrl('/authors')}>{t('editorialPolicy.authorsLink')}</Link>
          {t('editorialPolicy.writersText').split('verified industry experts')[1] || ''}
        </p>
        <ul>
          <li>{t('editorialPolicy.writersItem1')}</li>
          <li>{t('editorialPolicy.writersItem2')}</li>
          <li>{t('editorialPolicy.writersItem3')}</li>
        </ul>

        <h2>{t('editorialPolicy.methodologyTitle')}</h2>
        <p>{t('editorialPolicy.methodologyText')}</p>

        <h3>{t('editorialPolicy.sourceTitle')}</h3>
        <p>
          {t('editorialPolicy.sourceText')}
        </p>
        <ul>
          <li>{t('editorialPolicy.sourceItem1')}</li>
          <li>{t('editorialPolicy.sourceItem2')}</li>
          <li>{t('editorialPolicy.sourceItem3')}</li>
          <li>{t('editorialPolicy.sourceItem4')}</li>
        </ul>

        <h3>{t('editorialPolicy.qualityTitle')}</h3>
        <p>
          {t('editorialPolicy.qualityText')}
        </p>
        <ul>
          <li>{t('editorialPolicy.qualityItem1')}</li>
          <li>{t('editorialPolicy.qualityItem2')}</li>
          <li>{t('editorialPolicy.qualityItem3')}</li>
          <li>{t('editorialPolicy.qualityItem4')}</li>
          <li>{t('editorialPolicy.qualityItem5')}</li>
        </ul>

        <h3>{t('editorialPolicy.balancedTitle')}</h3>
        <p>
          {t('editorialPolicy.balancedText')}
        </p>
        <ul>
          <li>{t('editorialPolicy.balancedItem1')}</li>
          <li>{t('editorialPolicy.balancedItem2')}</li>
          <li>{t('editorialPolicy.balancedItem3')}</li>
          <li>{t('editorialPolicy.balancedItem4')}</li>
        </ul>

        <h2>{t('editorialPolicy.citationTitle')}</h2>
        <p>
          {t('editorialPolicy.citationText')}
        </p>
        <ul>
          <li>{t('editorialPolicy.citationItem1')}</li>
          <li>{t('editorialPolicy.citationItem2')}</li>
          <li>{t('editorialPolicy.citationItem3')}</li>
        </ul>

        <h2>{t('editorialPolicy.dontDoTitle')}</h2>
        <p>{t('editorialPolicy.dontDoText')}</p>
        <ul>
          <li>{t('editorialPolicy.dontDoItem1')}</li>
          <li>{t('editorialPolicy.dontDoItem2')}</li>
          <li>{t('editorialPolicy.dontDoItem3')}</li>
          <li>{t('editorialPolicy.dontDoItem4')}</li>
          <li>{t('editorialPolicy.dontDoItem5')}</li>
          <li>{t('editorialPolicy.dontDoItem6')}</li>
        </ul>

        <h2>{t('editorialPolicy.disclaimerTitle')}</h2>
        <p>
          {t('editorialPolicy.disclaimerText')}
        </p>
        <ul>
          <li>{t('editorialPolicy.disclaimerItem1')}</li>
          <li>{t('editorialPolicy.disclaimerItem2')}</li>
          <li>{t('editorialPolicy.disclaimerItem3')}</li>
          <li>{t('editorialPolicy.disclaimerItem4')}</li>
        </ul>
        <p>
          {t('editorialPolicy.disclaimerLink')} <Link href={getLangUrl('/medical-disclaimer')}>{t('editorialPolicy.medicalDisclaimerLink')}</Link>.
        </p>

        <h2>{t('editorialPolicy.updatesTitle')}</h2>
        <p>
          {t('editorialPolicy.updatesText')}
        </p>
        <ul>
          <li>{t('editorialPolicy.updatesItem1')}</li>
          <li>{t('editorialPolicy.updatesItem2')}</li>
          <li>{t('editorialPolicy.updatesItem3')}</li>
          <li>{t('editorialPolicy.updatesItem4')}</li>
        </ul>

        <h2>{t('editorialPolicy.correctionsTitle')}</h2>
        <p>
          {t('editorialPolicy.correctionsText')}
        </p>
        <ul>
          <li>{t('editorialPolicy.correctionsItem1')}</li>
          <li>{t('editorialPolicy.correctionsItem2')}</li>
          <li>{t('editorialPolicy.correctionsItem3')}</li>
        </ul>
        <p>
          {t('editorialPolicy.correctionsLink')} <Link href={getLangUrl('/contact')}>{t('editorialPolicy.contactUs')}</Link>.
        </p>

        <h2>{t('editorialPolicy.conflictsTitle')}</h2>
        <p>
          {t('editorialPolicy.conflictsText')}
        </p>
        <ul>
          <li>{t('editorialPolicy.conflictsItem1')}</li>
          <li>{t('editorialPolicy.conflictsItem2')}</li>
          <li>{t('editorialPolicy.conflictsItem3')}</li>
        </ul>
        <p>
          {t('editorialPolicy.conflictsLink')} <Link href={getLangUrl('/authors')}>{t('editorialPolicy.authorsProfileLink')}</Link>.
        </p>

        <h2>{t('editorialPolicy.independenceTitle')}</h2>
        <p>
          {t('editorialPolicy.independenceText')}
        </p>
        <ul>
          <li>{t('editorialPolicy.independenceItem1')}</li>
          <li>{t('editorialPolicy.independenceItem2')}</li>
          <li>{t('editorialPolicy.independenceItem3')}</li>
          <li>{t('editorialPolicy.independenceItem4')}</li>
        </ul>

        <h2>{t('editorialPolicy.questionsTitle')}</h2>
        <p>
          {t('editorialPolicy.questionsText')} <Link href={getLangUrl('/contact')}>{t('editorialPolicy.contactUs')}</Link>.
        </p>
      </div>
    </div>
  );
}
