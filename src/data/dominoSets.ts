export interface DominoTile {
  id: string;
  left: string;
  right: string;
  notes?: string;
}

export interface DominoSet {
  id: string;
  name: string;
  description: string;
  tiles: DominoTile[];
}

// =========================================================================
// 7-DAY MONDAY-SUNDAY WEEKLY CYCLE (NO WORD REPEATS BETWEEN ANY OF THE 7 DAYS)
// Each day contains 12 dominoes forming an exact, deterministic closed cycle.
// Across all 7 days (84 dominoes, 168 word positions), every single word is unique!
// =========================================================================

// ASTELEHENA (Day 1 - Monday)
export const DAILY_CYCLE_ASTELEHENA: DominoTile[] = [
  { id: 'dl-1-1', left: 'HALA ERE', right: 'AURREKARI', notes: 'Aurrekari = Aitzindari' },
  { id: 'dl-1-2', left: 'AITZINDARI', right: 'ONESPEN', notes: 'Onespen = Oniritzi' },
  { id: 'dl-1-3', left: 'ONIRITZI', right: 'IRIZPIDE', notes: 'Irizpide = Irizpen' },
  { id: 'dl-1-4', left: 'IRIZPEN', right: 'TXIKIKERIA', notes: 'Txikikeria = Huskeria' },
  { id: 'dl-1-5', left: 'HUSKERIA', right: 'SUSTRAI', notes: 'Sustrai = Erro' },
  { id: 'dl-1-6', left: 'ERRO', right: 'DURUNDI', notes: 'Durundi = Oihartzun' },
  { id: 'dl-1-7', left: 'OIHARTZUN', right: 'EKOIZPEN', notes: 'Ekoizpen = Produkzio' },
  { id: 'dl-1-8', left: 'PRODUKZIO', right: 'HANKAZ GORA', notes: 'Hankaz gora = Batekoz beste' },
  { id: 'dl-1-9', left: 'BATEKOZ BESTE', right: 'BATIK BAT', notes: 'Batik bat = Gehienbat' },
  { id: 'dl-1-10', left: 'GEHIENBAT', right: 'PROPIO', notes: 'Propio = Beren-beregi' },
  { id: 'dl-1-11', left: 'BEREN-BEREGI', right: 'BEHINIK BEHIN', notes: 'Behinik behin = Behintzat' },
  { id: 'dl-1-12', left: 'BEHINTZAT', right: 'DENA DEN', notes: 'Dena den = Hala ere' },
];

// ASTEARTEA (Day 2 - Tuesday)
export const DAILY_CYCLE_ASTEARTEA: DominoTile[] = [
  { id: 'dl-2-1', left: 'APIKA', right: 'ORDEA', notes: 'Ordea = Haatik' },
  { id: 'dl-2-2', left: 'HAATIK', right: 'BERAZ', notes: 'Beraz = Hortaz' },
  { id: 'dl-2-3', left: 'HORTAZ', right: 'ABILEZIA', notes: 'Abilezia = Iaiotasun' },
  { id: 'dl-2-4', left: 'IAIOTASUN', right: 'ARAUTEGI', notes: 'Arautegi = Araudi' },
  { id: 'dl-2-5', left: 'ARAUDI', right: 'IGORRI', notes: 'Igorri = Bidali' },
  { id: 'dl-2-6', left: 'BIDALI', right: 'BIGUN', notes: 'Bigun = Samur' },
  { id: 'dl-2-7', left: 'SAMUR', right: 'HERTSI', notes: 'Hertsi = Itxi' },
  { id: 'dl-2-8', left: 'ITXI', right: 'TINKO', notes: 'Tinko = Zurrun' },
  { id: 'dl-2-9', left: 'ZURRUN', right: 'BALIAGARRI', notes: 'Baliagarri = Probetxugarri' },
  { id: 'dl-2-10', left: 'PROBETXUGARRI', right: 'MEMORIA', notes: 'Memoria = Oroimen' },
  { id: 'dl-2-11', left: 'OROIMEN', right: 'BORONDATE', notes: 'Borondate = Nahimen' },
  { id: 'dl-2-12', left: 'NAHIMEN', right: 'MENTURAZ', notes: 'Menturaz = Apika' },
];

