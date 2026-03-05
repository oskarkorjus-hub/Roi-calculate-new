import { Link } from 'react-router-dom';

export function Terms() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-zinc-500">Last updated: March 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 lg:p-12 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-zinc-400 leading-relaxed">
                By accessing and using ROI Calculate (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">2. Description of Service</h2>
              <p className="text-zinc-400 leading-relaxed">
                ROI Calculate provides financial analysis tools for property investment calculations, including but not limited to XIRR, ROI, cash flow projections, and related metrics. The Service is provided for informational purposes only.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">3. Disclaimer of Professional Advice</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">
                <strong className="text-amber-400">IMPORTANT:</strong> The calculations and projections provided by ROI Calculate are for informational purposes only and should NOT be considered financial, investment, tax, or legal advice.
              </p>
              <p className="text-zinc-400 leading-relaxed">
                Investment returns are not guaranteed. Past performance does not indicate future results. Always consult with a qualified financial advisor, tax professional, or attorney before making investment decisions.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">4. User Accounts</h2>
              <p className="text-zinc-400 leading-relaxed">
                You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">5. Acceptable Use</h2>
              <p className="text-zinc-400 leading-relaxed mb-4">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Harass, abuse, or harm any person or entity</li>
                <li>Attempt to gain unauthorized access to the Service or its systems</li>
                <li>Transmit viruses, malware, or any code of destructive nature</li>
                <li>Reverse engineer, decompile, or attempt to derive source code</li>
                <li>Violate any applicable laws or regulations</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">6. Intellectual Property Rights</h2>
              <p className="text-zinc-400 leading-relaxed">
                All content, features, and functionality of the Service (including but not limited to software, design, and calculators) are owned by Investland Group, its licensors, or other providers of such material and are protected by copyright and other intellectual property laws.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">7. User-Generated Content</h2>
              <p className="text-zinc-400 leading-relaxed">
                You retain all rights to any content you submit to the Service. By submitting content, you grant Investland Group a non-exclusive license to use that content for operational and improvement purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">8. Limitation of Liability</h2>
              <p className="text-zinc-400 leading-relaxed">
                <strong className="text-zinc-300">TO THE FULLEST EXTENT PERMITTED BY LAW:</strong> In no event shall Investland Group, its affiliates, or their respective officers, directors, or employees be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, arising out of or relating to this Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">9. Accuracy of Information</h2>
              <p className="text-zinc-400 leading-relaxed">
                While we strive for accuracy, we make no warranty or representation regarding the accuracy, completeness, or timeliness of the calculations provided. The accuracy of your results depends on the accuracy of your input data.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">10. Changes to Terms</h2>
              <p className="text-zinc-400 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective when posted to the Service. Your continued use of the Service following the posting of revised Terms means you accept those changes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">11. Termination</h2>
              <p className="text-zinc-400 leading-relaxed">
                We reserve the right to suspend or terminate your account or access to the Service at any time, for any reason, including violation of these Terms, without liability or refund.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">12. Governing Law</h2>
              <p className="text-zinc-400 leading-relaxed">
                These Terms of Service and your use of the Service shall be governed by and construed in accordance with the laws of Indonesia, without regard to its conflict of law provisions.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white mb-4">13. Contact Us</h2>
              <p className="text-zinc-400 leading-relaxed">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-zinc-400 mt-4">
                <span className="text-white font-medium">Investland Group</span><br />
                Email: <a href="mailto:reports@investlandgroup.com" className="text-emerald-400 hover:text-emerald-300 transition-colors">reports@investlandgroup.com</a><br />
                Location: Bali, Indonesia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Ready to Get Started?</h2>
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
