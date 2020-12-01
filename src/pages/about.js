import React from 'react';
import { graphql } from 'gatsby';
import Img from 'gatsby-image';

import Layout from '../components/layout';
import SEO from '../components/seo';

const TalkIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title;

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="About" />
      <div>{data.site.siteMetadata.author.bio}</div>
      <Img
        fluid={{ ...data.headshot.childImageSharp.fluid }}
        style={{ width: '100%', borderRadius: 8, marginTop: 10 }}
      />
    </Layout>
  );
};

export default TalkIndex;

export const pageQuery = graphql`
  query {
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
        fluid {
          ...GatsbyImageSharpFluid
        }
      }
    }
  }
`;
