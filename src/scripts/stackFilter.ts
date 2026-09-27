/**
 * Stack filter on the home page: picking a skill highlights the case studies and roles
 * (anything with data-skills) that use it and dims the rest. "All", or the same skill
 * again, clears it. The result is announced to screen readers.
 */
export function initStackFilter(): void {
  const group = document.querySelector<HTMLElement>('[data-stack-filter]');
  if (!group) return;
  const buttons = [...group.querySelectorAll<HTMLButtonElement>('button[data-skill]')];
  const status = document.querySelector<HTMLElement>('[data-stack-status]');
  const items = [...document.querySelectorAll<HTMLElement>('[data-skills]')];
  let active = '';

  const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

  const apply = () => {
    let studies = 0;
    let roles = 0;
    for (const item of items) {
      const match = active !== '' && (item.dataset.skills ?? '').split(' ').includes(active);
      item.classList.toggle('is-match', match);
      item.classList.toggle('is-dimmed', active !== '' && !match);
      if (match && item.classList.contains('card')) studies += 1;
      else if (match) roles += 1;
    }
    for (const button of buttons) button.setAttribute('aria-pressed', String((button.dataset.skill ?? '') === active));
    if (status) {
      const label = buttons.find((button) => button.dataset.skill === active)?.dataset.label ?? '';
      status.textContent = active
        ? `${label}: ${count(studies, 'case study', 'case studies')} and ${count(roles, 'role', 'roles')} below.`
        : '';
    }
  };

  group.hidden = false;
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const skill = button.dataset.skill ?? '';
      active = skill === active ? '' : skill;
      apply();
    });
  }
}
