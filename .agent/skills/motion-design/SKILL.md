---
name: motion-design
description: Premium animation and micro-interaction guide for React using Framer Motion. Use when adding "wow" factor animations, scroll-triggered effects, complex layout transitions, and interactive UI states to React applications.
---

# Motion Design

Premium animations transform a functional interface into a memorable experience. This skill provides established patterns and best practices for implementing high-performance motion using Framer Motion.

## Core Principles

1. **Intentionality**: Motion should guide the user's eye or provide feedback, never just distract.
2. **Performance**: Prioritize transform-based animations over layout-triggering properties (e.g., use `scale` instead of `width/height`).
3. **Subtlety**: Micro-interactions should be swift (200-400ms). Entrance animations can be more expressive (400-800ms).

## Quick Start

### Basic Hover & Tap
```jsx
import { motion } from "framer-motion";

<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click Me
</motion.button>
```

## Animation Patterns

### 1. Staggered Entrance
Ideal for lists or grid items to create a natural flow.
See [references/animation-patterns.md](references/animation-patterns.md) for implementation.

### 2. Scroll-Triggered Reveal
Enhance landing pages by revealing content as the user scrolls.
```jsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
>
  Reveal Content
</motion.div>
```

### 3. Layout Transitions
Seamlessly animate items moving across the screen or changing size.
```jsx
<motion.div layout />
```

## Performance & Accessibility

Motion can be overwhelming or performance-heavy. Follow these guidelines:
- **Reduced Motion**: Respect user preferences. See [references/performance.md](references/performance.md).
- **Orchestration**: Use `Variants` for complex, multi-element animations to keep code clean and synchronized.

## Detailed Guides

- **Animation Patterns**: [references/animation-patterns.md](references/animation-patterns.md) - Deep dive into stagger, keyframes, and exit animations.
- **Performance & Best Practices**: [references/performance.md](references/performance.md) - Ensuring 60fps and accessible motion.
