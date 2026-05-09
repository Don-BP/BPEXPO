import React from 'react';

const PrivacyPolicy: React.FC = () => (
  <div className="min-h-screen bg-slate-900 text-slate-200 px-6 py-12 max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
    {/*
      Replace the placeholder below with your Termly-generated privacy policy HTML.
      Generate at: termly.io → Create Privacy Policy
      Include: Supabase, RevenueCat, Gemini, Pinecone, Exa, Firecrawl as third parties.
      Enable APPI section for Japanese users.
    */}
    <div
      className="prose prose-invert prose-sm max-w-none"
      dangerouslySetInnerHTML={{
        __html: `<p>Privacy policy coming soon. Generated policy will appear here.</p>`,
      }}
    />
  </div>
);

export default PrivacyPolicy;
