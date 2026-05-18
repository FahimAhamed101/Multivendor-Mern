 

// import Footer from "@/components/landingPage/Footer";
// import Navbar from "@/components/landingPage/Navbar";
// import RouteConditionalNav from "@/customComponent/RouteConditionalNav";
// import Providers from "@/redux/Providers";
// import SupportMessage from "@/components/landingPage/SupportMessage";
// import type { Metadata } from "next";
// import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
// import "./globals.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// const cormorantGaramond = Cormorant_Garamond({
//   variable: "--font-cormorant",
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"],
//   display: "swap",
// });

// export const metadata: Metadata = {
//   title: "GitGoTech - Digital Solutions for Your Business",
//   description:
//     "Transform your digital presence with cutting-edge web and app development",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en" className={cormorantGaramond.variable}>
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} ${cormorantGaramond.variable} antialiased`}
//       >
//         <Navbar />
//         <RouteConditionalNav />
//         <main className="">
//           <Providers>{children}</Providers>
//         </main>
//         <Footer />
//         <SupportMessage />
//       </body>
//     </html>
//   );
// }
 

import Providers from "@/redux/Providers";
import ToastProvider from "@/components/ToastProvider";
import { FilterProvider } from "@/context/FilterContext";
import { SupportModalProvider } from "@/context/SupportModalContext";
import { SocketProvider } from "@/components/providers/SocketProvider";

import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/customComponent/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GitGoTech - Digital Solutions for Your Business",
  description:
    "Transform your digital presence with cutting-edge web and app development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cormorantGaramond.variable}>
      <body
         className={`${geistSans.variable} ${geistMono.variable} ${cormorantGaramond.variable} antialiased`}
  suppressHydrationWarning
      >
        <Providers>
          <SupportModalProvider>
            <FilterProvider>
              <SocketProvider>
                <ConditionalLayout>{children}</ConditionalLayout>
              </SocketProvider>
            </FilterProvider>
          </SupportModalProvider>
        </Providers>
        <ToastProvider />
      </body>
    </html>
  );
}