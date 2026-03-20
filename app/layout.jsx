import "./globals.css";
import GlobalNav from "@/components/GlobalNav";
import GlobalFooter from "@/components/GlobalFooter";

export const metadata = {
  title: "CODM LK — Sri Lanka CODM Community",
  description: "The home of Call of Duty Mobile players in Sri Lanka. Connect, post, and rise.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <GlobalNav />
        <div style={{ flex: 1 }}>{children}</div>
        <GlobalFooter />
      </body>
    </html>
  );
}
