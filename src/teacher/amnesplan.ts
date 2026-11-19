/**
 * Koppling till Skolverkets ämnesplan i artificiell intelligens (Gy25).
 *
 * Kontrollerad 2026-11-19 mot primärtexten: ämnesplanens webbsida och
 * PDF-version på syllabuswebb.skolverket.se (ämneskod ARTI, SKOLFS 2023:158,
 * gäller från 1 juli 2025). Det centrala innehållet för nivå 1 återges
 * ordagrant, i samma ordning och under samma rubriker som i ämnesplanen.
 *
 * Det som inte kunde kontrolleras står uttryckligen i källornas `note`:
 * Skolverkets kommentarmaterial gick inte att hämta (adressen leder till en
 * inloggningssida).
 */

export const checkedDate = '2026-11-19';

export interface PlanSource {
  title: string;
  url: string;
  /** Vad källan innehåller och hur den användes. */
  note: string;
}

export const sources: PlanSource[] = [
  {
    title: 'Ämne – Artificiell intelligens (Gymnasieskola), ämnesplan med ämneskod ARTI, Skolverket',
    url: 'https://syllabuswebb.skolverket.se/syllabuscw/jsp/subject.htm?subjectCode=ARTI&tos=gy',
    note: 'Ämnesplanens webbsida, läst i sin helhet. Sidan anger ”Gällande ämnesplan. Gäller från 1 July 2025” och versionsbeteckningen ARTIgy2.',
  },
  {
    title: 'Artificiell intelligens – ARTI – Gymnasieskola, Kommunal vuxenutbildning på gymnasial nivå (PDF), Skolverket',
    url: 'https://syllabuswebb.skolverket.se/subject/ARTI/2/pdf',
    note: 'PDF-versionen av samma ämnesplan (5 sidor, SKOLFS 2023:158), läst i sin helhet. Centralt innehåll och betygskriterier nedan är kontrollerade mot den.',
  },
  {
    title: 'Ämne – Artificiell intelligens (Gymnasieskola), tidigare ämnesplan med ämneskod ART, Skolverket',
    url: 'https://syllabuswebb.skolverket.se/syllabuscw/jsp/subject.htm?subjectCode=ART&tos=gy',
    note: 'Den tidigare ämnesplanen (SKOLFS 2023:136, kursen Artificiell intelligens 1, kurskod ARTART01, PDF: syllabuswebb.skolverket.se/subject/ART/1/pdf). Gäller för utbildning som påbörjats före 1 juli 2025. Punktlistan i det centrala innehållet för kurs 1 är ordagrant densamma som för nivå 1.',
  },
  {
    title: 'Kommentarmaterial till ämnet artificiell intelligens (Gy25), Skolverket',
    url: 'https://www.skolverket.se/download/18.453ec2dd19a0a2d0a6b28df0/1761656862656/Kommentarmaterial%20till%20%C3%A4mnet%20artificiell%20intelligens%20(Gy25).pdf',
    note: 'Kunde inte läsas: adressen skickade vidare till en inloggningssida den 19 november 2026. Kopplingen nedan bygger därför bara på ämnesplanen, inte på Skolverkets kommentarer till den.',
  },
];

/**
 * - `citat`: ordagrant ur ämnesplanen, kontrollerat mot primärtexten.
 * - `egen-formulering`: kontrollerat mot primärtexten men återgivet med egna ord.
 * - `ej-verifierat`: kunde inte kontrolleras mot primärtexten.
 */
export type Verification = 'citat' | 'egen-formulering' | 'ej-verifierat';

export const verificationLabel: Record<Verification, string> = {
  citat: 'Ordagrant ur ämnesplanen, kontrollerat',
  'egen-formulering': 'Kontrollerat mot ämnesplanen, egen formulering',
  'ej-verifierat': 'Ej kontrollerat',
};

/** Uppgifter om ämnet och nivån, som de står i ämnesplanen. */
export const course = {
  subject: 'Artificiell intelligens',
  subjectCode: 'ARTI',
  name: 'Artificiell intelligens nivå 1',
  levelCode: 'ARTI1000X',
  points: 100,
  validFrom: '2025-07-01',
  regulation: 'SKOLFS 2023:158',
  version: 'ARTIgy2',
} as const;

