import { defineLab } from '../../course/types';

export default defineLab({
  id: 'oppna-ett-neuralt-natverk',
  number: 15,
  part: 'maskininlarning',
  title: 'Öppna ett neuralt nätverk',
  summary: 'Ställ in vikter och bias i en neuron, upptäck att den inte klarar XOR och träna sedan ett litet nätverk med dolt lager steg för steg.',
  goals: [
    'Beskriva hur en artificiell neuron räknar: viktad summa plus bias, sedan en aktiveringsfunktion.',
    'Ställa in vikter och bias så att en neuron löser OCH och ELLER, och förklara varför den inte kan lösa XOR.',
    'Följa hur förlusten minskar när ett nätverk tränas med gradientnedstigning och jämföra prediktioner.',
    'Förklara vad ett dolt lager tillför.',
  ],
  prerequisites: ['Kunna multiplicera och addera negativa tal och decimaltal.'],
  prerequisiteLabs: ['forutsag-ett-tal'],
  minutes: [20, 25],
  concepts: ['neuron', 'vikt', 'aktiveringsfunktion', 'neuralt-natverk', 'forlustfunktion', 'medelkvadratfel', 'parameter', 'startvarde'],
  keywords: ['neuralt nätverk', 'neuron', 'vikt', 'bias', 'aktiveringsfunktion', 'sigmoid', 'dolt lager', 'XOR', 'gradientnedstigning', 'förlust', 'djupinlärning'],
  coverage: [
    {
      topic: 'Ändra vikter och bias i en neuron före aktivering',
      outcome: 'Eleven ändrar w1, w2 och b, läser z före aktivering och utdata efter, och löser OCH och ELLER.',
      verification: 'logic.test.ts (framåtberäkning, OCH/ELLER); Playwright kapitel3.spec.ts (labb 15: reglage)',
    },
    {
      topic: 'Visuell utmaning (XOR) som belyser vad ett dolt lager bidrar med',
      outcome: 'Eleven ser att ingen inställning ger mer än 3 av 4 rätt för XOR och förklarar det med en rak gräns.',
      verification: 'logic.test.ts (genomsökning av alla reglagelägen: högst 3 av 4); fråga xor-omojlig',
    },
    {
      topic: 'Litet träningsbart nätverk: stega träningen, jämföra prediktioner och se förlusten förändras',
      outcome: 'Eleven stegar 2000 epoker och ser förlusten gå från 0,29 till under 0,01 medan en ensam neuron stannar på 0,25.',
      verification: 'logic.test.ts (startvärde 3 når låg förlust, ensam neuron 0,25); Playwright kapitel3.spec.ts',
    },
    {
      topic: 'Startvärdets betydelse',
      outcome: 'I experimentläget ser eleven att startvärde 4 med två dolda neuroner fastnar men klarar sig med tre.',
      verification: 'logic.test.ts (startvärde 4)',
    },
  ],
  labels: ['forenklad'],
});
