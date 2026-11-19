import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'AI känns nytt, men forskningen började redan på 1950-talet. Vägen dit vi är i dag gick genom handskrivna regler, schackdatorer och bildtävlingar – och flera perioder då intresset och pengarna nästan tog slut.',
    'I den här labben ordnar du åtta milstolpar och undersöker vad som gjorde dem möjliga: mer **data**, mer **beräkningskraft**, nya **algoritmer** eller större **investeringar**. Sist får du använda det du vet i ett vardagsbeslut.',
    { type: 'note', kind: 'forenklad', text: 'Historien är förenklad till åtta milstolpar. Många viktiga personer och upptäckter saknas, och drivkrafterna är en grov indelning.' },
  ],
  sections: [
    {
      heading: 'Från regler till inlärning',
      blocks: [
        'De första årtiondena handlade mycket om att skriva regler. ELIZA (1966) svarade med mallar utifrån nyckelord. Under 1970- och 1980-talen byggdes [[expertsystem]] där experters kunskap skrevs ned som hundratals regler. De fungerade inom smala områden men var dyra att bygga och svåra att hålla uppdaterade.',
        'Perioder då förväntningarna inte infriades kallas ibland **AI-vintrar**: pengar och intresse minskade, bland annat i mitten av 1970-talet och i slutet av 1980-talet.',
        'Från 2010-talet tog [[maskininlarning]] över, framför allt [[neuralt-natverk|neurala nätverk]] med många lager. Idén var gammal, men nu fanns det data och beräkningskraft nog att träna dem. AlexNet (2012) visade det på bilder. Transformern (2017) gjorde det möjligt att träna stora [[sprakmodell|språkmodeller]] som ChatGPT (2022).',
      ],
    },
    {
      heading: 'Fyra drivkrafter',
      blocks: [
        {
          type: 'table',
          caption: 'Drivkrafter bakom AI:s utveckling',
          head: ['Drivkraft', 'Vad det betyder', 'Exempel i labben'],
          rows: [
            ['D – Data', 'Fler och bättre exempel att lära sig av', 'ImageNet för AlexNet, enorma textmängder för ChatGPT'],
            ['B – Beräkningskraft', 'Snabbare datorer och specialkretsar', 'Deep Blues schackkretsar, grafikkort för AlexNet'],
            ['A – Algoritmer', 'Nya metoder och idéer', 'ELIZA:s mönsterregler, AlphaGo, transformern'],
            ['I – Investeringar', 'Pengar från stater och företag', 'Forskningsbidrag till Dartmouth, techföretagens satsningar på stora modeller'],
          ],
        },
        'Drivkrafterna förstärker varandra. Bättre resultat lockar fler investeringar, som betalar för mer beräkningskraft och mer data, som gör det lönt att utveckla nya algoritmer.',
      ],
    },
    {
      heading: 'Varför det spelar roll i vardagen',
      blocks: [
        'Att veta hur ett AI-system har kommit till hjälper dig att bedöma det. En bildapp har lärt sig av bilder och kan ha fel när något ser ovanligt ut. En språkmodell har lärt sig av text och kan skriva något som låter rätt men är fel. Ju högre priset för ett fel är, desto viktigare är det att kontrollera.',
        { type: 'note', kind: 'pahittad', text: 'Scenariot med svampappen är påhittat. Appen och procentsatsen finns inte på riktigt.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Hur kontrollen av ordningen räknar',
      minutes: 8,
      prerequisites: 'labbens genomgång',
      blocks: [
        'När du kontrollerar räknar labben hur många **par** av milstolpar som står i fel ordning sinsemellan. Med 8 milstolpar finns 8 · 7 / 2 = 28 par. Startordningen har 15 par i fel ordning.',
        {
          type: 'pseudo',
          title: 'Räkna par i fel ordning',
          code: `fel ← 0
för varje plats i från 1 till 8:
    för varje senare plats j:
        om årtal(milstolpe på i) > årtal(milstolpe på j):
            fel ← fel + 1`,
        },
        'Varje gång du byter plats på två grannar som står fel minskar antalet fel par med exakt 1. Därför behövs precis 15 byten om du bara byter grannar som står fel – samma idé som sorteringsmetoden *bubbelsortering*.',
      ],
    },
  ],
  conclusion: [
    'AI har utvecklats i över sextio år, från handskrivna regler till modeller som lär sig av enorma datamängder. Genombrotten kom när data, beräkningskraft, algoritmer och investeringar samverkade.',
    'Att förstå var ett system kommer ifrån hjälper dig att avgöra när du kan lita på det – och när du behöver kontrollera.',
  ],
});
