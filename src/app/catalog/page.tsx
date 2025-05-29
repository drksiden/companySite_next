import { Metadata } from 'next';
import { COMPANY_NAME_SHORT } from '@/data/constants';
import CatalogClient from './CatalogClient';

export const metadata: Metadata = {
  title: `Каталог - ${COMPANY_NAME_SHORT}`,
};

export default function CatalogPage() {
  return <CatalogClient />;
}