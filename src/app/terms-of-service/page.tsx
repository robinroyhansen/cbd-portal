import { Metadata } from 'next';
import { getHreflangAlternates } from '@/components/HreflangTags';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Terms of Service | CBD Portal',
    description: 'Terms and conditions for using CBD Portal.',
    alternates: getHreflangAlternates('/terms-of-service'),
  };
}

export default function TermsOfServicePage() {
  const lastUpdated = 'January 1, 2025';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

      <div className="prose prose-green max-w-none">
        <h2>Agreement to Terms</h2>
        <p>
          By accessing or using CBD Portal (the "Site"), you agree to be bound by these Terms of
          Service ("Terms"). If you disagree with any part of these Terms, you may not access the Site.
        </p>

        <h2>Description of Service</h2>
        <p>
          CBD Portal provides educational information about cannabidiol (CBD) and related topics.
          Our content is for informational purposes only and is not intended to be a substitute for
          professional medical advice, diagnosis, or treatment.
        </p>

        <h2>Medical Disclaimer</h2>
        <p>
          <strong>IMPORTANT:</strong> The information provided on this Site is not medical advice.
          Always seek the advice of a qualified healthcare provider with any questions you may have
          regarding a medical condition. Never disregard professional medical advice or delay in
          seeking it because of something you have read on this Site.
        </p>
        <p>
          For our complete medical disclaimer, please visit our{' '}
          <a href="/medical-disclaimer">Medical Disclaimer</a> page.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          The Site and its original content, features, and functionality are owned by CBD Portal
          and are protected by international copyright, trademark, and other intellectual property laws.
        </p>
        <p>You may not:</p>
        <ul>
          <li>Copy, modify, or distribute our content without permission</li>
          <li>Use our content for commercial purposes without authorization</li>
          <li>Remove any copyright or proprietary notices</li>
          <li>Transfer the content to another person or "mirror" it on any other server</li>
        </ul>

        <h2>User Contributions</h2>
        <p>
          If you submit comments or other content to our Site, you grant us a non-exclusive,
          royalty-free, perpetual, and worldwide license to use, reproduce, modify, and distribute
          such content.
        </p>
        <p>You agree not to submit content that:</p>
        <ul>
          <li>Is false, misleading, or deceptive</li>
          <li>Is defamatory, obscene, or offensive</li>
          <li>Infringes on any third party's rights</li>
          <li>Contains malware or harmful code</li>
          <li>Violates any applicable law or regulation</li>
          <li>Promotes illegal activities or substances</li>
        </ul>

        <h2>Accuracy of Information</h2>
        <p>
          We strive to provide accurate and up-to-date information. However, we make no warranties
          or representations about the accuracy, completeness, or reliability of any content on
          the Site. Information may become outdated, and we are under no obligation to update it.
        </p>

        <h2>Third-Party Links</h2>
        <p>
          Our Site may contain links to third-party websites. We are not responsible for the
          content, privacy policies, or practices of any third-party sites. Accessing these links
          is at your own risk.
        </p>

        <h2>Research Citations</h2>
        <p>
          We cite peer-reviewed research to support our content. These citations are provided for
          reference only. The inclusion of research does not imply endorsement of CBD products or
          guarantee of specific outcomes.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, CBD Portal shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages resulting from:
        </p>
        <ul>
          <li>Your use or inability to use the Site</li>
          <li>Any content obtained from the Site</li>
          <li>Unauthorized access to your data</li>
          <li>Errors or omissions in content</li>
          <li>Any third-party conduct on the Site</li>
        </ul>

        <h2>Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless CBD Portal from any claims, damages, losses,
          or expenses arising from your use of the Site or violation of these Terms.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of Switzerland,
          without regard to its conflict of law provisions.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Changes will be effective
          immediately upon posting. Your continued use of the Site constitutes acceptance of
          the modified Terms.
        </p>

        <h2>Severability</h2>
        <p>
          If any provision of these Terms is found to be unenforceable, the remaining provisions
          will continue in full force and effect.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about these Terms, please contact us at:
        </p>
        <p>
          Email: legal@cbdportal.com
        </p>
      </div>
    </div>
  );
}