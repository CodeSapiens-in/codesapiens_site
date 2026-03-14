# Performance & Best Practices

Ensuring smooth, 60fps animations is critical for a high-quality user experience.

## 1. Respect Reduced Motion

Many users have sensitivity to motion. Always use the `useReducedMotion` hook from `framer-motion`.

```jsx
import { useReducedMotion } from "framer-motion";

function MyComponent() {
  const shouldReduceMotion = useReducedMotion();
  const animation = shouldReduceMotion ? { opacity: 1 } : { opacity: 1, x: 0 };
  
  return <motion.div animate={animation} initial={{ opacity: 0, x: -20 }} />;
}
```

## 2. Animate Cheap Properties

Avoid animating properties that trigger **Layout** or **Paint**. Prioritize **Compositor** properties.

- **Fast (Transform/Opacity)**: `x`, `y`, `scale`, `rotate`, `rotateX`, `rotateY`, `opacity`.
- **Avoid (Layout)**: `width`, `height`, `top`, `left`, `margin`, `padding`, `fontSize`.
  - *Tip*: If you need to change size, animate `scale` and use `layout` prop to handle the transform smoothly.

## 3. Use Variants for Orchestration

Variants keep your components lean and allow orchestrating complex trees (like stagger) without manually passing props.

## 4. Hardware Acceleration

Framer Motion automatically hardware accelerates animations, but you can ensure accuracy by keeping components focused. Avoid animating large, complex DOM trees within a single `motion.div`. Break them down into sub-motion components.

## 5. Viewport Optimization

For entrance animations, use the `whileInView` prop with a sensible `margin`. This ensures animations only run when visible, saving CPU/GPU cycles.

```jsx
<motion.div
  whileInView={{ opacity: 1 }}
  viewport={{ once: true, margin: "-100px" }}
>
  ...
</motion.div>
```
