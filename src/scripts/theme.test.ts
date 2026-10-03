// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { initThemeToggle, THEME_KEY } from './theme';

function setup(): HTMLButtonElement {
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = `
    <button
      type="button"
      data-theme-toggle
      data-label-light="Switch to light"
      data-label-dark="Switch to dark"
      aria-pressed="false"
    ></button>`;
  const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
  if (!button) throw new Error('fixture not mounted');
  return button;
}

beforeEach(() => {
  localStorage.clear();
});

describe('initThemeToggle', () => {
  it('switches to dark, persists it and updates the button state', () => {
    const button = setup();
    initThemeToggle();

    button.click();
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(THEME_KEY)).toBe('dark');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Switch to light');

    button.click();
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(THEME_KEY)).toBe('light');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark');
  });

  it('starts from a stored choice', () => {
    localStorage.setItem(THEME_KEY, 'dark');
    const button = setup();
    initThemeToggle();

    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Switch to light');
  });

  it('ignores junk stored values and does nothing without a button', () => {
    localStorage.setItem(THEME_KEY, 'sepia');
    setup();
    initThemeToggle();
    expect(document.documentElement.dataset.theme).toBeUndefined();

    document.body.innerHTML = '';
    expect(() => initThemeToggle()).not.toThrow();
  });
});
