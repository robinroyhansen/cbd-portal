// Extended Research Scanner with Additional Authoritative Sources

interface ResearchItem {
  title: string;
  authors?: string;
  publication?: string;
  year?: number;
  abstract?: string;
  url: string;
  doi?: string;
  source_site: string;
  search_term_matched?: string;
}

// Additional search terms for new sources
const JOURNAL_SEARCH_TERMS = [
  'cannabidiol CBD clinical trial',
  'cannabis medical therapeutic',
  'cannabinoid therapy efficacy',
  'CBD randomized controlled trial',
  'medical cannabis systematic review',
  'cannabidiol anxiety depression',
  'cannabis pain management',
  'CBD sleep insomnia',
  'cannabinoid epilepsy seizure',
  'medical marijuana PTSD'
];

/**
 * Scan Cochrane Library for systematic reviews and meta-analyses
 * Highest quality evidence source
 */
export async function scanCochraneLibrary(): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];

  // Cochrane typically has fewer results but highest quality
  const searchTerms = [
    'cannabidiol',
    'cannabis',
    'cannabinoid',
    'medical cannabis',
    'medical marijuana'
  ];

  for (const term of searchTerms) {
    try {
      // Cochrane Library search API
      const searchParams = new URLSearchParams({
        searchText: term,
        searchType: 'basic',
        resultFormat: 'json',
        pageSize: '20'
      });

      const response = await fetch(
        `https://www.cochranelibrary.com/api/search?${searchParams}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Research Scanner)'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.results) {
          for (const item of data.results) {
            if (item.title && item.url) {
              results.push({
                title: item.title,
                authors: item.authors?.join(', '),
                publication: 'Cochrane Library',
                year: item.publicationYear || new Date().getFullYear(),
                abstract: item.abstract,
                url: item.url,
                doi: item.doi,
                source_site: 'Cochrane Library',
                search_term_matched: term
              });
            }
          }
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Error scanning Cochrane for "${term}":`, error);
    }
  }

  return results;
}

/**
 * Scan JAMA Network journals
 * High-impact medical journals
 */
export async function scanJAMANetwork(): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];

  for (const term of JOURNAL_SEARCH_TERMS.slice(0, 8)) {
    try {
      // JAMA Network search
      const searchParams = new URLSearchParams({
        query: term,
        sort: 'date',
        size: '15'
      });

      const response = await fetch(
        `https://jamanetwork.com/api/search?${searchParams}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Research Scanner)'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.articles) {
          for (const article of data.articles) {
            if (article.title && article.permalink) {
              results.push({
                title: article.title,
                authors: article.authors?.map((a: any) => a.name).join(', '),
                publication: `JAMA ${article.journal || 'Network'}`,
                year: new Date(article.publishDate).getFullYear(),
                abstract: article.abstract,
                url: `https://jamanetwork.com${article.permalink}`,
                doi: article.doi,
                source_site: 'JAMA Network',
                search_term_matched: term
              });
            }
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 600));

    } catch (error) {
      console.error(`Error scanning JAMA Network for "${term}":`, error);
    }
  }

  return results;
}

/**
 * Scan Nature Publishing Group journals
 * Premier scientific journals
 */
export async function scanNature(): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];

  for (const term of JOURNAL_SEARCH_TERMS.slice(0, 6)) {
    try {
      // Nature.com search API
      const searchParams = new URLSearchParams({
        q: term,
        order: 'date_desc',
        article_type: 'research',
        subject: 'neuroscience,pharmacology',
        limit: '20'
      });

      const response = await fetch(
        `https://www.nature.com/search/api?${searchParams}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Research Scanner)'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.results) {
          for (const article of data.results) {
            if (article.title && article.url) {
              results.push({
                title: article.title,
                authors: article.authors?.join(', '),
                publication: article.journal || 'Nature',
                year: new Date(article.date).getFullYear(),
                abstract: article.teaser,
                url: `https://www.nature.com${article.url}`,
                doi: article.doi,
                source_site: 'Nature Publishing',
                search_term_matched: term
              });
            }
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 700));

    } catch (error) {
      console.error(`Error scanning Nature for "${term}":`, error);
    }
  }

  return results;
}

/**
 * Scan ScienceDirect (Elsevier) journals
 * Comprehensive scientific database
 */
