import type { Metadata } from 'next';
import AboutUs from './AboutUs';

export const metadata: Metadata = {
  title: 'О компании — Азия NTB',
  description: 'Информация о компании Азия NTB...',
};

export default function AboutPage() {
  return <AboutUs />;
}