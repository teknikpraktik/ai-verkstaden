import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben introducerar oövervakad inlärning med k-means och betonar två saker som ofta glöms: resultatet beror på startvärde och k, och grupper måste tolkas av människor.',
  tips: [
    'Låt eleverna rita in sina egna grupper på papper i förutsägelsesteget innan de stegar.',
    'Gör k-means ”för hand” på tavlan med 6–8 punkter: flytta magneter som centrum.',
    'Låt halva klassen använda startvärde 1 och halva startvärde 8 och jämför. Diskutera varför samma startvärde ger samma svar.',
    'I experimentläget finns en liten datamängd med 4 elever. Med k = 6 syns tomma kluster.',
  ],
  misconceptions: [
    { myth: 'Algoritmen hittar de ”riktiga” grupperna.', reality: 'Den hittar en indelning som är lokalt bäst för det valda k och startvärdet. Startvärde 8 ger en tydligt sämre indelning.' },
    { myth: 'Lägre summa betyder alltid bättre.', reality: 'Summan sjunker alltid med större k och blir 0 när varje punkt är en egen grupp.' },
    { myth: 'Slump betyder att resultatet inte går att upprepa.', reality: 'Datorns slump styrs av startvärdet. Samma startvärde ger exakt samma resultat.' },
    { myth: 'Algoritmen vet vad grupperna betyder.', reality: 'Den räknar bara avstånd. Namn som ”idrottarna” är vår tolkning.' },
  ],
  discussionStops: [
    'Efter stegningen: Varför kan summan aldrig öka under algoritmen?',
    'Efter startvärdena: Hur skulle du göra för att hitta en bra indelning om du inte visste vilket startvärde som var bra?',
    'Efter tolkningen: Ge exempel på när det kan vara problematiskt att dela in människor i grupper med en algoritm (t.ex. kunder, elever, patienter).',
  ],
  answers: [
    { question: 'Förutsägelse: Hur många grupper ser du?', answer: ['Det finns inget rätt svar. De flesta ser tre (idrottare, läsare, lite av varje), men punkt 20 och 21 kan tolkas som en fjärde grupp. Det illustrerar att k är ett val.'] },
    { question: 'Vad händer i ett uppdateringssteg?', answer: ['Varje centrum flyttas till medelpunkten av punkterna i sin grupp. Punkterna byter grupp i tilldelningssteget.'] },
    { question: 'Vilket startvärde ger en annan indelning?', answer: ['Startvärde 8: grupperna blir {1, 3, 6, 17}, {2, 4, 5, 7} och resten. Summan blir 143,4 mot 49,3 för startvärde 1–7.'] },
    { question: 'Är större k alltid bättre?', answer: ['Nej. Summan blir 153,7 (k = 2), 49,3 (k = 3), 29,7 (k = 4) och 24,4 (k = 5). Den sjunker alltid, men grupperna blir till slut meningslöst små.'] },
    {
      question: 'Öppen fråga: Namnge och tolka grupperna.',
      answer: [
        'Exempel med k = 3 och startvärde 1: ”Idrottarna” (punkt 1–7, centrum ungefär 9,5 timmar träning och 1,9 timmar läsning), ”Läsarna” (punkt 8–13, ungefär 1,8 och 9,3) och ”Lite av varje” (punkt 14–21, ungefär 4,8 och 4,4). Algoritmen vet inte vad grupperna betyder och har ingen aning om varför eleverna tränar eller läser. Punkt 20 och 21 ligger mittemellan och hamnar i ”lite av varje” mest för att det är närmast. Med ett annat k eller startvärde hade grupperna kunnat se annorlunda ut.',
      ],
    },
  ],
});
