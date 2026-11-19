import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Nu är det dags att använda allt du har gjort i kursen. Du ska granska ett påhittat AI-system, som om du vore den som ska ge råd innan systemet införs.',
    'Guiden tar dig genom sju steg: välj problem, beskriv mål och data, välj metod, hämta belägg från kursens labbar, bedöm fel, risker och [[manniska-i-loopen|mänsklig insyn]], ge en rekommendation och skriv ut rapporten. Allt sparas automatiskt i din webbläsare, så du kan fortsätta en annan lektion på samma dator.',
    {
      type: 'note',
      kind: 'pahittad',
      text: 'Alla problem, organisationer och platser i projektet är påhittade. Använd inga verkliga personer eller riktiga personuppgifter, inte heller i ett eget problem.',
    },
    {
      type: 'note',
      kind: 'tips',
      text: 'I läget **Genomgång** visas ett steg i taget. I läget **Experiment** visas alla steg på en gång – bra om du vill se hela projektet. **Börja om** raderar hela projektet.',
    },
  ],
  sections: [
    {
      heading: 'Vad är en bra granskning?',
      blocks: [
        'En granskning ska hjälpa någon att fatta ett bättre beslut. Därför räcker det inte att säga att ett system ”är bra” eller ”är farligt”. Du behöver visa **vad** du grundar din bedömning på.',
        {
          type: 'table',
          caption: 'Belägg, antagande och påstående utan stöd',
          head: ['Typ', 'Exempel'],
          rows: [
            [
              'Belägg från en labb',
              'I [Vem får fel svar?](/labb/vem-far-fel-svar/) såg jag att samma modell kan ha olika [[felandel]] för olika grupper. Därför måste felen i vårt system mätas gruppvis.',
            ],
            ['Eget antagande', 'Jag antar att kökspersonalen vill ha prognosen kvällen innan. Det behöver kontrolleras med dem.'],
            ['Påstående utan stöd', '”AI är alltid bättre än människor på att förutsäga.” Undvik sådant – vad bygger det på?'],
          ],
        },
        'Labbarna i kursen är små och förenklade. De bevisar inte hur ett verkligt system beter sig, men de visar **mekanismer** – till exempel att [[overanpassning|överanpassning]] finns, att en [[troskel|tröskel]] flyttar fel mellan grupper eller att en robots karta kan vara fel. Det är sådana mekanismer du använder som belägg.',
      ],
    },
    {
      heading: 'Fel, risker och mänsklig insyn',
      blocks: [
        'Alla AI-system gör fel. Frågan är vilka fel, hur ofta, för vem och vad de kostar. Ett [[falskt-negativ|falskt negativt]] utfall i sommarjobbsurvalet betyder att en lämplig sökande inte kallas till intervju – ett [[falskt-positiv|falskt positivt]] att någon kallas i onödan. Det är inte samma sak.',
        {
          type: 'list',
          items: [
            '**Helt automatiskt** – kan passa när felen är små, lätta att upptäcka och lätta att rätta.',
            '**Människa övervakar** – systemet beslutar, men någon följer resultatet och kan stoppa.',
            '**Människa beslutar** – systemet föreslår och en människa fattar varje beslut. Det fungerar bara om personen har tid, kunskap och rätt att säga nej.',
            '**Avstå från AI** – ibland är det bästa beslutet att inte använda ett AI-system alls.',
          ],
        },
        'Tänk också på lagar och regler. Om systemet behandlar [[personuppgift|personuppgifter]] gäller [[gdpr|GDPR]], och vissa användningsområden – till exempel urval till arbete – räknas som högrisk i [[ai-forordningen|EU:s AI-förordning]]. Repetera i [Hur regleras ett AI-system?](/labb/hur-regleras-ett-ai-system/).',
      ],
    },
  ],
  conclusion: [
    'Du har nu granskat ett AI-system från problem till rekommendation. Samma frågor – vad är målet, vilka data, vilken metod, vilka fel, vem drabbas och vem kan ingripa – kan du ställa om vilket AI-system som helst.',
    'Fortsätt till [reflektionssidan](/reflektion/) och skriv ned vad du har lärt dig i kursen.',
  ],
});
