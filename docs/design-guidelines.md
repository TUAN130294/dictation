# Design Guidelines - Dictation Practice App

## Design Philosophy
Clean, focused interface prioritizing concentration. Duolingo's gamification + Babbel's adult clarity.

---

## Color Palette

### Primary
| Name | Hex | Usage |
|------|-----|-------|
| Deep Blue | `#1A56DB` | Primary actions, focus states |
| Soft Blue | `#3B82F6` | Secondary buttons, links |
| Ocean Tint | `#EFF6FF` | Backgrounds, cards |

### Accent
| Name | Hex | Usage |
|------|-----|-------|
| Success Green | `#10B981` | Correct, streaks, achievements |
| Warning Amber | `#F59E0B` | Partial correct, hints |
| Error Red | `#EF4444` | Incorrect, errors |
| Focus Purple | `#8B5CF6` | Active dictation word |

### Neutral
| Name | Hex | Usage |
|------|-----|-------|
| Text Primary | `#111827` | Headings, body |
| Text Secondary | `#6B7280` | Captions, hints |
| Border | `#E5E7EB` | Dividers, inputs |
| Background | `#F9FAFB` | Page background |
| Surface | `#FFFFFF` | Cards, modals |

**Rationale**: Blue = calm focus; Green = positive reinforcement; Purple = typing highlight

---

## Typography

### Font Stack
```css
--font-display: 'Inter', system-ui, sans-serif;
--font-body: 'Source Sans 3', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

### Type Scale (1.25 ratio)
| Level | Size | Weight | Line Height |
|-------|------|--------|-------------|
| H1 | 2.5rem | 700 | 1.2 |
| H2 | 2rem | 600 | 1.25 |
| H3 | 1.5rem | 600 | 1.3 |
| Body | 1rem | 400 | 1.6 |
| Small | 0.875rem | 400 | 1.5 |
| Mono | 1.125rem | 400 | 1.8 |

### Dictation Text
- Transcript: `Source Sans 3` 18px, line-height 1.7
- User input: `JetBrains Mono` 18px (character alignment)
- Current word: `font-weight: 600`, purple underline

---

## Spacing (8px Grid)
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.5rem;   /* 24px */
--space-6: 2rem;     /* 32px */
--space-8: 3rem;     /* 48px */
```

---

## Breakpoints (Mobile-First)
```css
--bp-sm: 640px;   /* Large phones */
--bp-md: 768px;   /* Tablets */
--bp-lg: 1024px;  /* Laptops */
--bp-xl: 1280px;  /* Desktops */
```

---

## Components

### Buttons
| Variant | Background | Text | Radius |
|---------|------------|------|--------|
| Primary | Deep Blue | White | 8px |
| Secondary | Transparent | Deep Blue | 8px, 2px border |
| Success | Success Green | White | 8px |

**States**: Hover -5% brightness, Disabled 50% opacity, Min 44x44px touch

### Cards
```css
.card { background: #fff; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
```

### Inputs
```css
.input { height: 48px; padding: 0 1rem; border: 2px solid #E5E7EB; border-radius: 8px; }
.input:focus { border-color: #1A56DB; outline: 3px solid #EFF6FF; }
```

---

## Audio Player

### Layout
```
[Play/Pause] [<<] [>>] [Speed] [Vol]
======================================  <- Waveform
0:15 ----------------------- 2:30       <- Progress
```

### Specs
- Waveform: Line-style (clean for educational)
- Progress: 8px height, clickable, rounded
- Controls: 44px touch targets
- Speed: 0.5x, 0.75x, 1x, 1.25x, 1.5x
- Colors: Played=Deep Blue, Unplayed=Border

### Keyboard
Space=Play/Pause, Arrows=Seek 5s, Up/Down=Volume

---

## Streak & Progress

### Contribution Graph (GitHub-style)
Grid: 7x52, Cell: 12x12px, Gap: 3px, Radius: 2px

| Level | Color | Activity |
|-------|-------|----------|
| 0 | `#E5E7EB` | None |
| 1 | `#BBF7D0` | 1-2 exercises |
| 2 | `#86EFAC` | 3-5 exercises |
| 3 | `#4ADE80` | 6-9 exercises |
| 4 | `#22C55E` | 10+ exercises |

### Streak Counter
Large number + flame icon, pulse on increment, amber glow when at risk

### Badges
- CEFR: Circular badge (A1-C2)
- Achievement: 48x48px, grayscale when locked

---

## Animation

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--easing: cubic-bezier(0.4, 0, 0.2, 1);
```

**Micro-interactions**: Button scale 0.98, Card hover Y-2px, Correct=green flash, Wrong=red shake

**Reduced motion**: `@media (prefers-reduced-motion: reduce)` - disable all

---

## Accessibility

- Contrast: 4.5:1 min (WCAG AA)
- Focus: 3px outline on interactives
- ARIA: Labels on controls, live regions for feedback
- Sizing: rem-based, respects user prefs

---

## References

| Source | URL |
|--------|-----|
| Duolingo Brand | https://design.duolingo.com/ |
| GitHub Gamification | https://trophy.so/blog/github-gamification-case-study |
| Color Psychology | https://shiftelearning.com/blog/how-do-colors-influence-learning |
| Audio Player UX | https://ux.redhat.com/elements/audio-player/guidelines/ |
| Monospace Fonts | https://pangrampangram.com/blogs/journal/best-monospace-fonts-2025 |

### Competitor Insights
| App | Style | Insight |
|-----|-------|---------|
| Duolingo | Gamified | Streaks drive retention |
| Babbel | Clean | Adult-focused, no distractions |
| Quizlet | Cards | Spaced repetition viz |
