import React from 'react';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-[#020202] text-white">
      <div className="mx-auto max-w-3xl px-6 py-12 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">Terms of Use</h1>
        
        <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-gray-300 prose-li:text-gray-300 prose-strong:text-white">
          <p className="lead text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>

        <h2>1. Agreement to Terms</h2>
        <p>
          By accessing or using DocTree, you agree to be bound by these Terms of Use and our Privacy Policy. 
          If you do not agree to these terms, please do not use our services.
        </p>

        <h2>2. Intellectual Property Rights</h2>
        <p>
          Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, 
          website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, 
          service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected 
          by copyright and trademark laws and various other intellectual property rights.
        </p>

        <h2>3. User Representations</h2>
        <p>
          By using the Site, you represent and warrant that:
        </p>
        <ul>
          <li>All registration information you submit will be true, accurate, current, and complete.</li>
          <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
          <li>You have the legal capacity and you agree to comply with these Terms of Use.</li>
          <li>You are not a minor in the jurisdiction in which you reside.</li>
        </ul>

        <h2>4. Prohibited Activities</h2>
        <p>
          You may not access or use the Site for any purpose other than that for which we make the Site available. 
          The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
        </p>

        <h2>5. Termination</h2>
        <p>
          We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, 
          including without limitation if you breach the Terms.
        </p>

        <h2>6. Changes to Terms</h2>
        <p>
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
          What constitutes a material change will be determined at our sole discretion.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us.
        </p>
      </div>
    </div>
  </div>
  );
}
