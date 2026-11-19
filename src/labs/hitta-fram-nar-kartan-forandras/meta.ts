import { defineLab } from '../../course/types';

export default defineLab({
  id: 'hitta-fram-nar-kartan-forandras',
  number: 20,
  part: 'robotik',
  title: 'Hitta fram när kartan förändras',
  summary: 'Se en robot planera med A* på sin karta, upptäcka att verkligheten är annorlunda, stanna och planera om – steg för steg.',
  goals: [
    'Förklara skillnaden mellan robotens karta och den faktiska miljön med konkreta exempel.',
    'Följa hur en robot upptäcker ett hinder, stannar, uppdaterar kartan och planerar om från där den står.',
    'Förklara hur sensorns räckvidd påverkar hur lång resan blir, och vad roboten bör göra när ingen väg finns.',
  ],
  prerequisites: ['Veta ungefär vad en sökning som A* gör: hittar kortaste väg i ett rutnät.'],
  prerequisiteLabs: ['sok-med-kostnad-och-ledtrad', 'styr-en-robot'],
  minutes: [15, 20],
  concepts: ['omplanering', 'robotkarta', 'a-stjarna', 'sensor', 'robot', 'manniska-i-loopen'],
  keywords: ['karta', 'omplanering', 'replanering', 'A*', 'hinder', 'lager', 'dörr', 'navigering', 'räckvidd', 'ingen väg', 'lagerrobot'],
  coverage: [
    {
      topic: 'Låt en robot planera och planera om i ett rutnät när ett hinder dyker upp',
      outcome: 'Eleven stegar roboten, ser stoppet i F3 och den nya vägen på 14 steg, och räknar ut att resan blev 15 steg i stället för 5 planerade.',
      verification: 'logic.test.ts (pallen: 5 → 15 steg, stopp i F3, ny väg 14); Playwright kapitel5.spec.ts (fråga pall-steg fel → rätt)',
    },
    {
      topic: 'Skillnaden mellan robotens karta och den faktiska miljön med konkreta exempel',
      outcome: 'Eleven jämför ”Robotens karta” och ”Verkligheten” sida vid sida i fyra scenarier: pall i lagergång, stängd dörr, dörr som öppnats och blockerad passage.',
      verification: 'logic.test.ts (alla fyra scenarier); teacher.ts med konkreta exempel; öppen fråga karta-verklighet',
    },
    {
      topic: 'Visa stopp och omplanering steg för steg',
      outcome: 'Händelseloggen och statusraden visar varje stopp och omplanering med position och väglängd; eleven jämför räckvidd 1, 2 och 3 (17, 15, 13 steg).',
      verification: 'logic.test.ts (räckvidd 17/15/13/13); Playwright kontrollerar statusraden ”Stopp” och jämförelsetabellen',
    },
    {
      topic: 'Målet går inte att nå efter upptäckt',
      outcome: 'Eleven ser roboten stanna i L2 och larma när ingen väg finns, och motiverar varför det är rätt beteende.',
      verification: 'logic.test.ts (ingen väg: stopp i L2 efter 10 steg); fråga ingen-vag-gora',
    },
  ],
  labels: ['forenklad', 'simulering', 'pahittad'],
});
