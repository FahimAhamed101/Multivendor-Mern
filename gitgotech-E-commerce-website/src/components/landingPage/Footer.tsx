'use client';

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { useSupportModal } from '@/context/SupportModalContext';

const SUPPORT_EMAIL = 'support@techpit.com';
const GMAIL_COMPOSE = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SUPPORT_EMAIL)}`;
/** Replace with your brand TikTok profile when ready */
const TIKTOK_URL = 'https://www.tiktok.com/@sleeknit';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { openSupport } = useSupportModal();

  const quickLinks: { name: string; href: string; action?: 'support' }[] = [
    { name: 'Home', href: '/' },
    { name: 'Browse Ventures', href: '/ventures' },
    { name: 'Support', href: '#', action: 'support' },
    { name: 'FAQs', href: '/faqs' },
  ];

  const companyInfo = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Vendors', href: '/vendors' },
  ];

  return (
    <footer className="bg-[#141627] text-white pt-12 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <img className="h-24" src="/images/logo.png" alt="" />
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Built for creators and businesses, SleekNlit lets every vendor run their own store while helping customers plan events, manage guests, send invitations, and place orders seamlessly.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base text-2xl font-cormorant md:text-[32px] font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {link.action === 'support' ? (
                    <button
                      type="button"
                      onClick={openSupport}
                      className="text-gray-400 hover:text-white transition-colors text-sm text-left"
                    >
                      {link.name}
                    </button>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="text-base text-2xl font-cormorant md:text-[32px] font-semibold mb-4">Company Info</h3>
            <ul className="space-y-2">
              {companyInfo.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h3 className="text-base text-2xl font-cormorant md:text-[32px] font-semibold mb-4">Get In Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <a
                  href={GMAIL_COMPOSE}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 font-poppins text-sm hover:text-white transition-colors"
                >
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <span className="text-gray-400 font-poppins text-sm">(02) 0454658562</span>
              </li>
            </ul>
            <div className="flex space-x-3 mt-4">
              <a
                href={TIKTOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok size={14} className="text-gray-400" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-gray-500">
            © {currentYear} Sleeknit All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <p className="text-gray-500 hover:text-white transition-colors">
              Privacy Policy
            </p>
            <p className="text-gray-500 hover:text-white transition-colors">
              Terms of Service
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
