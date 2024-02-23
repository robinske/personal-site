import React from "react";

import { Link } from "gatsby";

import ExternalLink from "./external-link";
import { rhythm } from "../utils/typography";

import styled from "styled-components";

const FlexDiv = styled("div")`
  display: flex;
`;

const SocialIcons = styled(FlexDiv)`
  @media (max-width: 500px) {
    display: none;
  }
`;

const Divider = () => {
  return (
    <span
      style={{ marginLeft: rhythm(1 / 3), marginRight: rhythm(1 / 3) }}
    >{`|`}</span>
  );
};

const TopNav = () => {
  const navItems = [
    { name: "Talks", slug: "/" },
    { name: "Blog", slug: "/blog" },
    { name: "About", slug: "/about" },
  ];

  const navSize = navItems.length;
  const navLinks = navItems.map(({ name, slug }, i) => {
    const navLink = (
      <span>
        <Link to={slug}>{name}</Link>
      </span>
    );
    if (navSize === i + 1) {
      // last item
      return navLink;
    } else {
      return (
        <div>
          {navLink}
          <Divider />
        </div>
      );
    }
  });

  return (
    <nav
      style={{
        display: `flex`,
        flexWrap: `wrap`,
        justifyContent: `space-between`,
        alignItems: `center`,
      }}
    >
      <FlexDiv>{navLinks}</FlexDiv>
      <SocialIcons></SocialIcons>
    </nav>
  );
};

export default TopNav;
