import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben gör skillnaden mellan kö och stack konkret och visar att BFS optimalitet bara gäller antal steg. Leran förbereder labb 8 om kostnad och heuristik.',
  tips: [
    'Visa första stegen gemensamt på projektor i genomgångsläget. Låt eleverna sedan stega själva.',
    'Låt eleverna skriva ned sin förutsägelse innan jämförelsetabellen visas. Många tror att DFS är ”sämre” överallt – men här besöker DFS färre rutor.',
    'I experimentläget kan eleverna stänga en passage med en vägg. Fråga: vad händer när målet inte går att nå?',
  ],
  misconceptions: [
    { myth: 'BFS är alltid bättre än DFS.', reality: 'BFS hittar kortast väg i antal steg men kan besöka många fler rutor och behöver mer minne. I labyrinten besöker DFS 27 rutor och BFS 36.' },
    { myth: 'BFS hittar den billigaste vägen.', reality: 'Bara om alla steg kostar lika. I leran är BFS-vägen 6 steg men kostar 26, medan omvägen kostar 8.' },
    { myth: 'Sökningen ”ser” var målet ligger.', reality: 'Varken BFS eller DFS använder någon information om målets position. De provar rutorna i en fast ordning.' },
  ],
  discussionStops: [
    'Efter steg 2: Varför kallas BFS ”bredden först”? Låt eleverna beskriva mönstret med egna ord.',
    'Efter jämförelsen: När kan det vara värt att använda DFS trots att vägen kan bli lång?',
    'Efter leran: Ge exempel från verkligheten där färre steg inte är bäst (kollektivtrafik med byten, kostnad i pengar, energi).',
  ],
  answers: [
    { question: 'Förutsägelse: Vilken sökning hittar kortast väg?', answer: ['BFS. Vägen är 12 steg för BFS och 24 steg för DFS. Elever som gissar på DFS brukar resonera att den ”går rakt mot målet” – ta upp att DFS inte vet var målet ligger.'] },
    { question: 'Hur många steg längre är DFS-vägen?', answer: ['12 steg (24 − 12). Vanliga felsvar: 24 (hela DFS-vägen) och 9 (skillnaden i besökta rutor).'] },
    { question: 'Vad kostar BFS-vägen i leran?', answer: ['26: fem lerrutor à 5 plus målrutan à 1. Billigaste vägen går runt leran: 8 steg, kostnad 8.'] },
    { question: 'Varför hittar BFS kortast väg?', answer: ['Kön gör att alla rutor på avstånd n besöks före rutorna på avstånd n + 1. När målet tas ut första gången kan ingen kortare väg finnas. Det förutsätter att varje steg räknas lika.'] },
  ],
});
