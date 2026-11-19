import { defineConcepts } from '../../course/types';

export default defineConcepts([
  {
    id: 'koldioxidekvivalent',
    term: 'Koldioxidekvivalent (CO₂e)',
    definition: 'Ett sätt att räkna ihop olika växthusgaser till en siffra: hur mycket koldioxid som skulle ge samma klimatpåverkan. Skrivs ofta kg CO₂e.',
    aliases: ['CO2e', 'CO₂e', 'koldioxidekvivalenter', 'carbon dioxide equivalent', 'klimatpåverkan'],
    related: ['emissionsfaktor'],
  },
  {
    id: 'emissionsfaktor',
    term: 'Emissionsfaktor (för el)',
    definition: 'Hur mycket växthusgaser som släpps ut per kilowattimme el, till exempel gram CO₂e per kWh. Den beror på hur elen produceras – vatten, vind och kärnkraft ger låga värden, kol och gas höga.',
    aliases: ['elmix', 'utsläppsfaktor', 'koldioxidintensitet', 'carbon intensity', 'g CO2e/kWh'],
    related: ['koldioxidekvivalent', 'datacenter'],
  },
  {
    id: 'inferens',
    term: 'Inferens (användning av en modell)',
    definition: 'När en färdigtränad modell används för att ge ett svar, till exempel när en chattbot svarar på en fråga. Varje svar kräver beräkningar och därmed energi, till skillnad från träningen som görs en gång.',
    aliases: ['inference', 'användningsfas', 'körning'],
    related: ['modell', 'traningsdata', 'datacenter'],
  },
  {
    id: 'datacenter',
    term: 'Datacenter',
    definition: 'En byggnad full av servrar som lagrar data och kör beräkningar, till exempel AI-modeller. Datacenter behöver el till servrarna och till kylningen, och ibland vatten för kylning.',
    aliases: ['serverhall', 'data centre', 'data center', 'molnet'],
    related: ['inferens', 'emissionsfaktor'],
  },
  {
    id: 'rekyleffekt',
    term: 'Rekyleffekt',
    definition: 'När något blir effektivare eller billigare används det ofta mer, så att en del av – eller hela – besparingen äts upp. Om användningen ökar mer än effektiviseringen blir den totala förbrukningen till och med större.',
    aliases: ['rebound', 'reboundeffekt', 'Jevons paradox', 'rebound effect'],
    related: ['inferens'],
  },
  {
    id: 'hallbar-utveckling',
    term: 'Hållbar utveckling',
    definition: 'Utveckling som tillgodoser dagens behov utan att äventyra kommande generationers möjligheter. Brukar delas in i en ekologisk, en social och en ekonomisk dimension.',
    aliases: ['hållbarhet', 'sustainable development', 'Agenda 2030'],
    related: ['koldioxidekvivalent'],
  },
]);
