import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben gör rekommendationssystem konkreta: eleverna ser hur en enkel regel (vikt = (1 + klick)²) snabbt smalnar av ett flöde, jämför med ett läge som reserverar utrymme för annat och kopplar loggen till integritet och dataminimering. Den förbereder labb 24 om vilka uppgifter ett system behöver.',
  tips: [
    'Låt eleverna klicka fritt i sitt eget flöde först och jämföra mätaren med en bänkkamrat som klickat annorlunda.',
    'Visa jämförelsetabellen på projektor. Betona att bara läget skiljer – samma startvärde och samma robot-elev.',
    'I experimentläget kan eleverna byta startvärde och favoritämne för att se att mönstret håller, inte bara i ett lyckat exempel.',
    'Fördjupningen om Simpsons index passar elever som läser matematik och vill ha ett bättre mått än antal ämnen.',
  ],
  misconceptions: [
    { myth: 'Flödet visar det som är bäst eller mest populärt.', reality: 'Simuleringen bedömer inte kvalitet. Den visar det som förväntas ge klick utifrån ditt eget beteende.' },
    { myth: 'Det är användarens eget fel om flödet blir ensidigt.', reality: 'Med samma klick ger variationsläget 5 ämnen och engagemangsläget 1. Systemets regler avgör minst lika mycket som användaren.' },
    { myth: 'Om jag inte klickar vet systemet inget om mig.', reality: 'Loggen sparar också vad du hoppar över och hur länge du tittar. Sådant kan avslöja intressen du aldrig klickat på.' },
  ],
  discussionStops: [
    'Efter eget flöde: Hur många klick tog det innan ditt flöde dominerades av ett ämne?',
    'Efter jämförelsen: Vem tjänar på engagemangsläget? Vem tjänar på variationsläget?',
    'Efter datapanelen: Vilka av uppgifterna skulle du vilja att appen raderade? Vilka slutsatser om dig skulle du inte vilja att den drog?',
  ],
  answers: [
    {
      question: 'Förutsägelse: Vad händer med antalet olika ämnen efter 15 klick på spel?',
      answer: ['Det minskar. I engagemangsläget går det från 4 ämnen bland de första 12 inläggen till 1 ämne (12 av 12 spel). Elever som tror att det blir fler resonerar ofta att systemet ”vill visa nytt” – det gör det bara om det byggs så.'],
    },
    {
      question: 'Hur många olika ämnen finns bland de 12 senaste inläggen i engagemangsläget?',
      answer: ['1 (alla 12 är spel). Vanliga felsvar: 4 (de första 12 inläggen), 5 (variationsläget), 12 (antalet inlägg).'],
    },
    {
      question: 'Vilka uppgifter behöver flödet för att välja inlägg?',
      answer: ['Bara antal klick per ämne. Visningstid och listan över överhoppade inlägg loggas men används inte – ett tydligt exempel på insamling som strider mot dataminimering.'],
    },
    {
      question: 'Vilket läge borde vara standard i en app för unga, och vilka uppgifter borde appen få spara?',
      answer: [
        '**Exempelresonemang 1 (variation som standard):** Variationsläget gav 5 ämnen i stället för 1. För unga som håller på att forma sina intressen väger bredden tyngre än några fler klick. Appen bör bara spara klick per ämne och radera den detaljerade loggen. Användaren ska kunna byta läge själv.',
        '**Exempelresonemang 2 (användaren väljer):** Det är inte självklart att appen ska bestämma åt användaren. Engagemangsläget ger mer av det man gillar, vilket många vill ha. Men valet ska vara tydligt och lätt att ändra, och appen ska förklara vilka uppgifter den sparar och varför.',
        'Bra svar använder siffrorna från jämförelsen, nämner en nackdel med det egna valet och skiljer på uppgifter som behövs och uppgifter som bara samlas in.',
      ],
    },
  ],
});
