import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | CBD Portal',
  description: 'Learn how CBD Portal collects, uses, and protects your information.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 1, 2025';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

      <div className="prose prose-green max-w-none">
        <h2>Introduction</h2>
        <p>
          CBD Portal ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information when you visit our
          website cbd-portal.vercel.app (the "Site").
        </p>
        <p>
          Please read this Privacy Policy carefully. By accessing or using the Site, you acknowledge
          that you have read, understood, and agree to be bound by this Privacy Policy.
        </p>

        <h2>Information We Collect</h2>

        <h3>Information You Provide</h3>
        <p>We may collect information you voluntarily provide when you:</p>
        <ul>
          <li>Subscribe to our newsletter</li>
          <li>Submit comments on articles</li>
          <li>Contact us through forms or email</li>
        </ul>
        <p>This information may include:</p>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Any other information you choose to provide</li>
        </ul>

        <h3>Automatically Collected Information</h3>
        <p>
          When you visit our Site, we may automatically collect certain information about your device,
          including:
        </p>
        <ul>
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>IP address (anonymized)</li>
          <li>Pages visited and time spent</li>
          <li>Referring website</li>
          <li>Device type (mobile, desktop, tablet)</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Send newsletters and updates (with your consent)</li>
          <li>Respond to your inquiries and comments</li>
          <li>Improve our website and content</li>
          <li>Analyze usage patterns and trends</li>
          <li>Maintain the security of our Site</li>
          <li>Comply with legal obligations</li>
        </ul>

        <h2>Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar tracking technologies to enhance your experience on our Site.
          For detailed information, please see our <a href="/cookie-policy">Cookie Policy</a>.
        </p>

        <h2>Third-Party Services</h2>
        <p>We may use third-party services that collect information, including:</p>
        <ul>
          <li><strong>Analytics:</strong> We use analytics services to understand how visitors use our Site</li>
          <li><strong>Hosting:</strong> Our Site is hosted on Vercel</li>
          <li><strong>Database:</strong> We use Supabase for data storage</li>
        </ul>
        <p>
          These services have their own privacy policies governing the use of your information.
        </p>

        <h2>Data Retention</h2>
        <p>
          We retain your personal information only for as long as necessary to fulfill the purposes
          outlined in this Privacy Policy, unless a longer retention period is required by law.
        </p>

        <h2>Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal
          information against unauthorized access, alteration, disclosure, or destruction. However,
          no method of transmission over the Internet is 100% secure.
        </p>

        <h2>Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your information</li>
          <li>Withdraw consent for processing</li>
          <li>Object to certain processing activities</li>
          <li>Data portability</li>
        </ul>
        <p>
          To exercise these rights, please contact us at the address below.
        </p>

        <h2>Children's Privacy</h2>
        <p>
          Our Site is not intended for children under 18 years of age. We do not knowingly collect
          personal information from children.
        </p>

        <h2>International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your country
          of residence. These countries may have different data protection laws.
        </p>

        <h2>Changes to This Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by
          posting the new Privacy Policy on this page and updating the "Last updated" date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or our privacy practices, please contact us at:
        </p>
        <p>
          Email: privacy@cbdportal.com
        </p>
      </div>
    </div>
  );
}