import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1f2e] text-slate-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.png"
                alt="ROI Calculate Logo"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h3 className="text-white font-bold text-lg">ROI Calculate</h3>
                <p className="text-xs text-white">Property Investment Tools</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Analyze property investments with comprehensive XIRR calculations and 10-year cash flow projections for informed investment decisions.
            </p>
          </div>

          {/* Product Section */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/calculators"
                  className="text-sm hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Calculators
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Section */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/contact"
                  className="text-sm hover:text-indigo-400 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm hover:text-indigo-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm hover:text-indigo-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <span>✉️</span>
                <a href="mailto:hello@investlandgroup.com" className="hover:text-indigo-400 transition-colors">
                  hello@investlandgroup.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span>📍</span>
                <span>Bali, Indonesia</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-6">
          <p className="text-sm text-slate-400 text-center">
            © {currentYear} ROI Calculate by Investland Group. All rights reserved.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-[#141821]">
        <div className="max-w-7xl mx-auto px-4 md:px-10 lg:px-20 py-4">
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            <strong className="text-slate-400">Disclaimer:</strong> The calculations and projections provided by ROI Calculate tools are for informational purposes only and should not be considered as financial advice.
            Investment returns are not guaranteed and past performance does not indicate future results. Always consult with a qualified financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
