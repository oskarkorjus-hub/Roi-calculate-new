import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const features = [
    { name: 'Calculator Uses', free: '3/month', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Saved Projects', free: '1', pro: '25', enterprise: 'Unlimited' },
    { name: 'PDF Export', free: '❌', pro: '✓', enterprise: '✓' },
    { name: 'Advanced Modes', free: '❌', pro: '✓', enterprise: '✓' },
    { name: 'Multi-Currency', free: '❌', pro: '✓', enterprise: '✓' },
    { name: 'Historical Comparisons', free: '❌', pro: '✓', enterprise: '✓' },
    { name: 'Data Analytics', free: '❌', pro: '❌', enterprise: '✓' },
    { name: 'API Access', free: '❌', pro: '❌', enterprise: '✓' },
    { name: 'Custom Integrations', free: '❌', pro: '❌', enterprise: '✓' },
    { name: 'Dedicated Support', free: '❌', pro: 'Email', enterprise: '24/7' },
    { name: 'White Label', free: '❌', pro: '❌', enterprise: '✓' },
  ];

  const tiers = [
    {
      name: 'FREE',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Perfect for testing the platform',
      cta: 'Get Started',
      ctaVariant: 'secondary',
      highlight: false,
    },
    {
      name: 'PRO',
      monthlyPrice: 9,
      annualPrice: 99,
      description: 'For active investors and professionals',
      cta: 'Start Free Trial',
      ctaVariant: 'primary',
      highlight: true,
      savingsText: billingPeriod === 'annual' ? 'Save $9/month' : '',
    },
    {
      name: 'ENTERPRISE',
      monthlyPrice: null,
      annualPrice: null,
      description: 'For portfolio managers and teams',
      cta: 'Contact Sales',
      ctaVariant: 'secondary',
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-gray-600">
            Choose the plan that matches your investment needs. No hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="mt-8 flex justify-center items-center gap-4">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Annual
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save 8%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {tiers.map((tier, idx) => (
              <div
                key={idx}
                className={`relative p-8 rounded-xl border-2 transition-all ${
                  tier.highlight
                    ? 'border-indigo-600 bg-gradient-to-b from-indigo-50 to-white shadow-xl'
                    : 'border-gray-200 bg-white hover:shadow-lg'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </div>

                <div className="mb-6">
                  {tier.monthlyPrice !== null ? (
                    <div>
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        ${billingPeriod === 'monthly' ? tier.monthlyPrice : Math.floor(tier.annualPrice! / 12)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {billingPeriod === 'monthly' ? 'per month, billed monthly' : 'per month, billed annually'}
                      </p>
                      {tier.savingsText && (
                        <p className="text-xs text-green-700 font-semibold mt-2">{tier.savingsText}</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">Custom Pricing</div>
                      <p className="text-sm text-gray-600">Tailored for your team size and needs</p>
                    </div>
                  )}
                </div>

                <button
                  className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${
                    tier.ctaVariant === 'primary'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'border-2 border-gray-300 text-gray-700 hover:border-indigo-600 hover:text-indigo-600'
                  }`}
                >
                  {tier.cta}
                </button>

                <div className="space-y-3 text-sm">
                  <p className="font-semibold text-gray-900 mb-4">Key Features:</p>
                  {idx === 0 && (
                    <>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>3 calculator uses/month</span>
                      </div>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>Basic features</span>
                      </div>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>Save 1 project</span>
                      </div>
                    </>
                  )}
                  {idx === 1 && (
                    <>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>Unlimited calculator uses</span>
                      </div>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>25 saved projects</span>
                      </div>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>PDF export & multi-currency</span>
                      </div>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>Advanced analysis modes</span>
                      </div>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>Email support</span>
                      </div>
                    </>
                  )}
                  {idx === 2 && (
                    <>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>Everything in Pro</span>
                      </div>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>Custom integrations</span>
                      </div>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>Full API access</span>
                      </div>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>24/7 dedicated support</span>
                      </div>
                      <div className="flex gap-2">
                        <span>✓</span>
                        <span>White-label options</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Feature Comparison</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="px-6 py-4 text-left font-bold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-900">FREE</th>
                  <th className="px-6 py-4 text-center font-bold text-indigo-600">PRO</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-900">ENTERPRISE</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr
                    key={idx}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{feature.name}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{feature.free}</td>
                    <td className="px-6 py-4 text-center text-indigo-600 font-semibold">
                      {feature.pro}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">{feature.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Pricing FAQ</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Can I upgrade from FREE to PRO anytime?
              </h3>
              <p className="text-gray-600">
                Yes! Upgrade instantly with just one click. Pro features activate immediately.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-gray-600">
                Your projects stay saved in your account. You'll just have limited access until you upgrade again.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Is there a long-term contract required?
              </h3>
              <p className="text-gray-600">
                No contracts. Cancel anytime, no questions asked. You have full control.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600">
                We offer a 14-day money-back guarantee. If you're not satisfied, we'll refund your payment in full.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                What's included in the ENTERPRISE plan?
              </h3>
              <p className="text-gray-600">
                Custom pricing based on your needs. Includes API access, custom integrations, white-label options, and 24/7 dedicated support. Contact our sales team for details.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">
                How do you count "calculator uses"?
              </h3>
              <p className="text-gray-600">
                Each time you run a calculation and view results counts as one use. The monthly limit resets on the first of each month. PRO members have unlimited uses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-lg mb-8 opacity-90">
            Begin with FREE. Upgrade to PRO when you're ready for more power.
          </p>
          <Link
            to="/calculators"
            className="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            → Start Free Now
          </Link>
          <p className="text-sm opacity-75 mt-4">
            No credit card required. 3 free calculations to start.
          </p>
        </div>
      </section>
    </div>
  );
}
