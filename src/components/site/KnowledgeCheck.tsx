import { LabContext } from '../lab/LabContext';
import { QuestionList, type QuestionSpec } from '../lab/Questions';

/** Kunskapskontroll för ett kapitel. Svaren sparas under lab:kapitel-<id>:... */
export default function KnowledgeCheck({ checkId, questions }: { checkId: string; questions: QuestionSpec[] }) {
  return (
    <LabContext.Provider value={{ labId: checkId, mode: 'guided', setMode: () => {} }}>
      <QuestionList specs={questions} />
    </LabContext.Provider>
  );
}