// ASTEAZKENA (Day 3 - Wednesday)
export const DAILY_CYCLE_ASTEAZKENA: DominoTile[] = [
  { id: 'dl-3-1', left: 'LAIDOGARRI', right: 'ANTZUTU', notes: 'Antzutu = Lehortu' },
  { id: 'dl-3-2', left: 'LEHORTU', right: 'ZOKORATU', notes: 'Zokoratu = Baztertu' },
  { id: 'dl-3-3', left: 'BAZTERTU', right: 'SAIHESTU', notes: 'Saihestu = Ekidin' },
  { id: 'dl-3-4', left: 'EKIDIN', right: 'DERRIGORREAN', notes: 'Derrigorrean = Halabeharrez' },
  { id: 'dl-3-5', left: 'HALABEHARREZ', right: 'HORRENBESTEZ', notes: 'Horrenbestez = Ondorioz' },
  { id: 'dl-3-6', left: 'ONDORIOZ', right: 'AHALMEN', notes: 'Ahalmen = Eskumen' },
  { id: 'dl-3-7', left: 'ESKUMEN', right: 'ARDATZ', notes: 'Ardatz = Oinarri' },
  { id: 'dl-3-8', left: 'OINARRI', right: 'TESTIGU', notes: 'Testigu = Lekuko' },
  { id: 'dl-3-9', left: 'LEKUKO', right: 'BITARTEKARI', notes: 'Bitartekari = Artekari' },
  { id: 'dl-3-10', left: 'ARTEKARI', right: 'NOLAKOTASUN', notes: 'Nolakotasun = Ezaugarri' },
  { id: 'dl-3-11', left: 'EZAUGARRI', right: 'AZTORAGARRI', notes: 'Aztoragarri = Asaldagarri' },
  { id: 'dl-3-12', left: 'ASALDAGARRI', right: 'IRAINGARRI', notes: 'Iraingarri = Laidogarri' },
];

// OSTEGUNA (Day 4 - Thursday)
export const DAILY_CYCLE_OSTEGUNA: DominoTile[] = [
  { id: 'dl-4-1', left: 'BEHATU', right: 'HUNKIGARRI', notes: 'Hunkigarri = Zirraragarri' },
  { id: 'dl-4-2', left: 'ZIRRARAGARRI', right: 'BIDEZKOTASUN', notes: 'Bidezkotasun = Zilegitasun' },
  { id: 'dl-4-3', left: 'ZILEGITASUN', right: 'GIZATASUN', notes: 'Gizatasun = Gizalege' },
  { id: 'dl-4-4', left: 'GIZALEGE', right: 'ESATERAKO', notes: 'Esaterako = Hala nola' },
  { id: 'dl-4-5', left: 'HALA NOLA', right: 'BEHINGOZ', notes: 'Behingoz = Behin betiko' },
  { id: 'dl-4-6', left: 'BEHIN BETIKO', right: 'UNE HARTAN', notes: 'Une hartan = Artean' },
  { id: 'dl-4-7', left: 'ARTEAN', right: 'AZKEN FINEAN', notes: 'Azken finean = Azken buruan' },
  { id: 'dl-4-8', left: 'AZKEN BURUAN', right: 'LOTU', notes: 'Lotu = Uztartu' },
  { id: 'dl-4-9', left: 'UZTARTU', right: 'LAUSOTU', notes: 'Lausotu = Gandutu' },
  { id: 'dl-4-10', left: 'GANDUTU', right: 'MUZINDU', notes: 'Muzindu = Zapuztu' },
  { id: 'dl-4-11', left: 'ZAPUZTU', right: 'ELKARGO', notes: 'Elkargo = Elkarte' },
  { id: 'dl-4-12', left: 'ELKARTE', right: 'IKUSKATU', notes: 'Ikuskatu = Behatu' },
];

// OSTIRALA (Day 5 - Friday)
export const DAILY_CYCLE_OSTIRALA: DominoTile[] = [
  { id: 'dl-5-1', left: 'BERMATU', right: 'HORNITU', notes: 'Hornitu = Zuzkitu' },
  { id: 'dl-5-2', left: 'ZUZKITU', right: 'URGATZI', notes: 'Urgatzi = Babestu' },
  { id: 'dl-5-3', left: 'BABESTU', right: 'AGINTARITZA', notes: 'Agintaritza = Buruzagitza' },
  { id: 'dl-5-4', left: 'BURUZAGITZA', right: 'MIATU', notes: 'Miatu = Arakatu' },
  { id: 'dl-5-5', left: 'ARAKATU', right: 'EBATSI', notes: 'Ebatsi = Ostu' },
  { id: 'dl-5-6', left: 'OSTU', right: 'HELDU', notes: 'Heldu = Eutsi' },
  { id: 'dl-5-7', left: 'EUTSI', right: 'ERANTSI', notes: 'Erantsi = Gehitu' },
  { id: 'dl-5-8', left: 'GEHITU', right: 'INPOSATU', notes: 'Inposatu = Ezarri' },
  { id: 'dl-5-9', left: 'EZARRI', right: 'IRENTSI', notes: 'Irentsi = Tragatu' },
  { id: 'dl-5-10', left: 'TRAGATU', right: 'UKATU', notes: 'Ukatu = Ezeztatu' },
  { id: 'dl-5-11', left: 'EZEZTATU', right: 'ZEDARRITU', notes: 'Zedarritu = Mugatu' },
  { id: 'dl-5-12', left: 'MUGATU', right: 'BERMEA EMAN', notes: 'Bermea eman = Bermatu' },
];

