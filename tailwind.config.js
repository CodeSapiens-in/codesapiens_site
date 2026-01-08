tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { "50": "#eff6ff", "100": "#dbeafe", "200": "#bfdbfe", "300": "#93c5fd", "400": "#60a5fa", "500": "#3b82f6", "600": "#2563eb", "700": "#1d4ed8", "800": "#1e40af", "900": "#1e3a8a", "950": "#172554" }
      },
      fontSize: {
        'golden-1': ['1rem', { lineHeight: '1.618' }],    // 16px - Base / Body
        'golden-2': ['1.618rem', { lineHeight: '1.3' }], // ~25.89px - Subheadings
        'golden-3': ['2.618rem', { lineHeight: '1.1' }], // ~41.89px - Headings
      }
    },
    fontFamily: {
      'script': ['Dancing Script', 'cursive'],
      'bebas': ['Bebas Neue', 'sans-serif'],
      'body': [
        'Open Sans',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji'
      ],
      'sans': [
        'Open Sans',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'system-ui',
        'Segoe UI',
        'Roboto',
        'Helvetica Neue',
        'Arial',
        'Noto Sans',
        'sans-serif',
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji'
      ]
    }
  }
}