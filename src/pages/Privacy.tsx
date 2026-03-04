import { Link } from 'react-router-dom';

export function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: March 2024</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Overview</h2>
          <p>
            Investland Group ("we," "us," or "our") operates the ROI Calculate website and application (the "Service"). This Privacy Policy explains how we collect, use, disclose, and otherwise handle your personal information when you use our Service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-semibold mt-6 mb-3">Information You Provide</h3>
          <ul className="list-disc pl-6 my-4">
            <li>Account information: name, email address, password</li>
            <li>Profile information: company, location, investment experience</li>
            <li>Calculation data: property details, financial figures, cash flows</li>
            <li>Communication: messages, support requests, feedback</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-3">Information Collected Automatically</h3>
          <ul className="list-disc pl-6 my-4">
            <li>Usage data: pages visited, features used, time spent, interactions</li>
            <li>Device information: browser type, operating system, device type</li>
            <li>IP address and location information</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
          <p>We use collected information to:</p>
          <ul className="list-disc pl-6 my-4">
            <li>Provide, maintain, and improve the Service</li>
            <li>Authenticate your account and prevent fraud</li>
            <li>Send transactional communications (account updates, billing)</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Send marketing communications (if you opt in)</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>256-bit SSL/TLS encryption for data in transit</li>
            <li>Encrypted storage for sensitive data at rest</li>
            <li>Regular security audits and penetration testing</li>
            <li>Secure authentication protocols</li>
            <li>Limited access to personal information by authorized personnel</li>
          </ul>
          <p>
            While we implement security measures, no system is 100% secure. We cannot guarantee absolute security of your information.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy. You can request deletion of your data anytime, and we will delete it within 30 days, except where retention is required by law.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Data Sharing</h2>
          <p>
            <strong>We do not sell, trade, or rent your personal information to third parties.</strong> We may share information only in these cases:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li>Service providers who assist in operating the Service (with confidentiality agreements)</li>
            <li>Legal authorities, if required by law or court order</li>
            <li>To prevent fraud, harm, or illegal activity</li>
            <li>With your explicit consent for specific purposes</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. Your Rights</h2>
          <p>Depending on your location, you may have rights including:</p>
          <ul className="list-disc pl-6 my-4">
            <li><strong>Access:</strong> Request what personal data we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
            <li><strong>Deletion:</strong> Request deletion of your data (Right to be Forgotten)</li>
            <li><strong>Portability:</strong> Request your data in a portable format</li>
            <li><strong>Opt-Out:</strong> Opt out of marketing communications anytime</li>
          </ul>
          <p>
            To exercise these rights, contact us at hello@investlandgroup.com with "Privacy Request" in the subject line.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. GDPR Compliance</h2>
          <p>
            If you are located in the European Union, your data is processed in compliance with GDPR regulations. We have a legal basis for processing your data (e.g., contract performance, legitimate interests, consent). You have the right to lodge a complaint with your local data protection authority.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">9. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to enhance your experience:
          </p>
          <ul className="list-disc pl-6 my-4">
            <li><strong>Essential cookies:</strong> Required for Service functionality</li>
            <li><strong>Performance cookies:</strong> Track usage to improve the Service</li>
            <li><strong>Marketing cookies:</strong> Track marketing effectiveness (opt-in)</li>
          </ul>
          <p>
            You can control cookies through your browser settings. Disabling cookies may affect Service functionality.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">10. Third-Party Links</h2>
          <p>
            The Service may contain links to external websites. We are not responsible for the privacy practices of third-party sites. We encourage you to review their privacy policies before providing personal information.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">11. Children's Privacy</h2>
          <p>
            The Service is not intended for children under 13 years old. We do not knowingly collect personal information from children. If we become aware of such collection, we will delete the information and terminate the child's account.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">12. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy at any time. Changes are effective when posted. Your continued use of the Service following changes constitutes your acceptance of the updated Privacy Policy.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">13. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our privacy practices, contact us at:
          </p>
          <p>
            Investland Group<br />
            Email: hello@investlandgroup.com<br />
            Location: Bali, Indonesia
          </p>
          <p>
            We will respond to privacy inquiries within 14 days.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Your Data is Safe With Us</h2>
          <p className="text-gray-600 mb-6">
            We're committed to protecting your privacy. Start using ROI Calculate with confidence.
          </p>
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
