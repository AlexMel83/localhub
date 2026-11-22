// Static region registry (mirror of localhub_back outages/regions.js).
// Used for routing, SEO, sitemap and the direct svitlo fallback.
import type { RegionInfo } from '../types/svitlo';

export const DEFAULT_REGION = 'khmelnytska-oblast';
export const STANDARD_QUEUES = ['1.1', '1.2', '2.1', '2.2', '3.1', '3.2', '4.1', '4.2', '5.1', '5.2', '6.1', '6.2'];

const SVITLO = { name: 'svitlo.live', url: 'https://svitlo.live' };

interface RegionDef extends RegionInfo {
  dtekCpu: string | null;
  legacyCpu: string | null;
}

const r = (
  slug: string,
  nameUk: string,
  nameEn: string,
  legacyCpu: string | null,
  dtekCpu: string | null,
): RegionDef => ({
  slug,
  nameUk,
  nameEn,
  official: false,
  source: SVITLO,
  queues: STANDARD_QUEUES,
  addressSearch: null,
  legacyCpu,
  dtekCpu,
});

export const SVITLO_REGIONS: RegionDef[] = [
  {
    slug: 'khmelnytska-oblast',
    nameUk: 'Хмельницька область',
    nameEn: 'Khmelnytskyi Oblast',
    official: true,
    source: { name: 'АТ «Хмельницькобленерго»', url: 'https://hoe.com.ua/page/pogodinni-vidkljuchennja' },
    queues: STANDARD_QUEUES,
    addressSearch: { defaultSettlement: 'Старокостянтинів', officialUrl: 'https://hoe.com.ua/shutdown/queue' },
    legacyCpu: 'hmelnitska-oblast',
    dtekCpu: 'khmelnytska-oblast',
  },
  r('vinnytska-oblast', 'Вінницька область', 'Vinnytsia Oblast', 'vinnitska-oblast', null),
  r('volynska-oblast', 'Волинська область', 'Volyn Oblast', 'volinska-oblast', null),
  r(
    'dnipropetrovska-oblast',
    'Дніпропетровська область',
    'Dnipropetrovsk Oblast',
    'dnipropetrovska-oblast',
    'dnipropetrovska-oblast',
  ),
  r('donetska-oblast', 'Донецька область', 'Donetsk Oblast', 'donetska-oblast', null),
  r('zhytomyrska-oblast', 'Житомирська область', 'Zhytomyr Oblast', 'jitomirska-oblast', 'zhytomyrska-oblast'),
  r('zakarpatska-oblast', 'Закарпатська область', 'Zakarpattia Oblast', 'zakarpatska-oblast', 'zakarpatska-oblast'),
  r('zaporizka-oblast', 'Запорізька область', 'Zaporizhzhia Oblast', 'zaporizka-oblast', 'zaporizka-oblast'),
  r(
    'ivano-frankivska-oblast',
    'Івано-Франківська область',
    'Ivano-Frankivsk Oblast',
    'ivano-frankivska-oblast',
    'ivano-frankivska-oblast',
  ),
  r('kyivska-oblast', 'Київська область', 'Kyiv Oblast', 'kiivska-oblast', 'kiivska-oblast'),
  r('kirovogradska-oblast', 'Кіровоградська область', 'Kirovohrad Oblast', 'kirovogradska-oblast', null),
  r('lvivska-oblast', 'Львівська область', 'Lviv Oblast', 'lvivska-oblast', 'lvivska-oblast'),
  r('mykolaivska-oblast', 'Миколаївська область', 'Mykolaiv Oblast', 'mikolaivska-oblast', null),
  r('odeska-oblast', 'Одеська область', 'Odesa Oblast', 'odeska-oblast', 'odeska-oblast'),
  r('poltavska-oblast', 'Полтавська область', 'Poltava Oblast', 'poltavska-oblast', 'poltavska-oblast'),
  r('rivnenska-oblast', 'Рівненська область', 'Rivne Oblast', 'rivnenska-oblast', 'rivnenska-oblast'),
  r('sumska-oblast', 'Сумська область', 'Sumy Oblast', 'sumska-oblast', null),
  r('ternopilska-oblast', 'Тернопільська область', 'Ternopil Oblast', 'ternopilska-oblast', 'ternopilska-oblast'),
  {
    slug: 'kharkivska-oblast',
    nameUk: 'Харківська область',
    nameEn: 'Kharkiv Oblast',
    official: true,
    source: { name: 'АТ «Харківобленерго»', url: 'https://t.me/kharkivenergy' },
    queues: STANDARD_QUEUES,
    addressSearch: { defaultSettlement: 'Балаклія', officialUrl: 'https://www.oblenergo.kharkov.ua/getinfoingao' },
    legacyCpu: 'harkivska-oblast',
    dtekCpu: 'kharkivska-oblast',
  },
  r('cherkaska-oblast', 'Черкаська область', 'Cherkasy Oblast', 'cherkaska-oblast', 'cherkaska-oblast'),
  r('chernivetska-oblast', 'Чернівецька область', 'Chernivtsi Oblast', 'chernivetska-oblast', 'chernivetska-oblast'),
  r('chernihivska-oblast', 'Чернігівська область', 'Chernihiv Oblast', 'chernigivska-oblast', 'chernihivska-oblast'),
  { ...r('kyiv', 'Київ', 'Kyiv', 'kyiv', 'kyiv'), queues: [] },
];

export function findRegion(slug: string): RegionDef | undefined {
  return SVITLO_REGIONS.find((x) => x.slug === slug);
}

/** Public part of a region definition. */
export function publicRegion(def: RegionDef): RegionInfo {
  const { slug, nameUk, nameEn, official, source, queues, addressSearch } = def;
  return { slug, nameUk, nameEn, official, source, queues, addressSearch };
}
