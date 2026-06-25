import { Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/Navbar";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "TryOn AI — виртуальная примерка одежды",
  description: "Загрузите своё фото и фото любой одежды — AI мгновенно примерит её на вас с фотореалистичным результатом.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className="h-full w-full" data-theme="pastel">
      <body className={`${nunito.variable} h-full w-full flex flex-col antialiased bg-bg-page text-primary-text font-sans overflow-hidden`}>
        <Providers>
          <Navbar />
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
