import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Bio from "../components/bio"

const TalkIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const talks = data.allTalksYaml.edges

  const kebabTitle = str =>
    str &&
    str
      .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
      .map(x => x.toLowerCase())
      .join('-');

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
        const key = kebabTitle(node.title)

        return (
          <article key={`talk-` + key}>
            <header>
              <Link
                style={{ color: 'black' }}
                to={'#' + key}>
                  <h3 id={key}>{ node.title }</h3>
              </Link>
            </header>
            <section>
              {node.video !== null &&
                <iframe
                src={'https://www.youtube.com/embed/' + node.video}
                title={node.video}
                width="560"
                height="315"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>
              }
              <p>
                <Link to={node.slides}>
                  Slides
                </Link>
                {node.video !== null && ` | `}
                {node.video !== null &&
                  <Link 
                    to={'https://www.youtube.com/watch?v=' + node.video}>
                    Video
                  </Link>
                }
              </p>
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
