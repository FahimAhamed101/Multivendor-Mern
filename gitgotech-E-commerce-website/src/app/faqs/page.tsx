import SimpleFAQ from '@/components/landingPage/FaQuestion';
import FooterPageBack from '@/components/landingPage/FooterPageBack';

export default function FaqsPage() {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <FooterPageBack className="mb-4" />
      </div>
      <SimpleFAQ />
    </div>
  );
}
