import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben ger en historisk ram för kursen och visar att AI:s framsteg har drivits av samverkan mellan data, beräkningskraft, algoritmer och investeringar. Vardagsbeslutet kopplar historien till elevernas eget omdöme.',
  tips: [
    'Låt eleverna ordna milstolparna i par och resonera högt. Det är resonemanget, inte minnet av årtal, som är målet.',
    'Ledtrådarna efter en felaktig kontroll pekar på ett par som står fel. Uppmuntra eleverna att använda innehållet (”ChatGPT bygger på transformern”) i stället för att gissa.',
    'Svampscenariot fungerar bra som helklassdiskussion: vilken säkerhet hade ni krävt? Vem bär ansvaret om appen har fel?',
    'Årtalen i labben är väletablerade (Dartmouth 1956, ELIZA 1966, Deep Blue mot Kasparov 1997, AlexNet i ImageNet-tävlingen 2012, AlphaGo mot Lee Sedol 2016, artikeln om transformern 2017, ChatGPT november 2022). Kontrollera gärna mot ett uppslagsverk tillsammans med eleverna.',
  ],
  misconceptions: [
    { myth: 'AI är en uppfinning från 2020-talet.', reality: 'Begreppet är från 1950-talet. Det som är nytt är att data och beräkningskraft räcker för att träna mycket stora modeller.' },
    { myth: 'Utvecklingen har gått stadigt framåt.', reality: 'Det har funnits perioder med minskat intresse och minskade pengar, så kallade AI-vintrar.' },
    { myth: 'Genombrott beror på en enda geniidé.', reality: 'Neurala nätverk fanns länge innan AlexNet. Det var data och beräkningskraft som gjorde att idén fungerade 2012.' },
    { myth: '92 % säkerhet betyder att svaret är rätt.', reality: 'Det betyder att modellen ofta har fel i liknande fall. När ett fel är farligt räcker det inte.' },
  ],
  discussionStops: [
    'Efter ordningen: Vilken milstolpe var svårast att placera? Varför?',
    'Efter drivkrafterna: Vilken drivkraft tror ni är viktigast i dag? Vem har råd med den?',
    'Efter vardagsbeslutet: I vilka situationer är det rimligt att lita på en app med 92 % säkerhet, och i vilka inte?',
  ],
  answers: [
    {
      question: 'Ordna milstolparna',
      answer: ['Dartmouth (1956), ELIZA (1966), expertsystemen (1970- och 80-talen), Deep Blue (1997), AlexNet (2012), AlphaGo (2016), transformern (2017), ChatGPT (november 2022). Startordningen har 15 par i fel ordning.'],
    },
    { question: 'Förutsägelse: När började begreppet AI användas?', answer: ['På 1950-talet – i ansökan till mötet i Dartmouth 1956. Många elever gissar på 2000- eller 2010-talet.'] },
    { question: 'Hur många år från Dartmouth till ChatGPT?', answer: ['66 år (2022 − 1956). Vanliga felsvar: 56 (från ELIZA) och 25 (från Deep Blue).'] },
    { question: 'Viktigaste drivkraften för Deep Blue?', answer: ['Beräkningskraft: specialbyggda schackkretsar som sökte hundratals miljoner ställningar per sekund.'] },
    { question: 'Vad gjorde AlexNet möjligt 2012?', answer: ['Data (ImageNet med över en miljon märkta bilder) och beräkningskraft (grafikkort). Investeringarna i djupinlärning ökade framför allt efter genombrottet.'] },
    { question: 'Drivkrafter för ChatGPT', answer: ['Alla fyra: data, beräkningskraft, algoritmer (transformern) och investeringar.'] },
    {
      question: 'Öppen fråga: En drivkraft och två milstolpar',
      answer: ['Exempelresonemang: ”Beräkningskraft: Deep Blue 1997 kunde slå Kasparov för att specialkretsar räknade igenom hundratals miljoner ställningar per sekund. 2012 tränades AlexNet på grafikkort, vilket gjorde det möjligt att träna ett nätverk med många lager på över en miljon bilder. Utan snabbare hårdvara hade båda idéerna funnits men inte fungerat.”'],
    },
    { question: 'Svampappen: vad är klokast?', answer: ['Att inte äta svampen på appens ord utan kontrollera med en kunnig person. 92 % innebär en betydande risk för fel, och ett fel kan vara livsfarligt.'] },
    {
      question: 'Öppen fråga: Ett eget vardagsbeslut',
      answer: ['Exempelresonemang: ”När jag använder en chattbot till en skoluppgift vet jag att den är en språkmodell som har lärt sig av text och kan hitta på källor som låter trovärdiga. Därför kontrollerar jag varje källa den nämner innan jag använder den.”'],
    },
  ],
});
