import axios from 'axios';
import { env } from '../config/env.js';
import { createTtlCache } from './ttlCache.js';

const WIKIPEDIA_CACHE_TTL_MS = 10 * 60 * 1000;

const wikiCache = createTtlCache({ ttlMs: WIKIPEDIA_CACHE_TTL_MS });

const api = axios.create({
  timeout: 5000,
  headers: { 'User-Agent': env.NOMINATIM_USER_AGENT ?? 'Settled/1.0' },
});

/** OSM's `wikipedia` tag is "lang:Title" — most commonly "en:Title". */
const parseWikiTag = (tag) => {
  if (!tag) return null;
  const [maybeLang, ...rest] = tag.split(':');
  if (rest.length > 0 && /^[a-z]{2,3}$/.test(maybeLang)) {
    return { lang: maybeLang, title: rest.join(':') };
  }
  return { lang: 'en', title: tag };
};

const fetchEnwikiTitleForWikidataId = async (qid) => {
  const response = await api.get('https://www.wikidata.org/w/api.php', {
    params: {
      action: 'wbgetentities',
      ids: qid,
      props: 'sitelinks',
      sitefilter: 'enwiki',
      format: 'json',
    },
  });

  const entity = response.data?.entities?.[qid];
  return entity?.sitelinks?.enwiki?.title ?? null;
};

const fetchSummaryForTitle = async (lang, title) => {
  const response = await api.get(
    `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
  );

  const data = response.data;
  if (!data?.extract) return null;

  return {
    title: data.title ?? title,
    extract: data.extract,
    thumbnail: data.thumbnail?.source ?? null,
    url: data.content_urls?.desktop?.page ?? null,
    source: lang,
  };
};

/**
 * Wikipedia summary for a place, either from OSM's `wikipedia` extratag
 * ("lang:Title") or its `wikidata` id ("Q…"). Cached briefly like the
 * reverse-geocode cache — popular spots get clicked repeatedly. Failures are
 * soft: they return null so a place lookup never breaks because Wikipedia is
 * unreachable or has no article.
 */
export const fetchWikipediaSummary = async ({ wikipediaTag, wikidataId } = {}) => {
  try {
    const tag = parseWikiTag(wikipediaTag);
    const cacheKey = tag ? `${tag.lang}:${tag.title}` : wikidataId;
    if (!cacheKey) return null;

    const cached = wikiCache.get(cacheKey);
    if (cached !== undefined) return cached;

    let summary = null;
    if (tag) {
      summary = await fetchSummaryForTitle(tag.lang, tag.title);
    } else if (wikidataId) {
      const title = await fetchEnwikiTitleForWikidataId(wikidataId);
      if (title) summary = await fetchSummaryForTitle('en', title);
    }

    wikiCache.set(cacheKey, summary);
    return summary;
  } catch {
    return null;
  }
};
