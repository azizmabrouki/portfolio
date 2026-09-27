/**
 * Skills offered by the stack filter on the home page. A case study or a role matches a
 * skill when one of its stack entries contains one of the skill's words.
 */

export interface Skill {
  id: string;
  label: string;
  /** Lowercase fragments searched for in stack entries ("Laravel 12" matches "laravel"). */
  match: string[];
}

export const filterSkills: Skill[] = [
  { id: 'laravel', label: 'Laravel', match: ['laravel'] },
  { id: 'spring-boot', label: 'Spring Boot', match: ['spring boot'] },
  { id: 'python', label: 'Python', match: ['python'] },
  { id: 'postgresql', label: 'PostgreSQL', match: ['postgres'] },
  { id: 'docker', label: 'Docker', match: ['docker'] },
  { id: 'kubernetes', label: 'Kubernetes', match: ['kubernetes'] },
  { id: 'ci-cd', label: 'CI/CD', match: ['ci/cd', 'github actions'] },
  { id: 'angular', label: 'Angular', match: ['angular'] },
];

/** Ids of the filter skills a stack covers, as a space-separated list for data-skills. */
export function skillsOf(stack: string[]): string {
  const entries = stack.map((entry) => entry.toLowerCase());
  return filterSkills
    .filter((skill) => skill.match.some((word) => entries.some((entry) => entry.includes(word))))
    .map((skill) => skill.id)
    .join(' ');
}
