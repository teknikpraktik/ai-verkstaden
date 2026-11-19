import { describe, expect, it } from 'vitest';
import { plainText, renderInline } from './markup';

const o = {
  conceptHref: (id: string) => `/begrepp/#${id}`,
  conceptTerm: (id: string) => (id === 'bfs' ? 'Bredden först' : undefined),
  internalHref: (p: string) => p,
};

describe('renderInline', () => {
  it('escapar HTML', () => {
    expect(renderInline('<script>x</script> & "y"', o)).toBe('&lt;script&gt;x&lt;/script&gt; &amp; &quot;y&quot;');
  });
  it('länkar begrepp med term eller egen text', () => {
    expect(renderInline('[[bfs]]', o)).toContain('>Bredden först</a>');
    expect(renderInline('[[bfs|BFS]]', o)).toContain('href="/begrepp/#bfs">BFS</a>');
  });
  it('rapporterar okända begrepp', () => {
    const unknown: string[] = [];
    renderInline('[[finns-inte]]', { ...o, onUnknownConcept: (id) => unknown.push(id) });
    expect(unknown).toEqual(['finns-inte']);
  });
  it('hanterar fet, kursiv, kod och länkar', () => {
    const html = renderInline('**a** *b* `c` [d](/labb/x/) [e](https://eur-lex.europa.eu/)', o);
    expect(html).toContain('<strong>a</strong>');
    expect(html).toContain('<em>b</em>');
    expect(html).toContain('<code>c</code>');
    expect(html).toContain('<a href="/labb/x/">d</a>');
    expect(html).toContain('rel="noopener"');
  });
  it('låter multiplikation i formler vara', () => {
    expect(renderInline('2 * 3 = 6', o)).toBe('2 * 3 = 6');
  });
  it('plainText tar bort markering', () => {
    expect(plainText('Se [[bfs|BFS]] och **fet** [länk](/x/)')).toBe('Se BFS och fet länk');
  });
});
