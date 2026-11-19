import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben avmystifierar neurala nätverk: eleven räknar en neuron för hand, upptäcker begränsningen med en rak gräns (XOR) och ser hur ett dolt lager och gradientnedstigning löser den. Kopplar till regression och förlust i labb 11.',
  tips: [
    'Räkna z för (1, 1) med w1 = w2 = 1, b = −1,5 gemensamt på tavlan.',
    'Låt eleverna tävla om att klara XOR med en neuron i några minuter. Frustrationen är poängen – samla sedan in förklaringar.',
    'Rita XOR-hörnen på tavlan och visa att det behövs två linjer.',
    'I experimentläget: startvärde 4 med två dolda neuroner fastnar på 0,25, men med tre dolda neuroner går det. Bra diskussion om varför träning inte alltid lyckas.',
  ],
  misconceptions: [
    { myth: 'En artificiell neuron fungerar som en hjärncell.', reality: 'Den är bara en viktad summa och en S-kurva. Namnet är inspirerat av biologin, men likheten är ytlig.' },
    { myth: 'Större vikter gör att neuronen kan lösa svårare problem.', reality: 'Större vikter gör S-kurvan brantare, men gränsen förblir en rak linje.' },
    { myth: 'Träningen hittar alltid den bästa lösningen.', reality: 'Gradientnedstigning kan fastna, till exempel med startvärde 4 och två dolda neuroner.' },
    { myth: 'Förlusten sjunker jämnt.', reality: 'Här ligger den länge kvar runt 0,25 och sjunker sedan snabbt efter ungefär 400–600 epoker.' },
  ],
  discussionStops: [
    'Efter OCH/ELLER: Vad gör biasen? Varför räckte det att ändra bara den?',
    'Efter XOR: Vilka vardagliga beslut är ”antingen eller”?',
    'Efter träningen: Ingen har programmerat vikterna. Vem vet då vad nätverket gör, och hur kan man ta reda på det?',
  ],
  answers: [
    { question: 'Förutsägelse: Kan en neuron lära sig XOR?', answer: ['Nej. En neuron delar ytan med en rak linje, och XOR kräver två. Högst 3 av 4 blir rätt.'] },
    { question: 'Vad blir z för (1, 1) med w1 = w2 = 1 och b = −1,5?', answer: ['0,5. Vanliga fel: 2 (biasen glömd) och 0,62 (utdata efter aktivering i stället för z).'] },
    { question: 'Vilken bias gör neuronen till ELLER?', answer: ['−0,5. Då räcker en etta för att z ska bli positivt, men (0, 0) ger z = −0,5.'] },
    { question: 'Varför klarar en neuron aldrig mer än 3 av 4 för XOR?', answer: ['Gränsen z = 0 är en rak linje, och ingen rak linje skiljer (0, 1) och (1, 0) från (0, 0) och (1, 1).'] },
    { question: 'Vilken förlust har den ensamma neuronen efter 2000 epoker?', answer: ['0,25. Den svarar ungefär 0,5 på alla fyra. Nätverket med dolt lager har under 0,01.'] },
    {
      question: 'Öppen fråga: Vad tillför det dolda lagret?',
      answer: [
        'Exempelresonemang: ”En ensam neuron kan bara dra en rak gräns, så den kan inte skilja ut XOR. I nätverket drar de två dolda neuronerna varsin gräns – den ena reagerar ungefär när minst en indata är 1, den andra när inte båda är 1 – och utdataneuronen svarar 1 när båda dolda neuronerna är på. Förlusten visar hur fel nätverket har; den låg kvar vid 0,25 ett tag och sjönk sedan nästan till 0. Med ett annat startvärde kan träningen fastna.”',
        'Observera att de dolda neuronernas roller kan bli olika beroende på startvärde och inte alltid är lika lätta att tolka. Godta förklaringar som bygger på ”flera raka gränser som kombineras”.',
      ],
    },
  ],
});
