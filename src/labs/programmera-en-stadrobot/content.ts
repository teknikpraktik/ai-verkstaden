import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'En städrobot är ett bra exempel på en [[agent]]: den har ett mål (ett rent golv), [[sensor|sensorer]] som känner av omgivningen och [[handling|handlingar]] den kan utföra. Men hur väljer den vad den ska göra härnäst?',
    'Du stegar två program i samma rum. Det ena väljer håll på måfå. Det andra följer regler och minns vad det har sett. Sedan ändrar du en sak i taget: först hur långt roboten ser, sedan hur rummet är möblerat.',
    { type: 'note', kind: 'simulering', text: 'Rummet, roboten och smutsen är en förenklad simulering. Varje handling – ett steg eller en sugning – räknas som en tidsenhet, och simuleringen avbryts efter 300 handlingar.' },
  ],
  sections: [
    {
      heading: 'Agentens fem delar',
      blocks: [
        'I varje steg gör roboten samma sak: den läser av sensorerna, uppdaterar sitt [[tillstand|tillstånd]], väljer en handling och ser resultatet. Det kallas ibland agentens slinga.',
        {
          type: 'table',
          caption: 'Städroboten beskriven som agent',
          head: ['Del', 'Vad det är', 'Hos städroboten'],
          rows: [
            ['Mål', 'Vad agenten ska åstadkomma', 'Alla rutor ska vara rena'],
            ['Sensorinformation', 'Det agenten mäter just nu', 'Är min ruta smutsig? Ser jag smuts inom sikten? Står det något i vägen?'],
            ['Tillstånd', 'Det agenten vet om sig själv och världen', 'Var jag står, vilka rutor jag har kontrollerat, var jag har sett smuts'],
            ['Handling', 'Det agenten kan göra', 'Suga, gå ett steg åt något håll, stanna'],
            ['Resultat', 'Vad handlingen ledde till', 'Rutan blev ren, roboten flyttade sig'],
          ],
        },
        'Slumproboten har inget minne. Den regelstyrda roboten har ett minne och en karta över möblerna. Det är en del av dess tillstånd, och det är därför den kan arbeta systematiskt.',
      ],
    },
    {
      heading: 'Regler prövas uppifrån och ned',
      blocks: [
        'Den regelstyrda robotens program är en lista med regler av typen *om … så …*. I varje steg prövas reglerna i ordning, och den första som passar används. Ordningen spelar roll: om regeln om att suga stod sist skulle roboten gå förbi smuts.',
        'Ett program som bara består av sådana regler är ett [[regelbaserat-system|regelbaserat system]]. Roboten lär sig ingenting – den gör alltid samma sak i samma situation. Därför blir körningen exakt likadan varje gång.',
      ],
    },
    {
      heading: 'Slump som går att upprepa',
      blocks: [
        'Datorer kan inte slå tärning på riktigt. De räknar fram tal som ser slumpmässiga ut utifrån ett [[startvarde]]. Samma startvärde ger samma följd, så du kan visa en kamrat exakt samma körning.',
        'Slumpen kan ha tur, men den kan också gå fram och tillbaka i samma hörn länge. I det tomma rummet blev slumproboten klar efter mellan 60 och 236 handlingar för startvärdena 1–20, och två körningar blev inte klara alls inom 300 handlingar. Den regelstyrda roboten behöver alltid 32.',
      ],
    },
    {
      heading: 'Sikt och miljö',
      blocks: [
        'Med sikt 0 ser roboten bara rutan den står på. Med större sikt ser den smuts längre bort och kan gå direkt dit. När bara sikten ändras – rummet och reglerna är desamma – minskar antalet handlingar från 32 (sikt 0) till 24 (sikt 1) och 22 (sikt 2).',
        'Miljön påverkar också. I det möblerade rummet måste roboten runda en soffa och ett bord. Den regelstyrda roboten klarar det med sin karta (31 handlingar), medan slumproboten lätt fastnar bakom möblerna.',
        { type: 'note', kind: 'forenklad', text: 'Roboten ser smuts ”genom” möbler och mäter avståndet i steg upp, ned, höger och vänster. En riktig robot har brusiga sensorer och vet inte exakt var den är – det kommer du till i kapitel 5.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Den regelstyrda roboten i pseudokod',
      minutes: 10,
      prerequisites: 'labbens genomgång; ingen programmering krävs',
      blocks: [
        'Så här kan programmet skrivas. ”Närmaste” räknas som kortast väg runt möblerna, och den hittas med en bredden-först-sökning som du lär dig mer om i [labb 7](/labb/bredden-forst-och-djupet-forst/).',
        {
          type: 'pseudo',
          title: 'Regelstyrd städrobot',
          code: `kontrollerade ← tom mängd
känd_smuts ← tom mängd
upprepa:
    läs sensorerna
    lägg alla rutor inom sikten i kontrollerade
    lägg smuts som syns i känd_smuts
    om egna rutan är smutsig:        sug
    annars om känd_smuts inte är tom: gå ett steg mot närmaste kända smuts
    annars om någon nåbar ruta inte är kontrollerad:
                                     gå ett steg mot närmaste sådan ruta
    annars:                          stanna`,
        },
        'Lägg märke till att roboten inte kan veta att rummet är rent förrän den har kontrollerat alla rutor. Därför fortsätter den en stund efter att sista smutsen är borta.',
      ],
    },
  ],
  conclusion: [
    'En agent väljer handlingar utifrån sitt mål, det sensorerna visar och det den minns. Regler och minne gav en robot som var både snabbare och pålitligare än slumpen i samma rum.',
    'Bättre sensorer (större sikt) gav färre handlingar, och en svårare miljö (möbler) gjorde det svårare för slumpen. Att hitta närmaste väg runt hinder är ett sökproblem – det är vad resten av kapitlet handlar om.',
  ],
});
