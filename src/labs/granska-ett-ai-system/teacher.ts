import { defineTeacher } from '../../course/types';

export default defineTeacher({
  purpose:
    'Slutprojektet väver ihop kursen: eleven granskar ett påhittat AI-system och måste använda resultat från labbarna som belägg för en bedömning av mål, data, metod, fel, risker och mänsklig insyn. Projektet kan göras individuellt eller i par (se arbetsformer och bedömningsstöd under rubriken Slutprojekt på lärarsidan).',
  tips: [
    'Planera 3–4 lektioner: (1) välj problem, mål och data, (2) metod och belägg, (3) fel, risker och insyn, (4) slutsats, kamratgranskning med granskningslistan och utskrift.',
    'Arbetet sparas bara i elevens webbläsare. Be eleverna ladda ner textfilen eller skriva ut till PDF i slutet av varje lektion om de byter dator.',
    'Låt par byta rapport med ett annat par och använda granskningslistan som kamratbedömning: vilka påståenden saknar belägg?',
    'Granskningslistan kontrollerar bara att delarna är ifyllda (antal ord). Kvaliteten bedömer läraren – visa det tydligt för eleverna.',
    'Sommarjobbsurvalet är det mest etiskt laddade problemet och passar elever som vill fördjupa sig i rättvisa och lagstiftning. Leveransroboten passar elever som vill arbeta tekniskt.',
  ],
  misconceptions: [
    {
      myth: 'Granskningen är klar när alla rutor i granskningslistan är gröna.',
      reality: 'Listan visar bara att delarna finns. En bra granskning kopplar varje påstående till ett belägg eller markerar det som ett antagande.',
    },
    {
      myth: 'Människa i loopen löser alla risker.',
      reality: 'Människor tenderar att lita på datorns förslag (automatiseringsbias). Insyn kräver tid, kunskap, mandat och möjlighet för den berörda att överklaga.',
    },
    {
      myth: 'Labbarna bevisar hur det riktiga systemet fungerar.',
      reality: 'Labbarna visar mekanismer i små, förenklade modeller. De motiverar vad som måste testas i det verkliga systemet – de ersätter inte testet.',
    },
  ],
  discussionStops: [
    'Efter steg 2: Vem finns i datan, och vem påverkas av besluten? Är det samma personer?',
    'Efter steg 4: Vilket belägg är starkast i er granskning – och vilket påstående vilar mest på antaganden?',
    'Efter steg 6: Skulle ni ändra rekommendation om systemet gjorde dubbelt så många fel för en grupp? Varför?',
  ],
  answers: [
    {
      question: 'Kontrollfråga: Systemet föreslår vilka som kallas till intervju och en handläggare fattar varje beslut. Vilken nivå av insyn är det?',
      answer: [
        '**Människa beslutar.** Vanligt felsvar är ”människa övervakar” – skillnaden är vem som fattar det enskilda beslutet. Följ upp: vad krävs för att handläggaren verkligen ska kunna säga nej?',
      ],
    },
    {
      question: 'Exempelresonemang: matsvinn i skolmatsalen',
      answer: [
        'Mål: minska svinnet utan att någon blir utan mat – mätt som slängda kilo per vecka och antal dagar då maten tog slut. Data: tidigare antal ätande per dag, veckodag, meny, lov och provdagar; inga uppgifter om enskilda elever behövs (dataminimering, labb 24).',
        'Metod: regression (labb 11). Belägg: labb 11 visar att prognosen har fel och att den blir sämre utanför datans område (t.ex. en ny sorts dag); labb 12 visar att modellen måste testas på veckor den inte tränats på.',
        'Fel: för låg prognos är allvarligare än för hög. Insyn: kocken beslutar och kan justera. Rekommendation: inför med villkor – testa en termin och följ upp båda feltyperna.',
      ],
    },
    {
      question: 'Exempelresonemang: urval till kommunens sommarjobb',
      answer: [
        'Urval till arbete räknas som ett högriskområde i EU:s AI-förordning (labb 25), och ansökningarna innehåller personuppgifter (GDPR). Tidigare urval kan innehålla snedvridningar som modellen lär sig (labb 3 och 4).',
        'En bra granskning jämför felandelar mellan grupper med tydliga nämnare (labb 4) och diskuterar var tröskeln ska ligga (labb 23). Rimliga rekommendationer är ”vänta” eller ”inför med villkor” – t.ex. att systemet bara sorterar bort ofullständiga ansökningar och att en människa beslutar resten, med möjlighet att få beslutet förklarat.',
      ],
    },
    {
      question: 'Exempelresonemang: leveransrobot i ett sjukhus',
      answer: [
        'Belägg: labb 8 (kostnader, t.ex. att undvika trånga korridorer), labb 19 (sensorbrus), labb 20 (kartan stämmer inte när dörrar stängs – omplanering) och labb 21 (autonominivå och övertagande).',
        'Fel som spelar roll: kollision med människor, fastnar och blockerar en korridor, levererar för sent. Insyn: människa övervakar, med nödstopp och fjärrövertagande. Personuppgifter kan förekomma på proverna – vem ser dem?',
      ],
    },
  ],
});
