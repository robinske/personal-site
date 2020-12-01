import React from 'react';
import { Link } from 'gatsby';

import TopNav from './top-nav';

import { rhythm } from '../utils/typography';

const Layout = ({ title, children }) => {
  const header = (
    <h1>
      <Link to={`/`}>{title}</Link>
    </h1>
  );

  return (
    <div
      style={{
        marginLeft: `auto`,
        marginRight: `auto`,
        maxWidth: rhythm(30),
        padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
      }}
    >
      <header>{header}</header>
      <main>
        <TopNav />
        {children}
      </main>
      <footer
        style={{
          marginTop: rhythm(2),
        }}
      >
        © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default Layout;
