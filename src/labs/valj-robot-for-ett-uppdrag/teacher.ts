import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben låter eleverna resonera om robotval utifrån uttryckliga regler i stället för känsla. Regellistan gör simuleringen genomskinlig, och omsorgsuppdraget lyfter frågor om värdighet, trygghet och mänsklig tillsyn som leder vidare till kapitel 6.',
  tips: [
    'Läs reglerna tillsammans innan ni kör. Poängen är att varje resultat ska gå att förklara med regel-id.',
    'Låt grupper ta var sitt uppdrag i experimentläget och hitta den billigaste roboten (minst personaltid) som klarar alla förhållanden utan säkerhetsrisk. Redovisa med regelhänvisningar.',
    'Ta omsorgsuppdraget på allvar: det är fiktivt men rör verkliga frågor. Diskutera vad som går förlorat om robotar ersätter mänsklig kontakt, och vem som bestämmer över de boendes vardag.',
    'Påminn om att reglerna är påhittade. Fråga: vilken regel skulle ni lägga till för att simuleringen ska bli mer realistisk?',
  ],
  misconceptions: [
    { myth: 'Mer autonomi är alltid bättre.', reality: 'En självständig robot utan rätt villkor för övertagande blir en säkerhetsrisk (A4, O3). Övervakad drift binder personal men är säkrare.' },
    { myth: 'Fler sensorer löser allt.', reality: 'I regn är både kamera och lidar osäkra. Ogräsroboten med alla fyra sensorerna behöver ändå 9 övertaganden.' },
    { myth: 'Om roboten inte krockar är den säker.', reality: 'I omsorgen underkänns en robot som inte larmar när en boende behöver hjälp, även om den aldrig krockar (O3).' },
    { myth: 'Simuleringen visar hur verkliga robotar fungerar.', reality: 'Reglerna och siffrorna är påhittade. Simuleringen visar hur man resonerar, inte exakta fakta om robotar.' },
  ],
  discussionStops: [
    'Efter lagret: Vem bär ansvaret om en självständig robot kör på en anställd – tillverkaren, arbetsgivaren eller den som valde inställningarna?',
    'Efter jordbruket: När är det värt att ha en robot som behöver hjälp ofta? (farligt eller tungt arbete, brist på personal)',
    'Efter omsorgen: Vilka uppgifter i omsorgen bör alltid göras av människor? Varför?',
  ],
  answers: [
    { question: 'Förutsägelse: Vad händer med lagerroboten i mörker?', answer: ['Den klarar inte uppdraget. Kameran fungerar inte i mörker (S1) och roboten har ingen annan sensor för att hitta vägen (U1). Tack vare villkoret ”när sensorerna är osäkra” stannar den säkert och kallar på hjälp (A3) – en människa får göra jobbet: 60 minuters personaltid.'] },
    { question: 'Vilka regler förklarar att uppdraget inte blev utfört i mörker?', answer: ['S1 och U1. R1 gäller inte (lagret är tomt). A4 gäller inte, eftersom villkoret för osäkra sensorer finns.'] },
    { question: 'Varför klarar roboten med lidar nattskiftet?', answer: ['Lidarn fungerar i mörker (S2) och inomhus räcker en fungerande sensor för att hitta vägen (U1). Resultat: klart med 1 övertagande (pallen), 5 minuters personaltid.'] },
    { question: 'Hur många gånger måste en människa ta över i regn?', answer: ['9: osäkra sensorer i alla 8 rader (S1, S2, A3) plus 1 gång för slangen. Personaltid 45 minuter. Vanliga felsvar: 8 (glömt slangen) och 1 (svaret för normalt väder).'] },
    { question: 'Varför räknas omsorgsroboten med närhetssensor ändå som en säkerhetsrisk?', answer: ['Den saknar villkoret att larma när en människa behöver hjälp. En boende som kände sig yr fick vänta (O3). Med larmvillkoret blir resultatet klart med 2 övertaganden (rullatorn och larmet), 10 minuters personaltid.'] },
    {
      question: 'Öppen fråga: Välj och motivera en robot för äldreboendet.',
      answer: [
        'Exempelresonemang: Jag väljer lidar och närhetssensor, självständig autonomi och alla tre villkoren för övertagande. Lidarn gör att roboten hittar även på natten när kameran inte fungerar (S1, S2, U1). Närhetssensorn behövs eftersom boende går i korridoren (R1, R2). Larmvillkoret är ett krav: den som behöver hjälp ska få det direkt (O3). Jag tar bort kameran – den behövs inte för vägen, och färre kameror skyddar de boendes integritet (O2).',
        'Roboten ska aldrig lyfta, stötta eller mata någon (O1), och den ska inte ersätta personalens samtal och omsorg. Simuleringen kan inte visa hur de boende upplever roboten, om tiden som sparas verkligen går till dem, eller ovanliga situationer som reglerna inte täcker.',
        'Ett starkt svar hänvisar till regler med id, prövar valet under flera förhållanden och tar upp både säkerhet och värdighet.',
      ],
    },
  ],
});