export const courseFacts: { text: string; verified: Verification }[] = [
  {
    text: 'Nivån heter i ämnesplanen ”Nivå 1, 100 poäng” med ”Nivåkod: ARTI1000X”. Kursen Artificiell intelligens nivå 1 omfattar alltså 100 gymnasiepoäng.',
    verified: 'citat',
  },
  { text: 'Ämnet har två nivåer: ”Nivå 2, 100 poäng, som bygger på nivå 1.” Nivå 2 har nivåkoden ARTI2000X.', verified: 'citat' },
  {
    text: 'Ämnesplanen är beslutad som SKOLFS 2023:158 och gäller från 1 juli 2025 (Gy25). För utbildning som påbörjats före 1 juli 2025 gäller den tidigare ämnesplanen med kursen Artificiell intelligens 1 (ARTART01, 100 poäng, SKOLFS 2023:136).',
    verified: 'egen-formulering',
  },
  {
    text: 'Det centrala innehållet för nivå 1 är ordnat under tre rubriker: ”Artificiell intelligens”, ”Praktisk användning av AI” och ”Förhållningssätt till AI” – 15 punkter totalt.',
    verified: 'citat',
  },
  {
    text: 'Betygskriterierna (E, C och A) gäller för ämnet som helhet och handlar om kunskaper om AI, att använda AI för att lösa enkla problem, jämförelser av mänsklig och artificiell intelligens, lagar och andra bestämmelser samt resonemang om möjligheter och risker.',
    verified: 'egen-formulering',
  },
];

/** Kort sammanfattning av ämnets syfte, med egna ord. */
export const purposeSummary =
  'Ämnet ska ge en introduktion till och överblick av AI: centrala begrepp och tekniker, hur AI fungerar och är uppbyggt, och hur det påverkar vardagen och vår bild av omvärlden. Det behandlar AI framför allt ur ett samhällsperspektiv – lagar och andra bestämmelser, juridiska, etiska, ekonomiska och säkerhetsmässiga överväganden, hållbar utveckling och likheter och skillnader mellan mänsklig och artificiell intelligens. Teori ska varvas med praktiskt arbete med digitala verktyg och programmering, och det ska finnas utrymme att diskutera etiska frågor.';

/** Ämnets fem syftespunkter, ordagrant. */
export const purposeGoals: string[] = [
  'Kunskaper om AI, dess tillämpningar, tekniker och beståndsdelar.',
  'Förmåga att använda AI i problemlösning.',
  'Kunskaper om skillnader och likheter mellan mänsklig och artificiell intelligens.',
  'Kunskaper om lagar och andra bestämmelser relevanta för AI.',
  'Förmåga att resonera om möjligheter och risker med AI och dess konsekvenser för samhället.',
];

/** Rubrikerna för det centrala innehållet, i ämnesplanens ordning. */
export const planGroups = ['Artificiell intelligens', 'Praktisk användning av AI', 'Förhållningssätt till AI'] as const;
export type PlanGroup = (typeof planGroups)[number];

export type Coverage = 'täcks' | 'delvis' | 'täcks-inte';

export const coverageLabel: Record<Coverage, string> = {
  täcks: 'Täcks',
  delvis: 'Delvis',
  'täcks-inte': 'Täcks inte',
};

export interface PlanItem {
  id: string;
  group: PlanGroup;
  /** Innehållspunkten. Inom citattecken ”…” när verified = 'citat'. */
  text: string;
  verified: Verification;
  coverage: Coverage;
  /** Kapitel (id) som behandlar punkten. */
  chapters: string[];
  /** Labbar (id) som behandlar punkten. */
  labs: string[];
  /** Hur webbplatsen täcker punkten, luckor och förslag. Markdown. */
  comment: string;
}

