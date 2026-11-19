import { defineLab } from '../../course/types';

export default defineLab({
  id: 'fran-expertregler-till-stora-modeller',
  number: 2,
  part: 'introduktion',
  title: 'Från expertregler till stora modeller',
  summary: 'Ordna milstolpar i AI:s historia och koppla dem till det som drev utvecklingen.',
  goals: [
    'Ordna viktiga milstolpar i AI:s historia från 1956 till 2022.',
    'Koppla milstolparna till drivkrafterna data, beräkningskraft, algoritmer och investeringar.',
    'Förklara hur drivkrafterna samverkar.',
    'Använda kunskap om AI i ett vardagsbeslut.',
  ],
  prerequisites: ['Veta skillnaden mellan fasta regler och lärande system (labb 1).'],
  prerequisiteLabs: ['ar-det-ai'],
  minutes: [15, 20],
  concepts: ['artificiell-intelligens', 'expertsystem', 'regelbaserat-system', 'maskininlarning', 'neuralt-natverk', 'sprakmodell', 'datamangd'],
  keywords: ['AI:s historia', 'Dartmouth', 'ELIZA', 'expertsystem', 'Deep Blue', 'ImageNet', 'AlexNet', 'AlphaGo', 'transformer', 'ChatGPT', 'drivkrafter', 'beräkningskraft', 'investeringar'],
  coverage: [
    {
      topic: 'Ordna historiska milstolpar',
      outcome: 'Eleven ordnar åtta milstolpar med upp/ned-knappar (utan dragning), får återkoppling med ledtråd och försöker igen.',
      verification: 'Playwright: tests/e2e/kapitel1.spec.ts (labb 2: ordna med tangentbord, fel → ledtråd → rätt); logic.test.ts (checkOrder, move)',
    },
    {
      topic: 'Koppla milstolparna till drivkrafter som data, beräkningskraft, algoritmer och investeringar',
      outcome: 'Eleven markerar en drivkraft i tidslinjen och besvarar frågor om Deep Blue, AlexNet och ChatGPT.',
      verification: 'logic.test.ts (drivkrafter); frågorna deepblue-drivkraft, alexnet-drivkraft och chatgpt-drivkrafter med återkoppling',
    },
    {
      topic: 'Avsluta med ett vardagsbeslut där AI-kunnighet spelar roll',
      outcome: 'Eleven väljer hur man bör agera när en bildapp är ”92 % säker” på en svamp och beskriver ett eget vardagsbeslut.',
      verification: 'Fråga svamp med förklarade felsvar; öppen fråga eget-beslut (kriterier, exempel i teacher.ts)',
    },
  ],
  labels: ['pahittad', 'forenklad'],
});
