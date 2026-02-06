import './globals.css';

export const metadata = {
  title: 'Second Brain',
  description: 'Marcel\'s Second Brain / Mission Control',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
