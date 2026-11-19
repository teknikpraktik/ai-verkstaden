import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Labben tränar ändamålsbegränsning, dataminimering och lagringsminimering på ett konkret och elevnära fall. Eleverna ser att återkopplingen ändras när bara ändamålet byts, och övar på att formulera följdfrågor i stället för att tro att det finns ett enkelt ja/nej-svar. Leder över till labb 25 om AI-förordningen.',
  tips: [
    'Låt eleverna först göra förutsägelsen individuellt och sedan jämföra i par innan de börjar bocka ur.',
    'Labbens bedömning av vad som ”behövs” är ett antagande. Uppmuntra elever som argumenterar för en annan bedömning (t.ex. att tid per uppgift behövs) – poängen är att motiveringen ska utgå från ändamålet.',
    'Diskutera vem som fattar beslutet i verkligheten: skolans huvudman är normalt personuppgiftsansvarig och leverantören personuppgiftsbiträde. Detta är en förenkling som kan behöva nyanseras.',
  ],
  misconceptions: [
    { myth: 'Mer data gör alltid systemet bättre, så det är bäst att samla in allt.', reality: 'Dataminimering kräver att man bara samlar in det som behövs för ändamålet. För övningsförslag räcker id och svar.' },
    { myth: 'Ett elev-id är anonymt.', reality: 'Ett pseudonymt id kan kopplas till eleven av skolan och räknas därför som en personuppgift. Det är pseudonymiserat, inte anonymt.' },
    { myth: 'Uppgifter som redan finns får användas till vad som helst.', reality: 'Ändamålsbegränsningen gäller. Ett nytt ändamål, som betygssättning, måste prövas för sig.' },
  ],
  discussionStops: [
    'Efter steg 2: Varför tror ni att leverantören ville ha så många uppgifter? Vem tjänar på det?',
    'Efter steg 4: Vilka nya uppgifter behövs när ändamålet blir en läraröversikt? Är det rimligt att läraren ser varje enskilt svar?',
    'Avslutning: Vem bör bestämma – rektorn, läraren, eleverna, leverantören?',
  ],
  answers: [
    { question: 'Förutsägelse: Hur många av de 9 uppgifterna behövs?', answer: ['2 (pseudonymt elev-id och svar på övningar) för ändamålet att föreslå övningar. Tid per uppgift och inloggningstider kan möjligen motiveras men kräver förklaring.'] },
    { question: 'Vilka uppgifter är nödvändiga för ändamålet att föreslå övningar?', answer: ['Pseudonymt elev-id och svar på övningar. Namn behövs inte (id räcker), diagnos behövs inte och är känslig (art. 9), gamla betyg säger mindre än svaren.'] },
    { question: 'Hur länge är det rimligt att spara svaren?', answer: ['Tills kursen är avslutad (eller terminens slut). ”För alltid” bryter mot lagringsminimering; ”efter lektionen” gör att ändamålet inte kan uppnås.'] },
    { question: 'Samma uppgifter, nytt ändamål – vad visar jämförelsen?', answer: ['Att ändamålet styr urvalet: för läraröversikten behövs namn och klass, som inte behövdes för övningsförslagen.'] },
    {
      question: 'Förslag till rektorn: ändamål, uppgifter, lagringstid och två följdfrågor',
      answer: [
        '**Exempel:** Ändamålet är att föreslå övningar. Läxkompis får använda ett pseudonymt elev-id och elevens svar (rätt/fel per uppgift), som raderas när kursen är slut. Namn, klass, betyg, diagnoser, chatt och inloggningstider behövs inte för ändamålet och ska inte samlas in. Innan verktyget används måste vi veta (1) vilket avtal vi har med leverantören och om leverantören får använda uppgifterna för egna syften, och (2) hur eleverna informeras om vad som samlas in och hur länge.',
        'Andra godtagbara följdfrågor: vilken rättslig grund skolan har (art. 6), vem som får se uppgifterna, om uppgifterna lämnar EU, hur elever kan få se sina uppgifter, om en konsekvensbedömning behövs (art. 35).',
      ],
    },
  ],
  sources: [
    { title: 'Förordning (EU) 2016/679 (GDPR), art. 5, 6, 9, 13, 35 – EUR-Lex', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj', checked: '2026-11-19', note: 'EUR-Lex kunde inte läsas maskinellt (webbläsarkontroll, HTTP 202). Artikelinnehållet bygger på förordningstexten som den var känd före kontrollen och har inte kunnat jämföras ord för ord. GDPR har inte ändrats i de delar som används. Kontrollera före publicering.' },
  ],
});
