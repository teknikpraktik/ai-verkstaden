import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben visar hur kostnad (g) och ledtråd (h) styr tre sökningar på samma karta, med ett tydligt exempel där den giriga sökningen luras. Den anger exakt villkor för att labbens A* ska hitta en billigaste väg.',
  tips: [
    'Låt eleverna räkna f för Sjövik och Granberga för hand innan de stegar A*. Att 368 och 369 ligger så nära varandra skapar spänning.',
    'Peka på att uniformkostnadssökningen är samma sak som A* med h = 0. Visa det i experimentläget.',
    'Fördjupningen om tillåten mot konsistent heuristik passar elever som vill gå vidare; ordinarie labb kräver bara att man kan ange villkoret.',
  ],
  misconceptions: [
    { myth: 'A* hittar alltid den billigaste vägen.', reality: 'Bara om ledtråden är lämplig. Med 3 × fågelvägen hittar A* vägen som kostar 450 i stället för 375.' },
    { myth: 'Den giriga sökningen är dålig.', reality: 'Den expanderar minst (4 orter) och är ofta bra nog. Men den garanterar inte billigaste väg.' },
    { myth: 'Det räcker alltid att h aldrig överskattar.', reality: 'Det räcker för A* som kan öppna besökta noder igen. Labbens A* gör inte det och kräver därför en konsistent h. Se ”Lurig ledtråd”: kostnad 9 i stället för 7.' },
    { myth: 'h är den verkliga kostnaden kvar.', reality: 'h är en uppskattning. Fågelvägen till Lindvik från Sjövik är 158, men vägen kostar 240.' },
  ],
  discussionStops: [
    'Efter steg 1: Vilken information använder en mänsklig bilförare som liknar h? Vad kan lura den?',
    'Efter steg 4: Varför tar A* ut Granberga (f = 369) före Lindvik (f = 450), fast Lindvik redan finns i gränsen?',
    'Efter steg 6: Vad kan vara en bra ledtråd i andra problem, till exempel ett pussel eller ett rutnät?',
  ],
  answers: [
    { question: 'Förutsägelse: Vilken väg hittar den giriga sökningen?', answer: ['Norra vägen Ekeby → Björkås → Sjövik → Lindvik, kostnad 450. Björkås har lägre h (237) än Hagby (240) och Sjövik har lägst h av alla (158).'] },
    { question: 'Varför expanderar uniformkostnadssökningen Tallmo och Åsa?', answer: ['Vägarna dit är korta (g = 90 och 95) och uniformkostnadssökningen väljer alltid lägst g. Den vet inte var målet ligger.'] },
    { question: 'Vad kostar den giriga vägen?', answer: ['450 = 100 + 110 + 240. Billigaste vägen kostar 375.'] },
    { question: 'Vilket f-värde får Sjövik i A*?', answer: ['368 = 210 + 158. Vanliga felsvar: 158 (bara h) och 210 (bara g).'] },
    { question: 'Under vilka villkor hittar A* i labben alltid en billigaste väg?', answer: ['Positiva kostnader och en konsistent heuristik: h(mål) = 0 och h(n) ≤ kostnad(n, m) + h(m) för varje väg. Att h är tillåten räcker inte för labbens implementation eftersom besökta noder aldrig öppnas igen.'] },
    {
      question: 'Förklara varför den giriga sökningen valde en dyrare väg och varför A* inte gjorde det.',
      answer: [
        'Exempelresonemang: Den giriga sökningen tittar bara på h. Sjövik ligger bara 158 km från Lindvik fågelvägen, så den ser lovande ut, men vägen måste gå runt Långsjön och kostar 240. A* räknar f = g + h. När Lindvik läggs till via Sjövik blir f = 450, medan Granberga har f = 369. A* undersöker därför södra vägen först och hittar att den bara kostar 375.',
      ],
    },
  ],
});
