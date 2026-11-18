"""Skapar platshållarmappar för labbar som saknas (används bara vid uppstart)."""
import os

LABS = [
 (1,'ar-det-ai','introduktion','Är det AI?','Sortera vardagssystem: fasta regler, lärande system eller både och?'),
 (2,'fran-expertregler-till-stora-modeller','introduktion','Från expertregler till stora modeller','Ordna milstolpar i AI:s historia och koppla dem till det som drev utvecklingen.'),
 (3,'vad-finns-i-datamangden','introduktion','Vad finns i datamängden?','Inspektera och ändra ett syntetiskt dataset och upptäck obalans.'),
 (4,'vem-far-fel-svar','introduktion','Vem får fel svar?','Jämför en klassificerares fel för två grupper med tydliga nämnare.'),
 (5,'programmera-en-stadrobot','sokning','Programmera en städrobot','Stega en städrobot och jämför slumpstrategi med regelstyrning.'),
 (6,'bygg-en-graf','sokning','Bygg en graf','Bygg en liten graf och se skillnaden mellan sökträd och graf.'),
 (7,'bredden-forst-och-djupet-forst','sokning','Bredden först och djupet först','Kör BFS och DFS steg för steg i samma labyrint.'),
 (8,'sok-med-kostnad-och-ledtrad','sokning','Sök med kostnad och ledtråd','Jämför uniformkostnadssökning, girig sökning och A* på samma karta.'),
 (9,'tre-i-rad-mot-en-agent','sokning','Tre i rad mot en agent','Spela mot slump, regler och minimax och inspektera beslutsträdet.'),
 (10,'trana-en-klassificerare','maskininlarning','Träna en klassificerare','Flytta datapunkter, ändra k och se klassificeringsgränsen.'),
 (11,'forutsag-ett-tal','maskininlarning','Förutsäg ett tal','Flytta en regressionslinje och se residualer och medelkvadratfel.'),
 (12,'trana-valj-och-testa','maskininlarning','Träna, välj och testa','Välj modellkomplexitet med valideringsdata och mät på reserverad testdata.'),
 (13,'grupper-utan-facit','maskininlarning','Grupper utan facit','Stega genom k-means och se hur startvärde och k påverkar klustren.'),
 (14,'lar-en-agent-med-beloning','maskininlarning','Lär en agent med belöning','Träna en agent med Q-inlärning och se vad belöningen faktiskt lär ut.'),
 (15,'oppna-ett-neuralt-natverk','maskininlarning','Öppna ett neuralt nätverk','Ändra vikter i en neuron och träna ett litet nätverk på XOR.'),
 (16,'gor-text-till-data','sprak','Gör text till data','Jämför tokenisering, stemming och lemmatisering och räkna ord.'),
 (17,'sortera-meddelanden','sprak','Sortera meddelanden med en textmodell','Testa en bag-of-words-klassificerare på nya meddelanden.'),
 (18,'samma-mening-flera-tolkningar','sprak','Samma mening, flera tolkningar','Pröva svensk tvetydighet och en liten nästa-ord-modell.'),
 (19,'styr-en-robot','robotik','Styr en robot','Bygg kedjan sensor → styrprogram → motor och prova brus och hinder.'),
 (20,'hitta-fram-nar-kartan-forandras','robotik','Hitta fram när kartan förändras','Se en robot stanna och planera om när ett hinder dyker upp.'),
 (21,'valj-robot-for-ett-uppdrag','robotik','Välj robot för ett uppdrag','Konfigurera sensorer, autonomi och mänskligt övertagande för olika uppdrag.'),
 (22,'bygg-ett-rekommendationsflode','etik','Bygg ett rekommendationsflöde','Se hur dina val formar ett simulerat flöde och vad det kostar i integritet.'),
 (23,'bedom-en-rattvisekonflikt','etik','Bedöm en rättvisekonflikt','Ändra en beslutströskel och jämför feltyper gruppvis.'),
 (24,'vilka-uppgifter-behover-systemet','etik','Vilka uppgifter behöver systemet?','Välj uppgifter, ändamål och lagringstid för ett fiktivt skolverktyg.'),
 (25,'hur-regleras-ett-ai-system','etik','Hur regleras ett AI-system?','Undersök fiktiva användningsfall mot EU:s AI-förordning och GDPR.'),
 (26,'besluta-om-ett-framtida-ai-system','etik','Besluta om ett framtida AI-system','Ta en roll, väg nytta mot risk och se följderna av beslutet.'),
 (27,'granska-ett-ai-system','avslutning','Granska ett AI-system','Kursens slutprojekt: granska ett fiktivt AI-system med kursens verktyg.'),
]

root = os.path.join(os.path.dirname(__file__), '..', 'src', 'labs')
for n, lab_id, part, title, summary in LABS:
    d = os.path.join(root, lab_id)
    if os.path.exists(os.path.join(d, 'Lab.tsx')):
        continue
    os.makedirs(d, exist_ok=True)
    with open(os.path.join(d, 'meta.ts'), 'w') as f:
        f.write(f"""import {{ defineLab }} from '../../course/types';

// STUB – ersätts av kapitlets arbetsström.
export default defineLab({{
  id: '{lab_id}',
  number: {n},
  part: '{part}',
  title: '{title}',
  summary: '{summary}',
  goals: ['(under arbete)'],
  prerequisites: ['Inga särskilda förkunskaper.'],
  prerequisiteLabs: [],
  minutes: [10, 20],
  concepts: [],
  keywords: [],
  coverage: [],
  labels: [],
}});
""")
    with open(os.path.join(d, 'content.ts'), 'w') as f:
        f.write("""import { defineContent } from '../../course/types';

// STUB
export default defineContent({
  intro: ['Den här labben är under arbete.'],
  sections: [],
  conclusion: ['Under arbete.'],
});
""")
    with open(os.path.join(d, 'teacher.ts'), 'w') as f:
        f.write("""import { defineTeacher } from '../../course/types';

// STUB
export default defineTeacher({
  purpose: 'Under arbete.',
  tips: [],
  misconceptions: [],
  discussionStops: [],
  answers: [],
});
""")
    with open(os.path.join(d, 'Lab.tsx'), 'w') as f:
        f.write("""// STUB – ersätts av kapitlets arbetsström.
export default function Lab() {
  return <p>Den här labben är under arbete.</p>;
}
""")
print('ok')
