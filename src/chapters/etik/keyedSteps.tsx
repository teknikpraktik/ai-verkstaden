import { Fragment } from 'react';
import type { GuidedStep } from '../../components/lab/GuidedSteps';

/**
 * GuidedSteps renderar stegets innehåll på samma plats utan nyckel. Då kan
 * React återanvända en fråga från förra steget (samma komponenttyp) med dess
 * interna tillstånd, t.ex. ett ifyllt sifferfält. Nyckla varje stegs innehåll
 * så att varje steg får nya komponenter.
 */
export function keyedSteps(steps: GuidedStep[]): GuidedStep[] {
  return steps.map((s) => ({ ...s, body: <Fragment key={s.id}>{s.body}</Fragment> }));
}
