import { defineContent } from '../../course/types';

export default defineContent({
  intro: [
    'I förra labben valde modellen en kategori. Ofta vill man i stället förutsäga ett **tal**: ett pris, en temperatur eller – som här – hur många glassar en kiosk kommer att sälja. Det kallas [[regression]].',
    'Den enklaste regressionsmodellen är en rak linje. Linjens lutning och nivå är modellens [[parameter|parametrar]]. Frågan är: vilken linje är bäst, och hur mäter man det?',
    { type: 'note', kind: 'syntetisk', text: 'Kioskens försäljningssiffror är påhittade för labben.' },
  ],
  sections: [
    {
      heading: 'Residualer och medelkvadratfel',
      blocks: [
        'För varje dag kan man jämföra det verkliga antalet sålda glassar med linjens förutsägelse. Skillnaden är en [[residual]]:',
        { type: 'formula', text: 'residual = verkligt värde − förutsagt värde', caption: 'Positiv residual: linjen gissade för lågt.' },
        'För att få ett enda mått på hur bra linjen är tar man varje residual i kvadrat och räknar medelvärdet. Det är [[medelkvadratfel|medelkvadratfelet (MSE)]]. Kvadraten gör att fel åt olika håll inte tar ut varandra och att stora fel väger tungt: en residual på 44 bidrar med 1936, medan en residual på 4 bara bidrar med 16.',
        'När en dator ”tränar” en linje letar den efter de parametrar som ger lägst MSE på träningsdatan. MSE fungerar då som en [[forlustfunktion|förlustfunktion]]. För en rak linje finns en färdig formel för det, **minsta kvadratmetoden**. Den anpassade linjen i labben har lutningen 5,9 glassar per grad och MSE 10,0.',
      ],
    },
    {
      heading: 'Extrapolering',
      blocks: [
        'Träningsdatan kommer från dagar mellan 14 och 28 °C. Inom det området fungerar linjen bra. Men en linje fortsätter rakt i all oändlighet – det gör inte verkligheten. Vid 5 °C förutsäger linjen ungefär −30 glassar, och vid 36 °C ungefär 153, trots att kiosken bara rymmer 120.',
        'Att använda en modell utanför det område där den har sett data kallas [[extrapolering]]. Det är en vanlig orsak till att modeller som verkar fungera bra ger orimliga svar i nya situationer. Modellen kan inte veta något om förhållanden den aldrig har sett.',
        { type: 'note', kind: 'forenklad', text: 'Glassförsäljning beror i verkligheten på mycket mer än temperatur: veckodag, lov, regn och om det finns glass kvar. Modellen använder bara en egenskap.' },
      ],
    },
  ],
  deepDives: [
    {
      heading: 'Formlerna bakom minsta kvadratmetoden',
      minutes: 15,
      prerequisites: 'räta linjens ekvation y = kx + m, summatecken; labbens genomgång',
      blocks: [
        'Med n punkter (x₁, y₁), …, (xₙ, yₙ) och linjen ŷ = kx + m är medelkvadratfelet',
        { type: 'formula', text: 'MSE = (1/n) · Σ (yᵢ − (k·xᵢ + m))²', caption: 'Summan går över alla n punkter.' },
        'Den linje som gör MSE så litet som möjligt har lutningen och skärningen',
        { type: 'formula', text: 'k = Σ (xᵢ − x̄)(yᵢ − ȳ) / Σ (xᵢ − x̄)²     m = ȳ − k·x̄', caption: 'x̄ och ȳ är medelvärdena av x och y.' },
        'För kiosken är x̄ = 21 °C och ȳ = 64,4 glassar, vilket ger k ≈ 5,88 och m ≈ −59,2. I labben skrivs linjen i stället som nivå + lutning · (temperatur − 20). Det är samma linje, men reglagen blir lättare att använda eftersom nivån vid 20 °C ligger mitt i datan.',
        'Formeln får man genom att derivera MSE med avseende på k och m och sätta derivatorna till noll. För mer komplicerade modeller, som neurala nätverk, finns ingen sådan färdig formel. Då används gradientnedstigning – det ser du i [labb 15](/labb/oppna-ett-neuralt-natverk/).',
      ],
    },
  ],
  conclusion: [
    'En regressionsmodell förutsäger ett tal. Residualerna visar felet för varje punkt, och medelkvadratfelet sammanfattar dem. Träningen väljer den linje som har lägst fel på träningsdatan.',
    'Lågt fel på träningsdatan är ingen garanti för bra förutsägelser överallt. Utanför det område modellen har sett kan svaren bli orimliga – som negativa glassar.',
  ],
});
