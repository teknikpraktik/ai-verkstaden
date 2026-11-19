/**
 * Förslag på terminsplan för vårterminen. Veckonumren är ungefärliga och
 * ska anpassas efter skolans läsårsplan (sportlov och påsklov varierar mellan
 * kommuner). Förslaget utgår från två lektioner à 60–80 minuter per vecka.
 */

export interface TermWeek {
  /** Löpnummer i kursen (1–20). */
  week: number;
  /** Ungefärlig kalendervecka på vårterminen. */
  calendarWeek: string;
  theme: string;
  /** Labbar (id) som görs under veckan. */
  labs: string[];
  /** Övrigt: kunskapskontroll, buffert, projekt. */
  activities: string[];
  /** Vecka som lätt kan krympas eller flyttas (lov, prov, studiedagar). */
  flexible?: boolean;
}

export const lessonsPerWeek = 'två lektioner à 60–80 minuter';

export const termPlan: TermWeek[] = [
  { week: 1, calendarWeek: 'v. 3', theme: 'Vad är AI?', labs: ['ar-det-ai'], activities: ['Kursstart: gå igenom webbplatsen, lokal lagring och projektorläget.', 'Diskussion: vilka AI-system har eleverna mött?'] },
  { week: 2, calendarWeek: 'v. 4', theme: 'AI:s historia och drivkrafter', labs: ['fran-expertregler-till-stora-modeller'], activities: ['Tidslinje i helklass.'] },
  { week: 3, calendarWeek: 'v. 5', theme: 'Data och urval', labs: ['vad-finns-i-datamangden', 'vem-far-fel-svar'], activities: ['Kunskapskontroll kapitel 1.'] },
  { week: 4, calendarWeek: 'v. 6', theme: 'Agenter och grafer', labs: ['programmera-en-stadrobot', 'bygg-en-graf'], activities: [] },
  { week: 5, calendarWeek: 'v. 7', theme: 'Sökalgoritmer', labs: ['bredden-forst-och-djupet-forst', 'sok-med-kostnad-och-ledtrad'], activities: [] },
  { week: 6, calendarWeek: 'v. 8', theme: 'Spelande agenter', labs: ['tre-i-rad-mot-en-agent'], activities: ['Kunskapskontroll kapitel 2.'] },
  { week: 7, calendarWeek: 'v. 9', theme: 'Buffert (ofta sportlov)', labs: [], activities: ['Ikapp-vecka eller fördjupningar från kapitel 1–2.'], flexible: true },
  { week: 8, calendarWeek: 'v. 10', theme: 'Klassificering och regression', labs: ['trana-en-klassificerare', 'forutsag-ett-tal'], activities: [] },
  { week: 9, calendarWeek: 'v. 11', theme: 'Träna, validera och testa', labs: ['trana-valj-och-testa'], activities: ['Diskussion: dataläckage i verkliga exempel.'] },
  { week: 10, calendarWeek: 'v. 12', theme: 'Klustring och belöning', labs: ['grupper-utan-facit', 'lar-en-agent-med-beloning'], activities: [] },
  { week: 11, calendarWeek: 'v. 13', theme: 'Neurala nätverk', labs: ['oppna-ett-neuralt-natverk'], activities: ['Kunskapskontroll kapitel 3.'] },
  { week: 12, calendarWeek: 'v. 14', theme: 'Text som data', labs: ['gor-text-till-data', 'sortera-meddelanden'], activities: [] },
  { week: 13, calendarWeek: 'v. 15', theme: 'Tvetydighet och språkmodeller', labs: ['samma-mening-flera-tolkningar'], activities: ['Kunskapskontroll kapitel 4.'] },
  { week: 14, calendarWeek: 'v. 16', theme: 'Buffert (ofta påsklov)', labs: [], activities: ['Ikapp-vecka eller fördjupningar från kapitel 3–4.'], flexible: true },
  { week: 15, calendarWeek: 'v. 17', theme: 'Robotens styrkedja och omplanering', labs: ['styr-en-robot', 'hitta-fram-nar-kartan-forandras'], activities: [] },
  { week: 16, calendarWeek: 'v. 18', theme: 'Robotar i uppdrag', labs: ['valj-robot-for-ett-uppdrag'], activities: ['Kunskapskontroll kapitel 5.'] },
  { week: 17, calendarWeek: 'v. 19', theme: 'Rekommendationer och rättvisa', labs: ['bygg-ett-rekommendationsflode', 'bedom-en-rattvisekonflikt'], activities: [] },
  { week: 18, calendarWeek: 'v. 20', theme: 'Personuppgifter och lagstiftning', labs: ['vilka-uppgifter-behover-systemet', 'hur-regleras-ett-ai-system'], activities: [] },
  {
    week: 19,
    calendarWeek: 'v. 21',
    theme: 'Beslut och start av slutprojektet',
    labs: ['besluta-om-ett-framtida-ai-system', 'granska-ett-ai-system'],
    activities: ['Kunskapskontroll kapitel 6.', 'Slutprojektet: välj problem, mål och data.'],
  },
  {
    week: 20,
    calendarWeek: 'v. 22–23',
    theme: 'Slutprojekt och reflektion',
    labs: ['granska-ett-ai-system'],
    activities: ['Slutprojektet: belägg, risker, rekommendation och kamratgranskning.', 'Redovisning och reflektionssidan.'],
    flexible: true,
  },
];

/** Upplägg för en enskild lektion som fungerar för de flesta labbar. */
export const lessonTemplate: { phase: string; minutes: string; text: string }[] = [
  { phase: 'Start', minutes: '5–10', text: 'Visa labbens förutsägelsefråga på projektorn. Låt alla skriva ned en gissning innan något körs.' },
  { phase: 'Prova', minutes: '20–30', text: 'Eleverna arbetar i genomgångsläget, gärna i par vid en dator. Läraren cirkulerar och använder diskussionsstoppen.' },
  { phase: 'Jämför', minutes: '10–15', text: 'Gemensam genomgång: jämför förutsägelser med utfallet. Ta upp de vanligaste felsvaren och missuppfattningarna.' },
  { phase: 'Förklara', minutes: '10–15', text: 'Eleverna besvarar den öppna frågan eller förklarasteget. Avsluta med en exit-fråga eller en fråga ur kapitlets kunskapskontroll.' },
  { phase: 'Fördjupa (valfritt)', minutes: '10–20', text: 'Snabba elever byter till experimentläget eller öppnar en fördjupning.' },
];
