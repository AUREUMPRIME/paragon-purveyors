# Mobile Repair Strategy After Failed Baseline

## Status

Read-only strategy after reverting or confirming removal of the failed mobile baseline.

## What Went Wrong

The failed mobile baseline tried to fix mobile by applying broad rules to all panels and scenes. That made the site worse because:

- It introduced page or panel scrolling in Sections 3, 4, and 5.
- It fought the existing depth-scroll system.
- It changed panel behavior globally instead of fixing each section carefully.
- It damaged the index/navigation layout.
- It changed Section 4 card layout too broadly, making cut preview images inconsistent.
- It left the floating Request Availability CTA competing with mobile content.

## Correct Mobile Rule

Mobile must still behave like the desktop concept:

- No outer section scrolling.
- Depth scroll remains the main section navigation.
- Each section must fit inside the viewport.
- Section 4 may keep internal scrolling only inside the selected cuts card area.
- Mobile cards need their own compact visual rules, not global card overrides.
- Request Availability must not overlap content.

## Safe Fix Plan

1. Preserve depth-scroll and do not add overflow-y auto to all panels.
2. Fix mobile panel scale section by section.
3. Start with Hero and index/navigation only.
4. Then adjust About.
5. Then Producers.
6. Then Selected Cuts, including internal scroll area and image consistency.
7. Then Inquiry.
8. Then mobile CTA placement.
9. Only after sections are stable, audit mobile modals.

## Next Implementation Step

Apply a very small mobile fix for the global shell only:

- Do not add general section scrolling.
- Do not change Section 4 cards yet.
- Do not change Section 5 yet.
- Fix only mobile viewport sizing, left/right overflow, and broken index positioning.

## Prevention Rules

- Never use broad mobile selectors that target every .panel with overflow-y auto.
- Never convert the whole site into a normal scrolling page.
- Do not apply desktop card fixes to mobile cards without testing.
- Each section gets one focused mobile pass.
- Build and screenshot after every pass.
