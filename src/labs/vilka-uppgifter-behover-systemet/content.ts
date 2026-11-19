import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Ett AI-verktyg i skolan kan samla in mycket om eleverna. Men hur mycket behöver det egentligen veta? Här får du granska ett förslag från en leverantör och skära bort det som inte behövs.',
    'Verktyget, skolan och leverantören är påhittade. Du arbetar bara med uppgiftstyper – inga riktiga elevuppgifter.',
    { type: 'note', kind: 'pahittad', text: 'Läxkompis och Ekbackens gymnasium finns inte. Bedömningen av vad som ”behövs” bygger på labbens antaganden och är förenklad; i verkligheten görs den av skolans huvudman tillsammans med dataskyddsombudet.' },
  ],
  sections: [
    {
      heading: 'Tre principer i GDPR',
      blocks: [
        'Dataskyddsförordningen, [[gdpr|GDPR]], innehåller principer för all behandling av [[personuppgift|personuppgifter]] (artikel 5). Tre av dem står i centrum i labben:',
        {
          type: 'table',
          caption: 'Principerna i labben',
          head: ['Princip', 'Betyder', 'Fråga att ställa'],
          rows: [
            ['[[andamalsbegransning|Ändamålsbegränsning]]', 'Uppgifter samlas in för ett tydligt angivet ändamål och används inte för något oförenligt.', 'Vad ska uppgifterna användas till – exakt?'],
            ['[[dataminimering|Dataminimering]]', 'Bara de uppgifter som behövs för ändamålet.', 'Fungerar det utan den här uppgiften?'],
            ['[[lagringsminimering|Lagringsminimering]]', 'Inte sparas längre än ändamålet kräver.', 'När behövs uppgiften inte längre?'],
          ],
        },
        'Ordningen spelar roll: först bestäms ändamålet, sedan vilka uppgifter som behövs och hur länge. Därför ändras återkopplingen när du byter ändamål, trots att uppgifterna är desamma.',
      ],
    },
    {
      heading: 'Pseudonymer och känsliga uppgifter',
      blocks: [
        'Ett slumpat elev-id i stället för namn är [[pseudonymisering]]. Det minskar risken om uppgifterna läcker, men det är fortfarande personuppgifter eftersom skolan kan koppla id:t till en elev.',
        'Uppgifter om hälsa, som en diagnos, hör till [[kanslig-personuppgift|känsliga personuppgifter]] (GDPR artikel 9). De får bara behandlas om något av undantagen i artikeln gäller, och kräver extra eftertanke.',
        { type: 'note', kind: 'info', text: 'Labben ger ingen juridisk bedömning. Den tränar dig i att ställa rätt frågor. Läs mer om reglerna i [nästa labb](/labb/hur-regleras-ett-ai-system/).' },
      ],
    },
  ],
  conclusion: [
    'Leverantörens förslag innehöll 9 uppgifter som skulle sparas i 5 år. För att föreslå övningar räcker 2: ett pseudonymt id och svaren, sparade tills kursen är slut.',
    'Vilka uppgifter som behövs beror på ändamålet. Ett nytt ändamål – som att använda svaren för betyg – kräver en ny prövning, inte bara att uppgifterna redan finns.',
  ],
});
