# OG Image Design Guide

Complete guide for creating your social media preview image (1200×630px).

## 🎨 Design Option 1: Terminal Code Style (Recommended)

This is the design in `og-image-template.html` - matches your V3 terminal aesthetic perfectly.

### Layout:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ⬡ Deepanshu Malik                                         │
│                                                             │
│   Senior Backend Engineer & GenAI Developer                │
│   Building scalable microservices and LLM-powered apps     │
│                                                             │
│   [Python] [FastAPI] [Kubernetes] [AWS] [GenAI]           │
│                                                             │
│   ┌─ Terminal ─────────────────┐                          │
│   │ # Experience               │                          │
│   │ $ years_experience = 4+    │                          │
│   │ $ certifications = ["CKA"] │                          │
│   │ $ location = "India"       │                          │
│   └────────────────────────────┘                          │
│                                                             │
│                          deepanshu-malik.github.io         │
└─────────────────────────────────────────────────────────────┘
```

### Colors:
- Background: `#1a1a2e` (dark blue-gray)
- Text: `#ffffff` (white)
- Accent: `#c778dd` (purple/pink)
- Secondary: `#abb2bf` (gray)
- Muted: `#607b96`

### Elements:
✅ Grid background (subtle purple)
✅ Glow effects (top-right purple, bottom-left green)
✅ Hexagon logo (⬡)
✅ Terminal window with code
✅ Tech stack tags
✅ Website URL badge

---

## 🎨 Design Option 2: Minimalist Hero

Simpler design focusing on name and title.

### Layout:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                    ⬡                                        │
│                                                             │
│              Deepanshu Malik                                │
│                                                             │
│    Senior Backend Engineer & GenAI Developer                │
│                                                             │
│    Python • FastAPI • Kubernetes • AWS • GenAI             │
│                                                             │
│           4+ Years • CKA Certified • India                  │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design Option 3: Split Screen

Left side text, right side visual.

### Layout:
```
┌────────────────────────────┬────────────────────────────────┐
│                            │                                │
│  ⬡ Deepanshu Malik         │    ┌─ main.py ────────────┐   │
│                            │    │ from fastapi import  │   │
│  Senior Backend Engineer   │    │     FastAPI          │   │
│  & GenAI Developer         │    │                      │   │
│                            │    │ app = FastAPI()      │   │
│  [Python] [FastAPI]        │    │                      │   │
│  [Kubernetes] [AWS]        │    │ @app.get("/")        │   │
│  [GenAI]                   │    │ def build():         │   │
│                            │    │   return "scalable"  │   │
│  4+ Years Experience       │    │                      │   │
│  CKA Certified             │    └──────────────────────┘   │
│                            │                                │
└────────────────────────────┴────────────────────────────────┘
```

---

## 🎨 Design Option 4: Card Style

Central card with decorative elements.

### Layout:
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│        ┌──────────────────────────────────────┐            │
│        │                                      │            │
│        │   ⬡ Deepanshu Malik                  │            │
│        │                                      │            │
│        │   Senior Backend Engineer            │            │
│        │   & GenAI Developer                  │            │
│        │                                      │            │
│        │   Building scalable microservices    │            │
│        │   and LLM-powered applications       │            │
│        │                                      │            │
│        │   Python • FastAPI • Kubernetes      │            │
│        │   AWS • GenAI • Docker               │            │
│        │                                      │            │
│        │   4+ Years • CKA • India             │            │
│        │                                      │            │
│        └──────────────────────────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📐 Technical Specifications

### Dimensions:
- **Width**: 1200px
- **Height**: 630px
- **Aspect Ratio**: 1.91:1
- **Format**: PNG or JPG

### Safe Zones:
- **Title Safe**: Keep important text 40px from edges
- **Action Safe**: Keep all content 20px from edges
- **Center Focus**: Most important info in center 900×400px area

### Font Sizes:
- **Name**: 40-48px (bold)
- **Title**: 28-36px (medium)
- **Body**: 18-24px (regular)
- **Tags**: 14-18px (medium)
- **Footer**: 12-14px (regular)

### Color Palette (V3 Theme):
```css
--bg-primary: #1a1a2e      /* Main background */
--bg-secondary: #16162a    /* Secondary background */
--bg-card: #1e1e3f         /* Card background */
--text-primary: #ffffff    /* White text */
--text-secondary: #abb2bf  /* Gray text */
--text-muted: #607b96      /* Muted text */
--accent: #c778dd          /* Purple accent */
--border: #3d3d5c          /* Borders */
```

---

## 🛠️ How to Generate the Image

### Method 1: Use the HTML Template (Easiest)

1. **Open the template**:
   ```bash
   # Open og-image-template.html in your browser
   open og-image-template.html
   ```

2. **Set browser dimensions**:
   - Press `F12` to open DevTools
   - Press `Ctrl+Shift+M` (or Cmd+Shift+M on Mac) for device toolbar
   - Click "Responsive" dropdown
   - Set width: `1200`, height: `630`

3. **Take screenshot**:
   - **Option A**: Browser DevTools
     - Press `Ctrl+Shift+P` (Cmd+Shift+P on Mac)
     - Type "screenshot"
     - Select "Capture node screenshot"
     - Click on `.og-container` element

   - **Option B**: Extension
     - Install "Full Page Screen Capture" extension
     - Take screenshot of visible area

   - **Option C**: macOS
     - Press `Cmd+Shift+4`
     - Press `Space` to capture window
     - Click on browser window