// LARUNBATA (Day 6 - Saturday)
export const DAILY_CYCLE_LARUNBATA: DominoTile[] = [
  { id: 'dl-6-1', left: 'BULTZATU', right: 'KALTE', notes: 'Kalte = Galera' },
  { id: 'dl-6-2', left: 'GALERA', right: 'KONTU', notes: 'Kontu = Afera' },
  { id: 'dl-6-3', left: 'AFERA', right: 'EGITASMO', notes: 'Egitasmo = Proiektu' },
  { id: 'dl-6-4', left: 'PROIEKTU', right: 'AZALPEN', notes: 'Azalpen = Argibide' },
  { id: 'dl-6-5', left: 'ARGIBIDE', right: 'ESLEIPEN', notes: 'Esleipen = Adjudikazio' },
  { id: 'dl-6-6', left: 'ADJUDIKAZIO', right: 'AMARRU', notes: 'Amarru = Iruzur' },
  { id: 'dl-6-7', left: 'IRUZUR', right: 'GAILENDU', notes: 'Gailendu = Nagusitu' },
  { id: 'dl-6-8', left: 'NAGUSITU', right: 'JASAN', notes: 'Jasan = Pairatu' },
  { id: 'dl-6-9', left: 'PAIRATU', right: 'OLDARTU', notes: 'Oldartu = Eraso' },
  { id: 'dl-6-10', left: 'ERASO', right: 'HALABER', notes: 'Halaber = Era berean' },
  { id: 'dl-6-11', left: 'ERA BEREAN', right: 'EZER BAINO LEHEN', notes: 'Ezer baino lehen = Lehenik' },
  { id: 'dl-6-12', left: 'LEHENIK', right: 'SUSTATU', notes: 'Sustatu = Bultzatu' },
];

// IGANDEA (Day 7 - Sunday)
export const DAILY_CYCLE_IGANDEA: DominoTile[] = [
  { id: 'dl-7-1', left: 'ALDERATU', right: 'BIDENABAR', notes: 'Bidenabar = Bide batez' },
  { id: 'dl-7-2', left: 'BIDE BATEZ', right: 'BESTALDE', notes: 'Bestalde = Gainera' },
  { id: 'dl-7-3', left: 'GAINERA', right: 'ARBUIATU', notes: 'Arbuiatu = Erdeinatu' },
  { id: 'dl-7-4', left: 'ERDEINATU', right: 'ERANSKIN', notes: 'Eranskin = Gehigarri' },
  { id: 'dl-7-5', left: 'GEHIGARRI', right: 'ERAKUSGAI', notes: 'Erakusgai = Lagin' },
  { id: 'dl-7-6', left: 'LAGIN', right: 'UNITATE', notes: 'Unitate = Ale' },
  { id: 'dl-7-7', left: 'ALE', right: 'DELIBERAMENDU', notes: 'Deliberamendu = Ebazpen' },
  { id: 'dl-7-8', left: 'EBAZPEN', right: 'IRAKASPEN', notes: 'Irakaspen = Irakastaldi' },
  { id: 'dl-7-9', left: 'IRAKASTALDI', right: 'JAKINARAZPEN', notes: 'Jakinarazpen = Notifikazio' },
  { id: 'dl-7-10', left: 'NOTIFIKAZIO', right: 'AGERRARAZI', notes: 'Agerrarazi = Azaleratu' },
  { id: 'dl-7-11', left: 'AZALERATU', right: 'ARTATU', notes: 'Artatu = Zaindu' },
  { id: 'dl-7-12', left: 'ZAINDU', right: 'ERKATU', notes: 'Erkatu = Alderatu' },
];

export const DAILY_CYCLE_MAP: { [dayIndex: number]: { name: string; tiles: DominoTile[] } } = {
  0: { name: 'Astelehena (1. Eguna)', tiles: DAILY_CYCLE_ASTELEHENA },
  1: { name: 'Asteartea (2. Eguna)', tiles: DAILY_CYCLE_ASTEARTEA },
  2: { name: 'Asteazkena (3. Eguna)', tiles: DAILY_CYCLE_ASTEAZKENA },
  3: { name: 'Osteguna (4. Eguna)', tiles: DAILY_CYCLE_OSTEGUNA },
  4: { name: 'Ostirala (5. Eguna)', tiles: DAILY_CYCLE_OSTIRALA },
  5: { name: 'Larunbata (6. Eguna)', tiles: DAILY_CYCLE_LARUNBATA },
  6: { name: 'Igandea (7. Eguna)', tiles: DAILY_CYCLE_IGANDEA },
};

