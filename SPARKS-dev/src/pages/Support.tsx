import React from 'react';

const Support: React.FC = () => (
  <div className="min-h-screen bg-slate-900 text-slate-200 px-6 py-12 max-w-2xl mx-auto">
    <h1 className="text-3xl font-bold mb-4">Support</h1>
    <p className="text-slate-400 mb-8">
      SPARKS is a classroom teacher tools app for interactive lessons and activities.
    </p>

    <h2 className="text-xl font-semibold mb-2">Contact</h2>
    <p className="text-slate-300 mb-6">
      For help, questions, or to report an issue, email us at:{' '}
      {/* Replace with your actual support email address */}
      <a href="mailto:support@sparksapp.com" className="text-orange-400 underline">
        support@sparksapp.com
      </a>
    </p>

    <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
    <div className="space-y-4 text-slate-300">
      <div>
        <p className="font-medium">How do I cancel my subscription?</p>
        <p className="text-slate-400 text-sm mt-1">
          Subscriptions are managed through your App Store or Google Play account.
          Go to your device&apos;s subscription settings to cancel at any time.
        </p>
      </div>
      <div>
        <p className="font-medium">How do I restore a purchase?</p>
        <p className="text-slate-400 text-sm mt-1">
          Open the app, go to the subscription screen, and tap &quot;Restore Purchases&quot;.
        </p>
      </div>
      <div>
        <p className="font-medium">What is included in the free plan?</p>
        <p className="text-slate-400 text-sm mt-1">
          The free plan includes access to core classroom tools. Premium unlocks all tools and
          advanced features.
        </p>
      </div>
    </div>
  </div>
);

export default Support;
