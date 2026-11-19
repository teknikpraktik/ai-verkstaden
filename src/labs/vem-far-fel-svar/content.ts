import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Två påhittade skolor, Norrby och Söderby, har fått en skanner som läser elevernas handskrivna svar på matteprov. Den ska avgöra om det står 1 eller 7. Modellen tränades på svar från Norrby. Fungerar den lika bra för alla?',
    'Du kör en enkel [[klassificering|klassificerare]], jämför [[felandel|felandelen]] för båda skolorna och provar vad som händer när [[urval|urvalet]] i [[traningsdata|träningsdatan]] ändras.',
    { type: 'note', kind: 'syntetisk', text: 'Skolorna, eleverna och alla mätvärden är påhittade. Skillnaden i handstil är vald för att visa en princip – den beskriver inga verkliga skolor.' },
  ],
  sections: [
    {
      heading: 'Skriv alltid ut nämnaren',
      blocks: [
        'En felandel är antalet fel delat med antalet fall. Talet under bråkstrecket – **nämnaren** – avgör vad siffran betyder. ”5 fel” säger lite. ”5 fel av 10 svar” och ”5 fel av 50 svar” är helt olika resultat.',
        {
          type: 'table',
          caption: 'Samma fel, olika nämnare (modellen tränad på 24 svar från Norrby)',
          head: ['Grupp', 'Fel av antal svar', 'Felandel'],
          rows: [
            ['Norrby', '0 av 40', '0 %'],
            ['Söderby', '5 av 10', '50 %'],
            ['Alla tillsammans', '5 av 50', '10 %'],
          ],
        },
        'Totalen ser bra ut eftersom Norrby är den stora gruppen. Den som bara tittar på 10 % missar att varannan elev i Söderby får sitt svar fel läst. Därför ska man jämföra felandelar **per grupp**.',
      ],
    },
    {
      heading: 'Urvalet är viktigare än mängden',
      blocks: [
        'När modellen bara får se Norrbys handstil lär den sig en gräns som passar Norrby. Att samla in dubbelt så många svar från Norrby ändrar ingenting för Söderby – det är fortfarande samma urval. Men med lika många svar totalt, hälften från varje skola, flyttas gränsen så att Söderbys ettor läses rätt.',
        'Det här är ett exempel på [[bias|snedvridning]]: felet beror inte på att någon ville göra fel, utan på vilka exempel som råkade finnas med i träningen.',
      ],
    },
    {
      heading: 'Att förstå modellen är inte samma sak som att lita på den',
      blocks: [
        'Modellen i labben är så enkel att den kan förklaras med en mening: ”Är det övre strecket längre än tröskeln, svara 7.” En sådan förklaring är värdefull – den visar vilken [[egenskap]] modellen använder och var gränsen går. Det var så vi kunde se varför Söderbys ettor blev fel.',
        'Men förklaringen fanns hela tiden, även innan någon testade modellen på Söderbys svar. [[transparens|Transparens]] gör det möjligt att granska ett system. Om man kan lita på utfallet avgörs av hur det fungerar på riktiga data från alla som berörs.',
        { type: 'note', kind: 'forenklad', text: 'Verkliga system för handskrift tittar på tusentals egenskaper samtidigt och är svårare att förklara. Principen att fel ska jämföras per grupp med tydlig nämnare gäller ändå.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Hur modellen hittar sin tröskel',
      minutes: 10,
      prerequisites: 'labbens genomgång; ingen programmering krävs',
      blocks: [
        'Modellen provar många möjliga trösklar och räknar hur många träningssvar varje tröskel skulle läsa fel. Den väljer tröskeln med minst antal fel.',
        {
          type: 'pseudo',
          title: 'Träna en tröskelmodell',
          code: `värden ← alla streck-längder i träningsdatan, sorterade
för varje par av intilliggande värden a och b:
    t ← (a + b) / 2
    fel(t) ← antal ettor med längd > t  +  antal sjuor med längd ≤ t
välj t med minst fel
(vid lika många fel: välj mitten av intervallet)`,
        },
        { type: 'formula', text: 'felandel = antal fel ÷ antal svar i gruppen', caption: 'Ange alltid nämnaren, till exempel 5 ÷ 10 = 0,5 = 50 %.' },
        'Med bara Norrbys svar blir tröskeln 3,65 mm. Med 12 svar från varje skola blir den 4,85 mm. En enda tröskel för alla kan ändå inte alltid passa båda grupperna perfekt – prova i experimentläget vad som händer när Norrby och Söderby har olika många exempel.',
      ],
    },
  ],
  conclusion: [
    'En modell kan fungera bra i genomsnitt och ändå göra många fel för en mindre grupp. Det syns bara om felen jämförs per grupp, med tydlig nämnare.',
    'Fler exempel från samma urval hjälper inte den grupp som saknas. Och en modell som går att förklara måste fortfarande testas på data från alla som berörs innan man kan lita på den.',
  ],
});
