# Astra Security Website

A modern, responsive website for Astra Security featuring dark/light mode toggle and elegant design.

## Features

- **Dark/Light Mode Toggle**: Switch between themes with persistent preference storage
- **Responsive Design**: Fully responsive across all device sizes
- **Modern Typography**: Uses Space Grotesk for headings and Luxurious Script for accent text
- **Interactive Elements**: Smooth animations and hover effects
- **Human Silhouette Graphic**: Animated glowing human silhouette as the hero graphic
- **Feature Cards**: Highlight key security features with hover animations

## Design Elements

### Typography
- **Space Grotesk**: Used for all body text, buttons, and "security that verifies" text
- **Luxurious Script**: Used exclusively for the "humanity" text in the hero section

### Color Scheme
- **Light Mode**: Clean, professional white/blue palette
- **Dark Mode**: Deep navy/cyan palette for reduced eye strain

### Layout
- Header with logo, theme toggle, and auth buttons
- Hero section with text and human silhouette graphic
- Features section with three highlight cards
- Clean footer with links and copyright

## Files Structure

```
astra-website/
├── index.html          # Main HTML file
├── style.css          # All styles including dark/light mode
├── script.js          # Interactive functionality
├── Astra-logo.png     # Main logo
├── favicon.ico        # Website favicon
├── package.json       # Project configuration
└── README.md          # This file
```

## How to Use

1. Open `index.html` in any modern web browser
2. Click the moon/sun icon in the top right to toggle dark/light mode
3. The theme preference is saved in local storage
4. Buttons have interactive hover and click effects

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

The website uses vanilla HTML, CSS, and JavaScript with no external dependencies beyond Google Fonts.

### Key CSS Features
- CSS Custom Properties for theme variables
- CSS Grid and Flexbox for layout
- CSS Animations for interactive elements
- Responsive design with media queries

### JavaScript Features
- Theme preference storage in localStorage
- System theme detection
- Interactive button animations
- Ripple effect on CTA buttons

## License

© 2024 Astra Security. All rights reserved.