import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          company: '',
          subject: '',
          message: '',
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError('Failed to send message. Please try again or email us directly.');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to send message. Please try again or email us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      {/* Header */}
      <section className="pt-12 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4"
          >
            Get In Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-400"
          >
            Have questions? Want to learn more about ROI Calculate? We'd love to hear from you.
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-1"
            >
              <h2 className="text-xl font-bold text-white mb-8">Contact Information</h2>

              <div className="space-y-8">
                <div>
                  <h3 className="font-semibold text-zinc-300 mb-2">Email</h3>
                  <a
                    href="mailto:hello@investlandgroup.com"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    hello@investlandgroup.com
                  </a>
                  <p className="text-sm text-zinc-500 mt-1">
                    We respond within 24 hours
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-zinc-300 mb-2">Location</h3>
                  <p className="text-zinc-400">Bali, Indonesia</p>
                </div>

                <div>
                  <h3 className="font-semibold text-zinc-300 mb-2">Hours</h3>
                  <p className="text-zinc-400">Monday - Friday</p>
                  <p className="text-zinc-400">9:00 AM - 6:00 PM WIB</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2"
            >
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl font-bold text-white mb-6">Send Us a Message</h2>

                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
                  >
                    <p className="text-emerald-400 font-semibold">
                      ✓ Thank you! We've received your message and will get back to you soon.
                    </p>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                  >
                    <p className="text-red-400 font-semibold">{error}</p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all [&:-webkit-autofill]:bg-zinc-800 [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#27272a_inset]"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-zinc-400 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all [&:-webkit-autofill]:bg-zinc-800 [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#27272a_inset]"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-zinc-400 mb-2">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all [&:-webkit-autofill]:bg-zinc-800 [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#27272a_inset]"
                        placeholder="Your company"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-zinc-400 mb-2">
                        Subject *
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      >
                        <option value="" className="bg-zinc-800">Select a subject</option>
                        <option value="general" className="bg-zinc-800">General Inquiry</option>
                        <option value="sales" className="bg-zinc-800">Sales / Pricing</option>
                        <option value="support" className="bg-zinc-800">Technical Support</option>
                        <option value="enterprise" className="bg-zinc-800">Enterprise Plans</option>
                        <option value="feedback" className="bg-zinc-800">Feedback</option>
                        <option value="partnership" className="bg-zinc-800">Partnership</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-zinc-400 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-6 py-3 min-h-[44px] bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>

                  <p className="text-sm text-zinc-500 text-center">
                    We'll respond to your message within 24 business hours.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-zinc-800">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl font-bold text-white mb-4"
          >
            Ready to Start Calculating?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 mb-8"
          >
            Get started with 3 free calculator uses. No credit card required.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 min-h-[44px] sm:py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-cyan-600 transition-all text-sm sm:text-base"
            >
              Start Free Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
