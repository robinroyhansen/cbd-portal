export function MedicalDisclaimerSchema({ articleTitle }: { articleTitle: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: articleTitle,
    medicalAudience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patient'
    },
    mainContentOfPage: {
      '@type': 'WebPageElement',
      cssSelector: 'article'
    },
    reviewedBy: {
      '@type': 'Person',
      name: 'Robin Roy Krigslund-Hansen',
      jobTitle: 'CBD Expert',
      description: '12+ years CBD industry experience'
    },
    lastReviewed: new Date().toISOString().split('T')[0],
    disclaimer: 'This content is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional before starting any new supplement regimen.'
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}