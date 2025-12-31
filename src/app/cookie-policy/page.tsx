import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | CBD Portal',
  description: 'Information about how CBD Portal uses cookies.',
  alternates: {
    canonical: '/cookie-policy',
  },
};

export default function CookiePolicyPage() {
  const lastUpdated = 'January 1, 2025';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

      <div className="prose prose-green max-w-none">
        <h2>What Are Cookies?</h2>
        <p>
          Cookies are small text files that are placed on your computer or mobile device when you
          visit a website. They are widely used to make websites work more efficiently and provide
          information to website owners.
        </p>

        <h2>How We Use Cookies</h2>
        <p>CBD Portal uses cookies for the following purposes:</p>

        <h3>Essential Cookies</h3>
        <p>
          These cookies are necessary for the website to function properly. They enable core
          functionality such as security, network management, and accessibility.
        </p>
        <table className="w-full border-collapse border border-gray-300 my-4">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">Cookie</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">session</td>
              <td className="border border-gray-300 px-4 py-2">Maintains user session state</td>
              <td className="border border-gray-300 px-4 py-2">Session</td>
            </tr>
          </tbody>
        </table>

        <h3>Analytics Cookies</h3>
        <p>
          These cookies help us understand how visitors interact with our website by collecting
          and reporting information anonymously.
        </p>
        <table className="w-full border-collapse border border-gray-300 my-4">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">Cookie</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">_ga</td>
              <td className="border border-gray-300 px-4 py-2">Google Analytics - distinguishes users</td>
              <td className="border border-gray-300 px-4 py-2">2 years</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">_gid</td>
              <td className="border border-gray-300 px-4 py-2">Google Analytics - distinguishes users</td>
              <td className="border border-gray-300 px-4 py-2">24 hours</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">_gat</td>
              <td className="border border-gray-300 px-4 py-2">Google Analytics - throttle request rate</td>
              <td className="border border-gray-300 px-4 py-2">1 minute</td>
            </tr>
          </tbody>
        </table>

        <h3>Preference Cookies</h3>
        <p>
          These cookies remember your preferences and settings to enhance your experience.
        </p>
        <table className="w-full border-collapse border border-gray-300 my-4">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 px-4 py-2 text-left">Cookie</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">language</td>
              <td className="border border-gray-300 px-4 py-2">Remembers your language preference</td>
              <td className="border border-gray-300 px-4 py-2">1 year</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">cookie_consent</td>
              <td className="border border-gray-300 px-4 py-2">Stores your cookie consent preferences</td>
              <td className="border border-gray-300 px-4 py-2">1 year</td>
            </tr>
          </tbody>
        </table>

        <h2>Third-Party Cookies</h2>
        <p>
          Some cookies are placed by third-party services that appear on our pages. We do not
          control these cookies. Third parties that may set cookies include:
        </p>
        <ul>
          <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
          <li><strong>Vercel:</strong> Our hosting provider may set performance-related cookies</li>
        </ul>

        <h2>Managing Cookies</h2>
        <p>
          Most web browsers allow you to control cookies through their settings. You can:
        </p>
        <ul>
          <li>View what cookies are stored on your device</li>
          <li>Delete all or specific cookies</li>
          <li>Block all cookies</li>
          <li>Block third-party cookies</li>
          <li>Accept all cookies</li>
          <li>Receive a warning before a cookie is stored</li>
        </ul>

        <h3>Browser-Specific Instructions</h3>
        <ul>
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">Mozilla Firefox</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">Safari</a></li>
          <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">Microsoft Edge</a></li>
        </ul>

        <h2>Impact of Disabling Cookies</h2>
        <p>
          If you disable cookies, some features of our website may not function properly.
          Essential cookies cannot be disabled as they are necessary for the site to work.
        </p>

        <h2>Do Not Track</h2>
        <p>
          Some browsers have a "Do Not Track" feature that signals to websites that you do not
          want to have your online activity tracked. Our Site currently does not respond to
          "Do Not Track" signals.
        </p>

        <h2>Updates to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. Any changes will be posted on this
          page with an updated revision date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about our use of cookies, please contact us at:
        </p>
        <p>
          Email: privacy@cbdportal.com
        </p>
      </div>
    </div>
  );
}