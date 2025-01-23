import Link from 'next/link';
import React from 'react';

const Contact = () => {
  return (
    <div>
      <h1>Contact Us</h1>
      <p>This is the Contact page in a Nextron app.</p>
      <Link href="/home">Go back to Home</Link>
    </div>
  );
};

export default Contact;
