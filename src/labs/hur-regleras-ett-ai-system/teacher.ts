import { defineTeacher } from '../../course/types';

const VIA_SOK =
  'Kontrollstatus: EUR-Lex/myndighetssidan gick inte att öppna direkt från arbetsmiljön (nätverksspärr) när materialet skrevs. Uppgiften är kontrollerad mot sökresultat (utdrag) från den officiella domänen och mot förordningstexten som den var känd före kontrollen – inte läst i sin helhet i primärkällan. Kontrollera mot primärkällan före publicering.';

export default defineTeacher({
  purpose:
    'Labben ger eleverna en grov karta över AI-förordningens riskindelning och hur GDPR gäller parallellt. Tyngdpunkten ligger på att bedömningar bygger på antaganden om användningen, att ”det behövs mer information” ofta är rätt svar, och att ikraftträdande och tillämpning är olika saker. Labben är undervisningsmaterial, inte juridisk rådgivning.',
  tips: [
    '**Kontrollera före varje användning** att datumen i tidslinjen fortfarande stämmer. AI-förordningen har ändrats genom (EU) 2026/1744 och fler ändringar kan komma. Se källistan och dess kontrollstatus nedan.',
    'Låt eleverna läsa antagandena högt innan de klassar. Många felsvar beror på att man hoppar över ett antagande.',
    'Studievägledarboten passar för en helklassdiskussion: låt halva klassen argumentera för ”högrisk” och halva för ”bara öppenhet” och se hur snabbt de behöver fråga efter fakta.',
    'Fördjupningen med förordningstexten passar elever som vill läsa juridisk text. Den svenska versionen finns på EUR-Lex.',
    'Om eleverna frågar om myndigheter i Sverige: IMY är tillsynsmyndighet för GDPR. För AI-förordningen har regeringen under 2026 gett uppdrag till flera myndigheter, bland andra PTS och IMY (enligt IMY:s egen nyhet, juni 2026). Utredningen SOU 2025:101 föreslog PTS som samordnande marknadskontrollmyndighet. Kontrollera aktuellt läge på regeringen.se, pts.se och imy.se – labben anger medvetet inte en fullständig ansvarsfördelning.',
  ],
  misconceptions: [
    { myth: 'Alla AI-system i skolan är högrisk.', reality: 'Bara vissa användningar i bilaga III punkt 3, som antagning, bedömning av läranderesultat, bedömning av utbildningsnivå och övervakning vid prov. Schemaläggning är inte högrisk.' },
    { myth: 'AI-förordningen gäller fullt ut sedan 1 augusti 2024.', reality: 'Den trädde i kraft då, men reglerna tillämpas stegvis: förbud från 2 februari 2025, huvuddelen från 2 augusti 2026 och högriskkraven i bilaga III från 2 december 2027 enligt (EU) 2026/1744.' },
    { myth: 'När AI-förordningen gäller behövs inte GDPR.', reality: 'Båda gäller samtidigt. AI-förordningen reglerar AI-systemet, GDPR behandlingen av personuppgifter.' },
    { myth: 'Om man inte vet är det säkrast att säga ”högrisk”.', reality: 'En korrekt bedömning kräver fakta om användningen. Att ange vilka fakta som saknas är bättre än att gissa.' },
  ],
  discussionStops: [
    'Efter känsloläsaren: Varför tror ni att EU valde att förbjuda just detta i skolor och på arbetsplatser?',
    'Efter studievägledarboten: Vem borde ansvara för att ta reda på hur boten används – kommunen, leverantören eller någon annan?',
    'Efter tidslinjen: Vad betyder det att högriskkraven skjutits upp? Vem vinner och vem förlorar på det?',
  ],
  answers: [
    { question: 'Förutsägelse: Vad gäller för AI-system som används i skolor?', answer: ['Det beror på vad systemet används till. Bara vissa användningar räknas upp i bilaga III punkt 3, en användning är förbjuden (känsloigenkänning, art. 5.1 f) och andra har inga särskilda krav.'] },
    { question: 'Känsloläsaren i klassrummet', answer: ['Förbjuden (art. 5.1 f) sedan 2 februari 2025. Undantag finns bara för medicinska skäl eller säkerhetsskäl.'] },
    { question: 'Rättningsassistenten', answer: ['Högrisk (bilaga III punkt 3, bedömning av läranderesultat). GDPR: art. 22 om beslutet i praktiken fattas enbart automatiskt, och troligen en konsekvensbedömning enligt art. 35. Art. 9 är inte aktuell enligt antagandena.'] },
    { question: 'Gymmets kundtjänstchatt', answer: ['Krav på öppenhet (art. 50.1) från 2 augusti 2026.'] },
    { question: 'CV-sorteraren', answer: ['Högrisk (bilaga III punkt 4). Automatiska avslag utan mänsklig prövning väcker också frågor enligt GDPR art. 22.'] },
    { question: 'Schemaläggaren', answer: ['Inga särskilda krav i AI-förordningen utöver de allmänna. GDPR gäller för lärarnas personuppgifter.'] },
    { question: 'Studievägledarboten', answer: ['Det behövs mer information. Art. 50.1 gäller i alla fall. Om bedömningen används vid antagning blir systemet högrisk (bilaga III punkt 3); om den bara ger råd gäller endast öppenhetskravet.'] },
    { question: 'Avhoppsvarnaren och vilka fakta som måste utredas', answer: ['Det behövs mer information. Rätt svar på flervalsfrågan: hur mentorerna använder listan, om uppgifter om hälsa eller frånvaroorsaker används, om något beslut fattas helt automatiskt. Leverantörens land och priset avgör inte klassningen.'] },
    { question: 'Från vilket datum gäller förbudet mot känsloigenkänning i skolor?', answer: ['2 februari 2025. Vanliga felsvar: 1 augusti 2024 (ikraftträdande), 2 augusti 2026 (huvuddelen), 2 december 2027 (högrisk enligt bilaga III efter ändringen).'] },
    {
      question: 'Förklara med egna ord hur ett scenario regleras',
      answer: [
        '**Exempel (rättningsassistenten):** Systemet bedömer elevers läranderesultat och är därför högrisk enligt bilaga III punkt 3. Bedömningen bygger på antagandet att poängen faktiskt påverkar betyget. Om systemet bara markerade stavfel och läraren rättade själv skulle det kunna vara en snäv uppgift enligt art. 6.3 och inte högrisk. Enligt GDPR får eleven inte bli föremål för ett beslut som enbart fattas automatiskt om det påverkar hen i betydande grad (art. 22), och skolan bör göra en konsekvensbedömning (art. 35). Förordningen trädde i kraft 1 augusti 2024, men högriskkraven för bilaga III tillämpas från 2 december 2027 enligt ändringsförordningen (EU) 2026/1744.',
      ],
    },
  ],
  sources: [
    {
      title: 'Förordning (EU) 2024/1689 (AI-förordningen) – EUR-Lex',
      url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj',
      checked: '2026-11-19',
      note: `Används för: publicering 12 juli 2024, ikraftträdande 1 augusti 2024 och stegvis tillämpning (art. 113), art. 4, art. 5.1 f, art. 6.3, art. 14, art. 50.1, bilaga III punkt 1, 3 och 4. ${VIA_SOK}`,
    },
    {
      title: 'Förordning (EU) 2026/1744 (AI-omnibus, ändring av 2024/1689) – EUR-Lex',
      url: 'https://eur-lex.europa.eu/eli/reg/2026/1744/oj',
      checked: '2026-11-19',
      note: `Används för: förordningen finns, är daterad 8 juli 2026 och publicerad i EUT 24 juli 2026 (EUR-Lex-sidan i sökindex); ikraftträdande 27 juli 2026; högriskkrav enligt bilaga III från 2 december 2027 och enligt bilaga I/art. 6.1 från 2 augusti 2028; förlängd tid till 2 december 2026 för märkningskravet i art. 50.2 för system som släppts ut före 2 augusti 2026; ändrad art. 4 (AI-kunnighet). Datumen bekräftades av flera officiella sidor i sökresultaten (kommissionens AI Act Service Desk och digital-strategy.ec.europa.eu, rådets pressmeddelande 29 juni 2026, Europaparlamentets lagstiftningsöversikt). ${VIA_SOK}`,
    },
    {
      title: 'Europeiska kommissionen: AI Omnibus enters into force',
      url: 'https://digital-strategy.ec.europa.eu/en/news/ai-omnibus-enters-force',
      checked: '2026-11-19',
      note: `Används för ikraftträdandedatum och nya tillämpningsdatum. ${VIA_SOK}`,
    },
    {
      title: 'Europeiska kommissionen: AI Act Service Desk – tidslinje för genomförandet',
      url: 'https://ai-act-service-desk.ec.europa.eu/en/ai-act/timeline/timeline-implementation-eu-ai-act',
      checked: '2026-11-19',
      note: `Används för tidslinjen. Obs: sidan för art. 113 i Service Desk visade enligt sökresultaten en blandning av ursprunglig och ändrad text. ${VIA_SOK}`,
    },
    {
      title: 'Europeiska kommissionen: Riktlinjer om förbjudna AI-metoder (art. 5)',
      url: 'https://ai-act-service-desk.ec.europa.eu/sites/default/files/2025-08/guidelines_on_prohibited_artificial_intelligence_practices_established_by_regulation_eu_20241689_ai_act_english_ied3r5nwo50xggpcfmwckm3nuc_112367-1.PDF',
      checked: '2026-11-19',
      note: `Används för att känsloigenkänning för att mäta elevers intresse och uppmärksamhet är förbjuden, och att icke-förbjuden känsloigenkänning är högrisk enligt bilaga III punkt 1 c. ${VIA_SOK}`,
    },
    {
      title: 'Förordning (EU) 2016/679 (GDPR) – EUR-Lex',
      url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj',
      checked: '2026-11-19',
      note: `Används för art. 5, 6, 9, 12–13, 22 och 35. Ordalydelsen i art. 22.1 och art. 35.1 bekräftades i sökresultatens utdrag från EUR-Lex. ${VIA_SOK}`,
    },
    {
      title: 'Förslag om digital omnibus (ändringar av bl.a. GDPR) – status (sekundärkälla)',
      url: 'https://www.lovguiden.dk/en/det-offentlige/raadet-for-den-europaeiske-union/2026-10-21-raadet-vil-beholde-gdprs-definition-af-personoplysninger-i-digital-omnibus',
      checked: '2026-11-19',
      note: 'Endast sekundärkällor (advokatbyråer och nyhetstjänster i sökresultat): förslaget om ändringar i GDPR var inte slutligt antaget per september–oktober 2026; rådet antog en förhandlingsposition 21 oktober 2026. Kunde inte verifieras mot primärkälla. Labben säger därför bara att ett förslag finns och inte var antaget på referensdatumet. Länken går till en sekundärkälla; leta upp förslaget och dess status på EUR-Lex.',
    },
    {
      title: 'IMY: IMY blir marknadskontrollmyndighet för AI-förordningen',
      url: 'https://www.imy.se/nyheter/imy-blir-marknadskontrollmyndighet-for-ai-forordningen/',
      checked: '2026-11-19',
      note: `Används för att regeringen har gett IMY uppdrag som marknadskontrollmyndighet (bl.a. brottsbekämpning och kreditvärdering) och att IMY samverkar med PTS och Finansinspektionen. Sökresultaten angav olika datum (juni 2026) och regeringsbeslut Fi2026/01365 har inte kunnat läsas. ${VIA_SOK}`,
    },
    {
      title: 'SOU 2025:101 Anpassningar till AI-förordningen',
      url: 'https://www.riksdagen.se/sv/dokument-och-lagar/dokument/statens-offentliga-utredningar/anpassningar-till-ai-forordningen_hdb3101/html/',
      checked: '2026-11-19',
      note: 'Endast via sökresultat: utredningen föreslog PTS som samordnande marknadskontrollmyndighet. Det är ett förslag, inte ett beslut. Inte kontrollerad i primärtexten.',
    },
  ],
});
