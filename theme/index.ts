import type { Theme } from "theme-ui";
import { darken, lighten } from '@theme-ui/color'

const makeTheme = <T extends Theme>(t: T) => t

export const theme = makeTheme({
  config: {
    initialColorModeName: 'light',
  },
  breakpoints: ['40em', '52em', '64em', '78em'],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: 'Work Sans, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: 'Work Sans, sans-serif',
    monospace: 'Roboto, monospace',
  },
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 400,
    bold: 700,
  },
  layout: {
    container: {
      maxWidth: "100%",
      width: "100%",
      mx: "auto",
      px: 3
    }
  },
  lineHeights: {
    body: 1.5,
    heading: 0.85,
  },
  colors: {
    text: '#000000',
    background: '#FFFFFF',
    primary: '#9A52FF',
    secondary: '#30c',
    muted: '#C6C6D3',
    modes: {
      dark: {
        text: '#FFFFFF',
        background: '#000000',
        primary: '#9A52FF',
        secondary: '#30c',
      }
    }
  },
  text: {
    heading: {
      fontFamily: 'heading',
      lineHeight: 'heading',
      fontWeight: 'heading',
    },
    monospace: {
      fontWeight: 300
    }
  },
  sizes: {
    "widePlus": 2048,
    "wide": 1536,
    "layoutPlus": 1260,
    "layout": 1024,
    "copyUltra": 980,
    "copyPlus": 768,
    "copy": 680,
    "narrowPlus": 600,
    "narrow": 512,
    sm: {
      paddingX: 3,
      paddingY: 1
    },
    md: {
      px: 4,
      py: 2
    },
    lg: {
      px: 6,
      py: 4
    },
  },
  buttons: {

    primary: {
      size: 'md',
      color: 'white',
      bg: 'primary',
      '&:hover': {
        bg: darken('primary', 0.1),
        borderColor: darken('primary', 0.1)
      },
      fontWeight: 600,
      borderRadius: '3px',
      fontSize: 1,
      border: '1px solid',
      borderColor: 'primary',
    },
    secondary: {
      color: 'black',
      bg: 'muted',
      fontSize: 1,
      borderRadius: '3px',
      border: '1px solid',
      borderColor: 'muted',
      '&:hover': {
        bg: darken('muted', 0.1),
        borderColor: darken('muted', 0.1),
      },
      cursor: 'pointer'
    },
    muted: {
      color: 'text',
      bg: 'background',
      fontSize: 1,
      border: '1px solid',
      borderColor: 'text',
      borderRadius: '3px',
      '&:hover': {
        bg: darken('background', 0.1),
      },
      cursor: 'pointer'
    }
  },
  styles: {
    root: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
    },
    h1: {
      variant: 'text.heading',
      fontSize: 5,
    },
    h2: {
      variant: 'text.heading',
      fontSize: 4,
    },
    h3: {
      variant: 'text.heading',
      fontSize: 3,
    },
    h4: {
      variant: 'text.heading',
      fontSize: 2,
    },
    h5: {
      variant: 'text.heading',
      fontSize: 1,
    },
    h6: {
      variant: 'text.heading',
      fontSize: 0,
    },
    pre: {
      fontFamily: 'monospace',
      overflowX: 'auto',
      code: {
        color: 'inherit',
      },
    },
    code: {
      fontFamily: 'monospace',
      fontSize: 'inherit',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0,
    },
    th: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
    td: {
      textAlign: 'left',
      borderBottomStyle: 'solid',
    },
  },
});