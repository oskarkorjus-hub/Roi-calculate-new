import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Pricing() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');

  const features = [
    { name: 'Calculator Uses', free: '3/month', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Saved Projects', free: '1', pro: '25', enterprise: 'Unlimited' },
    { name: 'PDF Export', free: false, pro: true, enterprise: true },
    { name: 'Advanced Modes', free: false, pro: true, enterprise: true },
    { name: 'Multi-Currency', free: false, pro: true, enterprise: true },
    { name: 'Historical Comparisons', free: false, pro: true, enterprise: true },
    { name: 'Data Analytics', free: false, pro: false, enterprise: true },
    { name: 'API Access', free: false, pro: false, enterprise: true },
    { name: 'Custom Integrations', free: false, pro: false, enterprise: true },
    { name: 'Dedicated Support', free: 'Community', pro: 'Email', enterprise: '24/7 Priority' },
    { name: 'White Label', free: false, pro: false, enterprise: true },
  ];

  const tiers = [
    {
      name: 'Free',
      monthlyPrice: 0,
      annualPrice: 0,
      description: 'Perfect for testing the platform',
      cta: 'Get Started',
      highlight: false,
      features: [
        '3 calculations per month',
        'All 8 calculators',
        'Save 1 project',
        'Community support',
      ],
    },
    {
      name: 'Pro',
      monthlyPrice: 9,
      annualPrice: 99,
      description: 'For serious property investors',
      cta: 'Start 7-Day Free Trial',
      highlight: true,
      features: [
        'Unlimited calculations',
        '25 saved projects',
        'PDF export',
        'Multi-currency support',
        'Advanced analysis modes',
        'Scenario comparison',
        'Email support',
      ],
    },
    {
      name: 'Enterprise',
      monthlyPrice: null,
      annualPrice: null,
      description: 'For teams and portfolio managers',
      cta: 'Contact Sales',
      highlight: false,
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'API access',
        'Custom integrations',
        'White-label option',
        '24/7 priority support',
        'Dedicated account manager',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      {/* Header */}
      <section className="pt-8 pb-12 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
          >
            Simple, Transparent Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-400 mb-8"
          >
            Choose the plan that matches your investment needs. No hidden fees.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl"
          >
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                billingPeriod === 'annual'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Annual
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                Save 8%
              </span>
            </button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {tiers.map((tier, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.1 }}
                className={`relative rounded-2xl p-8 transition-all ${
                  tier.highlight
                    ? 'bg-gradient-to-b from-emerald-500/10 to-cyan-500/5 border-2 border-emerald-500/50'
                    : 'bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{tier.name}</h3>
                  <p className="text-sm text-zinc-500">{tier.description}</p>
                </div>

                <div className="mb-6">
                  {tier.monthlyPrice !== null ? (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">
                          ${billingPeriod === 'monthly' ? tier.monthlyPrice : Math.floor(tier.annualPrice! / 12)}
                        </span>
                        <span className="text-zinc-500">/month</span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-1">
                        {billingPeriod === 'annual' && tier.annualPrice! > 0
                          ? `$${tier.annualPrice} billed annually`
                          : billingPeriod === 'monthly' && tier.monthlyPrice > 0
                          ? 'Billed monthly'
                          : 'Free forever'}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold text-white">Custom</span>
                      <p className="text-xs text-zinc-600 mt-1">Tailored for your needs</p>
                    </div>
                  )}
                </div>

                <Link
                  to={tier.name === 'Enterprise' ? '/contact' : '/calculators'}
                  className={`block w-full py-3 text-center font-semibold rounded-xl transition-all ${
                    tier.highlight
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600'
                      : 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700'
                  }`}
                >
                  {tier.cta}
                </Link>

                <div className="mt-8 space-y-3">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${tier.highlight ? 'text-emerald-400' : 'text-zinc-500'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-zinc-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white text-center mb-8"
          >
            Feature Comparison
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-x-auto rounded-xl border border-zinc-800"
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-6 py-4 text-left font-semibold text-zinc-400">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-zinc-400">Free</th>
                  <th className="px-6 py-4 text-center font-semibold text-emerald-400">Pro</th>
                  <th className="px-6 py-4 text-center font-semibold text-zinc-400">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-zinc-800/50 ${idx % 2 === 0 ? 'bg-zinc-900/30' : ''}`}
                  >
                    <td className="px-6 py-4 text-zinc-300">{feature.name}</td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? (
                          <span className="text-emerald-400">✓</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )
                      ) : (
                        <span className="text-zinc-400">{feature.free}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.pro === 'boolean' ? (
                        feature.pro ? (
                          <span className="text-emerald-400">✓</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )
                      ) : (
                        <span className="text-emerald-400 font-medium">{feature.pro}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {typeof feature.enterprise === 'boolean' ? (
                        feature.enterprise ? (
                          <span className="text-emerald-400">✓</span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )
                      ) : (
                        <span className="text-zinc-400">{feature.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white text-center mb-8"
          >
            Pricing FAQ
          </motion.h2>

          <div className="space-y-4">
            {[
              {
                q: 'Can I upgrade from Free to Pro anytime?',
                a: 'Yes! Upgrade instantly with one click. Pro features activate immediately and you only pay for the remaining billing period.',
              },
              {
                q: 'What happens to my data if I downgrade?',
                a: "Your projects stay saved in your account. You'll just have limited access until you upgrade again. We never delete your data.",
              },
              {
                q: 'Is there a long-term contract required?',
                a: 'No contracts. Cancel anytime with one click, no questions asked. You have full control over your subscription.',
              },
              {
                q: 'Do you offer refunds?',
                a: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied for any reason, we'll refund your payment in full.",
              },
              {
                q: 'How do you count "calculator uses"?',
                a: 'Each time you run a calculation and view results counts as one use. The monthly limit resets on the first of each month. Pro members have unlimited uses.',
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-xl"
              >
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantee Section */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl"
          >
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">30-Day Money-Back Guarantee</h3>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Try ROI Calculate risk-free. If you're not completely satisfied with your Pro subscription,
              we'll refund every penny. No questions asked.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 lg:px-8 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white mb-4"
          >
            Ready to Make Smarter Investment Decisions?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 mb-8"
          >
            Start with Free. Upgrade to Pro when you're ready for unlimited power.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/calculators"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all"
            >
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="text-sm text-zinc-600 mt-4">
              No credit card required • 3 free calculations
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
