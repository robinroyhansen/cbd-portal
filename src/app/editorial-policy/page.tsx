import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Editorial Policy | CBD Portal',
  description: 'Learn about CBD Portal editorial standards and research methodology.',
  alternates: {
    canonical: '/editorial-policy',
  },
};

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Editorial Policy</h1>
      <p className="text-xl text-gray-600 mb-8">
        How we research, write, and maintain accurate CBD information.
      </p>

      <div className="prose prose-green max-w-none">
        <h2>Our Commitment to Accuracy</h2>
        <p>
          CBD Portal is committed to providing accurate, evidence-based information about cannabidiol
          and related topics. We understand that health-related decisions require trustworthy information,
          and we take this responsibility seriously.
        </p>

        <h2>Who Writes Our Content</h2>
        <p>
          All content on CBD Portal is written by <Link href="/authors">verified industry experts</Link> with
          real-world experience in CBD product development, research, or healthcare. Our authors have:
        </p>
        <ul>
          <li>Demonstrated expertise in the CBD or cannabis industry</li>
          <li>Verifiable professional backgrounds</li>
          <li>Commitment to evidence-based reporting</li>
        </ul>

        <h2>Research Methodology</h2>
        <p>Our research process includes:</p>

        <h3>1. Primary Source Review</h3>
        <p>
          We prioritize peer-reviewed research from reputable journals. Our primary sources include:
        </p>
        <ul>
          <li>PubMed and PubMed Central (NIH)</li>
          <li>ClinicalTrials.gov</li>
          <li>Cochrane Database of Systematic Reviews</li>
          <li>Major medical journals (JAMA, BMJ, Lancet, etc.)</li>
        </ul>

        <h3>2. Quality Assessment</h3>
        <p>
          We evaluate research quality based on:
        </p>
        <ul>
          <li>Study design (randomized controlled trials weighted highest)</li>
          <li>Sample size and statistical significance</li>
          <li>Peer review status</li>
          <li>Replication by independent researchers</li>
          <li>Potential conflicts of interest</li>
        </ul>

        <h3>3. Balanced Reporting</h3>
        <p>
          We present research findings honestly, including:
        </p>
        <ul>
          <li>Study limitations and caveats</li>
          <li>Conflicting findings from other studies</li>
          <li>Areas where evidence is limited or preliminary</li>
          <li>Clear distinction between human and animal studies</li>
        </ul>

        <h2>Citation Standards</h2>
        <p>
          Every factual claim in our articles is supported by citations. We use:
        </p>
        <ul>
          <li>Inline citations linking directly to source material</li>
          <li>Reference lists at the end of each article</li>
          <li>Clear attribution of quotes and statistics</li>
        </ul>

        <h2>What We Don't Do</h2>
        <p>To maintain credibility, we never:</p>
        <ul>
          <li>Make unsubstantiated health claims</li>
          <li>Promise specific outcomes or "cures"</li>
          <li>Present preliminary research as conclusive</li>
          <li>Ignore contradictory evidence</li>
          <li>Accept payment for favorable coverage</li>
          <li>Recommend specific products without disclosure</li>
        </ul>

        <h2>Medical Disclaimer</h2>
        <p>
          Our content is for informational purposes only. We always recommend that readers:
        </p>
        <ul>
          <li>Consult healthcare professionals before using CBD</li>
          <li>Discuss potential drug interactions with their doctor</li>
          <li>Not replace prescribed treatments with CBD</li>
          <li>Be cautious of any source making guaranteed health claims</li>
        </ul>
        <p>
          Read our full <Link href="/medical-disclaimer">Medical Disclaimer</Link>.
        </p>

        <h2>Content Updates</h2>
        <p>
          CBD research is rapidly evolving. We commit to:
        </p>
        <ul>
          <li>Reviewing articles annually for accuracy</li>
          <li>Updating content when significant new research emerges</li>
          <li>Clearly displaying "last updated" dates on all articles</li>
          <li>Noting when articles have been substantially revised</li>
        </ul>

        <h2>Corrections Policy</h2>
        <p>
          If we make an error, we will:
        </p>
        <ul>
          <li>Correct it promptly upon verification</li>
          <li>Note the correction at the bottom of the article</li>
          <li>Preserve transparency about what was changed</li>
        </ul>
        <p>
          To report an error or suggest a correction, please <Link href="/contact">contact us</Link>.
        </p>

        <h2>Conflicts of Interest</h2>
        <p>
          We believe in transparency. Our authors disclose:
        </p>
        <ul>
          <li>Current or past employment in the CBD industry</li>
          <li>Financial interests in CBD companies</li>
          <li>Any relationships that could influence content</li>
        </ul>
        <p>
          These disclosures appear on each <Link href="/authors">author's profile page</Link>.
        </p>

        <h2>Independence</h2>
        <p>
          CBD Portal maintains editorial independence. We:
        </p>
        <ul>
          <li>Do not accept payment for favorable coverage</li>
          <li>Clearly label any sponsored content (which is rare)</li>
          <li>Base recommendations solely on evidence and expert judgment</li>
          <li>Disclose affiliate relationships where applicable</li>
        </ul>

        <h2>Questions About Our Editorial Standards?</h2>
        <p>
          We welcome questions about our editorial process. Please <Link href="/contact">contact us</Link>
          with any concerns or inquiries.
        </p>
      </div>
    </div>
  );
}