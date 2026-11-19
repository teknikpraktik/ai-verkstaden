/**
 * Påhittade användningsfall och hur de förhåller sig till EU:s AI-förordning
 * (EU) 2024/1689, ändrad genom (EU) 2026/1744, och GDPR (EU) 2016/679.
 * Detta är undervisningsmaterial, inte juridisk rådgivning. Alla bedömningar
 * bygger på uttalade antaganden i varje scenario. Källor och kontrollstatus
 * finns i teacher.ts.
 */

export const REFERENCE_DATE = '2026-11-19';

export type Category = 'forbjuden' | 'hogrisk' | 'transparens' | 'ingen' | 'mer-info';

export const categories: { id: Category; name: string; short: string }[] = [
  { id: 'forbjuden', name: 'Förbjuden användning (art. 5)', short: 'Förbjuden' },
  { id: 'hogrisk', name: 'Högrisksystem (art. 6 och bilaga III)', short: 'Hög risk' },
  { id: 'transparens', name: 'Krav på öppenhet (art. 50)', short: 'Öppenhet' },
  { id: 'ingen', name: 'Inga särskilda krav i AI-förordningen utöver de allmänna', short: 'Inga särskilda krav' },
  { id: 'mer-info', name: 'Det behövs mer information', short: 'Mer information' },
];

export const categoryName = (c: Category) => categories.find((x) => x.id === c)!.name;

export interface Scenario {
  id: string;
  title: string;
  description: string;
  assumptions: string[];
  answer: Category;
  /** Varför svaret blir så, med artikelhänvisning. */
  explanation: string;
  /** Återkoppling på vanliga felsvar. */
  wrong: Partial<Record<Category, string>>;
  /** Vad som skulle behöva utredas i verkligheten. */
  investigate: string[];
  /** GDPR-aspekter. */
  gdpr: string[];
  /** När reglerna i AI-förordningen som avgör svaret gäller från. */
  appliesFrom: string;
}

