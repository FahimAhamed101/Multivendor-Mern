"use client";
import React from 'react';
import { RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft } from 'react-icons/fa';

export default function ReturnPolicyPage() {
     const router = useRouter(); 
  const policyContent = [
    {
      title: "",
      text: "This Return Policy (\"Policy\") governs the conditions under which customers (\"You\" or \"Customer\") may return products purchased from Sleeklift (\"We,\" \"Us,\" or \"Ours\"). By placing an order with Sleeklift, you acknowledge and agree to the terms stated herein."
    },
    {
      title: "1. Return Eligibility Period",
      text: "Customers may submit a return request for eligible items within seven (7) calendar days from the date of delivery."
    },
    {
      title: "",
      text: "Returns requested after this period carrier's tracking information. Any return request made after this period."
    },
    {
      title: "",
      text: "Will be deemed invalid and will not be processed."
    },
    {
      title: "2. Condition of Returned Merchandise",
      text: "Returned merchandise must satisfy the following criteria to qualify for acceptance:"
    },
    {
      title: "",
      text: "• Items must be in their original, unused, and unworn condition."
    },
    {
      title: "",
      text: "• All original tags, labels, accessories, and packaging must remain fully intact."
    },
    {
      title: "",
      text: "• Free from stains, tears, modifications, or signs of use."
    },
    {
      title: "",
      text: "• Items that fail to meet these criteria or are not in accordance to reject any return that fails to meet these standards."
    },
    {
      title: "3. Non-Returnable Merchandise",
      text: "The following categories are strictly non-returnable:"
    },
    {
      title: "",
      text: "• Undergarments and intimates"
    },
    {
      title: "",
      text: "• Cosmetics and personal care products"
    },
    {
      title: "",
      text: "• Jewelry"
    },
    {
      title: "",
      text: "• Items for personal-care items"
    },
    {
      title: "",
      text: "• Customized or personalized products"
    },
    {
      title: "",
      text: "• Items marked as \"Non-Returnable\""
    },
    {
      title: "4. Return Process",
      text: "To initiate a return:"
    },
    {
      title: "",
      text: "1. Log into your Sleeklift account."
    },
    {
      title: "",
      text: "2. Navigate to your order history."
    },
    {
      title: "",
      text: "3. Submit a return request."
    },
    {
      title: "",
      text: "4. Return the product and follow the provided instructions."
    },
    {
      title: "",
      text: "5. Ensure that any damaged or unauthorized return receipts provided by Sleeklift."
    },
    {
      title: "",
      text: "5. Return Shipping Costs"
    },
    {
      title: "",
      text: "Except where it is at fault (defective or incorrect item), the customer is solely responsible for return shipping fees."
    },
    {
      title: "",
      text: "Sleeklift is not accountable for only other Sleeklift replaces and inspects the returned item. Returns may be made:"
    },
    {
      title: "",
      text: "To the carrier (payment method or via Sleeklift Store Credit. Items failing inspection will be returned to the customer at their expense."
    },
    {
      title: "",
      text: "6. Refund Process"
    },
    {
      title: "",
      text: "7. Damaged, Faulty, or Incorrect Merchandise"
    },
    {
      title: "",
      text: "Customers must notify Sleeklift within forty-eight (48) hours of delivery if an item is found to be damaged, faulty, or incorrect."
    },
    {
      title: "",
      text: "Defective or incorrect, and may be required to submit photographic evidence."
    },
    {
      title: "",
      text: "8. Policy Amendments"
    },
    {
      title: "",
      text: "Sleeklift reserves the right to modify or amend this policy at any time without prior notice. The Policy in effect at the time of the"
    },
    {
      title: "",
      text: "return request will apply."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-[#0f0924] to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}

           <div className="container md:mt-24 mt-12 my-4 mx-auto flex items-center gap-4">
             <button onClick={()=> router.back()} className="flex items-center text-purple-400 hover:text-purple-300 transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B630F4] to-[#2ACCED] cursor-pointer flex items-center justify-center">
            <FaArrowLeft className='text-black' />
          </div>
        </button>
          <h1 className="text-2xl font-semibold text-gray-300 font-cormorant">Return Policy</h1>
        </div>
        

        {/* Content Card */}
        <div className="bg-gradient-to-br from-gray-800/40 to-purple-900/20 border-2 border-blue-500/50 rounded-3xl p-6 md:p-10 backdrop-blur-sm">
          <div className="space-y-4 text-sm text-gray-400 leading-relaxed   overflow-y-auto pr-2 custom-scrollbar">
            {policyContent.map((section, index) => (
              <div key={index}>
                {section.title && (
                  <h3 className="text-white font-semibold mb-2">{section.title}</h3>
                )}
                <p className="text-gray-400">{section.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        {/* <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
            I Understand
          </button>
          <button className="w-full py-4 border-2 border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 rounded-xl font-semibold transition-all duration-300 hover:scale-105">
            Initiate Return
          </button>
        </div> */}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.7);
        }
      `}</style>
    </div>
  );
}