/**
 * Turns the Zod issue list the API rejects with into `{ field: message }` for a
 * local form. `fieldMap` renames server fields to local state names where the
 * two differ (`name` → `boardName`); anything not listed keeps its server name,
 * so a form can read `fieldErrors.email` without declaring a map at all.
 *
 * Returns `null` when no issue maps — a caller can't otherwise tell "nothing was
 * wrong with a field" from "this was a 403, not a validation failure", and in
 * both cases it should fall back to the block error rather than leave the form
 * silently doing nothing.
 *
 * Pure — no state, no formatting. Forms own the decision of what to show.
 */
export const mapValidationIssues = (issues, fieldMap = {}) => {
  if (!Array.isArray(issues)) return null;

  const mapped = {};
  for (const issue of issues) {
    const serverField = Array.isArray(issue.path) ? issue.path[0] : null;
    if (!serverField) continue;
    const field = fieldMap[serverField] ?? serverField;
    if (!mapped[field]) mapped[field] = issue.message;
  }

  return Object.keys(mapped).length > 0 ? mapped : null;
};