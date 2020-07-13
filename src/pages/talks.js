import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Bio from "../components/bio"

const TalkIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const talks = data.allTalksYaml.edges


  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="Talks" />
      <h2>Bio</h2>
      <Bio />
      <div>
        {data.site.siteMetadata.author.bio}
      </div>
      <h2>Talks</h2>
      {talks.map(({ node }) => {
        return (
          <article key={`foo`}>
            <header>
              <h3>{ node.title }</h3>
            </header>
            <section>
              <Link style={{ boxShadow: `none` }} to={node.slides}>
                Slides
              </Link>
              {` | `}
              <Link style={{ boxShadow: `none` }} to={node.video}>
                Video
              </Link>
              <p
                dangerouslySetInnerHTML={{
                  __html: node.abstract,
                }}
              />
              <h4>Conferences</h4>
              <ul>
              {node.conferences.map(({ name, website }) => {
                return (<li><Link to={website}>{name}</Link></li>)
              })}
              </ul>
            </section>
          </article>
        )
      })}
    </Layout>
  )
}

export default TalkIndex

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
    allTalksYaml {
      edges {
        node {
          title
          abstract
          slides
          video
          conferences {
            name
            website
          }
        }
      }
    }
  }
`
