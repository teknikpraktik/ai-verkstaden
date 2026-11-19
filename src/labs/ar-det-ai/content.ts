import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Ordet AI används om allt från röststyrda högtalare till tvättmaskiner. Men vad är det egentligen som skiljer ett ”smart” system från ett vanligt program?',
    'I den här labben sorterar du nio vardagssystem. Sedan testar du två små modeller – en termostat och ett skräppostfilter – i situationer där en människa skulle tänka annorlunda.',
    { type: 'note', kind: 'forenklad', text: 'Skräppostfiltret i labben har bara lärt sig av tio påhittade meddelanden. Verkliga filter tränas på enorma mängder mejl och använder många fler ledtrådar än enskilda ord.' },
  ],
  sections: [
    {
      heading: 'Fasta regler eller lärande?',
      blocks: [
        'Ett [[regelbaserat-system]] följer regler som en människa har skrivit: ”om det är kallare än 20,5 °C, värm”. Det gör samma sak varje gång och blir inte bättre av att användas.',
        'Ett lärande system har fått sina regler från exempel. Med [[maskininlarning]] hittar en algoritm mönster i [[traningsdata|träningsdata]], till exempel vilka ord som brukar finnas i skräppost. Resultatet kallas en [[modell]].',
        {
          type: 'table',
          caption: 'Ledtrådar när du sorterar ett system',
          head: ['Fråga', 'Talar för fasta regler', 'Talar för lärande system'],
          rows: [
            ['Vem bestämde reglerna?', 'En människa skrev dem', 'De togs fram ur exempel'],
            ['Blir systemet bättre av mer data?', 'Nej', 'Ja, oftast'],
            ['Kan någon skriva ned alla regler?', 'Ja, de är få och tydliga', 'Nej, det skulle bli för många'],
          ],
        },
        'Att systemet har en [[sensor]] eller känns snabbt och smart säger ingenting om vilken sort det är.',
      ],
    },
    {
      heading: 'Gränsfall',
      blocks: [
        'De flesta verkliga system är byggda av flera delar. Ansiktsupplåsningen har en lärd modell för att känna igen ansikten, men regeln om att kräva kod efter fem försök är fast. Både ”lärande system” och ”kombination” är därför rimliga svar. Ett bra svar säger vilken del man menar.',
        'Ordet [[artificiell-intelligens|artificiell intelligens]] används på olika sätt. Ibland räknas också avancerade regelsystem som AI, till exempel de [[expertsystem]] du möter i nästa labb.',
      ],
    },
    {
      heading: 'Människa och modell',
      blocks: [
        'Människor har förmågor som de små modellerna saknar. Vi **förstår** sammanhang, kan **generalisera** till helt nya situationer, bygger **erfarenhet** av många olika upplevelser och gör **situationsbedömningar** när något ovanligt händer.',
        'Skräppostfiltret har lärt sig ordpoäng. Det kan inte [[generalisering|generalisera]] till engelska, eftersom det aldrig har sett ett engelskt ord. Termostaten värmer för fullt när fönstret står öppet, eftersom regeln inte vet något om fönster.',
        { type: 'note', kind: 'info', text: 'Större modeller klarar mycket mer än de här två – men frågan är densamma: vad har modellen sett, och hur beter den sig i situationer den inte har sett?' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Så räknar skräppostfiltret',
      minutes: 10,
      prerequisites: 'labbens genomgång; ingen programmering krävs',
      blocks: [
        'Varje ord i träningsmeddelandena får en poäng. Ordet får +1 för varje skräpmeddelande det finns i och −1 för varje vanligt meddelande.',
        {
          type: 'pseudo',
          title: 'Träna och använda filtret',
          code: `för varje träningsmeddelande:
    för varje ord i meddelandet (varje ord räknas en gång):
        om meddelandet är skräp: poäng[ord] ← poäng[ord] + 1
        annars:                  poäng[ord] ← poäng[ord] − 1

nytt meddelande:
    summa ← summan av poäng[ord] för alla kända ord
    om summa > 0: skräp
    om summa < 0: inte skräp
    om summa = 0: vet inte – släpp igenom`,
        },
        '”Klicka” finns i tre skräpmeddelanden och inga vanliga, så det får +3. ”Grattis” finns i ett av varje sort och får 0. Riktiga filter använder sannolikheter i stället för hela poäng, men idén är densamma.',
      ],
    },
  ],
  conclusion: [
    'Ett system är inte lärande för att det känns smart, utan för att dess regler har tagits fram ur data. Många verkliga system blandar lärda modeller och fasta regler, och då finns det flera rimliga svar.',
    'Modeller gör det de har byggts eller tränats för. När något ovanligt händer saknar de ofta den förståelse och situationsbedömning som en människa har.',
  ],
});
