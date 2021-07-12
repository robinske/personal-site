import React from 'react';
import { graphql } from 'gatsby';
import { GatsbyImage } from 'gatsby-plugin-image';

import Layout from '../components/layout';
import SEO from '../components/seo';

const TalkIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title;

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="About" />
      <div>{data.site.siteMetadata.author.bio}</div>
      <GatsbyImage
        image={{ ...data.headshot.childImageSharp.gatsbyImageData }}
        style={{ width: '100%', borderRadius: 8, marginTop: 10 }}
      />
    </Layout>
  );
};

export default TalkIndex;

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
        author {
          name
          bio
        }
      }
    }
    headshot: file(relativePath: { eq: "assets/profile-pic-wide.jpeg" }) {
      childImageSharp {
        gatsbyImageData(layout: FULL_WIDTH)
      }
    }
  }
`;
