# UniVibe Animation System Guide

This document explains the animation system currently defined in [app/globals.css](../app/globals.css) and how to trigger it with [hooks/useAnimateOnScroll.ts](../hooks/useAnimateOnScroll.ts).

## Overview

The system is built around:

1. **Reveal keyframes** (motion curves and visual behavior)
2. **Utility classes** (what you place on components)
3. **Visibility triggers** (when animation starts)
4. **Delay helpers** (stagger sequences)
5. **Reduced motion fallback** (accessibility)

## Animation Types Available

### 1) Directional Reveal Types

These are the primary entrance animation types.

| Type | Utility Class | Motion Direction | Best For |
|---|---|---|---|
| Standard reveal | `.reveal` | Bottom to top | Paragraphs, section wrappers, generic content |
| Reveal from right | `.reveal-left` | Right to left | Right-side panels, image blocks entering left |
| Reveal from left | `.reveal-right` | Left to right | Left-side panels, mirrored layouts |
| Reveal from above | `.reveal-down` | Top to bottom | Header rows, badges, nav strips, top-aligned elements |

### 2) Style Reveal Types

These add character beyond simple directional movement.

| Type | Utility Class | Visual Style | Best For |
|---|---|---|---|
| Zoom reveal | `.reveal-zoom` | Fade + scale-up + soft rise | Cards, tiles, popovers |
| Pop reveal | `.reveal-pop` | Fade + subtle overshoot settle | Buttons, chips, counters, CTAs |

## Trigger Types

A reveal class alone keeps the element hidden initially. One of the following trigger types must be present.

Note: You can animate a full parent frame by putting a reveal class on the parent itself and toggling `is-visible` on that same parent, while using `in-view` to trigger children.

### Trigger A: Direct element class

Use `is-visible` on the same element.

```tsx
<div className="reveal is-visible">...</div>
```

### Trigger B: Parent container class

Use `in-view` on a parent and reveal classes on children.

```tsx
<section className="in-view">
  <h2 className="reveal-down">Title</h2>
  <p className="reveal reveal-delay-1">Body</p>
</section>
```

### Trigger C: Data attribute

Use `data-in-view="true"` on the animated element.

```tsx
<div className="reveal-zoom" data-in-view="true">...</div>
```

## Timing and Easing Types

Animations use curated durations and easing curves:

1. Directional reveals (`reveal`, `reveal-left`, `reveal-right`, `reveal-down`)
- Duration: `780ms`
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`
- Style: smooth ease-out with premium finish

2. Styled reveals (`reveal-zoom`, `reveal-pop`)
- Duration: `760ms`
- `reveal-zoom` easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- `reveal-pop` easing: `cubic-bezier(0.22, 1, 0.36, 1)`

## Stagger Types (Sequence Delays)

Use delay helpers to reveal siblings in sequence.

| Class | Delay |
|---|---|
| `.reveal-delay-1` | 180ms |
| `.reveal-delay-2` | 360ms |
| `.reveal-delay-3` | 540ms |
| `.reveal-delay-4` | 720ms |
| `.reveal-delay-5` | 900ms |
| `.reveal-delay-6` | 1080ms |

Example sequence:

```tsx
<div className={`reveal-zoom ${isVisible ? "in-view is-visible" : ""}`}>
  <h2 className="reveal-down reveal-delay-1">Heading</h2>
  <p className="reveal reveal-delay-2">Subtitle</p>
  <button className="reveal-pop reveal-delay-4">Get Started</button>
</div>
```

This pattern gives two layers of motion:

1. Parent frame reveal (`reveal-zoom` + `is-visible`)
2. Child stagger sequence (`in-view` + delay classes)

## Hook Integration Type: IntersectionObserver

The hook in [hooks/useAnimateOnScroll.ts](../hooks/useAnimateOnScroll.ts) provides one-time viewport entry detection.

### Current hook behavior

1. Observes a single element ref
2. Marks `isVisible = true` when intersecting
3. Unobserves after first intersection (one-time animation)
4. Uses:
- `threshold: 0.2`
- `rootMargin: '0px 0px -50px 0px'`

### Hook usage pattern

```tsx
'use client'

import { useAnimateOnScroll } from '@/hooks/useAnimateOnScroll'

export default function FeatureCard() {
  const { ref, isVisible } = useAnimateOnScroll()

  return (
    <div ref={ref} className={`reveal-zoom ${isVisible ? 'is-visible' : ''}`}>
      ...
    </div>
  )
}
```

## Accessibility Type: Reduced Motion

If user prefers reduced motion, all reveal variants are rendered immediately without transforms, blur, or animation.

This behavior is already implemented in [app/globals.css](../app/globals.css) under:

```css
@media (prefers-reduced-motion: reduce) { ... }
```

## Recommended Mapping by Component Type

Use this to keep motion language consistent across the product.

1. Section wrappers and body copy: `.reveal`
2. Titles/badges at top: `.reveal-down`
3. Left-right split content: `.reveal-left` / `.reveal-right`
4. Cards and visual blocks: `.reveal-zoom`
5. CTA buttons and small emphasis elements: `.reveal-pop`

## Common Mistakes and Fixes

1. **Element stays invisible**
- Cause: reveal class added, trigger missing
- Fix: add `is-visible`, `in-view` parent, or `data-in-view="true"`

2. **Animation never starts with hook**
- Cause: ref not attached
- Fix: ensure `ref={ref}` is on the animated DOM node

3. **Everything animates at once and feels noisy**
- Cause: too many reveal types mixed in same section
- Fix: use one primary reveal type per section and small stagger only

4. **Motion too strong for specific area**
- Cause: expressive class used on dense text
- Fix: use `.reveal` for text, reserve `.reveal-pop` for focal elements

## Quick Reference

```text
Directional: reveal, reveal-left, reveal-right, reveal-down
Stylized: reveal-zoom, reveal-pop
Triggers: is-visible | parent in-view | data-in-view="true"
Delays: reveal-delay-1..6
Observer hook: useAnimateOnScroll
A11y: prefers-reduced-motion fallback included
```

## Change Log Note

This document reflects the current animation definitions in [app/globals.css](../app/globals.css) and may need updates if classes, keyframes, or durations change.
