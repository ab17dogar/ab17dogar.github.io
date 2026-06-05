import { describe, it, expect } from 'vitest';
import { initials, gradientFor, normalizeLinks, similarProjects, allTags, GRADIENTS } from './projects';

describe('initials', () => {
  it('takes the first letter of the first two words, uppercased', () => {
    expect(initials('VetraPath — Monte Carlo Path Tracer')).toBe('VM');
    expect(initials('RGB-D Semantic Scene Graphs')).toBe('RS');
  });
  it('uses the first two chars for a single word', () => {
    expect(initials('Solo')).toBe('SO');
  });
  it('falls back to ? for empty input', () => {
    expect(initials('   ')).toBe('?');
  });
});

describe('gradientFor', () => {
  it('is deterministic for the same seed', () => {
    expect(gradientFor('project-csi')).toBe(gradientFor('project-csi'));
  });
  it('always returns one of the known theme gradients', () => {
    expect(GRADIENTS).toContain(gradientFor('rgbd-scene-graph'));
    expect(gradientFor('anything').startsWith('linear-gradient(')).toBe(true);
  });
});

describe('normalizeLinks', () => {
  it('maps dedicated fields to ordered labelled links', () => {
    expect(normalizeLinks({ webapp: 'w', appstore: 'a', playstore: 'p', demo: 'd' })).toEqual([
      { label: 'Web App', href: 'w' },
      { label: 'iOS App', href: 'a' },
      { label: 'Android', href: 'p' },
      { label: 'Live Demo', href: 'd' },
    ]);
  });
  it('returns an empty array when nothing is set', () => {
    expect(normalizeLinks({})).toEqual([]);
  });
  it('appends generic links after dedicated ones', () => {
    expect(normalizeLinks({ demo: 'd', links: [{ label: 'Docs', href: 'x' }] })).toEqual([
      { label: 'Live Demo', href: 'd' },
      { label: 'Docs', href: 'x' },
    ]);
  });
});

describe('similarProjects', () => {
  const all = [
    { slug: 'a', tags: ['x', 'y'] },
    { slug: 'b', tags: ['x'] },
    { slug: 'c', tags: ['y', 'z'] },
    { slug: 'd', tags: ['w'] },
  ];
  it('ranks by shared-tag overlap, excludes self and zero-overlap', () => {
    expect(similarProjects(all[0], all).map((p) => p.slug)).toEqual(['b', 'c']);
  });
  it('respects the limit', () => {
    expect(similarProjects(all[0], all, 1).map((p) => p.slug)).toEqual(['b']);
  });
});

describe('allTags', () => {
  it('returns the sorted unique union of tags', () => {
    expect(allTags([{ tags: ['b', 'a'] }, { tags: ['a', 'c'] }])).toEqual(['a', 'b', 'c']);
  });
});