4. **Save and optimize**:
   ```bash
   # Save as og-image.png
   # Optionally optimize:
   pngquant og-image.png --output og-image-optimized.png
   ```

### Method 2: Figma/Canva (Design Tools)

#### Figma:
1. Create new file with frame: 1200×630px
2. Use V3 colors and Fira Code font
3. Follow layout from options above
4. Export as PNG at 2x resolution (2400×1260) then resize to 1200×630

#### Canva:
1. Go to https://canva.com
2. Create custom size: 1200×630px
3. Use "presentation" template and modify
4. Add text, shapes, and colors from V3 theme
5. Download as PNG

### Method 3: Automated (Puppeteer)

```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 630 });
  await page.goto('file:///path/to/og-image-template.html');

  const element = await page.$('.og-container');
  await element.screenshot({ path: 'og-image.png' });

  await browser.close();
})();
```

### Method 4: HTML2Canvas (JavaScript)

```html
<script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
<script>
  html2canvas(document.querySelector('.og-container')).then(canvas => {
    const link = document.createElement('a');
    link.download = 'og-image.png';
    link.href = canvas.toDataURL();
    link.click();
  });
</script>
```

---

## ✅ Quality Checklist

Before finalizing your OG image:

- [ ] Dimensions are exactly 1200×630px
- [ ] File size is under 1MB (preferably under 300KB)
- [ ] Text is readable at small sizes (mobile preview)
- [ ] All important content is in safe zone (40px from edges)
- [ ] Colors match V3 theme (#1a1a2e, #c778dd)
- [ ] Font is Fira Code (or similar monospace)
- [ ] No pixelation or blur
- [ ] Hexagon logo (⬡) is visible
- [ ] Your name is prominent and clear
- [ ] Tech stack is visible but not overwhelming

---

## 🧪 Testing Your OG Image

### Before Upload:
1. **Preview at different sizes**:
   - Desktop: 1200×630 (full size)
   - Mobile: 600×315 (50% size)
   - Thumbnail: 300×157 (25% size)

2. **Check readability**:
   - Zoom out to 25% in image viewer
   - Can you still read your name and title?
   - Are tech tags distinguishable?

### After Upload:
1. **Facebook Debugger**:
   - URL: https://developers.facebook.com/tools/debug/
   - Enter: `https://deepanshu-malik.github.io`
   - Click "Scrape Again" to refresh cache

2. **Twitter Card Validator**:
   - URL: https://cards-dev.twitter.com/validator
   - Enter your portfolio URL
   - Preview how it looks

3. **LinkedIn Post Inspector**:
   - URL: https://www.linkedin.com/post-inspector/
   - Enter your portfolio URL
   - Check preview

4. **WhatsApp Preview**:
   - Send link to yourself
   - Check how preview appears

---

## 💡 Pro Tips

### Text Contrast:
- White text on dark background: excellent contrast
- Purple accent on dark: use sparingly for highlights
- Gray text: use for secondary information only

### Visual Hierarchy:
1. **Most Important**: Your name (largest, boldest)
2. **Very Important**: Job title (medium size)
3. **Important**: Tech stack (visible but smaller)
4. **Context**: Years, location, certifications (smallest)

### Mobile Optimization:
- Preview at 50% size (mobile feeds)
- Ensure name and title are still readable
- Don't use text smaller than 18px

### Brand Consistency:
- Use same accent color (#c778dd) as portfolio
- Use same font (Fira Code)
- Use same terminal aesthetic
- Include hexagon logo (⬡)

### Common Mistakes to Avoid:
❌ Text too small (below 18px)
❌ Too much information (overwhelming)
❌ Wrong dimensions (not 1200×630)
❌ Poor contrast (can't read text)
❌ Missing name or title
❌ File size too large (>1MB)
❌ Pixelated or blurry

---

## 🎯 Recommended: Option 1 (Terminal Style)

The HTML template provided implements **Option 1** which I recommend because:

✅ Matches your V3 terminal aesthetic perfectly
✅ Shows your personality (developer-focused)
✅ Includes visual interest (terminal window)
✅ Professional yet unique
✅ All key information visible
✅ Scalable to mobile sizes
✅ Easy to generate from template

---

## 📦 Deliverables

After generating, you should have:

1. **og-image.png**
   - Dimensions: 1200×630px
   - Location: `assets/images/og-image.png`
   - Size: < 300KB (optimized)

2. **Testing**:
   - Tested on Facebook debugger
   - Tested on Twitter validator
   - Previewed at mobile size

3. **Git**:
   ```bash
   git add assets/images/og-image.png
   git commit -m "feat: add OG image for social media previews"
   git push origin main
   ```

---

## 🆘 Need Help?

If you get stuck:

1. **Quick Fix**: Use Canva
   - Go to canva.com
   - Use 1200×630 template
   - Manually recreate the design
   - Download as PNG

2. **Professional Help**:
   - Fiverr: $5-20 for custom OG image
   - 99designs: Professional designers
   - Upwork: Hire for custom work

3. **Free Tools**:
   - Remove.bg: Remove backgrounds
   - TinyPNG: Compress images
   - GIMP: Free Photoshop alternative

---

Good luck! The HTML template should make this super easy. Just open it, screenshot it, and you're done! 🚀
