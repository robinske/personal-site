module.exports = {
  siteMetadata: {
    title: `kelley robinson`,
    description: `Kelley is a writer, home cook, and developer living in the Hudson Valley.`,
    author: {
      name: `Kelley Robinson`,
      bio: `Kelley works on the User Authentication & Identity team at Twilio, helping developers manage and secure customer identity in their software applications. Previously she worked in a variety of API platform and data engineering roles at startups. Her research focuses on authentication user experience and design trade-offs for different risk profiles and 2FA channels. She believes in the power of good documentation and is passionate about making security accessible to new audiences. Kelley lives in the Hudson Valley and is an avid home cook.`,
    },
    siteUrl: `https://krobinson.me`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 590,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-73009306-1`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `K. Robinson's Blog`,
        short_name: `K. Robinson`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `static/favicon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-typography`,
      options: {
        pathToConfigModule: `src/utils/typography`,
      },
    },
    `gatsby-transformer-yaml`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `./src/data/`,
      },
    },
    {
      resolve: "gatsby-plugin-react-svg",
      options: {
        rule: {
          include: /static/,
        },
      },
    },
  ],
};
