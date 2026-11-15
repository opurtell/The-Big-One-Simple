# Phase 3: Catch up, resync and log

**Status:** draft, approve after Phase 2 · 15/11/2026
**Mock-ups:** "Start", "Catch up", "Resync keypad", "End case: log".

## Components

- `src/ui/Keypad.tsx`: shared microwave keypad (`1–9`, Clear, `0`, ⌫). It fills from the right, max 6 digits (h:mm:ss), and reports `{ seconds, enteredAt }` where `enteredAt` = time of the last digit.
- `src/ui/StartScreen.tsx`: Start now (big), Catch up, Last case (date · duration), shown only if one exists.
- `src/ui/CatchupScreen.tsx`: monitor time (keypad), optional pattern chips (Evens · Odds · Half evens · Half odds, tap again to clear), 6 steppers (no ROSC), "Start at mm:ss". On start: `elapsed = seconds + (now - enteredAt)/1000`.
- `src/ui/ResyncSheet.tsx`: bottom sheet showing app time, the typed monitor time, the delta (`+0:12`), Cancel / Set.
- `src/ui/LogScreen.tsx`: Back to case, header + total chips + rows, Copy (`navigator.clipboard.writeText(formatLog)`, button reads "Copied" for 2 s), New case (moves the case to Last case, back to Start).

## Acceptance criteria

- [ ] Catch up at 07:30 with 2 shocks + 1 adrenaline: the timer matches a stopwatch started at 07:30 (within 1 s after 5 min), and the log shows `before app · Shock ×2`, `before app · Adrenaline ×1`.
- [ ] Waiting 20 s between the last digit and Start doesn't lose those 20 s.
- [ ] Catch up 07:30 + Evens → the bar shows 0:30. With no pattern → 2:00.
- [ ] Resync +0:12: elapsed jumps 12 s, the bar doesn't move, the log shows "Resync +0:12", and Undo reverses it.
- [ ] Copied text pastes cleanly into a notes app and matches the DESIGN.md format.
- [ ] Back to case from the log resumes the running case with no gap.
- [ ] Last case is viewable from Start until the next case begins. A case untouched for 3 h is auto-closed on reopen.
