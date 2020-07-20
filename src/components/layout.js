import React from "react"
import { Link } from "gatsby"

import { rhythm, scale } from "../utils/typography"

const Layout = ({ title, children }) => {
  const header = (
    <h1
      style={{
        ...scale(1.7),
        fontFamily: `Allura, sans-serif`,
        marginBottom: rhythm(1.5),
        marginTop: 0,
      }}
    >
      <Link
        style={{
          boxShadow: `none`,
          color: `inherit`,
        }}
        to={`/`}
      >
        {title}
      </Link>
    </h1>
  )

  const tabs = (
    <div>
      <Link to={`/`} style={{ textDecoration: 'none' }}>Blog</Link>
      {` | `}
      <Link to={`/talks`} style={{ textDecoration: 'none' }}>Talks</Link>
    </div>
  )

  return (
    <div
      style={{
        marginLeft: `auto`,
        marginRight: `auto`,
        maxWidth: rhythm(24),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
      }}
    >
      <header>{header}</header>
      <main>{tabs} {children}</main>
      <footer 
        style={{
          marginTop: rhythm(2),
        }}>
        © {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default Layout
