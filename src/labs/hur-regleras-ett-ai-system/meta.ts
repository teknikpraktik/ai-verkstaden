import { defineLab } from '../../course/types';

export default defineLab({
  id: 'hur-regleras-ett-ai-system',
  number: 25,
  part: 'etik',
  title: 'Hur regleras ett AI-system?',
  summary: 'Undersök påhittade användningsfall och avgör hur EU:s AI-förordning och GDPR träffar dem – eller vilka fakta som saknas.',
  goals: [
    'Beskriva AI-förordningens indelning: förbjuden användning, högrisksystem, krav på öppenhet och övriga system.',
    'Klassa ett påhittat användningsfall utifrån uttalade antaganden och hänvisa till rätt artikel eller bilaga.',
    'Avgöra när det behövs mer information och formulera vilka fakta som måste utredas.',
    'Skilja på när en förordning träder i kraft och när dess regler börjar tillämpas.',
  ],
  prerequisites: ['Labb 24 eller grundläggande kunskap om personuppgifter.'],
  prerequisiteLabs: ['vilka-uppgifter-behover-systemet'],
  minutes: [20, 25],
  concepts: ['ai-forordningen', 'gdpr', 'hogrisksystem', 'ikrafttradande', 'oppenhetskrav', 'personuppgift', 'manniska-i-loopen', 'transparens'],
  keywords: ['AI-förordningen', 'AI Act', 'GDPR', 'högrisk', 'förbjuden AI', 'känsloigenkänning', 'bilaga III', 'artikel 50', 'artikel 22', 'ikraftträdande', 'tillämpning', 'omnibus', 'lagstiftning', 'reglering'],
  coverage: [
    {
      topic: 'Undersök olika fiktiva användningsfall',
      outcome: 'Eleven klassar sju påhittade scenarier (förbjuden, högrisk, öppenhet, inga särskilda krav, mer information) och får återkoppling med artikelhänvisning.',
      verification: 'logic.test.ts (facit och återkoppling för alla felsvar i alla scenarier); Playwright: kapitel6.spec.ts (labb 25: fel → återkoppling → rätt)',
    },
    {
      topic: 'Koppla till relevanta delar av AI-förordningen och GDPR genom tydliga antaganden och länkar',
      outcome: 'Eleven läser antaganden, art. 5.1 f, art. 50.1, bilaga III punkt 3 och 4 samt GDPR art. 6, 9, 22 och 35 i scenarierna, och följer länkarna till EUR-Lex.',
      verification: 'logic.test.ts (varje förklaring hänvisar till artikel/bilaga); källor med kontrolldatum och kontrollstatus i teacher.ts; manuell lärarkontroll mot EUR-Lex före publicering',
    },
    {
      topic: 'Ange kontroll- eller referensdatum och skilj ikraftträdande från tillämpningsdatum',
      outcome: 'Eleven ser referensdatum 2026-11-19 och tidslinjen, och besvarar att förbuden gäller från 2 februari 2025 trots ikraftträdandet 1 augusti 2024.',
      verification: 'logic.test.ts (tidslinjen, 20 dagar efter publicering, passed(REFERENCE_DATE)); fråga nar-forbud med förklarade felsvar; kapitel6.spec.ts kontrollerar referensdatumet',
    },
    {
      topic: 'Alternativ där facit är att man behöver mer information',
      outcome: 'Eleven klassar studievägledarboten och avhoppsvarnaren som ”mer information”, ändrar ett faktum och ser klassningen ändras, och väljer vilka fakta som måste utredas.',
      verification: 'logic.test.ts (classifyGuidanceBot ja/nej/okänt); frågor ett-faktum och utreda-avhopp; kapitel6.spec.ts',
    },
  ],
  labels: ['pahittad', 'forenklad'],
});