export const scenarios: Scenario[] = [
  {
    id: 'kanslo',
    title: 'Känsloläsaren i klassrummet',
    description: 'Det påhittade företaget Fokusbolaget säljer en kamera som sitter i klassrummet. Ett AI-system tolkar elevernas ansiktsuttryck och rapporterar till läraren vilka elever som verkar uttråkade eller oroliga.',
    assumptions: [
      'Systemet drar slutsatser om elevers känslor utifrån bilder av deras ansikten.',
      'Det används i en skola (en utbildningsinstitution).',
      'Det används inte av medicinska skäl eller säkerhetsskäl.',
    ],
    answer: 'forbjuden',
    explanation: 'AI-system som drar slutsatser om människors känslor på arbetsplatser och i utbildningsinstitutioner är förbjudna, utom när de används av medicinska skäl eller säkerhetsskäl (art. 5.1 f). Förbuden gäller sedan 2 februari 2025.',
    wrong: {
      hogrisk: 'Vissa system för känsloigenkänning är högrisk (bilaga III punkt 1). Men i skolor och på arbetsplatser är de förbjudna enligt art. 5.1 f, om inte undantaget för medicinska skäl eller säkerhetsskäl gäller – och det gör det inte enligt antagandena.',
      transparens: 'Art. 50 kräver att människor informeras om känsloigenkänning i vissa fall. Men i en skola räcker inte information – användningen är förbjuden enligt art. 5.1 f.',
      'mer-info': 'Antagandena räcker här: känslor, utbildningsinstitution och inget medicinskt syfte eller säkerhetssyfte. Då gäller förbudet i art. 5.1 f.',
      ingen: 'Det här är ett av de få fall som AI-förordningen uttryckligen förbjuder (art. 5.1 f).',
    },
    investigate: ['Används systemet verkligen i en utbildningsinstitution eller på en arbetsplats?', 'Finns ett medicinskt syfte eller säkerhetssyfte – på riktigt, inte som förevändning?'],
    gdpr: ['Bilder av elever är personuppgifter. All behandling kräver en rättslig grund (art. 6).', 'Om ansiktsbilder behandlas för att identifiera elever är det biometriska uppgifter, som är känsliga (art. 9).'],
    appliesFrom: '2 februari 2025',
  },
  {
    id: 'rattning',
    title: 'Rättningsassistenten',
    description: 'Ett påhittat gymnasium använder ett AI-system som läser elevernas provsvar och sätter poäng. Poängen används när läraren sätter betyg.',
    assumptions: [
      'Systemet bedömer elevernas läranderesultat – det gör mer än att rätta stavfel.',
      'Resultatet används som underlag för betyg.',
    ],
    answer: 'hogrisk',
    explanation: 'AI-system som är avsedda att bedöma läranderesultat räknas upp bland högrisksystemen i bilaga III punkt 3 (utbildning). Då gäller bland annat krav på riskhantering, dokumentation och mänsklig tillsyn (art. 14). Enligt ändringsförordningen (EU) 2026/1744 gäller kraven för sådana system från 2 december 2027.',
    wrong: {
      forbjuden: 'AI-förordningen förbjuder inte AI vid bedömning av elever. Det är tillåtet men räknas som högrisk med särskilda krav.',
      transparens: 'Öppenhetskraven i art. 50 gäller bland annat chattbottar och genererat innehåll. Ett system som bedömer läranderesultat är högrisk (bilaga III punkt 3).',
      ingen: 'Bedömning av läranderesultat står uttryckligen i bilaga III punkt 3. Därför är det högrisk.',
      'mer-info': 'Antagandena säger att systemet bedömer läranderesultat och påverkar betyg. Det räcker för att det ska omfattas av bilaga III punkt 3.',
    },
    investigate: ['Gör systemet bara en snäv, förberedande uppgift (art. 6.3), eller påverkar det bedömningen på riktigt?', 'Hur ser den mänskliga tillsynen ut – granskar läraren varje poäng?'],
    gdpr: ['Om ett beslut med betydande påverkan fattas enbart automatiskt har eleven som huvudregel rätt att slippa det (art. 22).', 'En konsekvensbedömning avseende dataskydd behövs troligen (art. 35).'],
    appliesFrom: '2 december 2027 (enligt (EU) 2026/1744; ursprungligen 2 augusti 2026)',
  },
  {
    id: 'chatt',
    title: 'Gymmets kundtjänstchatt',
    description: 'Det påhittade Trätorpets gym har en chatt på sin webbplats där en AI svarar på frågor om öppettider och priser.',
    assumptions: ['Människor skriver direkt med AI-systemet.', 'Det är inte självklart för användaren att det är en AI.', 'Chatten fattar inga beslut om enskilda personer.'],
    answer: 'transparens',
    explanation: 'AI-system som är avsedda att interagera direkt med människor ska utformas så att människorna får veta att de talar med en AI, om det inte är uppenbart (art. 50.1). Artikel 50 gäller från 2 augusti 2026.',
    wrong: {
      ingen: 'Chattbotten är inte högrisk, men art. 50.1 kräver att användarna får veta att de interagerar med ett AI-system.',
      hogrisk: 'Att svara på frågor om öppettider finns inte bland högriskområdena i bilaga III.',
      forbjuden: 'Chattbottar är inte förbjudna. De har ett krav på öppenhet (art. 50.1).',
      'mer-info': 'Antagandena räcker: direkt interaktion med människor och inte uppenbart att det är en AI. Då gäller art. 50.1.',
    },
    investigate: ['Är det uppenbart för en normalt uppmärksam användare att det är en AI?'],
    gdpr: ['Om användare skriver personuppgifter i chatten gäller GDPR för gymmets behandling av dem.'],
    appliesFrom: '2 augusti 2026',
  },
  {
    id: 'rekrytering',
    title: 'CV-sorteraren',
    description: 'Det påhittade företaget Norrviks Bygg låter ett AI-system ranka alla jobbansökningar. De 80 % som rankas lägst får automatiskt ett nej.',
    assumptions: ['Systemet används för att välja ut och sortera sökande till en anställning.', 'Ingen människa granskar de automatiska avslagen.'],
    answer: 'hogrisk',
    explanation: 'AI-system för rekrytering och urval, till exempel för att analysera och filtrera ansökningar och bedöma kandidater, är högrisk enligt bilaga III punkt 4. Enligt (EU) 2026/1744 gäller kraven från 2 december 2027.',
    wrong: {
      forbjuden: 'Det finns inget förbud mot AI i rekrytering, men det är högrisk (bilaga III punkt 4). Automatiska avslag utan mänsklig prövning är däremot ett problem enligt GDPR art. 22.',
      ingen: 'Rekrytering står uttryckligen i bilaga III punkt 4.',
      transparens: 'Det är mer än ett öppenhetskrav: rekrytering är ett högriskområde i bilaga III punkt 4.',
      'mer-info': 'Antagandena räcker: systemet sorterar och väljer bort sökande, vilket täcks av bilaga III punkt 4.',
    },
    investigate: ['Vilken rättslig grund har företaget för behandlingen, och hur informeras de sökande?'],
    gdpr: ['Automatiska avslag utan mänsklig prövning är beslut som enbart grundas på automatiserad behandling med betydande påverkan (art. 22).', 'En konsekvensbedömning behövs troligen (art. 35).'],
    appliesFrom: '2 december 2027 (enligt (EU) 2026/1744; ursprungligen 2 augusti 2026)',
  },
  {
    id: 'schema',
    title: 'Schemaläggaren',
    description: 'Ett påhittat gymnasium använder ett AI-system som föreslår vilka salar som ska användas för vilka lektioner, utifrån salarnas storlek och när lärarna är lediga.',
    assumptions: ['Systemet fattar inga beslut om enskilda elever och bedömer ingen.', 'Det används inte för något av områdena i bilaga III.', 'Människor interagerar inte direkt med det som med en chatt.'],
    answer: 'ingen',
    explanation: 'Systemet är varken förbjudet, högrisk eller omfattat av öppenhetskraven i art. 50. Allmänna regler gäller ändå, till exempel bestämmelsen om AI-kunnighet (art. 4), och GDPR om personuppgifter behandlas.',
    wrong: {
      hogrisk: 'Att ett system används i en skola gör det inte automatiskt till högrisk. Bilaga III punkt 3 gäller bland annat antagning, bedömning av läranderesultat och övervakning vid prov – inte salsbokning.',
      transparens: 'Art. 50 gäller bland annat system som interagerar direkt med människor och genererat innehåll. Schemaförslag omfattas inte enligt antagandena.',
      forbjuden: 'Inget i art. 5 täcker salsbokning.',
      'mer-info': 'Antagandena säger uttryckligen att systemet inte bedömer någon och inte används inom bilaga III. Då kan vi avgöra frågan.',
    },
    investigate: ['Stämmer antagandet att inga beslut fattas om enskilda elever?'],
    gdpr: ['Lärarnas namn och scheman är personuppgifter. GDPR gäller för dem även om AI-förordningen inte ställer särskilda krav.'],
    appliesFrom: '–',
  },
  {
    id: 'vagledning',
    title: 'Studievägledarboten',
    description: 'En påhittad kommun låter elever i årskurs 9 chatta med en AI om vilka gymnasieprogram som kan passa dem. Kommunen har inte berättat vad botens svar används till.',
    assumptions: ['Eleverna chattar direkt med AI:n.', 'Det är okänt om botens bedömning används när kommunen beslutar om antagning eller placering.'],
    answer: 'mer-info',
    explanation: 'Chatten omfattas i alla fall av öppenhetskravet i art. 50.1. Men om systemet också är högrisk beror på hur det används: AI som avgör tillträde eller antagning till utbildning är högrisk enligt bilaga III punkt 3. Det vet vi inte – därför behövs mer information.',
    wrong: {
      transparens: 'Art. 50.1 gäller säkert, men det räcker inte för att avgöra saken. Om botens bedömning används vid antagning kan systemet vara högrisk (bilaga III punkt 3). Det framgår inte av antagandena.',
      hogrisk: 'Det kan vara högrisk – men bara om bedömningen används för att avgöra tillträde eller antagning. Det är okänt enligt antagandena.',
      ingen: 'Det är en chatt med elever, så art. 50.1 gäller i alla fall. Och användningen vid antagning är okänd.',
      forbjuden: 'Inget i antagandena pekar mot något förbud i art. 5.',
    },
    investigate: [
      'Används botens bedömning när beslut fattas om antagning eller placering (bilaga III punkt 3)?',
      'Bedömer den vilken utbildningsnivå eleven ska få tillgång till?',
      'Gör den bara en förberedande uppgift utan att påverka beslutet (art. 6.3)?',
      'Sparas chattarna, och vem får läsa dem?',
    ],
    gdpr: ['Elevernas chattar är personuppgifter om barn. Kommunen behöver en rättslig grund (art. 6) och ska informera eleverna begripligt (art. 12–13).'],
    appliesFrom: 'Art. 50: 2 augusti 2026. Högriskkraven (om de gäller): 2 december 2027 enligt (EU) 2026/1744',
  },
  {
    id: 'avhopp',
    title: 'Avhoppsvarnaren',
    description: 'Ett påhittat gymnasium testar ett AI-system som utifrån närvaro och betyg räknar ut vilka elever som riskerar att hoppa av. En lista skickas till mentorerna.',
    assumptions: ['Systemet gör en riskbedömning av enskilda elever (profilering).', 'Det är okänt vad mentorerna gör med listan och om den påverkar beslut om eleverna.', 'Det är okänt om fler uppgifter än närvaro och betyg används.'],
    answer: 'mer-info',
    explanation: 'Att förutsäga avhopp står inte uttryckligen i bilaga III punkt 3, men punkten omfattar till exempel bedömning av läranderesultat, också när resultatet används för att styra elevens lärande. Om systemet räknas dit beror på hur listan används. Även GDPR-bedömningen beror på det. Därför behövs mer information.',
    wrong: {
      hogrisk: 'Det kan vara högrisk om resultatet används för att bedöma eleven eller styra elevens lärande (bilaga III punkt 3), men det är okänt enligt antagandena.',
      ingen: 'Systemet profilerar elever och kan påverka dem. Innan vi vet hur listan används går det inte att säga att inga särskilda krav gäller.',
      forbjuden: 'Inget i antagandena pekar mot något förbud i art. 5. (Förbudet mot känsloigenkänning gäller inte här.)',
      transparens: 'Eleverna interagerar inte direkt med systemet, så art. 50.1 är inte det centrala. Frågan är om det är högrisk – och det beror på hur listan används.',
    },
    investigate: [
      'Vad gör mentorerna med listan? Påverkar den beslut om eleven, till exempel om studieplan eller stöd?',
      'Används uppgifter om hälsa eller frånvaroorsaker (känsliga uppgifter, GDPR art. 9)?',
      'Fattas något beslut enbart automatiskt (GDPR art. 22)?',
      'Har skolan gjort en konsekvensbedömning (GDPR art. 35)?',
      'Hur ofta har systemet fel, och för vilka elever?',
    ],
    gdpr: ['Riskbedömning av enskilda elever är profilering. Det kräver rättslig grund (art. 6), information till eleverna och troligen en konsekvensbedömning (art. 35).'],
    appliesFrom: 'Beror på klassningen',
  },
];

