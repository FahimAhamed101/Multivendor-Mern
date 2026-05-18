import Link from 'next/link';
import FooterPageBack from '@/components/landingPage/FooterPageBack';

const ways = [
  { title: 'Vendors', description: 'Discover brands and shops on the marketplace.', href: '/vendors' },
  { title: 'Showrooms', description: 'Browse showrooms and curated collections.', href: '/showroom' },
  { title: 'Shopping cart', description: 'Review items and head to checkout.', href: '/shopping-cart' },
  { title: 'Wishlist', description: 'Save products you love for later.', href: '/wishlist' },
  { title: 'Messages', description: 'Chat with vendors about orders and designs.', href: '/messaging' },
  { title: 'Design request', description: 'Request custom designs from creators.', href: '/design-request' },
];

export default function BrowseVenturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0f0924] to-black text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl">
        <FooterPageBack className="mb-6" />
        <h1 className="text-3xl md:text-4xl font-cormorant font-semibold mb-3">Browse ventures</h1>
        <p className="text-gray-400 text-sm md:text-base max-w-2xl mb-10">
          Explore the main areas of the site—whether you are shopping, planning an event, or working with vendors.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {ways.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-gray-700/60 bg-gray-900/50 p-5 transition-colors hover:border-purple-500/50 hover:bg-gray-900/80"
            >
              <h2 className="text-lg font-semibold text-white mb-2">{item.title}</h2>
              <p className="text-sm text-gray-400">{item.description}</p>
              <span className="mt-3 inline-block text-sm text-purple-400">Open →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
