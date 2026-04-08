/**
 * Frontend validation rules — mirrors backend Pydantic schemas exactly.
 *
 * Category name : min 1, max 100, not blank (whitespace-only rejected)
 * Tag name      : min 1, max  50, not blank
 * Todo title    : min 1, max 255, not blank
 * Todo description: optional, max 1000
 */

export type ValidationResult =
  | { valid: true }
  | { valid: false; message: string };

/* ── primitives ──────────────────────────────────────────────────── */

function notBlank(value: string, label: string): ValidationResult {
  if (!value.trim()) return { valid: false, message: `${label} must not be blank` };
  return { valid: true };
}

function maxLen(value: string, max: number, label: string): ValidationResult {
  if (value.length > max)
    return { valid: false, message: `${label} must be ${max} characters or fewer` };
  return { valid: true };
}

function required(value: string, label: string): ValidationResult {
  if (!value) return { valid: false, message: `${label} is required` };
  return { valid: true };
}

function chain(...results: ValidationResult[]): ValidationResult {
  for (const r of results) if (!r.valid) return r;
  return { valid: true };
}

/* ── domain validators ───────────────────────────────────────────── */

/** Category name: required, 1–100 chars, not blank. */
export function validateCategoryName(name: string): ValidationResult {
  return chain(required(name, 'Name'), notBlank(name, 'Name'), maxLen(name, 100, 'Name'));
}

/** Tag name: required, 1–50 chars, not blank. */
export function validateTagName(name: string): ValidationResult {
  return chain(required(name, 'Name'), notBlank(name, 'Name'), maxLen(name, 50, 'Name'));
}

/** Todo title: required, 1–255 chars, not blank. */
export function validateTodoTitle(title: string): ValidationResult {
  return chain(required(title, 'Title'), notBlank(title, 'Title'), maxLen(title, 255, 'Title'));
}

/** Todo description: optional, max 1000 chars. */
export function validateTodoDescription(description: string): ValidationResult {
  return maxLen(description, 1000, 'Description');
}