export const scenarioById = new Map(scenarios.map((s) => [s.id, s]));

export type Fact = 'ja' | 'nej' | 'okant';

/**
 * Studievägledarboten med ett ändrat faktum: används botens bedömning när
 * beslut fattas om antagning eller placering?
 */
export function classifyGuidanceBot(usedForAdmission: Fact): { category: Category; reason: string } {
  switch (usedForAdmission) {
    case 'ja':
      return { category: 'hogrisk', reason: 'AI som avgör tillträde eller antagning till utbildning är högrisk (bilaga III punkt 3). Art. 50.1 gäller dessutom eftersom eleverna chattar med den.' };
    case 'nej':
      return { category: 'transparens', reason: 'Boten ger bara råd och påverkar inga beslut. Kvar blir öppenhetskravet i art. 50.1: eleverna ska veta att de chattar med en AI.' };
    case 'okant':
      return { category: 'mer-info', reason: 'Art. 50.1 gäller i alla fall. Om boten också är högrisk beror på om den används vid antagning – det måste utredas.' };
  }
}

export const isFact = (v: unknown): v is Fact => v === 'ja' || v === 'nej' || v === 'okant';

/** Datum ur (EU) 2024/1689 art. 113 och ändringsförordningen (EU) 2026/1744. */
export interface Milestone {
  date: string;
  iso: string;
  kind: 'ikrafttradande' | 'tillampning' | 'publicering';
  text: string;
  source: string;
}

