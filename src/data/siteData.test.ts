import { describe, it, expect } from 'vitest';
import { siteData } from './siteData';

describe('siteData', () => {
  it('has core identity fields', () => {
    expect(siteData.name).toBe('Abu Bakar');
    expect(siteData.email).toBe('10abdogar@gmail.com');
    expect(siteData.location).toMatch(/Rostock/);
  });

  it('has github + linkedin socials with valid urls', () => {
    const byKey = Object.fromEntries(siteData.socials.map((s) => [s.label.toLowerCase(), s.href]));
    expect(byKey.github).toBe('https://github.com/ab17dogar');
    expect(byKey.linkedin).toContain('abdogar17');
    siteData.socials.forEach((s) => expect(s.href).toMatch(/^https?:|^mailto:/));
  });

  it('exposes focus areas and at least 6 skills', () => {
    expect(siteData.focusAreas.length).toBeGreaterThanOrEqual(3);
    expect(siteData.skills.length).toBeGreaterThanOrEqual(6);
    siteData.skills.forEach((s) => expect(typeof s.name).toBe('string'));
  });

  it('every nav item has a root-relative href', () => {
    siteData.nav.forEach((n) => expect(n.href.startsWith('/')).toBe(true));
  });
});
