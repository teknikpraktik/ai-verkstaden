import { defineTeacher } from '../../course/types';

const CHECKED = '2026-11-19';

export default defineTeacher({
  purpose:
    'Extralabben täcker de miljömässiga och ekonomiska delarna av ämnesplanens punkt om ”demokratiska, sociala, ekonomiska, miljömässiga och säkerhetsmässiga möjligheter och risker med AI-användning samt dess konsekvenser för samhället”, och kopplar AI till hållbar utveckling. Eleverna räknar på en påhittad skola, ser skillnaden mellan träning och användning, undersöker osäkerheten ett antagande i taget, möter rekyleffekten och väger till sist nytta mot kostnad. Labben passar efter labb 26 och kan kopplas till naturkunskap eller samhällskunskap.',
  tips: [
    'Börja med förutsägelsen i helklass: låt eleverna gissa bilresans längd innan de ser resultatet. Många tror antingen ”nästan inget” eller ”enormt mycket”.',
    'Betona att alla siffror är antaganden med spann. Elever som ifrågasätter ett värde gör precis det labben tränar – låt dem ändra nivån i experimentläget och se effekten.',
    'Enhetsfrågan (Wh → kWh) är ett bra tillfälle för samarbete med matematiken. Felsvaret 3 000 (glömt att dela med 1 000) är mycket vanligt.',
    'Låt halva klassen köra ”Datacenter i Norden” och andra halvan ”världsgenomsnittlig el” och jämför vilket antagande som hamnar överst.',
    'Siffrorna för verkliga tjänster ändras snabbt. Kontrollera gärna källorna nedan inför lektionen och diskutera varför företagens egna mätningar och oberoende uppskattningar kan skilja.',
  ],
  misconceptions: [
    { myth: 'Det är träningen som står för nästan all energi.', reality: 'Träningen är en stor engångspost, men om modellen används miljarder gånger blir användningen större. I huvudscenariot drar 100 miljarder frågor 30 000 MWh mot träningens 10 000 MWh.' },
    { myth: 'En AI-fråga förbrukar ungefär lika mycket som att köra bil en mil.', reality: 'En vanlig textfråga uppskattas till några tiondels Wh. Det är summan av många användare – och tunga uppgifter som bilder och långa resonemang – som gör skillnad.' },
    { myth: 'Effektivare modeller löser miljöproblemet.', reality: 'Rekyleffekten: om användningen ökar mer än effektiviseringen ökar den totala energin (540 → 720 kWh i labben).' },
    { myth: 'Siffrorna i labben är fakta.', reality: 'De är uttalade antaganden med låga och höga värden. Hela spannet går från ca 6 till ca 1 346 kg CO₂e för samma skola.' },
    { myth: 'AI är bara dåligt för miljön.', reality: 'AI kan också spara energi, till exempel genom att styra värme. Det påhittade värmeexemplet sparar mycket mer än assistenten släpper ut – men nyttan måste visas från fall till fall.' },
  ],
  discussionStops: [
    'Efter steg 2: Är 84 kg CO₂e per läsår mycket eller lite? Jämfört med vad?',
    'Efter steg 4: Varför kan samma beräkning ge 19 eller 197 kg beroende på elmixen? Vem bestämmer var datacentret ligger?',
    'Efter steg 5: Har ni själva märkt en rekyleffekt – att något blev enklare och att ni då använde det mer?',
    'Avslutning: Vem betalar för AI-assistenten, vem får nyttan och var hamnar utsläppen?',
  ],
  answers: [
    { question: 'Förutsägelse: Skolans AI-användning under ett läsår motsvarar ungefär hur lång bilresa?', answer: ['Några hundra km: ca 84 kg CO₂e ≈ 560 km med bensinbil (0,15 kg/km) i huvudscenariot. Med världsgenomsnittlig el blir det ca 440 kg, alltså ca 2 900 km.'] },
    { question: 'Hur många kWh går åt under en skoldag om 1 000 elever ställer 10 frågor var (0,3 Wh per fråga)?', answer: ['3 kWh (10 000 frågor × 0,3 Wh = 3 000 Wh). Vanliga felsvar: 3 000 (Wh i stället för kWh), 0,003 (delat med 1 000 två gånger), 0,3 (en fråga), 30 (fel antal frågor).'] },
    { question: 'Träning 10 000 MWh, 100 miljarder frågor à 0,3 Wh – vad drar mest totalt?', answer: ['Användningen: 30 000 MWh, tre gånger träningen. Träningen per fråga blir 0,1 Wh. Med bara 1 miljon frågor skulle träningen dominera (10 000 Wh per fråga).'] },
    { question: 'Vilket antagande ändrar utsläppen mest i huvudscenariot?', answer: ['Elmixen: ca 19–197 kg CO₂e (skillnad ca 178 kg). Träningen och livslängden ger ca 79 kg, energi per fråga ca 73 kg och energi per bild ca 71 kg. Med världsgenomsnittlig el hamnar i stället träningen och livslängden överst.'] },
    { question: 'Liten modell (0,05 Wh) och 80 frågor per dag – hur många kWh per läsår?', answer: ['720 kWh (1 000 × 80 × 180 × 0,05 Wh), mot 540 kWh före bytet. Utan ökad användning hade det blivit 90 kWh. Felsvaret 4 320 kommer av att räkna med den stora modellen.'] },
    {
      question: 'Ska kommunen ge alla gymnasieelever en AI-assistent? Väg nyttan mot miljökostnaden och den ekonomiska kostnaden.',
      answer: [
        '**Ja, med villkor:** Med nordisk el ger assistenten ca 84 kg CO₂e per år för 1 000 elever (spann ca 6–1 346 kg), ungefär 560 km bilkörning. Det är litet jämfört med t.ex. skolans uppvärmning. Licensen på 400 000 kr är den stora kostnaden – den måste ställas mot tid som lärare sparar och bättre stöd för eleverna. Villkor: en liten modell som standard, datacenter med fossilfri el i avtalet, och att användningen följs upp så att rekyleffekten inte äter upp vinsten.',
        '**Nej, inte för alla:** Siffrorna är så osäkra att vi inte vet om det är 6 eller 1 300 kg. Med världsgenomsnittlig el och bildgenerering blir det betydligt mer, och vatten används där datacentret ligger. 400 000 kr kunde i stället gå till fler lärartimmar. Jag föreslår en mindre pilot för de kurser där nyttan är tydligast, och att leverantören redovisar energi per fråga.',
        '**Prioritera annan AI:** Det påhittade värmeexemplet sparar ca 3 000 kg CO₂e per år, mycket mer än assistenten släpper ut. Om kommunen vill använda AI för hållbar utveckling bör den börja där – men elevassistenten kan ha andra värden (lärande, likvärdighet) som inte mäts i kilo.',
        'Bedöm om eleven använder siffror med enhet, nämner osäkerhet eller ett spann, jämför med något, tar upp vem som betalar och får nyttan, och föreslår villkor med tanke på rekyleffekten.',
      ],
    },
  ],
  sources: [
    {
      title: 'IEA: Energy and AI (2025), sammanfattning',
      url: 'https://www.iea.org/reports/energy-and-ai/executive-summary',
      checked: CHECKED,
      note: 'Används för: datacenter ca 415 TWh el 2024 (ca 1,5 % av världens el), prognos ca 945 TWh 2030, AI största drivkraften, stor osäkerhet. Kontrollstatus: värden www.iea.org kunde inte nås från arbetsmiljön (spärrad). Siffrorna kontrollerades 2026-11-19 bara via sökresultat som återger rapporten (bl.a. American Public Power Association och DatacenterDynamics). Kontrollera mot IEA före publicering.',
    },
    {
      title: 'Elsworth m.fl.: Measuring the environmental impact of delivering AI at Google Scale (arXiv:2508.15734, 2025)',
      url: 'https://arxiv.org/abs/2508.15734',
      checked: CHECKED,
      note: 'Används för: medianenergi ca 0,24 Wh per textfråga (0,10 Wh om bara acceleratorerna räknas) och vattenanvändning ca 1,15 liter per kWh i företagets datacenter (huvudvärdet 1 liter/kWh i labben är ett avrundat undervisningsantagande). Kontrollstatus: arxiv.org var spärrad; uppgifterna kontrollerades via sökresultat (abstrakt och sammanfattningar). Labben anger inget företags- eller produktnamn.',
    },
    {
      title: 'Ritchie, H.: What’s the carbon footprint of using ChatGPT or Gemini? (augusti 2025)',
      url: 'https://hannahritchie.substack.com/p/ai-footprint-august-2025',
      checked: CHECKED,
      note: 'Sekundärkälla som sammanställer publicerade och oberoende uppskattningar (bl.a. Epoch AI ca 0,3 Wh) till ca 0,2–0,4 Wh per vanlig textfråga. Endast via sökresultat. Underlag för spannet 0,15–0,6 Wh (stor modell) i labben, som avsiktligt är bredare.',
    },
    {
      title: 'Luccioni, Jernite, Strubell: Power Hungry Processing – Watts Driving the Cost of AI Deployment? (arXiv:2311.16863, v3 2024)',
      url: 'https://arxiv.org/abs/2311.16863',
      checked: CHECKED,
      note: 'Används för: bildgenerering i medel ca 2,9 kWh per 1 000 bilder (≈ 2,9 Wh per bild, huvudvärde 3 Wh) och ca 11,5 Wh för den mest krävande modellen (högt värde). Öppna modeller på en A100-GPU; kommersiella tjänster redovisar inte motsvarande. Kontrollstatus: endast via sökresultat (arxiv.org spärrad).',
    },
    {
      title: 'Patterson m.fl.: Carbon Emissions and Large Neural Network Training (arXiv:2104.10350, 2021)',
      url: 'https://arxiv.org/abs/2104.10350',
      checked: CHECKED,
      note: 'Används för: träning av en stor språkmodell från 2020 uppskattad till ca 1 287 MWh (lågt värde 1 000 MWh i labben). Huvudvärdet 10 000 MWh och högt värde 50 000 MWh är undervisningsantaganden för nyare, större modeller. Endast via sökresultat.',
    },
    {
      title: 'Naturvårdsverket: Klimatklivet – värden för att beräkna utsläppsminskning (version 2025-09-08)',
      url: 'https://www.naturvardsverket.se/4a5639/globalassets/amnen/klimatomstallning/klimatklivet/dokument/klimatklivet-varden-for-att-berakna-utslappsminskning-2025-09-08.pdf',
      checked: CHECKED,
      note: 'Används för: 90 g CO₂e/kWh för el (nordisk elmix inkl. import/export, med hänvisning till SMED-rapport nr 4 2021). Kontrollstatus: www.naturvardsverket.se var spärrad; värdet kontrollerades via sökresultat som återger dokumentet. Energimyndighetens egna värden hittades inte i sökningen. Spannets ändar (20 g ≈ svensk produktion enligt tredjepartsdata, ca 210 g ≈ residualmix enligt elbolagsuppgift) är avrundade undervisningsvärden.',
    },
    {
      title: 'Ember: Global Electricity Review 2025',
      url: 'https://ember-energy.org/latest-insights/global-electricity-review-2025/global-electricity-trends/',
      checked: CHECKED,
      note: 'Används för: världens elproduktion ca 473 g CO₂/kWh 2024 (huvudvärde 470), USA ca 384 g och Kina ca 560 g (spannets ändar). Kontrollstatus: ember-energy.org var spärrad; endast via sökresultat.',
    },
  ],
});
