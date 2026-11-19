import { countsText, featureName, fmtGini, labelSymbol, labelText, splitText, weatherSymbol, type Path, type Row, type TreeNode } from './logic';

/**
 * Trädet som en nästlad lista: varje nod visar fråga (eller svar i ett löv),
 * antal av varje klass, Gini och majoritet. Markeringar är alltid text/symbol,
 * aldrig bara färg.
 */
export function TreeView(props: {
  tree: TreeNode;
  label: string;
  /** Noder längs en förutsägelseväg. */
  onPath?: ReadonlySet<Path>;
  /** Noden där förutsägelsen just nu befinner sig. */
  current?: Path;
  /** Nyss tillagd fråga (automatisk tillväxt). */
  newest?: Path;
  /** Vald nod i handbyggaren. */
  selected?: Path;
  onSelect?: (path: Path) => void;
  onRemove?: (path: Path) => void;
  /** Noder på detta djup och djupare kan inte väljas för delning. */
  maxSplitDepth?: number;
  testId?: string;
}) {
  return (
    <ul className="dt-tree" aria-label={props.label} data-testid={props.testId}>
      <NodeItem node={props.tree} {...props} />
    </ul>
  );
}

function branchName(path: Path): string {
  if (path === '') return 'Rot';
  return path.endsWith('j') ? 'Ja' : 'Nej';
}

function NodeItem({
  node,
  onPath,
  current,
  newest,
  selected,
  onSelect,
  onRemove,
  maxSplitDepth = 4,
}: {
  node: TreeNode;
  onPath?: ReadonlySet<Path>;
  current?: Path;
  newest?: Path;
  selected?: Path;
  onSelect?: (path: Path) => void;
  onRemove?: (path: Path) => void;
  maxSplitDepth?: number;
}) {
  const leaf = !node.split;
  const n = node.counts.installd + node.counts.genomfors;
  const isOnPath = onPath?.has(node.path) ?? false;
  const isCurrent = current === node.path;
  const isSelected = selected === node.path;
  const cls = ['dt-node', leaf ? 'dt-leaf' : 'dt-inner', isOnPath ? 'dt-on-path' : '', isCurrent ? 'dt-current' : '', isSelected ? 'dt-selected' : '', newest === node.path ? 'dt-newest' : '']
    .filter(Boolean)
    .join(' ');
  const where = node.path === '' ? 'roten' : `noden ${node.path.toUpperCase().split('').map((c) => (c === 'J' ? 'ja' : 'nej')).join('–')}`;
  return (
    <li data-path={node.path === '' ? 'rot' : node.path} data-leaf={leaf ? 'true' : 'false'}>
      <div className={cls}>
        <div className="dt-node-head">
          <span className={`dt-branch dt-branch-${branchName(node.path).toLowerCase()}`}>{branchName(node.path)}</span>
          {leaf ? (
            <strong className={`dt-answer dt-answer-${node.prediction}`}>
              Löv → {labelSymbol[node.prediction]} {labelText[node.prediction]}
            </strong>
          ) : (
            <strong>{splitText(node.split!)}</strong>
          )}
          {isCurrent && <span className="dt-marker">◀ här</span>}
          {!isCurrent && isOnPath && <span className="dt-marker-soft">● på vägen</span>}
          {newest === node.path && <span className="dt-marker">★ nytt</span>}
          {isSelected && <span className="dt-marker">✎ vald</span>}
        </div>
        <div className="dt-node-info">
          {n === 0 ? (
            <span>0 dagar – svaret ärvs från föräldern</span>
          ) : (
            <span>
              {countsText(node.counts)} · Gini {fmtGini(node.gini)}
              {node.gini === 0 ? ' (ren)' : ''}
              {!leaf ? ` · majoritet: ${labelText[node.prediction]}` : ''}
              {node.inherited && n > 0 ? ' · lika många, svaret ärvs från föräldern' : ''}
            </span>
          )}
        </div>
        {(onSelect || onRemove) && (
          <div className="dt-node-actions">
            {onSelect && node.depth < maxSplitDepth && (
              <button type="button" className="btn btn-quiet" aria-pressed={isSelected} aria-label={`${leaf ? 'Dela' : 'Byt fråga i'} ${where}`} onClick={() => onSelect(node.path)}>
                {leaf ? 'Dela den här' : 'Byt fråga'}
              </button>
            )}
            {onRemove && !leaf && (
              <button type="button" className="btn btn-quiet" aria-label={`Ta bort frågan i ${where}`} onClick={() => onRemove(node.path)}>
                Ta bort frågan
              </button>
            )}
          </div>
        )}
      </div>
      {node.yes && node.no && (
        <ul>
          <NodeItem node={node.yes} {...{ onPath, current, newest, selected, onSelect, onRemove, maxSplitDepth }} />
          <NodeItem node={node.no} {...{ onPath, current, newest, selected, onSelect, onRemove, maxSplitDepth }} />
        </ul>
      )}
    </li>
  );
}

export function DataTable({ rows, caption, testId }: { rows: readonly Row[]; caption: string; testId?: string }) {
  return (
    <div className="table-wrap">
      <table className="table dt-data" data-testid={testId}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Dag</th>
            <th scope="col">{featureName.vader}</th>
            <th scope="col">{featureName.temp}</th>
            <th scope="col">{featureName.vind}</th>
            <th scope="col">Träningen</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <th scope="row">{r.day}</th>
              <td>
                <span aria-hidden="true">{weatherSymbol[r.vader]} </span>
                {r.vader}
              </td>
              <td>{r.temp < 0 ? `−${-r.temp}` : r.temp} °C</td>
              <td>{r.vind} m/s</td>
              <td className={`dt-answer-${r.label}`}>
                <span aria-hidden="true">{labelSymbol[r.label]} </span>
                {labelText[r.label]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