export const BASQUE_SET_1: DominoTile[] = [
  ...DAILY_CYCLE_ASTELEHENA,
  ...DAILY_CYCLE_ASTEARTEA
];

export const BASQUE_SET_2: DominoTile[] = [
  ...DAILY_CYCLE_ASTEAZKENA,
  ...DAILY_CYCLE_OSTEGUNA
];

export const BASQUE_SET_3: DominoTile[] = [
  ...DAILY_CYCLE_OSTIRALA,
  ...DAILY_CYCLE_LARUNBATA
];

export const BASQUE_SET_4: DominoTile[] = [
  ...DAILY_CYCLE_IGANDEA,
  ...DAILY_CYCLE_ASTELEHENA
];

export const ALL_SETS: { [key: string]: DominoSet } = {
  'multzoa-1': {
    id: 'multzoa-1',
    name: '1. Multzoa',
    description: 'Aurreka, Onespen, Sustrai...',
    tiles: BASQUE_SET_1
  },
  'multzoa-2': {
    id: 'multzoa-2',
    name: '2. Multzoa',
    description: 'Antzutu, Zokoratu...',
    tiles: BASQUE_SET_2
  },
  'multzoa-3': {
    id: 'multzoa-3',
    name: '3. Multzoa',
    description: 'Hornitu, Urgatzi...',
    tiles: BASQUE_SET_3
  },
  'multzoa-4': {
    id: 'multzoa-4',
    name: '4. Multzoa',
    description: 'Bidenabar, Bestalde...',
    tiles: BASQUE_SET_4
  }
};

export const WEEK_DAY_NAMES = [
  'Astelehena (1. Eguna)',
  'Asteartea (2. Eguna)',
  'Asteazkena (3. Eguna)',
  'Osteguna (4. Eguna)',
  'Ostirala (5. Eguna)',
  'Larunbata (6. Eguna)',
  'Igandea (7. Eguna)'
];

/**
 * Returns the exact 12-tile set for the given date.
 * Guarantee: In the Monday-Sunday cycle, ZERO words repeat between any of the 7 days!
 */
export function getDaily12Tiles(dateStr: string): DominoTile[] {
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month, day);

  // Map 0 = Sunday, 1 = Monday -> 0 = Monday ... 6 = Sunday
  const dayOfWeek = date.getDay();
  const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  const dayData = DAILY_CYCLE_MAP[dayIndex] || DAILY_CYCLE_MAP[0];
  return dayData.tiles.map((t) => ({
    ...t,
    id: `daily-${dateStr}-${t.id}`
  }));
}

/**
 * Generates a self-closing subcycle of count tiles from a base set.
 */
export function generatePhaseTiles(baseTiles: DominoTile[], count: number, startOffset: number = 0): DominoTile[] {
  const total = baseTiles.length;
  const k = Math.min(count, total);
  const result: DominoTile[] = [];

  for (let i = 0; i < k; i++) {
    const originalTile = baseTiles[(startOffset + i) % total];
    result.push({
      ...originalTile,
      id: `phase-${count}-${originalTile.id}`
    });
  }

  if (k < total && k > 1) {
    const lastTile = result[k - 1];
    const prevIndex = (startOffset - 1 + total) % total;
    const closingWord = baseTiles[prevIndex].right;

    result[k - 1] = {
      ...lastTile,
      right: closingWord
    };
  }

  return result;
}

/**
 * Checks if two words are synonyms within the given active tile set.
 * In our deterministic closed loop of 12 dominoes:
 * Tile i's RIGHT matches Tile (i+1)'s LEFT.
 * And Tile (N-1)'s RIGHT matches Tile 0's LEFT.
 */
export function areSynonyms(word1: string, word2: string, tiles: DominoTile[]): boolean {
  const w1 = word1.toUpperCase().trim();
  const w2 = word2.toUpperCase().trim();
  if (!w1 || !w2) return false;
  if (w1 === w2) return true;

  const len = tiles.length;
  for (let i = 0; i < len; i++) {
    const current = tiles[i];
    const next = tiles[(i + 1) % len];
    const r = current.right.toUpperCase().trim();
    const l = next.left.toUpperCase().trim();
    if ((w1 === r && w2 === l) || (w1 === l && w2 === r)) {
      return true;
    }
  }

  return false;
}

export const AVAILABLE_SETS = ALL_SETS;
export const BASQUE_ORIGINAL_SET = BASQUE_SET_1;
