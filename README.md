# Deepanshu Malik - Portfolio Website

Personal portfolio website with a terminal/monospace aesthetic and integrated AI chat assistant. Built with vanilla HTML, CSS, and JavaScript using a JSON-driven architecture.

**Live URL**: [https://deepanshu-malik.github.io](https://deepanshu-malik.github.io)

## Features

- **Terminal Aesthetic**: Monospace typography with purple/pink accents and retro-futuristic design
- **JSON-Driven Content**: All content (projects, resume, about) loaded from structured JSON files
- **Integrated AI Chat**: Modal-based chatbot powered by RAG (Retrieval Augmented Generation)
- **Self-Contained Pages**: All styles inline, no external CSS/JS dependencies
- **Responsive Design**: Mobile-first approach, works on all devices
- **Smooth Animations**: Quote carousel, hover effects, and transitions

## Sections

1. **Hero** - Terminal-style code snippet with tech stack icons
2. **Quote Carousel** - Scrolling programming quotes
3. **Projects** - JSON-driven project cards with live/GitHub links
4. **Skills** - Grid layout with categorized technical skills
5. **Experience** - Timeline with highlighted achievements
6. **About** - Professional bio and background
7. **Contact** - Email, LinkedIn, and GitHub links

## Tech Stack

- HTML5
- CSS3 (inline styles with CSS variables)
- Vanilla JavaScript
- Fira Code font (monospace)
- Marked.js (markdown parsing for chat)

## Project Structure

```
deepanshu-malik.github.io/
├── index.html              # Main portfolio landing page
├── about.html              # About page
├── projects.html           # Projects listing page
├── resume.html             # Resume/CV page
├── 404.html                # Error page
├── data/
│   ├── projects-data.json  # Project information
│   ├── resume-data.json    # Resume/CV data
│   └── about-data.json     # About page content
├── assets/
│   └── images/             # Favicon, profile, OG images
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

The integrated chat modal connects to a FastAPI backend. Update the `API_URL` constant in `index.html`:

```javascript
const API_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:8000/api'
    : 'https://your-backend-url.onrender.com/api';
```

See [portfolio-ai-backend](https://github.com/deepanshu-malik/portfolio-ai-backend) for backend setup.

## Customization

### Profile Photo
Replace images in `assets/images/` directory (favicon, profile, etc.).

### Colors
Edit CSS variables in the `<style>` section of each HTML file:
```css
:root {
    --bg-primary: #1a1a2e;
    --bg-secondary: #16162a;
    --accent: #c778dd;           /* Purple/pink accent */
    --text-primary: #ffffff;
    --text-secondary: #abb2bf;
}
```

### Content
Edit JSON files in the `/data/` directory:
- **data/projects-data.json** - Update project information, tech stacks, and links
- **data/resume-data.json** - Update work experience, education, skills, and certifications
- **data/about-data.json** - Update bio, stats, and personal information

For other content (hero text, quotes), edit the HTML directly in `index.html`.

## Deployment

This site is designed for GitHub Pages:

1. Push changes to `main` branch
2. Go to repository Settings > Pages
3. Set source to `main` branch
4. Site will be live at `https://deepanshu-malik.github.io`

## License

MIT License
