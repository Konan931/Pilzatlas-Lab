import type { Metadata, Viewport } from 'next';
import 'maplibre-gl/dist/maplibre-gl.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pilzatlas BB · Agent Toad',
  description: 'Scientific, interpretable mushroom atlas and expedition lab for Berlin-Brandenburg.',
  manifest: '/manifest.webmanifest',
  icons: { icon: '/toad.svg' }
};
export const viewport: Viewport = { themeColor: '#0b0e0c', width: 'device-width', initialScale: 1 };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
