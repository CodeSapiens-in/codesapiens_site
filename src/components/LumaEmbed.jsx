// LumaEmbed.jsx
import React from 'react';

export default function LumaEmbed({ src, style }) {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <iframe
        src={src}
        title="Luma Calendar"
        style={{ width: '100%', height: 800, border: 0, ...style }}
        loading="lazy"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
      />
    </div>
  );
}

// Usage:
// <LumaEmbed src="https://lu.ma/embed/your-calendar-id?view=calendar" />
