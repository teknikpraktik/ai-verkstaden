import { LabContext } from '../lab/LabContext';
import { QuestionList, type OpenSpec } from '../lab/Questions';

/**
 * Öppna reflektionsfrågor. Svaren sparas lokalt under lab:reflektion:open:<id>
 * och rensas från Min arbetsöversikt som allt annat.
 */
export default function ReflectionQuestions({ questions }: { questions: OpenSpec[] }) {
  return (
    <LabContext.Provider value={{ labId: 'reflektion', mode: 'guided', setMode: () => {} }}>
      <QuestionList specs={questions} />
    </LabContext.Provider>
  );
}
