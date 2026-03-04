import { useState } from 'react';
import { Link } from 'react-router-dom';

export function FAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs = [
    {
      id: '1',
      question: 'What calculators should I use for my investment?',
      answer:
        'It depends on your investment strategy. Use XIRR for flip projects with multiple cash flows, Annualized ROI for long-term rentals, Mortgage Calculator for financing analysis, and Cap Rate for comparing yield across properties. Most investors start with XIRR or Annualized ROI. We recommend exploring multiple calculators to find what works best for your analysis.',
    },
    {
      id: '2',
      question: 'How accurate is the ROI calculation?',
      answer:
        'Our calculators use the same financial formulas used by professional investors and financial institutions. XIRR calculations follow Excel standards, and all projections are based on standard financial mathematics. The accuracy of your results depends on the accuracy of your input data. Garbage in = garbage out. Always verify your assumptions with market research.',
    },
    {
      id: '3',
      question: 'Do you save my data? Is it secure?',
      answer:
        'Yes, we save your projects when you create an account. Your data is encrypted end-to-end using 256-bit encryption, stored securely on encrypted servers, and never shared with third parties. We comply with GDPR, SOC 2, and other data protection standards. You can delete any project anytime. Your financial data is confidential.',
    },
    {
      id: '4',
      question: 'What\'s the difference between FREE, PRO, and ENTERPRISE?',
      answer:
        'FREE tier includes 3 calculator uses per month and lets you save 1 project. Perfect for testing the platform. PRO ($9/month) gives unlimited calculators, 25 saved projects, PDF export, advanced modes, and multi-currency support. ENTERPRISE is custom-priced and includes API access, custom integrations, white-label options, and 24/7 support for teams and portfolio managers.',
    },
    {
      id: '5',
      question: 'Can I export my results? What format?',
      answer:
        'Yes! PRO and ENTERPRISE users can export calculations to PDF with full details, charts, and summaries. PDFs are professionally formatted and perfect for sharing with clients, lenders, or partners. FREE tier does not include PDF export. You can always take screenshots of your results.',
    },
    {
      id: '6',
      question: 'Do you support multiple currencies?',
      answer:
        'Yes! PRO and ENTERPRISE tiers support all major currencies including USD, EUR, GBP, IDR, AUD, SGD, MYR, and more. Simply select your currency when setting up a calculation. All conversions and results maintain precision. This is perfect for international property portfolios.',
    },
    {
      id: '7',
      question: 'How are developers paid? Is this a subscription trap?',
      answer:
        'We believe in transparent, honest pricing. We\'re not a subscription trap—we charge reasonable monthly fees for advanced features. FREE users can always use the platform. Our revenue comes from PRO subscriptions and ENTERPRISE contracts. We keep the lights on and continuously improve the platform. No surprise charges, ever.',
    },
    {
      id: '8',
      question: 'How safe is my financial data?',
      answer:
        'Your data is protected with enterprise-grade security: 256-bit encryption in transit and at rest, secure database architecture, compliance with GDPR and SOC 2 standards, and regular security audits. We never sell data to third parties. You own your data and can export or delete it anytime.',
    },
    {
      id: '9',
      question: 'Do you offer API access or custom integrations?',
      answer:
        'Yes, but only in ENTERPRISE tier. We provide full API access, webhooks, and custom integrations for portfolio managers, teams, and organizations. You can embed calculators into your own platform or automate calculations. Contact sales@investlandgroup.com for ENTERPRISE plans.',
    },
    {
      id: '10',
      question: 'Is there a mobile app?',
      answer:
        'Not yet, but our platform is fully mobile-responsive. Access ROI Calculate from any smartphone or tablet through your web browser. A native mobile app is on our roadmap for 2025. Subscribe to our newsletter to be notified when it launches.',
    },
    {
      id: '11',
      question: 'What if I need help using the calculators?',
      answer:
        'FREE users have access to detailed tooltips and guides within each calculator. PRO users get email support within 24 hours. ENTERPRISE users get 24/7 dedicated support with a personal account manager. We also offer video tutorials and documentation for each calculator on our help center.',
    },
    {
      id: '12',
      question: 'Can I use ROI Calculate for commercial real estate?',
      answer:
        'Yes, absolutely. While our platform was built for villa and residential property analysis, all calculators work for commercial real estate, office buildings, retail spaces, and mixed-use properties. The XIRR, Cap Rate, and Cash Flow Projector are particularly powerful for commercial deals.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Everything you need to know about ROI Calculate. Can't find your answer? Contact us.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <span>{faq.question}</span>
                  <span
                    className={`text-2xl transition-transform transform ${
                      openId === faq.id ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>

                {openId === faq.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-indigo-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
          <p className="text-gray-600 mb-8">
            We're here to help. Reach out to our support team anytime.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link
              to="/contact"
              className="p-6 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <div className="text-3xl mb-2">📧</div>
              <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
              <p className="text-sm text-gray-600">hello@investlandgroup.com</p>
            </Link>

            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-3xl mb-2">𝕏</div>
              <h3 className="font-bold text-gray-900 mb-2">Twitter</h3>
              <p className="text-sm text-gray-600">@investlandgroup</p>
            </a>

            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-3xl mb-2">💼</div>
              <h3 className="font-bold text-gray-900 mb-2">LinkedIn</h3>
              <p className="text-sm text-gray-600">Investland Group</p>
            </a>
          </div>

          <Link
            to="/contact"
            className="inline-block px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Contact Us →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Calculating?</h2>
          <p className="text-lg mb-8 opacity-90">
            Get started with 3 free calculator uses. No credit card required.
          </p>
          <Link
            to="/calculators"
            className="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            → Start Free Now
          </Link>
        </div>
      </section>
    </div>
  );
}
