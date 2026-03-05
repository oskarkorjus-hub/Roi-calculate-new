import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', path: '/features' },
      { label: 'Calculators', path: '/calculators' },
      { label: 'Pricing', path: '/pricing' },
    ],
    company: [
      { label: 'About', path: '/contact' },
      { label: 'Contact', path: '/contact' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Privacy Policy', path: '/privacy' },
    ],
  };


  return (
    <footer className="bg-[#0a0a0a] border-t border-zinc-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <img
                src="/logo.png"
                alt="ROI Calculate"
                className="h-10 w-auto"
              />
              <span className="font-bold text-lg text-white">ROI Calculate</span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Professional property investment analysis tools. Calculate ROI, rental yields, and cash flow projections with institutional-grade accuracy.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Stay Updated
            </h4>
            <p className="text-sm text-zinc-500 mb-4">
              Get investment tips and product updates.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition-all"
              >
                Join
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-zinc-800">
              <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:hello@investlandgroup.com" className="hover:text-emerald-400 transition-colors">
                  hello@investlandgroup.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Bali, Indonesia</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-600">
              © {currentYear} ROI Calculate. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-zinc-600">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                256-bit SSL Encrypted
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                GDPR Compliant
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <p className="text-xs text-zinc-600 text-center leading-relaxed">
            <strong className="text-zinc-500">Disclaimer:</strong> The calculations and projections provided are for informational purposes only and should not be considered financial advice.
            Investment returns are not guaranteed. Always consult with a qualified financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
