import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌿</span>
              <span className="text-xl font-bold text-white">CBD Portal</span>
            </Link>
            <p className="text-sm text-gray-400">
              Evidence-based CBD information backed by peer-reviewed research.
            </p>
          </div>

          {/* Topics */}
          <div>
            <h3 className="font-semibold text-white mb-4">Topics</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/categories/conditions" className="hover:text-white">Health Conditions</Link></li>
              <li><Link href="/categories/products" className="hover:text-white">CBD Products</Link></li>
              <li><Link href="/categories/science" className="hover:text-white">CBD Science</Link></li>
              <li><Link href="/categories/guides" className="hover:text-white">Beginner Guides</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/research" className="hover:text-white">Research Database</Link></li>
              <li><Link href="/articles" className="hover:text-white">All Articles</Link></li>
              <li><Link href="/authors" className="hover:text-white">Our Authors</Link></li>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/categories" className="hover:text-white">Browse Topics</Link></li>
              <li><Link href="/tags" className="hover:text-white">Browse Tags</Link></li>
              <li><Link href="/glossary" className="hover:text-white">Glossary</Link></li>
              <li><Link href="/admin" className="hover:text-white text-gray-400">Admin</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/editorial-policy" className="hover:text-white">Editorial Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/medical-disclaimer" className="hover:text-white">Medical Disclaimer</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>

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