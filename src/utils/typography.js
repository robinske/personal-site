import Typography from 'typography';

import gray from 'gray-percentage';

export const green = '#099976';

const MOBILE_MEDIA_QUERY = '@media only screen and (max-width:480px)';

const options = {
  baseFontSize: '16px',
  baseLineHeight: '26px',
  scaleRatio: 2,
  googleFonts: [
    {
      name: 'Abel',
      styles: ['400'],
    },
    {
      name: 'Merriweather',
      styles: ['400', '400i', '700', '700i', '900', '900i'],
    },
    {
      name: 'Roboto',
      styles: ['400', '700'],
    },
  ],
  headerFontFamily: ['Merriweather', 'Georgia', 'serif'],
  bodyFontFamily: ['Merriweather', 'Georgia', 'serif'],
  bodyColor: 'hsla(0,0%,0%,0.9)',
  headerWeight: 900,
  bodyWeight: 400,
  boldWeight: 700,
  overrideStyles: ({ adjustFontSizeTo, scale, rhythm }, styles) => ({
    'h1,h2': {
      fontFamily: ['Abel', 'sans-serif'].join(','),
    },
    h1: {
      ...scale(3 / 2),
    },
    h2: {
      ...scale(1),
    },
    'h1,h2,h3,h4,h5,h6': {
      marginTop: rhythm(1),
    },
    h4: {
      letterSpacing: '0.140625em',
      textTransform: 'uppercase',
    },
    a: {
      color: green,
      textDecoration: 'none',
    },
    'a:hover,a:active': {
      color: 'black',
      textDecoration: 'none',
    },
    'h1 a, h2 a': {
      color: 'black',
    },
    nav: {
      marginBottom: rhythm(1.5),
    },
    ul: {
      listStyle: 'disc',
    },
    [MOBILE_MEDIA_QUERY]: {
      'ul,ol': {
        marginLeft: rhythm(1),
      },
      blockquote: {
        marginLeft: rhythm(-3 / 4),
        marginRight: 0,
        paddingLeft: rhythm(9 / 16),
      },
    },
    '.gatsby-resp-image-background-image': {
      borderRadius: '8px',
      position: 'absolute !important',
      top: '0px',
      bottom: '0px',
      left: '0px',
      right: '0px',
    },
    '.gatsby-resp-image-image': {
      borderRadius: '8px',
    },
    blockquote: {
      ...scale(1 / 5),
      color: gray(41),
      fontStyle: 'italic',
      paddingLeft: rhythm(13 / 16),
      marginLeft: rhythm(-1),
      borderLeft: `${rhythm(3 / 16)} solid ${gray(10)}`,
    },
    'blockquote > :last-child': {
      marginBottom: 0,
    },
    'blockquote cite': {
      ...adjustFontSizeTo(styles.baseFontSize),
      color: styles.bodyColor,
      fontWeight: styles.bodyWeight,
    },
    'blockquote cite:before': {
      content: '"— "',
    },
  }),
};

const theme = new Typography(options);

// Hot reload theme in development.
if (process.env.NODE_ENV !== `production`) {
  theme.injectStyles();
}

export default theme;
export const rhythm = theme.rhythm;
export const scale = theme.scale;
