import React from 'react';

const ExternalLink = ({ to, children, ...props }) => {
  return (
    <a href={to} target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  );
};

export default ExternalLink;
