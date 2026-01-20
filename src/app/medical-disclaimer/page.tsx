import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Medical Disclaimer | CBD Portal',
  description: 'Important medical disclaimer regarding CBD information.',
  alternates: {
    canonical: '/medical-disclaimer',
  },
};

export default function MedicalDisclaimerPage() {
  const lastUpdated = 'January 1, 2025';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-4">Medical Disclaimer</h1>
      <p className="text-gray-500 mb-8">Last updated: {lastUpdated}</p>

      {/* Important notice box */}
      <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8">
        <h2 className="text-xl font-bold text-red-800 mb-2">Important Notice</h2>
        <p className="text-red-700">
          The information provided on CBD Portal is for educational and informational purposes only.
          It is NOT intended to be a substitute for professional medical advice, diagnosis, or treatment.
        </p>
      </div>

      <div className="prose prose-green max-w-none">
        <h2>Not Medical Advice</h2>
        <p>
          The content on this website, including text, graphics, images, and other material, is
          provided for general informational purposes only. Nothing on this Site should be construed
          as medical advice or used for medical diagnosis or treatment.
        </p>

        <h2>Consult Healthcare Professionals</h2>
        <p>
          <strong>Always seek the advice of your physician or other qualified healthcare provider</strong>
          with any questions you may have regarding:
        </p>
        <ul>
          <li>Any medical condition</li>
          <li>Starting, stopping, or changing any medication</li>
          <li>Using CBD or any other supplement</li>
          <li>Potential interactions with existing medications</li>
          <li>Pregnancy, breastfeeding, or family planning</li>
        </ul>

        <h2>Never Disregard Professional Advice</h2>
        <p>
          Never disregard professional medical advice or delay seeking it because of something you
          have read on this website. If you think you may have a medical emergency, call your doctor
          or emergency services immediately.
        </p>

        <h2>No Doctor-Patient Relationship</h2>
        <p>
          Use of this Site does not create a doctor-patient relationship between you and CBD Portal
          or any contributor to this Site. The information provided is not a substitute for professional
          medical care.
        </p>

        <h2>Regulatory Status of CBD Products</h2>
        <p>
          Most CBD products discussed on this Site are sold as food supplements or wellness products
          and have not been approved by regulatory bodies as medicines for the diagnosis, treatment,
          cure, or prevention of any disease. The prescription CBD medication Epidiolex is approved
          in several countries (including the EU, UK, USA, and others) for specific epilepsy conditions.
          Regulatory status of CBD varies significantly by country - always check your local regulations.
        </p>

        <h2>Research Limitations</h2>
        <p>
          While we cite peer-reviewed research, it's important to understand that:
        </p>
        <ul>
          <li>CBD research is still evolving</li>
          <li>Many studies are preliminary or conducted on animals</li>
          <li>Individual results may vary significantly</li>
          <li>Long-term effects are not fully understood</li>
          <li>Product quality varies widely in the CBD industry</li>
        </ul>

        <h2>Potential Risks and Side Effects</h2>
        <p>
          CBD may cause side effects in some individuals, including:
        </p>
        <ul>
          <li>Drowsiness and fatigue</li>
          <li>Changes in appetite</li>
          <li>Diarrhea</li>
          <li>Changes in weight</li>
          <li>Interactions with other medications</li>
        </ul>
        <p>
          This is not a complete list of potential side effects. Consult your healthcare provider
          for personalized advice.
        </p>

        <h2>Drug Interactions</h2>
        <p>
          CBD can interact with various medications, including:
        </p>
        <ul>
          <li>Blood thinners</li>
          <li>Heart medications</li>
          <li>Immunosuppressants</li>
          <li>Seizure medications</li>
          <li>Some antidepressants</li>
        </ul>
        <p>
          <strong>Always inform your doctor about all supplements you take, including CBD.</strong>
        </p>

        <h2>Legal Considerations</h2>
        <p>
          The legal status of CBD varies significantly by country and region. Regulations differ
          regarding THC content limits, product types, and sales channels. It is your responsibility
          to verify the legality of CBD products in your jurisdiction before purchasing or using them.
          This website provides general information and does not constitute legal advice for any
          specific jurisdiction.
        </p>

        <h2>Personal Opinions</h2>
        <p>
          The views and opinions expressed in our articles are the personal expert opinions of the
          author, Robin Roy Krigslund-Hansen, based on his extensive industry experience and research.
          They do not represent the official position of any organisation.
        </p>

        <h2>No Guarantees</h2>
        <p>
          We make no guarantees about the efficacy of CBD or any specific outcomes. Individual
          experiences with CBD vary greatly based on factors including:
        </p>
        <ul>
          <li>Individual biology and metabolism</li>
          <li>Product quality and concentration</li>
          <li>Dosage and administration method</li>
          <li>Underlying health conditions</li>
          <li>Other medications being taken</li>
        </ul>

        <h2>Acknowledgment</h2>
        <p>
          By using this Site, you acknowledge that you have read, understood, and agree to this
          Medical Disclaimer. You agree to use the information at your own risk and to consult
          appropriate healthcare professionals before making any decisions about your health.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Medical Disclaimer, please contact us at:
        </p>
        <p>
          Email: info@cbdportal.com
        </p>
      </div>
    </div>
  );
}