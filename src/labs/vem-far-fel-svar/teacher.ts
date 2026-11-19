import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben gör begreppen felandel, nämnare och urval konkreta med en modell som är så enkel att den kan förklaras helt. Den förbereder förväxlingsmatriser i kapitel 3 och rättvisa och transparens i kapitel 6.',
  tips: [
    'Låt eleverna skriva ned sin förutsägelse innan modellen körs. Många gissar ”lika för båda” eftersom modellen är ”objektiv”.',
    'Skriv upp ”5 fel” på tavlan och fråga vad det betyder. Lägg sedan till nämnarna 10 och 50.',
    'I experimentläget kan eleverna ställa in tröskeln själva. En tröskel runt 4,85 mm ger få fel i båda skolorna – men modellen hittar den inte när Söderby saknas i träningsdatan. Låt eleverna också prova 12 svar från Norrby och 0 från Söderby: slumpen i ett litet urval kan ge en annan tröskel.',
    'Påpeka att handstilsskillnaden är påhittad. Koppla gärna till verkliga exempel där system har testats på vissa grupper men inte andra, utan att peka ut elever.',
  ],
  misconceptions: [
    { myth: 'En dator är objektiv och gör lika många fel för alla.', reality: 'Modellen gör det den har lärt sig av träningsdatan. Saknas en grupp i träningen kan den få fler fel.' },
    { myth: 'Fler data löser alltid problemet.', reality: 'Dubbelt så många svar från Norrby gav samma 50 % fel för Söderby. Det är urvalet som avgör.' },
    { myth: 'Om man kan se hur modellen räknar kan man lita på den.', reality: 'Transparens gör det möjligt att granska. Tillit kräver att modellen har testats på data från alla som berörs.' },
    { myth: 'Antalet fel räcker för att jämföra grupper.', reality: 'Grupperna är olika stora. 0 av 40 och 5 av 10 måste jämföras som andelar.' },
  ],
  discussionStops: [
    'Efter steg 2: Om ni bara fick veta att 10 % av svaren lästes fel – skulle ni köpa skannern?',
    'Efter steg 4: Vem bär ansvaret om en elev i Söderby får fel betyg på grund av skannern?',
    'Efter steg 5: Vad skulle det kosta att samla in träningsdata från alla skolor som ska använda systemet? Är det värt det?',
  ],
  answers: [
    { question: 'Förutsägelse: Vilken skola får störst andel fel?', answer: ['Söderby: 5 av 10 (50 %), mot 0 av 40 i Norrby. Modellen har bara sett Norrbys handstil.'] },
    { question: 'Hur stor andel av Söderbys svar lästes fel?', answer: ['50 % (5 av 10). Vanliga felsvar: 5 (antalet, inte andelen) och 10 (felandelen för alla 50 svar).'] },
    { question: 'Varför är totalen 10 % missvisande?', answer: ['Söderby är bara 10 av 50 svar. Deras höga felandel späds ut av Norrbys 40 felfria svar.'] },
    { question: 'Vad visar förklaringen om felen i Söderby?', answer: ['Tröskeln är 3,65 mm. Söderbys ettor har övre streck på 3,7–4,7 mm och hamnar alla över tröskeln, så de läses som sjuor.'] },
    { question: 'Hur många procentenheter sjönk Söderbys felandel med 12 + 12?', answer: ['50 procentenheter (från 50 % till 0 %). Med 48 svar från Norrby blev det ingen förändring alls. Tröskeln flyttas från 3,65 mm till 4,85 mm.'] },
    {
      question: 'Öppen fråga: Vad ska Söderby kontrollera innan de använder skannern?',
      answer: [
        'Exempelresonemang: ”Vi skulle be om att få testa skannern på ett par hundra svar från våra egna elever och jämföra felandelen med Norrbys, uppdelat per skola och per siffra, till exempel 5 av 10 i stället för bara ’10 % fel totalt’. Om felen är många för oss räcker det inte att leverantören samlar in fler svar från Norrby – de behöver svar som liknar våra elevers handstil. Att leverantören kan förklara exakt hur modellen räknar gör inte att vi kan lita på den förrän den är testad på oss.”',
        'Ett godtagbart svar nämner minst test på egna data och jämförelse per grupp med nämnare.',
      ],
    },
  ],
});
