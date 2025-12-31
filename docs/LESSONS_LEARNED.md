Lessons Learned (plain English)

1. Keep changes small and focused.
   - Make one functional change at a time so it's easier to test and, if needed, undo.

2. Always run the TypeScript checker before merging.
   - Developers: run `npm run check` locally.
   - CI: block merges if type-check fails.

3. Separate visual vs functional changes.
   - Visual changes (colors, texture, placement) should not modify gameplay logic.
   - Use the odd/even rule to mark visual-only releases.

4. Accessibility must be a priority.
   - Target users include small children and senior adults. Use larger UI elements, higher contrast, and clear cues.
   - Prefer automated accessibility checks for color contrast and text size.

5. Keep the release process simple for non-technical staff.
   - The auto-bump script updates the version automatically and logs a one-line release note.

6. Document "how to revert".
   - Reverting a release involves reverting the bump commit and removing the tag.

7. Tests: keep a small, fast smoke test that must pass on every merge.


If you want, I can expand these into a checklist for PR reviewers or convert them into a one-page guide for non-technical product owners.

