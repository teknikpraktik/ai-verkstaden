import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Vilken robot som passar beror på uppdraget. En lagerrobot på nattskiftet, en ogräsrobot i regn och en robot på ett äldreboende möter helt olika problem. Här väljer du [[sensor|sensorer]], [[autonomi|autonominivå]] och när en människa ska ta över – [[manniska-i-loopen|mänsklig tillsyn]].',
    'Simuleringen är helt regelstyrd: allt som händer följer av en lista med regler som du kan läsa. Därför kan du alltid förklara resultatet – och se exakt vad simuleringen inte tar hänsyn till.',
    { type: 'note', kind: 'pahittad', text: 'Uppdragen, reglerna och siffrorna (antal moment, minuter) är påhittade och förenklade för att visa principer. De beskriver inga verkliga robotar eller arbetsplatser.' },
  ],
  sections: [
    {
      heading: 'Tre autonominivåer',
      blocks: [
        {
          type: 'table',
          caption: 'Autonominivåerna i simuleringen',
          head: ['Nivå', 'Vem bestämmer?', 'Personaltid', 'Svaghet'],
          rows: [
            ['Fjärrstyrd', 'En person styr hela tiden via kameran', 'Hela uppdraget', 'Fungerar inte om kameran inte ser något'],
            ['Övervakad', 'Roboten kör, en person tittar och tar över direkt', 'Hela uppdraget', 'Binder en person, men är säker'],
            ['Självständig', 'Roboten kör och kallar på hjälp enligt villkor', '5 min per övertagande', 'Gör bara det villkoren säger'],
          ],
        },
        'En självständig robot sparar mest personaltid – men bara om villkoren för övertagande är rätt valda. Utan villkoret ”när sensorerna är osäkra” fortsätter den köra fast den inte ser (regel A4).',
      ],
    },
    {
      heading: 'Sensorer har olika svagheter',
      blocks: [
        'En kamera ser inget i mörker. En [[lidar]] fungerar i mörker men störs av regn. GPS fungerar bara utomhus. En närhetssensor ser bara ungefär en meter men fungerar alltid. Genom att kombinera sensorer som inte störs av samma sak blir roboten robustare – i lagret räcker det att lägga till en lidar för att klara nattskiftet.',
        'Men fler sensorer hjälper inte alltid: i regn är både kameran och lidarn osäkra, och ogräsroboten behöver hjälp i alla 8 rader plus en gång för slangen – 9 övertaganden. Då gör roboten knappt någon nytta (regel N1).',
      ],
    },
    {
      heading: 'Omsorg: värdighet och trygghet först',
      blocks: [
        'I omsorgen handlar det om människor, inte om varor. Därför har simuleringen särskilda regler: roboten rör aldrig de boendes kroppar (O1), kameran filmar aldrig inne hos någon (O2) och om en boende behöver hjälp ska personal larmas direkt (O3).',
        'En robot som aldrig krockar kan ändå vara olämplig om den inte larmar när någon mår dåligt. Och tid som roboten sparar är bara värdefull om den används till mer mänsklig kontakt – det kan ingen simulering räkna ut.',
        { type: 'note', kind: 'simulering', text: 'Simuleringen har inga slumpmoment. Samma inställningar ger alltid samma resultat. Verkligheten innehåller många fler situationer än reglerna täcker, och de som bygger robotar måste testa i verkliga miljöer.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Så räknar simuleringen',
      minutes: 10,
      prerequisites: 'labbens genomgång',
      blocks: [
        'Varje sensor får ett tillstånd: *fungerar*, *osäker* eller *fungerar inte*. Förmågan att hitta vägen är den bästa av kamera och lidar (inomhus) – utomhus den sämsta av GPS och den bästa av kamera och lidar.',
        {
          type: 'pseudo',
          title: 'Självständig robot',
          code: `behov ← sämsta av (hitta vägen, utföra uppgiften)
om behov inte fungerar:
    om villkor "osäkra sensorer": stanna och kalla på hjälp
    annars: fortsätt ändå → säkerhetsrisk (A4)
om behov är osäkert och villkoret finns:
    övertaganden ← övertaganden + antal moment
om vägen blockeras:
    om villkor "blockerad": övertaganden + 1
    annars: roboten fastnar
om människor är nära och närhetssensor saknas → säkerhetsrisk (R1)
personaltid ← 5 minuter · övertaganden`,
        },
        'Statusen väljs i ordningen säkerhetsrisk → inte utfört → klart med hjälp → klart. En säkerhetsrisk väger alltså alltid tyngst, oavsett hur effektivt resten gick.',
      ],
    },
  ],
  conclusion: [
    'Att välja robot är att välja kompromisser: sensorer som klarar förhållandena, en autonominivå som passar riskerna och tydliga villkor för när en människa tar över.',
    'Ju mer som står på spel för människor, desto viktigare är mänsklig tillsyn. I nästa kapitel fortsätter vi med etiska frågor om AI-system.',
  ],
});
