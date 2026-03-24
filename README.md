# Astra Website

A modern, professional website for Astra - an AI-powered financial analytics platform. Built with a Vercel-inspired design system featuring dark mode, interactive charts, and authentication flows.

## Features

### 🎨 Design System
- **Dark/Light Mode Toggle** - Persistent theme preference with smooth transitions
- **Vercel-inspired UI** - Clean, modern design with professional spacing and typography
- **Responsive Layout** - Fully responsive across all device sizes
- **Custom Animations** - Smooth scroll animations and interactive elements

### 📊 Interactive Components
- **Financial Performance Chart** - Animated bar chart showing growth metrics
- **Authentication Modal** - Login/Signup forms with validation
- **Pricing Cards** - Interactive pricing plans with selection states
- **Toast Notifications** - Success/error notifications with auto-dismiss
- **Smooth Scrolling** - Animated navigation between sections

### 🛠️ Technical Features
- **Vanilla JavaScript** - No frameworks, minimal dependencies
- **CSS Custom Properties** - Theme variables for easy customization
- **Local Storage** - Persistent theme and user preferences
- **Form Validation** - Client-side validation with user feedback
- **Performance Optimized** - Efficient animations and lazy loading

## Project Structure

```
astra-website/
├── index.html          # Main HTML file
├── style.css          # All styles (theme, layout, components)
├── script.js          # All JavaScript functionality
├── README.md          # This documentation
└── assets/            # Images and icons (to be added)
```

## Setup Instructions

1. **Clone or download** the project files
2. **Open `index.html`** in a modern web browser
3. **No build process required** - works directly in the browser

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Key Functionality

### Theme Toggle
- Click the sun/moon icon in the header
- Theme preference saved in localStorage
- Smooth transitions between themes

### Authentication
- Click "Get Started" or "Login" buttons
- Switch between Login and Signup tabs
- Form validation with real-time feedback
- Google OAuth simulation

### Interactive Elements
- **Chart Animation**: Bars grow on page load
- **Pricing Cards**: Click to select plans
- **Smooth Scrolling**: Click navigation links
- **Toast Notifications**: Success/error messages

## Customization

### Colors
Edit the CSS custom properties in `style.css`:
```css
:root {
  --purple-500: #8b5cf6;  /* Primary brand color */
  --green-500: #22c55e;   /* Success color */
  /* ... other variables */
}
```

### Content
- Update text content in `index.html`
- Modify chart data in `script.js` (initChart function)
- Adjust pricing plans in the pricing section

### Features
- Add new sections by following existing patterns
- Extend JavaScript functionality in `script.js`
- Add new CSS components in `style.css`

## Performance Notes

- **CSS**: All styles in one file for minimal HTTP requests
- **JavaScript**: Event delegation and efficient DOM manipulation
- **Images**: Placeholder images used - replace with optimized assets
- **Animations**: Uses CSS transitions for smooth performance

## Future Enhancements

1. **Backend Integration** - Connect to real authentication API
2. **Real Data Charts** - Integrate with financial data APIs
3. **Multi-language Support** - Add internationalization
4. **PWA Features** - Installable web app with offline support
5. **Analytics Integration** - Add user tracking and analytics

## License

This project is available for use and modification. Please credit the original design if used publicly.

## Contact

For questions or support, please refer to the documentation or contact the development team.

---

**Note**: This is a frontend demonstration. Backend functionality is simulated with timeouts for demonstration purposes.