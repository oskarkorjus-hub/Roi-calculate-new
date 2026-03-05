import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-zinc-500">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 lg:p-12 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">1. Overview</h2>
              <p className="text-zinc-400 leading-relaxed">
                Investland Group ("we," "us," or "our") operates the ROI Calculate website and application (the "Service"). This Privacy Policy explains how we collect, use, disclose, and otherwise handle your personal information when you use our Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">2. Information We Collect</h2>
              <h3 className="text-lg font-semibold text-zinc-300 mt-4 mb-3">Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                <li>Account information: name, email address, password</li>
                <li>Profile information: company, location, investment experience</li>
                <li>Calculation data: property details, financial figures, cash flows</li>
                <li>Communication: messages, support requests, feedback</li>
              </ul>

              <h3 className="text-lg font-semibold text-zinc-300 mt-6 mb-3">Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                <li>Usage data: pages visited, features used, time spent, interactions</li>
                <li>Device information: browser type, operating system, device type</li>
                <li>IP address and location information</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">3. How We Use Your Information</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">We use collected information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                <li>Provide, maintain, and improve the Service</li>
                <li>Authenticate your account and prevent fraud</li>
                <li>Send transactional communications (account updates, billing)</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Send marketing communications (if you opt in)</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">4. Data Security</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                <li>256-bit SSL/TLS encryption for data in transit</li>
                <li>Encrypted storage for sensitive data at rest</li>
                <li>Regular security audits and penetration testing</li>
                <li>Secure authentication protocols</li>
                <li>Limited access to personal information by authorized personnel</li>
              </ul>
              <p className="text-zinc-400 leading-relaxed mt-4">
                While we implement security measures, no system is 100% secure. We cannot guarantee absolute security of your information.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">5. Data Retention</h2>
              <p className="text-zinc-400 leading-relaxed">
                We retain your personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy. You can request deletion of your data anytime, and we will delete it within 30 days, except where retention is required by law.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">6. Data Sharing</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                <strong className="text-emerald-400">We do not sell, trade, or rent your personal information to third parties.</strong> We may share information only in these cases:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                <li>Service providers who assist in operating the Service (with confidentiality agreements)</li>
                <li>Legal authorities, if required by law or court order</li>
                <li>To prevent fraud, harm, or illegal activity</li>
                <li>With your explicit consent for specific purposes</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">7. Your Rights</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">Depending on your location, you may have rights including:</p>
              <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                <li><strong className="text-zinc-300">Access:</strong> Request what personal data we hold about you</li>
                <li><strong className="text-zinc-300">Correction:</strong> Request correction of inaccurate data</li>
                <li><strong className="text-zinc-300">Deletion:</strong> Request deletion of your data (Right to be Forgotten)</li>
                <li><strong className="text-zinc-300">Portability:</strong> Request your data in a portable format</li>
                <li><strong className="text-zinc-300">Opt-Out:</strong> Opt out of marketing communications anytime</li>
              </ul>
              <p className="text-zinc-400 leading-relaxed mt-4">
                To exercise these rights, contact us at <a href="mailto:reports@investlandgroup.com" className="text-emerald-400 hover:text-emerald-300 transition-colors">reports@investlandgroup.com</a> with "Privacy Request" in the subject line.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">8. GDPR Compliance</h2>
              <p className="text-zinc-400 leading-relaxed">
                If you are located in the European Union, your data is processed in compliance with GDPR regulations. We have a legal basis for processing your data (e.g., contract performance, legitimate interests, consent). You have the right to lodge a complaint with your local data protection authority.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">9. Cookies and Tracking</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                <li><strong className="text-zinc-300">Essential cookies:</strong> Required for Service functionality</li>
                <li><strong className="text-zinc-300">Performance cookies:</strong> Track usage to improve the Service</li>
                <li><strong className="text-zinc-300">Marketing cookies:</strong> Track marketing effectiveness (opt-in)</li>
              </ul>
              <p className="text-zinc-400 leading-relaxed mt-4">
                You can control cookies through your browser settings. Disabling cookies may affect Service functionality.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">10. Third-Party Links</h2>
              <p className="text-zinc-400 leading-relaxed">
                The Service may contain links to external websites. We are not responsible for the privacy practices of third-party sites. We encourage you to review their privacy policies before providing personal information.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">11. Children's Privacy</h2>
              <p className="text-zinc-400 leading-relaxed">
                The Service is not intended for children under 13 years old. We do not knowingly collect personal information from children. If we become aware of such collection, we will delete the information and terminate the child's account.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-zinc-400 leading-relaxed">
                We may update this Privacy Policy at any time. Changes are effective when posted. Your continued use of the Service following changes constitutes your acceptance of the updated Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">13. Contact Us</h2>
              <p className="text-zinc-400 leading-relaxed">
                If you have questions about this Privacy Policy or our privacy practices, contact us at:
              </p>
              <p className="text-zinc-400 mt-4">
                <span className="text-white font-medium">Investland Group</span><br />
                Email: <a href="mailto:reports@investlandgroup.com" className="text-emerald-400 hover:text-emerald-300 transition-colors">reports@investlandgroup.com</a><br />
                Location: Bali, Indonesia
              </p>
              <p className="text-zinc-400 mt-4">
                We will respond to privacy inquiries within 14 days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg className="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h2 className="text-2xl font-bold text-white">Your Data is Safe With Us</h2>
          </div>
          <p className="text-zinc-400 mb-6">
            We're committed to protecting your privacy. Start using ROI Calculate with confidence.
          </p>
          <Link
            to="/calculators"
            className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all"
          >
            Start Calculating
          </Link>
        </div>
      </section>
    </div>
  );
}