export async function scanScienceDirect(): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];

  for (const term of JOURNAL_SEARCH_TERMS.slice(0, 10)) {
    try {
      // ScienceDirect search (note: requires API key for full access)
      const searchParams = new URLSearchParams({
        query: term,
        content: 'journals',
        sort: 'date',
        count: '25',
        field: 'title,authors,publicationName,coverDate,doi,pii,description'
      });

      // This would require an Elsevier API key for full functionality
      // For now, we'll do a basic search
      const response = await fetch(
        `https://api.elsevier.com/content/search/sciencedirect?${searchParams}`,
        {
          headers: {
            'Accept': 'application/json',
            'X-ELS-APIKey': process.env.ELSEVIER_API_KEY || '',
            'User-Agent': 'Mozilla/5.0 (Research Scanner)'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data['search-results']?.entry) {
          for (const entry of data['search-results'].entry) {
            if (entry['dc:title'] && entry['prism:url']) {
              results.push({
                title: entry['dc:title'],
                authors: entry['dc:creator'],
                publication: entry['prism:publicationName'],
                year: new Date(entry['prism:coverDate']).getFullYear(),
                abstract: entry['dc:description'],
                url: entry['prism:url'],
                doi: entry['prism:doi'],
                source_site: 'ScienceDirect',
                search_term_matched: term
              });
            }
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 800));

    } catch (error) {
      console.error(`Error scanning ScienceDirect for "${term}":`, error);
    }
  }

  return results;
}

/**
 * Scan BMJ (British Medical Journal) publications
 * Authoritative medical journals
 */
export async function scanBMJ(): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];

  for (const term of JOURNAL_SEARCH_TERMS.slice(0, 8)) {
    try {
      // BMJ search
      const searchParams = new URLSearchParams({
        fulltext: term,
        submit: 'yes',
        andorexactfulltext: 'and',
        src: 'bmj',
        format_result: 'standard'
      });

      const response = await fetch(
        `https://www.bmj.com/search?${searchParams}`,
        {
          headers: {
            'Accept': 'text/html',
            'User-Agent': 'Mozilla/5.0 (Research Scanner)'
          }
        }
      );

      // Note: BMJ would need HTML parsing or a proper API
      // This is a placeholder structure
      await new Promise(resolve => setTimeout(resolve, 600));

    } catch (error) {
      console.error(`Error scanning BMJ for "${term}":`, error);
    }
  }

  return results;
}

/**
 * Scan Springer journals
 * Major scientific publisher
 */
export async function scanSpringer(): Promise<ResearchItem[]> {
  const results: ResearchItem[] = [];

  for (const term of JOURNAL_SEARCH_TERMS.slice(0, 8)) {
    try {
      // Springer API search
      const searchParams = new URLSearchParams({
        query: term,
        api_key: process.env.SPRINGER_API_KEY || '',
        s: '1',
        p: '20'
      });

      const response = await fetch(
        `http://api.springer.com/meta/v1/json?${searchParams}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.records) {
          for (const record of data.records) {
            if (record.title && record.url) {
              results.push({
                title: record.title,
                authors: record.creators?.map((c: any) => c.creator).join(', '),
                publication: record.publicationName,
                year: new Date(record.publicationDate).getFullYear(),
                abstract: record.abstract,
                url: record.url[0]?.value,
                doi: record.doi,
                source_site: 'Springer',
                search_term_matched: term
              });
            }
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      console.error(`Error scanning Springer for "${term}":`, error);
    }
  }

  return results;
}

/**
 * Master function to scan all extended sources
 */
export async function scanExtendedSources(): Promise<{
  cochrane: ResearchItem[];
  jama: ResearchItem[];
  nature: ResearchItem[];
  scienceDirect: ResearchItem[];
  bmj: ResearchItem[];
  springer: ResearchItem[];
}> {
  console.log('🔍 Starting extended source scanning...');

  const [cochraneResults, jamaResults, natureResults, scienceDirectResults, bmjResults, springerResults] =
    await Promise.allSettled([
      scanCochraneLibrary(),
      scanJAMANetwork(),
      scanNature(),
      scanScienceDirect(),
      scanBMJ(),
      scanSpringer()
    ]);

  const results = {
    cochrane: cochraneResults.status === 'fulfilled' ? cochraneResults.value : [],
    jama: jamaResults.status === 'fulfilled' ? jamaResults.value : [],
    nature: natureResults.status === 'fulfilled' ? natureResults.value : [],
    scienceDirect: scienceDirectResults.status === 'fulfilled' ? scienceDirectResults.value : [],
    bmj: bmjResults.status === 'fulfilled' ? bmjResults.value : [],
    springer: springerResults.status === 'fulfilled' ? springerResults.value : []
  };

  // Log any failures
  if (cochraneResults.status === 'rejected') {
    console.error('Cochrane scan failed:', cochraneResults.reason);
  }
  if (jamaResults.status === 'rejected') {
    console.error('JAMA scan failed:', jamaResults.reason);
  }
  if (natureResults.status === 'rejected') {
    console.error('Nature scan failed:', natureResults.reason);
  }

  console.log(`📊 Extended Results: Cochrane: ${results.cochrane.length}, JAMA: ${results.jama.length}, Nature: ${results.nature.length}, ScienceDirect: ${results.scienceDirect.length}, BMJ: ${results.bmj.length}, Springer: ${results.springer.length}`);

  return results;
}