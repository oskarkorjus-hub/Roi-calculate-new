import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // In a real implementation, this would send to a backend
      // For now, we'll just simulate the submission
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Log the form data (in production, send to backend)
      console.log('Form submitted:', formData);

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
      });

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Get In Touch</h1>
          <p className="text-lg text-gray-600">
            Have questions? Want to learn more about ROI Calculate? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Contact Info */}
            <div className="md:col-span-1">
              <h2 className="text-2xl font-bold mb-8">Contact Information</h2>

              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <a
                    href="mailto:hello@investlandgroup.com"
                    className="text-indigo-600 hover:underline"
                  >
                    hello@investlandgroup.com
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    We respond within 24 hours
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-700">Bali, Indonesia</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Hours</h3>
                  <p className="text-gray-700">Monday - Friday</p>
                  <p className="text-gray-700">9:00 AM - 6:00 PM WIB</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    <a
                      href="https://twitter.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      𝕏
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      in
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      📷
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

              {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-semibold">
                    ✓ Thank you! We've received your message and will get back to you soon.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-semibold text-gray-900 mb-2">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    placeholder="Your company"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales / Pricing</option>
                    <option value="support">Technical Support</option>
                    <option value="enterprise">Enterprise Plans</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>

                <p className="text-sm text-gray-600">
                  We'll respond to your message within 24 business hours.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Quick Help</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              to="/faq"
              className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-600 transition-colors"
            >
              <div className="text-3xl mb-3">❓</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">FAQ</h3>
              <p className="text-sm text-gray-600">
                Find answers to common questions about ROI Calculate
              </p>
            </Link>

            <Link
              to="/pricing"
              className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-600 transition-colors"
            >
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Pricing</h3>
              <p className="text-sm text-gray-600">
                Explore our plans and pricing options
              </p>
            </Link>

            <Link
              to="/calculators"
              className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-600 transition-colors"
            >
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Calculators</h3>
              <p className="text-sm text-gray-600">
                Start using ROI Calculate for free
              </p>
            </Link>
          </div>
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
