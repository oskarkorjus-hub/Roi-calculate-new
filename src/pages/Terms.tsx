import { Link } from 'react-router-dom';

export function Terms() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: March 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using ROI Calculate (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Description of Service</h2>
          <p>
            ROI Calculate provides financial analysis tools for property investment calculations, including but not limited to XIRR, ROI, cash flow projections, and related metrics. The Service is provided for informational purposes only.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Disclaimer of Professional Advice</h2>
          <p>
            <strong>IMPORTANT:</strong> The calculations and projections provided by ROI Calculate are for informational purposes only and should NOT be considered financial, investment, tax, or legal advice. 
          </p>
          <p>
            Investment returns are not guaranteed. Past performance does not indicate future results. Always consult with a qualified financial advisor, tax professional, or attorney before making investment decisions.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. User Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Harass, abuse, or harm any person or entity</li>
            <li>Attempt to gain unauthorized access to the Service or its systems</li>
            <li>Transmit viruses, malware, or any code of destructive nature</li>
            <li>Reverse engineer, decompile, or attempt to derive source code</li>
            <li>Violate any applicable laws or regulations</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Intellectual Property Rights</h2>
          <p>
            All content, features, and functionality of the Service (including but not limited to software, design, and calculators) are owned by Investland Group, its licensors, or other providers of such material and are protected by copyright and other intellectual property laws.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. User-Generated Content</h2>
          <p>
            You retain all rights to any content you submit to the Service. By submitting content, you grant Investland Group a non-exclusive license to use that content for operational and improvement purposes.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. Limitation of Liability</h2>
          <p>
            <strong>TO THE FULLEST EXTENT PERMITTED BY LAW:</strong> In no event shall Investland Group, its affiliates, or their respective officers, directors, or employees be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, arising out of or relating to this Service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. Accuracy of Information</h2>
          <p>
            While we strive for accuracy, we make no warranty or representation regarding the accuracy, completeness, or timeliness of the calculations provided. The accuracy of your results depends on the accuracy of your input data.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">10. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. Changes will be effective when posted to the Service. Your continued use of the Service following the posting of revised Terms means you accept those changes.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">11. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your account or access to the Service at any time, for any reason, including violation of these Terms, without liability or refund.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">12. Governing Law</h2>
          <p>
            These Terms of Service and your use of the Service shall be governed by and construed in accordance with the laws of Indonesia, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">13. Contact Us</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at:
          </p>
          <p>
            Investland Group<br />
            Email: hello@investlandgroup.com<br />
            Location: Bali, Indonesia
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <Link
            to="/calculators"
            className="inline-block px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            → Start Calculating
          </Link>
        </div>
      </section>
    </div>
  );
}
