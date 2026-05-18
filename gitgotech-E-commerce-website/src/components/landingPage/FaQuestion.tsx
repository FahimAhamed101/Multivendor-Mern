'use client';

import { SectionHeader } from '@/customComponent/Header';
import { useState } from 'react';

const faqData = [
  {
    question: "Can I set my delivery for a specific date?",
    answer: "Yes! You can choose a specific delivery date during checkout for eligible items. We offer scheduled delivery options for most products. You'll see available dates in the delivery options section before completing your purchase."
  },
  {
    question: "How long will the order take to arrive?",
    answer: "Delivery times vary based on your location and the product. Standard delivery typically takes 3-7 business days. Express options (1-2 days) are available for most items. You'll see estimated delivery dates for each item before checkout."
  },
  {
    question: "Where is my order?",
    answer: "You can track your order in real-time through your account dashboard. We'll send you tracking updates via email and SMS. If you're having trouble locating your order, contact our support team with your order number for assistance."
  },
  {
    question: "Why was my package returned to sender?",
    answer: "Packages may be returned if: the address was incorrect or incomplete, delivery attempts were unsuccessful after multiple tries, customs clearance couldn't be completed, or the recipient refused delivery. We'll notify you if this happens and help reschedule delivery."
  },
  {
    question: "Why am I charged for sales tax?",
    answer: "Sales tax is applied based on your shipping address and local regulations. Tax rates vary by state and municipality. The tax amount is calculated during checkout and shown before payment. Some items may be tax-exempt depending on your location."
  },
  {
    question: "Are there any additional fees for customs?",
    answer: "For international orders, customs duties and import taxes may apply. These fees are determined by your country's customs authority and are the responsibility of the recipient. We'll provide all necessary documentation to help with customs clearance."
  },
  {
    question: "What's Retail Delivery Fees?",
    answer: "Some states have implemented retail delivery fees that apply to orders delivered within their jurisdiction. This is a small fee (usually $0.50-$2.00) added to orders to support transportation and infrastructure projects. It will appear as a separate line item during checkout if applicable."
  }
];

export default function SimpleFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className=" py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto bg-gradient-to-r from-black via-[#0f0924] to-black">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className='flex items-center justify-center'> 
          <SectionHeader title='Frequently Asked Questions'></SectionHeader>
          </h1>
          <p className="text-xl text-gray-600">Get Qualibond Word 404 Answers</p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="  rounded-lg shadow-md overflow-hidden bg-gradient-to-l from-[#231c2e] to-[#22121e] text-white"
            >
              <button
                className="w-full px-6 py-5 text-left flex justify-between items-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-medium text-white">{faq.question}</span>
                <span className=" font-bold text-xl ml-4">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-5 pt-2 border-t border-gray-700">
                  <p className="text-white leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}