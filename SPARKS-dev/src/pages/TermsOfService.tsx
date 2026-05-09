import React from 'react';

const TermsOfService: React.FC = () => (
  <div className="min-h-screen bg-slate-900 text-slate-200 px-6 py-12 max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
    {/*
      Replace the placeholder below with your Termly-generated terms of service HTML.
      Generate at: termly.io → Create Terms and Conditions
      Include: auto-renewing subscription terms, Apple/Google handle refunds, cancellation via device settings.
    */}
    <div
      className="prose prose-invert prose-sm max-w-none"
      dangerouslySetInnerHTML={{
        __html: `<p>Terms of service coming soon. Generated terms will appear here.</p>`,
      }}
    />
  </div>
);

export default TermsOfService;
