# Deepanshu Malik - Portfolio Website

Personal portfolio website featuring an AI-powered interactive assistant. Built with HTML, Tailwind CSS, and vanilla JavaScript.

**Live URL**: [https://deepanshu-malik.github.io](https://deepanshu-malik.github.io)

## Features

- **Modern Dark Theme**: Glassmorphism effects, gradients, and neon accents
- **Smooth Animations**: Page load, scroll, and hover animations
- **Responsive Design**: Mobile-first approach, works on all devices
- **AI Chat Assistant**: Interactive chatbot powered by RAG (Retrieval Augmented Generation)
- **Code Highlighting**: Syntax-highlighted code snippets in chat

## Sections

1. **Hero** - Animated intro with profile photo and CTAs
2. **About** - Professional summary with animated stat counters
3. **Skills** - Categorized tech skills with hover effects
4. **Projects** - GitHub and professional projects with tabs
5. **Experience** - Interactive timeline of work history
6. **Contact** - Contact information and social links

## Tech Stack

- HTML5
- Tailwind CSS (CDN)
- Vanilla JavaScript
- Prism.js (code highlighting)

## Project Structure

```
deepanshu-malik.github.io/
├── index.html              # Main portfolio page
├── css/
│   └── style.css           # Custom styles (glassmorphism, animations)
├── js/
│   ├── main.js             # Navigation, animations, interactions
│   ├── chat.js             # Chat interface logic
│   └── particles.js        # Background particle animation
├── assets/
│   └── images/
│       └── profile.jpg     # Profile photo (add your own)
└── README.md
```

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/deepanshu-malik/deepanshu-malik.github.io.git
cd deepanshu-malik.github.io
```

2. Start a local server:
```bash
python -m http.server 3000
```

3. Open `http://localhost:3000` in your browser

## Chat Integration

The chat feature connects to a FastAPI backend. Update the `CONFIG.API_URL` in `js/chat.js`:

```javascript
const CONFIG = {
    API_URL: 'https://your-backend-url.onrender.com/api',
    // ...
};
```

See [portfolio-ai-backend](https://github.com/deepanshu-malik/portfolio-ai-backend) for backend setup.

## Customization

### Profile Photo
Replace `assets/images/profile.jpg` with your photo.

### Colors
Edit CSS variables in `css/style.css`:
```css
:root {
    --accent-primary: #6366f1;   /* Indigo */
    --accent-secondary: #8b5cf6; /* Purple */
    --accent-tertiary: #06b6d4;  /* Cyan */
}
```

### Content
Edit the HTML in `index.html` to update:
- Bio and summary
- Skills and technologies
- Projects information
- Work experience
- Contact details

## Deployment

This site is designed for GitHub Pages:

1. Push changes to `main` branch
2. Go to repository Settings > Pages
3. Set source to `main` branch
4. Site will be live at `https://deepanshu-malik.github.io`

## License

MIT License
