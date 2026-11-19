import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Hur lär man en robot något när det inte finns några exempel med facit? Ett sätt är att låta den prova själv och ge den poäng – en [[beloning|belöning]] – efter varje [[handling]]. Det kallas [[forstarkningsinlarning|förstärkningsinlärning]].',
    'Du följer en påhittad robotdammsugare (en [[agent]]) som lär sig hitta till laddstationen med [[q-inlarning|Q-inlärning]]. Sedan ändrar du en enda belöningsregel och ser vad som händer.',
    { type: 'note', kind: 'simulering', text: 'Rutvärlden är en förenklad simulering. En riktig robot har brusiga sensorer, rör sig inte i rutor och har många fler tillstånd.' },
  ],
  sections: [
    {
      heading: 'Tillstånd, handling, belöning',
      blocks: [
        {
          type: 'table',
          caption: 'Begreppen i rutvärlden',
          head: ['Begrepp', 'I labben'],
          rows: [
            ['[[tillstand|Tillstånd]]', 'Rutan där roboten står, t.ex. C1.'],
            ['[[handling|Handling]]', 'Upp, höger, ned eller vänster. Mot en vägg står roboten kvar.'],
            ['[[beloning|Belöning]]', '−1 per steg, +10 vid laddstationen, −10 i trappan.'],
            ['Episod', 'Ett försök från start tills roboten når laddstationen, trappan eller 40 steg.'],
            ['[[utforskning|Utforskning]]', 'I 20 % av stegen väljs en slumpvald handling.'],
          ],
        },
        'Roboten för en tabell med ett Q-värde för varje kombination av ruta och handling. Q-värdet är robotens uppskattning av hur mycket belöning den kommer att få totalt om den gör den handlingen där. Från början är alla Q-värden 0, så roboten irrar runt: första episoden tar 34 steg.',
        'Efter varje steg justeras Q-värdet en bit mot ”belöningen jag just fick plus det bästa jag tror finns i nästa ruta”. Belöningen från laddstationen sprider sig på så sätt bakåt, ruta för ruta, tills pilarna visar vägen.',
      ],
    },
    {
      heading: 'Frys modellen och gör ett prov',
      blocks: [
        'Under träningen utforskar roboten och ändrar hela tiden sin tabell. För att se vad den faktiskt har lärt sig fryser man modellen: ingen inlärning och ingen utforskning, bara de bästa handlingarna. Efter träningen når roboten laddstationen på 7 steg, den kortaste vägen.',
      ],
    },
    {
      heading: 'Agenten gör det belöningen säger – inte det vi menar',
      blocks: [
        'Med +1 per steg i stället för −1 lär sig roboten något helt annat: den kör in i en vägg om och om igen. Varje steg ger ju poäng, och laddstationen avslutar poängjakten. Ändringen av en enda regel räckte.',
        'Sådana oavsiktliga följder kallas ibland *belöningshackning*. De är ett verkligt problem när AI-system tränas med belöningar: systemet blir mycket bra på att maximera måttet, även när måttet inte fångar det vi ville.',
        { type: 'note', kind: 'forenklad', text: 'Inlärningstakten α = 0,5, diskonteringen γ = 0,95 och 150 episoder är valda så att träningen går att följa. Startvärdet 14 gör att alla får samma träning.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Q-uppdateringen',
      minutes: 15,
      prerequisites: 'sätta in tal i en formel; labbens genomgång',
      blocks: [
        { type: 'formula', text: 'Q(s, a) ← Q(s, a) + α · ( r + γ · max Q(s′, ·) − Q(s, a) )', caption: 's = tillstånd, a = handling, r = belöning, s′ = nästa tillstånd. Om s′ är laddstationen eller trappan räknas max Q(s′, ·) som 0.' },
        '**α** (inlärningstakten) bestämmer hur stort steg Q tar mot det nya målet. **γ** (diskonteringen) bestämmer hur mycket framtida belöning väger jämfört med belöning nu.',
        'Exempel: Q = 0, r = −1, bästa Q i nästa ruta = 2, α = 0,5 och γ = 0,95 ger 0 + 0,5 · (−1 + 0,95 · 2 − 0) = 0,45.',
        {
          type: 'pseudo',
          title: 'Q-inlärning med ε-girigt val',
          code: `Q ← 0 för alla rutor och handlingar
för varje episod:
    s ← start
    upprepa tills laddstation, trappa eller 40 steg:
        med sannolikhet ε: a ← slumpvald handling      (utforskning)
        annars:            a ← handlingen med högst Q(s, ·)
        utför a, få belöning r och ny ruta s′
        Q(s, a) ← Q(s, a) + α · (r + γ · max Q(s′, ·) − Q(s, a))
        s ← s′`,
        },
        'Varför får +1 per steg roboten att stanna ute? Med γ = 0,95 är värdet av att få +1 i all evighet ungefär 1 / (1 − 0,95) = 20, medan laddstationen bara ger 10 och avslutar episoden.',
      ],
    },
  ],
  conclusion: [
    'I förstärkningsinlärning lär sig agenten genom att prova, få belöning och uppdatera sina uppskattningar. Utforskning behövs för att hitta bra vägar, och ett prov med fryst modell visar vad som faktiskt har lärts in.',
    'Agenten lär sig exakt det som belöningen mäter. Att formulera belöningen är därför ett viktigt – och svårt – mänskligt ansvar.',
  ],
});
