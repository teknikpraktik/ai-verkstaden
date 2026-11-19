import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Varje gång en AI svarar på en fråga körs beräkningar i ett [[datacenter]]. Det kräver el, ibland vatten för kylning – och elen kan ge utsläpp. Hur mycket är det egentligen, och är det mycket eller lite jämfört med nyttan?',
    'Här räknar du på en påhittad skola som ger alla elever en AI-assistent. Du ser energi, utsläpp, vatten och kostnad, jämför med vardagssaker och undersöker vilket antagande som avgör mest.',
    { type: 'note', kind: 'pahittad', text: 'Åsens gymnasium, kommunen, priserna och värmeexemplet är påhittade.' },
    { type: 'note', kind: 'forenklad', text: 'Beräkningen är kraftigt förenklad: den räknar bara el i datacentret för svaren, en andel av träningen och kylvatten. Tillverkning av datorer, nätverk, elevernas egna skärmar och mycket annat ingår inte. Alla energital är osäkra uppskattningar med spann – se tabellen nedan.' },
  ],
  sections: [
    {
      heading: 'Så räknar labben',
      blocks: [
        { type: 'formula', text: 'energi (kWh) = antal frågor × Wh per fråga ÷ 1 000 + antal bilder × Wh per bild ÷ 1 000 + skolans andel av träningen', caption: '1 kWh = 1 000 Wh. Ett läsår har 180 skoldagar och 36 veckor.' },
        { type: 'formula', text: 'träning per fråga (Wh) = träningens energi (Wh) ÷ antal frågor modellen besvarar under hela sin livstid' },
        { type: 'formula', text: 'utsläpp (kg CO₂e) = energi (kWh) × emissionsfaktor (g CO₂e per kWh) ÷ 1 000' },
        'Med huvudvärdena: 1 000 elever × 10 frågor × 180 dagar = 1,8 miljoner frågor. De drar 540 kWh, bilderna 216 kWh och skolans andel av träningen 180 kWh – totalt 936 kWh. Med nordisk elmix (90 g per kWh) blir det ca 84 kg [[koldioxidekvivalent|CO₂e]].',
        'Varje antagande har ett lågt värde, ett huvudvärde och ett högt värde. Om alla antaganden är låga samtidigt blir det ca 6 kg, om alla är höga ca 1 346 kg. Att alla hamnar i samma ände är osannolikt, men spannet visar hur lite vi vet säkert.',
      ],
    },
    {
      heading: 'Antagandena och var de kommer ifrån',
      blocks: [
        {
          type: 'table',
          caption: 'Lågt – huvudvärde – högt. ”Undervisningsantagande” betyder ett rimligt valt värde utan direkt källa.',
          head: ['Antagande', 'Värden', 'Ursprung'],
          rows: [
            ['Energi per textfråga, stor modell', '0,15 – 0,3 – 0,6 Wh', 'Publicerade mätningar och oberoende uppskattningar 2025 hamnar ungefär mellan 0,2 och 0,4 Wh för en vanlig textfråga. Längre svar kräver mer.'],
            ['Energi per fråga, liten modell', '0,02 – 0,05 – 0,1 Wh', 'Undervisningsantagande: en mindre modell kräver färre beräkningar.'],
            ['Energi per fråga, ”resonerande” modell', '1 – 4 – 10 Wh', 'Undervisningsantagande. Uppskattningar för svar med långa mellansteg ligger på flera Wh.'],
            ['Energi per genererad bild', '0,5 – 3 – 11,5 Wh', 'En forskningsstudie av öppna bildmodeller (2023–2024) fick i medel ca 2,9 Wh per bild och upp till ca 11,5 Wh för den mest krävande modellen. Lågt värde: undervisningsantagande.'],
            ['Träningens energi, stor modell', '1 000 – 10 000 – 50 000 MWh', 'En vetenskaplig uppskattning från 2021 gav ca 1 300 MWh för en stor språkmodell från 2020. Nyare modeller är större; huvudvärde och högt värde är undervisningsantaganden.'],
            ['Träningens energi, liten modell', '10 – 100 – 1 000 MWh', 'Undervisningsantagande.'],
            ['Frågor under modellens livstid', '1 000 miljarder – 100 miljarder – 20 miljarder', 'Undervisningsantagande. Få frågor ger hög andel träning per fråga, därför är ”högt” det minsta talet.'],
            ['[[emissionsfaktor|Emissionsfaktor]], Norden', '20 – 90 – 210 g CO₂e/kWh', 'Naturvårdsverket anger 90 g CO₂e/kWh för nordisk elmix i Klimatklivet. Svensk elproduktion ensam ligger lägre (några tiotal gram), och den så kallade residualmixen högre (ca 210 g).'],
            ['Emissionsfaktor, världen', '380 – 470 – 560 g CO₂e/kWh', 'Världsgenomsnittet för elproduktion var ca 470 g CO₂/kWh 2024 (Ember). USA låg kring 380 g och Kina kring 560 g.'],
            ['Kylvatten', '0,2 – 1 – 2 liter per kWh', 'Undervisningsantagande. Ett stort molnföretag redovisade ca 1,1 liter per kWh för sina datacenter; luftkylda datacenter i kallt klimat använder mindre.'],
            ['Vardagsjämförelser', '0,1 kWh per liter kokat vatten, 15 Wh per mobilladdning, 0,15 kg CO₂e per km med bensinbil', 'Avrundade undervisningsantaganden. Att värma 1 liter vatten från 10 till 100 °C kräver ca 0,1 kWh.'],
          ],
        },
        { type: 'note', kind: 'varning', text: 'Lita inte på en enda siffra om AI:s energi – inte heller på dem här. Mätmetoderna skiljer sig (räknas kylning och vilande servrar med?), tekniken ändras snabbt och företagen redovisar olika mycket. Fråga alltid: vad ingår, och vilket år gäller siffran?' },
      ],
    },
    {
      heading: 'Träning och användning',
      blocks: [
        'En AI-modell tränas en gång, och det kan kräva lika mycket el som hundratals eller tusentals hushåll använder under ett år. Sedan används modellen – [[inferens]] – kanske miljarder gånger. Varje svar kräver lite energi, men tillsammans blir det mycket. I huvudscenariot drar 100 miljarder frågor tre gånger så mycket energi som träningen.',
        'Därför spelar både antalet användare och valet av modell roll. En liten modell som räcker för uppgiften kan kräva en bråkdel av energin per svar.',
      ],
    },
    {
      heading: 'Rekyleffekt – och AI som sparar energi',
      blocks: [
        'När något blir effektivare blir det också billigare och enklare att använda, så vi använder mer. Det kallas [[rekyleffekt]]. Om den lilla modellen kräver sex gånger mindre energi men eleverna ställer åtta gånger fler frågor, ökar energin från 540 till 720 kWh.',
        'AI kan också minska miljöpåverkan: styra värme och ventilation, planera transporter eller hitta läckor. I labbens påhittade exempel sparar AI-styrd värme 50 000 kWh värme och ca 3 000 kg CO₂e per år – långt mer än AI-assistenten släpper ut. Men nyttan måste visas i varje enskilt fall, och besparingen kan också ätas upp av rekyleffekter.',
      ],
    },
    {
      heading: 'Det stora perspektivet',
      blocks: [
        'Enligt Internationella energiorganet (IEA) använde världens datacenter ca 415 TWh el 2024, ungefär 1,5 procent av all el i världen. IEA räknar med att det kan bli ungefär det dubbla, ca 945 TWh, till 2030 – och AI är den största drivkraften. Elen behövs ofta på särskilda platser, vilket kan belasta elnätet lokalt. IEA betonar att prognosen är mycket osäker.',
        'För en enskild elev är energin per dag liten – i huvudscenariot ca 5 Wh, en tredjedel av en mobilladdning. Det är summan av miljarder användares frågor som gör AI till en fråga för [[hallbar-utveckling]].',
      ],
    },
    {
      heading: 'Ekonomi: vem betalar och vem får nyttan?',
      blocks: [
        {
          type: 'list',
          items: [
            'Skolan betalar en licens (i labben påhittade 400 kr per elev och år). Elen i datacentret är bara ca 1 400 kr av det – den ingår i leverantörens pris.',
            'Leverantören betalar el och vatten, men utsläppen och vattenuttaget hamnar där datacentret ligger – ofta någon annanstans än där nyttan finns.',
            'Nyttan – bättre förklaringar, tid som sparas för lärare – är svår att mäta i kronor eller kilo, men är skälet till att använda tekniken.',
            'Nya datacenter kan ge jobb och skatteintäkter i en kommun, men också höja efterfrågan på el och mark. Kunskap om AI blir en viktig färdighet på arbetsmarknaden, medan vissa arbetsuppgifter kan försvinna.',
          ],
        },
      ],
    },
  ],
  conclusion: [
    'AI:s miljökostnad beror främst på hur mycket den används, vilken modell som används och var elen kommer ifrån. I det nordiska huvudscenariot avgör elmixen mest – i ett annat scenario kan träningen eller modellvalet väga tyngst.',
    'Siffrorna är osäkra, och därför är det viktigaste att kunna fråga: vilka antaganden ligger bakom, vad ingår, och vad ställs nyttan mot?',
  ],
  deepDives: [
    {
      heading: 'Gör en egen känslighetsanalys',
      minutes: 10,
      prerequisites: 'Experimentläget i labben.',
      blocks: [
        'Byt i experimentläget till ”Datacenter med världsgenomsnittlig el”. Vilket antagande hamnar nu överst i ”Ett antagande i taget”? Varför ändras ordningen när elmixen ändras?',
        'Välj sedan den resonerande modellen. Hur många frågor per dag kan eleverna ställa till den lilla modellen för samma energi som 10 frågor till den resonerande?',
      ],
    },
  ],
});