export const milestones: Milestone[] = [
  { date: '12 juli 2024', iso: '2024-07-12', kind: 'publicering', text: 'AI-förordningen (EU) 2024/1689 publiceras i Europeiska unionens officiella tidning.', source: '(EU) 2024/1689' },
  { date: '1 augusti 2024', iso: '2024-08-01', kind: 'ikrafttradande', text: 'Förordningen träder i kraft (20 dagar efter publiceringen). Men nästan inga regler gäller ännu.', source: 'art. 113' },
  { date: '2 februari 2025', iso: '2025-02-02', kind: 'tillampning', text: 'Kapitel I och II börjar tillämpas: bland annat förbuden (art. 5) och bestämmelsen om AI-kunnighet (art. 4).', source: 'art. 113 a' },
  { date: '2 augusti 2025', iso: '2025-08-02', kind: 'tillampning', text: 'Bland annat reglerna om AI-modeller för allmänna ändamål, styrning och sanktioner börjar tillämpas.', source: 'art. 113 b' },
  { date: '27 juli 2026', iso: '2026-07-27', kind: 'ikrafttradande', text: 'Ändringsförordningen (EU) 2026/1744 (”AI-omnibus”) träder i kraft och skjuter upp bland annat högriskkraven.', source: '(EU) 2026/1744' },
  { date: '2 augusti 2026', iso: '2026-08-02', kind: 'tillampning', text: 'Huvuddelen av förordningen börjar tillämpas, bland annat öppenhetskraven i art. 50.', source: 'art. 113' },
  { date: '2 december 2027', iso: '2027-12-02', kind: 'tillampning', text: 'Kraven på högrisksystem enligt bilaga III (t.ex. utbildning och rekrytering) börjar tillämpas.', source: '(EU) 2026/1744' },
  { date: '2 augusti 2028', iso: '2028-08-02', kind: 'tillampning', text: 'Kraven på högrisksystem som ingår i produkter enligt bilaga I (art. 6.1) börjar tillämpas.', source: '(EU) 2026/1744' },
];

/** Vilka milstolpar som har passerats på ett visst datum (ÅÅÅÅ-MM-DD). */
export function passed(isoDate: string): Milestone[] {
  return milestones.filter((m) => m.iso <= isoDate);
}
