import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'Neurala nätverk ligger bakom bildigenkänning, översättning och språkmodeller. Men inuti är de byggda av mycket enkla delar. I labben öppnar du ett nätverk och tittar på varje del.',
    'Du börjar med en enda [[neuron]], ställer in dess [[vikt|vikter och bias]] för hand och stöter på ett problem som en neuron inte kan lösa. Sedan tränar du ett litet [[neuralt-natverk|neuralt nätverk]] med ett dolt lager.',
    { type: 'note', kind: 'forenklad', text: 'Nätverket är mycket litet (två indata, några dolda neuroner, en utdata) och tränas på fyra exempel. Riktiga nätverk har miljoner eller miljarder vikter, men räknar på samma sätt.' },
  ],
  sections: [
    {
      heading: 'En neuron',
      blocks: [
        { type: 'formula', text: 'z = w1 · x1 + w2 · x2 + b        utdata = σ(z) = 1 / (1 + e^(−z))', caption: 'Viktad summa plus bias, sedan aktiveringsfunktionen σ (en S-kurva).' },
        'Vikterna bestämmer hur mycket varje indata påverkar, och biasen flyttar gränsen. [[aktiveringsfunktion|Aktiveringsfunktionen]] gör om z till ett tal mellan 0 och 1: z = 0 ger 0,5, stora positiva z ger nära 1 och stora negativa nära 0. Labben räknar svaret som 1 när utdata är minst 0,5.',
        'Med w1 = w2 = 1 och b = −1,5 blir neuronen en OCH-grind: för (1, 1) blir z = 0,5 och utdata ungefär 0,62. Ändrar man bara biasen till −0,5 blir den en ELLER-grind.',
      ],
    },
    {
      heading: 'Varför XOR är svårt',
      blocks: [
        'Gränsen där z = 0 är alltid en **rak linje**. För OCH och ELLER går det att dra en rak linje som skiljer ettorna från nollorna. För XOR ligger ettorna (0, 1) och (1, 0) diagonalt mot varandra – ingen rak linje kan skilja dem från (0, 0) och (1, 1). Därför klarar en neuron aldrig mer än 3 av 4.',
        'Ett **dolt lager** löser problemet. De dolda neuronerna drar varsin rak linje, och utdataneuronen kombinerar dem. Till exempel kan en dold neuron bli ELLER och en annan INTE-OCH; utdataneuronen svarar 1 när båda är på.',
      ],
    },
    {
      heading: 'Träning med gradientnedstigning',
      blocks: [
        'I stället för att ställa in vikterna för hand låter man datorn göra det. [[forlustfunktion|Förlusten]] (här [[medelkvadratfel|medelkvadratfelet]] över de fyra exemplen) mäter hur fel nätverket har. **Gradientnedstigning** räknar ut åt vilket håll varje vikt ska ändras för att förlusten ska minska, och tar ett litet steg åt det hållet. Det upprepas tusentals gånger.',
        'Med startvärde 3 börjar förlusten på 0,29. Den ligger länge kvar runt 0,25 – nätverket svarar ungefär 0,5 på allt – och sjunker sedan snabbt. Efter 2000 epoker är den under 0,01 och alla fyra svar är rätt. En ensam neuron som tränas på samma sätt fastnar på 0,25.',
        'Startvikterna slumpas. Med vissa startvärden fastnar även nätverket (prova startvärde 4 i experimentläget). Fler dolda neuroner gör det oftast lättare.',
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Gradientnedstigning i formler',
      minutes: 20,
      prerequisites: 'derivata och kedjeregeln (Matematik 3–4); labbens genomgång',
      blocks: [
        'Förlusten är L = (1/4) · Σ (ŷ − y)² över de fyra exemplen. För varje vikt w räknar man derivatan ∂L/∂w och uppdaterar',
        { type: 'formula', text: 'w ← w − η · ∂L/∂w', caption: 'η är inlärningstakten (2 i labben).' },
        'För utdataneuronen med utdata ŷ = σ(z) och dold aktivering h ger kedjeregeln',
        { type: 'formula', text: '∂L/∂w = (2/4) · (ŷ − y) · ŷ · (1 − ŷ) · h', caption: 'σ′(z) = σ(z) · (1 − σ(z)).' },
        'För vikterna i det dolda lagret fortsätter kedjeregeln ett steg till bakåt genom utdataneuronens vikt. Det kallas *bakåtpropagering*.',
        {
          type: 'pseudo',
          title: 'Träning av nätverket',
          code: `slumpa alla vikter i [−1, 1] med startvärdet
upprepa 2000 gånger (epoker):
    för varje exempel: räkna framåt och spara h och ŷ
    räkna bakåt: hur mycket bidrog varje vikt till felet?
    flytta varje vikt ett litet steg mot lägre förlust`,
        },
      ],
    },
  ],
  conclusion: [
    'En neuron är en viktad summa plus bias genom en aktiveringsfunktion. Den kan bara dra en rak gräns, och därför klarar den inte XOR.',
    'Ett dolt lager låter nätverket kombinera flera enkla gränser till en mer komplicerad. Träningen hittar vikterna genom att steg för steg minska förlusten – men startvärdet kan avgöra om det lyckas.',
  ],
});
