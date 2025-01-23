import Link from 'next/link';
import React from 'react';

const About = () => {
  return (
    <div>
      <h1>About Us</h1>
      <p>This is the About page in a Nextron app.</p>
      <Link href="/home">Go back to Home</Link>
    </div>
  );
};

export default About;