export const planItems: PlanItem[] = [
  // Artificiell intelligens
  {
    id: 'definition',
    group: 'Artificiell intelligens',
    text: '”Definition av AI samt centrala begrepp inom området.”',
    verified: 'citat',
    coverage: 'täcks',
    chapters: ['introduktion', 'sokning'],
    labs: ['ar-det-ai', 'programmera-en-stadrobot'],
    comment: 'Labb 1 sorterar system efter fasta regler och lärande, kapitel 2 inför agentbegreppet. Begreppslistan samlar kursens begrepp.',
  },
  {
    id: 'data',
    group: 'Artificiell intelligens',
    text: '”Vikten av data, datakvalitet för AI och val av data.”',
    verified: 'citat',
    coverage: 'täcks',
    chapters: ['introduktion', 'maskininlarning', 'etik'],
    labs: ['vad-finns-i-datamangden', 'vem-far-fel-svar', 'trana-en-klassificerare', 'trana-valj-och-testa', 'vilka-uppgifter-behover-systemet'],
    comment: 'Obalans och urval, gruppvisa fel, felmärkta punkter, tränings-, validerings- och testdata, dataläckage och dataminimering.',
  },
  {
    id: 'drivkrafter',
    group: 'Artificiell intelligens',
    text: '”Drivkrafter bakom utvecklingen av AI.”',
    verified: 'citat',
    coverage: 'täcks',
    chapters: ['introduktion'],
    labs: ['fran-expertregler-till-stora-modeller'],
    comment: 'Milstolpar 1956–2022 kopplade till data, beräkningskraft, algoritmer och investeringar.',
  },
  {
    id: 'anvandning',
    group: 'Artificiell intelligens',
    text: '”Översikt över användningen av AI, däribland prediktion, robotik, vision och generativ AI samt olika tekniker och metoder som ligger bakom dessa.”',
    verified: 'citat',
    coverage: 'delvis',
    chapters: ['maskininlarning', 'sprak', 'robotik'],
    labs: ['forutsag-ett-tal', 'styr-en-robot', 'valj-robot-for-ett-uppdrag', 'samma-mening-flera-tolkningar', 'fran-expertregler-till-stora-modeller'],
    comment:
      'Prediktion och robotik täcks. Generativ AI behandlas delvis genom nästa-ord-prediktion och jämförelsen med stora språkmodeller i labb 18. **Vision (datorseende) har ingen labb** – förslag: en genomgång av hur en bild blir tal (pixlar) och hur en bildklassificerare tränas, gärna med ett färdigt verktyg i helklass.',
  },
  {
    id: 'tekniker',
    group: 'Artificiell intelligens',
    text: '”Översikt av tekniker för AI, däribland sökning, klassificering och objektigenkänning.”',
    verified: 'citat',
    coverage: 'delvis',
    chapters: ['sokning', 'maskininlarning', 'sprak'],
    labs: ['bygg-en-graf', 'bredden-forst-och-djupet-forst', 'sok-med-kostnad-och-ledtrad', 'trana-en-klassificerare', 'sortera-meddelanden'],
    comment:
      'Sökning och klassificering täcks utförligt. **Objektigenkänning har ingen labb** – förslag: visa ett exempel där en modell hittar och ringar in föremål i en bild och diskutera hur det skiljer sig från att klassificera hela bilden. Labb 3 jämför bilddata med text- och tabelldata och kan användas som ingång.',
  },
  {
    id: 'metoder',
    group: 'Artificiell intelligens',
    text: '”Översikt av metoder och algoritmer inom AI, däribland beslutsträd, regression samt övervakat och oövervakat lärande.”',
    verified: 'citat',
    coverage: 'delvis',
    chapters: ['maskininlarning'],
    labs: ['trana-en-klassificerare', 'forutsag-ett-tal', 'grupper-utan-facit', 'lar-en-agent-med-beloning', 'oppna-ett-neuralt-natverk'],
    comment:
      'Regression, övervakat lärande (k-närmaste grannar) och oövervakat lärande (klustring) täcks, liksom förstärkningsinlärning och neurala nätverk. **Beslutsträd som inlärningsmetod har ingen labb** – trädet i labb 9 är ett spelträd för sökning, inte ett beslutsträd för klassificering. Förslag: låt eleverna bygga ett litet beslutsträd för hand på frukterna i labb 10 och jämföra med k-närmaste grannar.',
  },
  // Praktisk användning av AI
  {
    id: 'process',
    group: 'Praktisk användning av AI',
    text: '”Översikt över processen för problemlösning med AI.”',
    verified: 'citat',
    coverage: 'täcks',
    chapters: ['sokning', 'maskininlarning', 'robotik'],
    labs: ['bygg-en-graf', 'trana-valj-och-testa', 'valj-robot-for-ett-uppdrag', 'granska-ett-ai-system'],
    comment: 'Problemformulering som graf, arbetsgången träna–välja–testa, val av lösning för ett uppdrag och slutprojektets mål, data, metod och utvärdering.',
  },
  {
    id: 'enklare-problemlosning',
    group: 'Praktisk användning av AI',
    text: '”Enklare typ av problemlösning med hjälp av AI, till exempel klassificering, objektigenkänning, prediktion, tolkning och bearbetning av naturligt språk (NLP), enklare maskininlärning och användning av spelagent.”',
    verified: 'citat',
    coverage: 'delvis',
    chapters: ['sokning', 'maskininlarning', 'sprak'],
    labs: [
      'trana-en-klassificerare',
      'forutsag-ett-tal',
      'gor-text-till-data',
      'sortera-meddelanden',
      'samma-mening-flera-tolkningar',
      'tre-i-rad-mot-en-agent',
    ],
    comment:
      'Klassificering, prediktion, NLP, enklare maskininlärning och spelagent (minimax i tre i rad) täcks med egna labbar. **Objektigenkänning saknas** – förslag: samma bildexempel som under ”Översikt av tekniker för AI”, gärna som en praktisk övning där eleverna testar ett färdigt verktyg för objektigenkänning och noterar var det gör fel.',
  },
  {
    id: 'principer',
    group: 'Praktisk användning av AI',
    text: '”Principer för, och tillämpningar av, vanliga tekniker inom AI, däribland maskininlärning och robotik.”',
    verified: 'citat',
    coverage: 'täcks',
    chapters: ['maskininlarning', 'robotik'],
    labs: [
      'trana-en-klassificerare',
      'trana-valj-och-testa',
      'grupper-utan-facit',
      'oppna-ett-neuralt-natverk',
      'styr-en-robot',
      'hitta-fram-nar-kartan-forandras',
      'valj-robot-for-ett-uppdrag',
    ],
    comment: 'Kapitel 3 (maskininlärning) och kapitel 5 (robotik).',
  },
  {
    id: 'traning',
    group: 'Praktisk användning av AI',
    text: '”Metoder för enklare träning av AI.”',
    verified: 'citat',
    coverage: 'täcks',
    chapters: ['maskininlarning', 'sprak'],
    labs: ['trana-en-klassificerare', 'forutsag-ett-tal', 'trana-valj-och-testa', 'lar-en-agent-med-beloning', 'oppna-ett-neuralt-natverk', 'sortera-meddelanden'],
    comment: 'Träning med facit, med belöning och av ett litet neuralt nätverk, uppdelning i tränings-, validerings- och testdata.',
  },
  // Förhållningssätt till AI
  {
    id: 'jamforelse-manniska',
    group: 'Förhållningssätt till AI',
    text: '”Jämförelse mellan hur enklare lösningar med AI fungerar och hur en människa löser samma problem.”',
    verified: 'citat',
    coverage: 'täcks',
    chapters: ['introduktion', 'sprak'],
    labs: ['ar-det-ai', 'sortera-meddelanden', 'samma-mening-flera-tolkningar'],
    comment:
      'Labb 1 jämför uttryckligen en regelmodell och en lärande modell med mänsklig förståelse och situationsbedömning. I labb 17 och 18 jämförs modellens beslut med hur en människa läser samma text.',
  },
  {
    id: 'overlagsen',
    group: 'Förhållningssätt till AI',
    text: '”Några situationer där AI är överlägsen människan och tvärtom.”',
    verified: 'citat',
    coverage: 'delvis',
    chapters: ['introduktion', 'sokning'],
    labs: ['ar-det-ai', 'tre-i-rad-mot-en-agent'],
    comment:
      'Labb 1 visar var människan är överlägsen; i labb 9 spelar minimax-agenten felfritt. Ingen labb ställer frågan direkt – förslag: ett diskussionsstopp efter labb 9 där eleverna listar uppgifter där AI är bättre (snabbhet, stora datamängder, uttömmande sökning) och sämre (nya situationer, sammanhang) än människan.',
  },
  {
    id: 'lagar',
    group: 'Förhållningssätt till AI',
    text: '”Normer samt lagar och andra bestämmelser som gäller AI och dess användning.”',
    verified: 'citat',
    coverage: 'täcks',
    chapters: ['etik'],
    labs: ['vilka-uppgifter-behover-systemet', 'hur-regleras-ett-ai-system', 'besluta-om-ett-framtida-ai-system'],
    comment: 'GDPR (ändamålsbegränsning, dataminimering) och EU:s AI-förordning. Normer behandlas genom de etiska principerna i kapitel 6.',
  },
  {
    id: 'etik',
    group: 'Förhållningssätt till AI',
    text: '”Etiska dilemman med användandet av AI, däribland transparens.”',
    verified: 'citat',
    coverage: 'täcks',
    chapters: ['introduktion', 'etik'],
    labs: ['vem-far-fel-svar', 'bygg-ett-rekommendationsflode', 'bedom-en-rattvisekonflikt', 'besluta-om-ett-framtida-ai-system', 'granska-ett-ai-system'],
    comment: 'Rättvisa mellan grupper, avvägningen mellan falskt positiva och falskt negativa, transparens och mänsklig insyn.',
  },
  {
    id: 'mojligheter-risker',
    group: 'Förhållningssätt till AI',
    text: '”Demokratiska, sociala, ekonomiska, miljömässiga och säkerhetsmässiga möjligheter och risker med AI-användning samt dess konsekvenser för samhället.”',
    verified: 'citat',
    coverage: 'delvis',
    chapters: ['robotik', 'etik'],
    labs: ['bygg-ett-rekommendationsflode', 'valj-robot-for-ett-uppdrag', 'besluta-om-ett-framtida-ai-system', 'granska-ett-ai-system'],
    comment:
      'Demokratiska och sociala aspekter (rekommendationsflöden, rättvisa), säkerhet (robotar, mänskligt övertagande) och nytta mot risk i beslut täcks. **Miljömässiga aspekter har ingen labb och ekonomiska behandlas bara indirekt** – förslag: en lektion om AI:s energi- och resursanvändning och om hur AI kan bidra till hållbar utveckling (nämns i ämnets syfte), samt om kostnader, arbetsmarknad och vem som tjänar på ett system.',
  },
];
