import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Trust Stats Bar */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-white">4.000+</p>
              <p className="text-xs text-gray-400">Research Studies</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">39+</p>
              <p className="text-xs text-gray-400">Health Conditions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">250+</p>
              <p className="text-xs text-gray-400">Glossary Terms</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">7</p>
              <p className="text-xs text-gray-400">Research Sources</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌿</span>
              <span className="text-xl font-bold text-white">CBD Portal</span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Evidence-based CBD information backed by peer-reviewed research.
            </p>
            <p className="text-xs text-gray-500">
              Independent. Research-driven. Transparent.
            </p>
          </div>

          {/* Learn */}
          <div>
            <h3 className="font-semibold text-white mb-4">Learn</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/conditions" className="hover:text-white transition-colors">Health Conditions</Link></li>
              <li><Link href="/categories/cbd-basics" className="hover:text-white transition-colors">CBD Basics</Link></li>
              <li><Link href="/categories/science" className="hover:text-white transition-colors">CBD Science</Link></li>
              <li><Link href="/categories/guides" className="hover:text-white transition-colors">Beginner Guides</Link></li>
              <li><Link href="/glossary" className="hover:text-white transition-colors">Glossary</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-white mb-4">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tools/dosage-calculator" className="hover:text-white transition-colors">Dosage Calculator</Link></li>
              <li><Link href="/tools/interactions" className="hover:text-white transition-colors">Drug Interactions</Link></li>
              <li><Link href="/tools/cost-calculator" className="hover:text-white transition-colors">Cost Calculator</Link></li>
              <li><Link href="/tools/strength-calculator" className="hover:text-white transition-colors">Strength Calculator</Link></li>
              <li><Link href="/tools/animal-dosage-calculator" className="hover:text-white transition-colors">Pet Dosage</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/research" className="hover:text-white transition-colors">Research Database</Link></li>
              <li><Link href="/reviews" className="hover:text-white transition-colors">Brand Reviews</Link></li>
              <li><Link href="/articles" className="hover:text-white transition-colors">All Articles</Link></li>
              <li><Link href="/authors" className="hover:text-white transition-colors">Our Authors</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/admin" className="hover:text-white text-gray-500 transition-colors">Admin</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/editorial-policy" className="hover:text-white transition-colors">Editorial Policy</Link></li>
              <li><Link href="/reviews/methodology" className="hover:text-white transition-colors">Review Methodology</Link></li>
              <li><Link href="/medical-disclaimer" className="hover:text-white transition-colors">Medical Disclaimer</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} CBD Portal. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 max-w-xl text-center md:text-right">
              This website is for informational purposes only and does not provide medical advice.
              Always consult a healthcare professional before using CBD products.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}