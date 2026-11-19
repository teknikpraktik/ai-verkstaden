import { useEffect, useState } from 'react';
import { getLastLab } from '../../lib/progress';

export default function ResumeLink({ labs }: { labs: Record<string, { title: string; href: string; number: number }> }) {
  const [last, setLast] = useState<string | null>(null);
  useEffect(() => setLast(getLastLab()), []);
  const lab = last ? labs[last] : undefined;
  if (!lab) return null;
  return (
    <p className="resume">
      <a className="btn btn-secondary" href={lab.href}>
        Fortsätt där du var: {lab.number}. {lab.title}
      </a>
    </p>
  );
}
