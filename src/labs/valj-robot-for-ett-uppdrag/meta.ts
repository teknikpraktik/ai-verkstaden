import { defineLab } from '../../course/types';

export default defineLab({
  id: 'valj-robot-for-ett-uppdrag',
  number: 21,
  part: 'robotik',
  title: 'Välj robot för ett uppdrag',
  summary: 'Konfigurera sensorer, autonominivå och villkor för mänskligt övertagande för uppdrag i lager, jordbruk och omsorg – och förklara resultatet med simuleringens regler.',
  goals: [
    'Jämföra krav på robotar i olika uppdrag, till exempel lager, jordbruk och omsorg.',
    'Välja sensorer, autonominivå och villkor för mänskligt övertagande och motivera valet.',
    'Förklara varför samma robot fungerar olika under olika förhållanden, med hänvisning till uttryckliga regler och begränsningar.',
  ],
  prerequisites: ['Känna till kedjan sensor → styrprogram → motor (labb 19).'],
  prerequisiteLabs: ['styr-en-robot'],
  minutes: [15, 20],
  concepts: ['autonomi', 'manniska-i-loopen', 'sensor', 'robot', 'lidar', 'regelbaserat-system', 'ansvar'],
  keywords: ['autonominivå', 'fjärrstyrd', 'övervakad', 'självständig', 'mänskligt övertagande', 'lidar', 'kamera', 'GPS', 'närhetssensor', 'lager', 'jordbruk', 'omsorg', 'äldreboende', 'mörker', 'regn', 'värdighet'],
  coverage: [
    {
      topic: 'Jämför uppdrag i exempelvis lager, jordbruk och omsorg',
      outcome: 'Eleven kör tre påhittade uppdrag och ser att de ställer olika krav: lidar i mörkt lager, kamera för ogräs i odlingen, närhetssensor och larmvillkor i omsorgen.',
      verification: 'logic.test.ts (lager, jordbruk och omsorg med kända utfall); Playwright kapitel5.spec.ts (omsorgssteget)',
    },
    {
      topic: 'Konfigurera sensorer, autonominivå och villkor för mänskligt övertagande',
      outcome: 'Eleven väljer fritt bland fyra sensorer, tre autonominivåer och tre villkor i experimentläget och ser effekten direkt.',
      verification: 'logic.test.ts (fjärrstyrd, övervakad, självständig med och utan villkor); Playwright ändrar sensor i experimentläget',
    },
    {
      topic: 'Kör samma uppdrag under olika förhållanden',
      outcome: 'Jämförelsetabellen visar samma robot i normalt läge, mörker, regn och trängsel; eleven räknar ut 9 övertaganden i regn.',
      verification: 'logic.test.ts (jordbruk i regn: 9 övertaganden, 45 min); Playwright: fel → återkoppling → rätt i fråga regn-overtaganden',
    },
    {
      topic: 'Förklara resultat utifrån explicit angivna regler och begränsningar',
      outcome: 'Varje utfall förklaras rad för rad med regel-id (S1–O3) och reglerna som används markeras i regellistan; eleven motiverar ett eget val med regelhänvisningar.',
      verification: 'logic.test.ts (varje förklaring hänvisar till en regel i listan); frågor lager-morker och omsorg-varfor; öppen fråga motivera-omsorg',
    },
  ],
  labels: ['simulering', 'pahittad', 'forenklad'],
});
