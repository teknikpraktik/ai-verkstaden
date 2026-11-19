import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Extralabben ger en konkret bild av objektigenkänning och datorseende: att en bild är tal, att igenkänning är klassificering och att lokalisering kan göras med ett glidande fönster. Den enkla mallmodellen gör det lätt att se varför flyttade, vridna eller annorlunda belysta föremål är svåra, vilket motiverar inlärda modeller som faltningsnätverk.',
  tips: [
    'Börja med att låta eleverna slå på ”Visa bilden som tal” och fråga: var är koppen nu? Poängen är att datorn bara har talen.',
    'Låt alla skriva ned sin förutsägelse om den flyttade koppen innan ni går vidare. De flesta tror att svaret blir kopp, eftersom de själva ser en kopp.',
    'Visa på projektor hur fönstret stegar genom den stora bilden. Stanna vid läge 2 (äpple 72 %) och läge 25 (äpplet, 100 %) och diskutera varför flera lägen nära samma föremål ger höga värden.',
    'I steg 5: låt halva klassen ändra bara bruset och halva bara tröskeln, och jämför. Koppla till falska larm och missade fall i labb 4.',
    'I experimentläget kan eleverna rita egna bilder. Utmaning: rita något som inte är en kopp men som modellen ändå kallar kopp, eller en kopp som modellen missar.',
  ],
  misconceptions: [
    { myth: 'Datorn ser bilden ungefär som vi gör.', reality: 'Datorn har bara ett rutnät av tal. Allt den ”vet” om föremål kommer från hur talen jämförs med mallar eller inlärda mönster.' },
    { myth: 'Om modellen svarar med hög säkerhet är svaret rätt.', reality: 'En helt svart bild ger äpple med 75 %. Modellen måste välja den mall som liknar mest, även när bilden inte föreställer något av föremålen.' },
    { myth: 'Lägre tröskel är alltid bättre eftersom fler föremål hittas.', reality: 'Med brus 20 % och tröskel 50 % hittas fler föremål, men två av fynden är fel. Tröskeln är en avvägning mellan falska larm och missade föremål.' },
    { myth: 'Riktiga system fungerar som labbens mallar, fast med större bilder.', reality: 'Riktiga system lär sig mönstren själva från mycket stora mängder märkta bilder och letar efter små mönster överallt i bilden. De klarar därför flyttade och vridna föremål mycket bättre – men kan fortfarande göra fel på bilder som skiljer sig från träningsdatan.' },
  ],
  discussionStops: [
    'Efter steg 3: Du såg att det var samma kopp. Vad gör du som modellen inte gör?',
    'Efter steg 4: En mobilbild har miljontals pixlar. Hur många fönsterlägen skulle det bli, och vad betyder det för hur snabbt en sådan metod är?',
    'Efter steg 5: I vilka användningar är ett falskt larm värst, och i vilka är ett missat föremål värst? (Till exempel en bil som letar efter fotgängare jämfört med en app som sorterar semesterbilder.)',
  ],
  answers: [
    { question: 'Förutsägelse: Om koppen flyttas två pixlar åt höger – vad händer med modellens svar?', answer: ['Modellen svarar fel klass: äpple 34 %, medan kopp bara får 21 %. Mallen jämförs pixel för pixel på samma plats, så när koppen flyttas hamnar de svarta pixlarna där mallen har vitt. De flesta förutsäger att svaret blir kopp, eftersom de själva ser samma kopp.'] },
    { question: 'Koppen och äpplemallen har 15 svarta pixlar gemensamt, och 29 pixlar är svarta i någon av dem. Vilken likhet ger det i procent?', answer: ['15 ÷ 29 ≈ 0,52, alltså 52 %. Vanliga fel: 88 % (delar med koppens 17 pixlar) och 56 % (delar med äpplemallens 27 pixlar).'] },
    { question: 'Vilken av ändringarna klarar modellen fortfarande – alltså svarar kopp?', answer: ['Högra delen skymd: kopp 41 %. Flyttad (äpple 34 %), vriden (äpple 38 %) och omvänd belysning (äpple 35 %, kopp 0 %) ger fel svar.'] },
    { question: 'Hur många fönsterlägen testar modellen i bilden på 28 × 8 pixlar?', answer: ['69: (28 − 6 + 1) = 23 lägen i sidled och (8 − 6 + 1) = 3 i höjdled. Vanliga fel: 66 (glömmer första läget), 224 (antal pixlar).'] },
    { question: 'Brus 20 % och tröskel 70 %: hur många av de tre föremålen missar modellen?', answer: ['2 – nyckeln och koppen (67 %). Bara äpplet (71 %) hittas.'] },
    { question: 'Behåll bruset på 20 % och sänk tröskeln till 50 %. Vad händer?', answer: ['Koppen hittas också (2 rätt), men nyckeln tas för ett äpple (59 %) och bollen tas för ett äpple (55 %): 2 felaktiga fynd, och nyckeln räknas fortfarande som missad.'] },
    {
      question: 'Öppen fråga: Du kände igen koppen även när den var flyttad, vriden eller hade omvänd belysning – men modellen gjorde det inte. Varför? Vad skulle en bättre modell behöva?',
      answer: [
        'Exempelresonemang: ”Modellen jämför pixel för pixel på exakt samma plats som i mallen. När koppen flyttas två steg hamnar de svarta pixlarna fel, så kopp får bara 21 % och äpple vinner med 34 %. Jag känner igen koppen på formen och handtaget, oavsett var den är eller hur den är vriden, eftersom jag har sett väldigt många koppar. En bättre modell skulle behöva många exempel på koppar i olika lägen, vinklar och ljus, och leta efter mindre delar som handtag och kanter var som helst i bilden – det är ungefär vad ett faltningsnätverk gör.”',
        'Godta svar som tar upp att modellen jämför exakta pixellägen och att generalisering kräver fler och mer varierade exempel eller mönster som kan kännas igen överallt. Ett starkt svar använder siffror från labben.',
      ],
    },
  ],
});
