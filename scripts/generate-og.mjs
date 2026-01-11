import fs from 'fs';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

// Load font
const fontBuffer = fs.readFileSync(
  new URL('../assets/fonts/FiraCode-Regular.ttf', import.meta.url)
);

const width = 1200;
const height = 630;

const svg = await satori(
  {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1a1a2e',
        padding: '60px 80px',
        fontFamily: 'Fira Code',
        color: '#ffffff',
        position: 'relative',
      },
      children: [
        // Header with logo
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '50px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#c778dd',
                    borderRadius: '50%',
                  },
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '22px',
                    fontWeight: 600,
                    color: '#ffffff',
                  },
                  children: 'Deepanshu Malik',
                },
              },
            ],
          },
        },

        // Main content area
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flex: 1,
              gap: '60px',
              alignItems: 'center',
            },
            children: [
              // Left side - Text content
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px',
                    flex: 1,
                  },
                  children: [
                    // Title
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '48px',
                          fontWeight: 700,
                          lineHeight: 1.2,
                          color: '#c778dd',
                        },
                        children: 'Backend Engineer',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '48px',
                          fontWeight: 700,
                          lineHeight: 1.2,
                          color: '#c778dd',
                          marginTop: '-8px',
                        },
                        children: '& GenAI Developer',
                      },
                    },

                    // Description
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '20px',
                          lineHeight: 1.5,
                          color: '#abb2bf',
                          marginTop: '12px',
                        },
                        children: 'Building production systems with Python,',
                      },
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontSize: '20px',
                          lineHeight: 1.5,
                          color: '#abb2bf',
                          marginTop: '-8px',
                        },
                        children: 'FastAPI, and Kubernetes',
                      },
                    },

                    // Tech tags
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          gap: '12px',
                          marginTop: '20px',
                          flexWrap: 'wrap',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                padding: '8px 16px',
                                backgroundColor: '#16162a',
                                border: '1px solid #3d3d5c',
                                fontSize: '16px',
                                color: '#c778dd',
                              },
                              children: 'Python',
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                padding: '8px 16px',
                                backgroundColor: '#16162a',
                                border: '1px solid #3d3d5c',
                                fontSize: '16px',
                                color: '#c778dd',
                              },
                              children: 'FastAPI',
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                padding: '8px 16px',
                                backgroundColor: '#16162a',
                                border: '1px solid #3d3d5c',
                                fontSize: '16px',
                                color: '#c778dd',
                              },
                              children: 'Kubernetes',
                            },
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                padding: '8px 16px',
                                backgroundColor: '#16162a',
                                border: '1px solid #3d3d5c',
                                fontSize: '16px',
                                color: '#c778dd',
                              },
                              children: 'GenAI',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },

              // Right side - Code terminal
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    width: '450px',
                  },
                  children: [
                    // Terminal
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          flexDirection: 'column',
                          backgroundColor: '#0d1117',
                          border: '1px solid #3d3d5c',
                          borderRadius: '8px',
                          overflow: 'hidden',
                        },
                        children: [
                          // Terminal header
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                gap: '6px',
                                backgroundColor: '#161b22',
                                padding: '10px 14px',
                              },
                              children: [
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      width: '10px',
                                      height: '10px',
                                      borderRadius: '50%',
                                      backgroundColor: '#ff5f56',
                                    },
                                  },
                                },
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      width: '10px',
                                      height: '10px',
                                      borderRadius: '50%',
                                      backgroundColor: '#ffbd2e',
                                    },
                                  },
                                },
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      width: '10px',
                                      height: '10px',
                                      borderRadius: '50%',
                                      backgroundColor: '#27ca40',
                                    },
                                  },
                                },
                              ],
                            },
                          },

                          // Terminal body
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '20px',
                                fontSize: '15px',
                                lineHeight: 1.8,
                                fontFamily: 'Fira Code',
                                whiteSpace: 'pre',
                              },
                              children: [
                                // Line 1: comment
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      color: '#8b949e',
                                    },
                                    children: '# Building RAG pipeline',
                                  },
                                },
                                // Line 2: from langchain import ChatOpenAI
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      display: 'flex',
                                      whiteSpace: 'pre',
                                    },
                                    children: [
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#ff7b72', whiteSpace: 'pre' },
                                          children: 'from',
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#e6edf3', whiteSpace: 'pre' },
                                          children: ' langchain ',
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#ff7b72', whiteSpace: 'pre' },
                                          children: 'import',
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#e6edf3', whiteSpace: 'pre' },
                                          children: ' ChatOpenAI',
                                        },
                                      },
                                    ],
                                  },
                                },
                                // Line 3: from chromadb import Client
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      display: 'flex',
                                      whiteSpace: 'pre',
                                    },
                                    children: [
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#ff7b72', whiteSpace: 'pre' },
                                          children: 'from',
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#e6edf3', whiteSpace: 'pre' },
                                          children: ' chromadb ',
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#ff7b72', whiteSpace: 'pre' },
                                          children: 'import',
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#e6edf3', whiteSpace: 'pre' },
                                          children: ' Client',
                                        },
                                      },
                                    ],
                                  },
                                },
                                // Empty line
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      height: '10px',
                                    },
                                  },
                                },
                                // Line 4: llm = ChatOpenAI("gpt-4o-mini")
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      display: 'flex',
                                      whiteSpace: 'pre',
                                    },
                                    children: [
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#e6edf3', whiteSpace: 'pre' },
                                          children: 'llm = ChatOpenAI(',
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#a5d6ff', whiteSpace: 'pre' },
                                          children: '"gpt-4o-mini"',
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#e6edf3', whiteSpace: 'pre' },
                                          children: ')',
                                        },
                                      },
                                    ],
                                  },
                                },
                                // Line 5: db = Client().get_collection()
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      color: '#e6edf3',
                                    },
                                    children: 'db = Client().get_collection()',
                                  },
                                },
                                // Empty line
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      height: '10px',
                                    },
                                  },
                                },
                                // Line 6: >>> response = rag_query("skills")
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      display: 'flex',
                                      alignItems: 'center',
                                      whiteSpace: 'pre',
                                    },
                                    children: [
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#7ee787', whiteSpace: 'pre' },
                                          children: '>>> ',
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#e6edf3', whiteSpace: 'pre' },
                                          children: 'response = rag_query(',
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#a5d6ff', whiteSpace: 'pre' },
                                          children: '"skills"',
                                        },
                                      },
                                      {
                                        type: 'span',
                                        props: {
                                          style: { color: '#e6edf3', whiteSpace: 'pre' },
                                          children: ')',
                                        },
                                      },
                                      {
                                        type: 'div',
                                        props: {
                                          style: {
                                            width: '8px',
                                            height: '16px',
                                            backgroundColor: '#c778dd',
                                            marginLeft: '4px',
                                          },
                                        },
                                      },
                                    ],
                                  },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },

                    // Status badge
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          marginTop: '16px',
                          padding: '12px 16px',
                          backgroundColor: '#1a1a2e',
                          border: '1px solid #3d3d5c',
                          fontSize: '14px',
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: {
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#c778dd',
                                borderRadius: '50%',
                              },
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: { color: '#abb2bf' },
                              children: 'Working on ',
                            },
                          },
                          {
                            type: 'span',
                            props: {
                              style: { color: '#c778dd', fontWeight: 600 },
                              children: 'GenAI Projects',
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
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
        name: 'Fira Code',
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
