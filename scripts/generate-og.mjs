import fs from 'fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Load the font
const fontBuffer = fs.readFileSync(
  new URL("../assets/fonts/FiraCode-Regular.ttf", import.meta.url)
);

const width = 1200;
const height = 630;

const svg = await satori(
  {
    type: 'div',
    props: {
      style: {
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#1a1a2e',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        color: '#ffffff',
        fontFamily: 'Fira Code', // must match font name in fonts array
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
	      display: 'flex',   // <-- add this
              flexDirection: 'column', // to make <br> behave correctly
              fontSize: '64px',
              fontWeight: '700',
              marginBottom: '24px',
            },
            children: '⬡ Deepanshu Malik',
          },
        },
        {
          type: 'div',
          props: {
            style: {
	      display: 'flex',   // <-- add this
              flexDirection: 'column', // to make <br> behave correctly
              fontSize: '40px',
              lineHeight: 1.2,
              marginBottom: '32px',
            },
            children: [
              'Senior Backend Engineer & GenAI',
              { type: 'br', props: {} },
              'Developer',
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
	      display: 'flex',   // <-- add this
              flexDirection: 'column', // to make <br> behave correctly
              fontSize: '28px',
              color: '#c778dd',
              marginBottom: '48px',
            },
            children: 'Python • FastAPI • Kubernetes • AWS',
          },
        },
        {
          type: 'div',
          props: {
            style: {
	      display: 'flex',   // <-- add this
              flexDirection: 'column', // to make <br> behave correctly
              backgroundColor: '#0f0f1a',
              borderRadius: '12px',
              padding: '24px 28px',
              fontSize: '24px',
              width: 'fit-content',
            },
            children: [
              { type: 'span', props: { style: { color: '#c778dd' }, children: '$' } },
              ' kubectl get pods',
            ],
          },
        },
      ],
    },
  },
  {
    width,
    height,
    fonts: [
      {
        name: 'Fira Code',   // matches fontFamily in style
        data: fontBuffer,
        weight: 400,
        style: 'normal',
      },
    ],
  }
);

const resvg = new Resvg(svg);
const png = resvg.render().asPng();

fs.mkdirSync('assets/images', { recursive: true });
fs.writeFileSync('assets/images/og-image.png', png);

console.log('✅ OG image generated: assets/images/og-image.png');

