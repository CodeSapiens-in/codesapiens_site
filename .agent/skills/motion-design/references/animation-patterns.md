# Animation Patterns

Leverage these patterns to create a premium feel in React applications.

## 1. Staggered Entrance (Variants)

Using variants is the cleanest way to orchestrate animations across multiple children.

```jsx
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

// Usage
<motion.div variants={containerVariants} initial="hidden" animate="show">
  {items.map(item => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

## 2. Dynamic Hover Reveal

Show hidden content or change appearance on hover with spring physics for a "snappy" feel.

```jsx
<motion.div
  whileHover="hover"
  initial="initial"
  className="relative overflow-hidden"
>
  <img src={image} />
  <motion.div
    variants={{
      initial: { opacity: 0, y: 20 },
      hover: { opacity: 1, y: 0 }
    }}
    className="absolute bottom-0 p-4 bg-black/60 backdrop-blur-md"
  >
    <h4>Overlay Title</h4>
  </motion.div>
</motion.div>
```

## 3. Keyframe Sequences

Create complex loop or entrance animations using keyframes.

```jsx
<motion.div
  animate={{
    scale: [1, 1.2, 1.2, 1, 1],
    rotate: [0, 0, 270, 270, 0],
    borderRadius: ["20%", "20%", "50%", "50%", "20%"],
  }}
  transition={{
    duration: 2,
    ease: "easeInOut",
    times: [0, 0.2, 0.5, 0.8, 1],
    repeat: Infinity,
    repeatDelay: 1
  }}
/>
```

## 4. AnimatePresence (Mount/Unmount)

Essential for smooth transitions when components are added or removed from the DOM.

```jsx
import { AnimatePresence, motion } from "framer-motion";

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      Modal Content
    </motion.div>
  )}
</AnimatePresence>
```
