import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | CBD Portal',
  description: 'Get in touch with the CBD Portal team.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <p className="text-xl text-gray-600 mb-12">
        We'd love to hear from you. Reach out with questions, feedback, or collaboration inquiries.
      </p>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact options */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>

          <div className="space-y-6">
            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-2">📧 General Inquiries</h3>
              <p className="text-gray-600 text-sm mb-2">
                Questions about CBD, our content, or general feedback
              </p>
              <a href="mailto:info@cbdportal.com" className="text-green-600 hover:underline">
                info@cbdportal.com
              </a>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-2">✏️ Editorial & Corrections</h3>
              <p className="text-gray-600 text-sm mb-2">
                Report errors, suggest corrections, or editorial inquiries
              </p>
              <a href="mailto:editorial@cbdportal.com" className="text-green-600 hover:underline">
                editorial@cbdportal.com
              </a>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-2">🤝 Partnerships</h3>
              <p className="text-gray-600 text-sm mb-2">
                Collaboration, guest posting, or business inquiries
              </p>
              <a href="mailto:partnerships@cbdportal.com" className="text-green-600 hover:underline">
                partnerships@cbdportal.com
              </a>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-semibold mb-2">🔒 Privacy</h3>
              <p className="text-gray-600 text-sm mb-2">
                Data requests or privacy-related concerns
              </p>
              <a href="mailto:privacy@cbdportal.com" className="text-green-600 hover:underline">
                privacy@cbdportal.com
              </a>
            </div>
          </div>
        </div>

        {/* Response times and notes */}
        <div>
          <h2 className="text-2xl font-bold mb-6">What to Expect</h2>

          <div className="bg-green-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-3">⏱️ Response Times</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• General inquiries: 2-3 business days</li>
              <li>• Editorial corrections: 1-2 business days</li>
              <li>• Partnership inquiries: 5-7 business days</li>
              <li>• Privacy requests: Within 30 days (as required by law)</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-3">📝 Before You Write</h3>
            <p className="text-sm text-gray-600 mb-3">
              For faster responses, please include:
            </p>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Specific article URL (if relevant)</li>
              <li>• Clear description of your question/issue</li>
              <li>• Any supporting information or sources</li>
            </ul>
          </div>

          <div className="bg-gray-100 rounded-xl p-6">
            <h3 className="font-semibold mb-3">🚫 Please Note</h3>
            <p className="text-sm text-gray-600">
              We cannot provide personalized medical advice. Please consult a healthcare
              professional for questions about your specific health situation or CBD use.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">Can I write for CBD Portal?</summary>
            <p className="mt-3 text-gray-600 text-sm">
              We welcome contributions from qualified CBD and healthcare professionals.
              Please email partnerships@cbdportal.com with your credentials and article ideas.
            </p>
          </details>

          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">I found an error in an article. How do I report it?</summary>
            <p className="mt-3 text-gray-600 text-sm">
              Please email editorial@cbdportal.com with the article URL, the error you found,
              and if possible, a source for the correct information. We take corrections seriously
              and will respond within 1-2 business days.
            </p>
          </details>

          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">Do you accept sponsored content?</summary>
            <p className="mt-3 text-gray-600 text-sm">
              We rarely accept sponsored content and when we do, it is clearly labeled.
              Our editorial content is never influenced by advertisers or sponsors.
              Contact partnerships@cbdportal.com for our advertising policy.
            </p>
          </details>

          <details className="bg-gray-50 rounded-lg p-4">
            <summary className="font-semibold cursor-pointer">Can you recommend specific CBD products?</summary>
            <p className="mt-3 text-gray-600 text-sm">
              We provide general guidance on what to look for in CBD products, but we don't
              make specific product recommendations. See our buying guides for tips on
              evaluating product quality.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}