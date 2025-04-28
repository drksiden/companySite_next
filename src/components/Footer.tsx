'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  COMPANY_NAME,
  COMPANY_ADDRESS,
  ALEXEY_PHONE,
  ALEXEY_EMAIL,
  OLEG_EMAIL,
  COMPANY_CITY_PHONE1,
  COMPANY_CITY_PHONE2,
} from '@/data/constants';

export function Footer() {
  return (
    <footer className="bg-card text-foreground py-16 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div className="md:col-span-3 lg:col-span-1">
          <h3 className="text-xl font-semibold text-foreground mb-4">{COMPANY_NAME}</h3>
          <p className="text-base text-muted-foreground leading-relaxed">
            Ваш надежный интегратор систем безопасности и автоматизации в Казахстане.
          </p>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4">Навигация</h4>
          <nav className="flex flex-col space-y-3 text-base">
            <Link href="/" className="hover:text-primary transition-all duration-300">
              Главная
            </Link>
            <Link href="/catalog" className="hover:text-primary transition-all duration-300">
              Каталог
            </Link>
            <Link href="/services" className="hover:text-primary transition-all duration-300">
              Услуги
            </Link>
            <Link href="/about" className="hover:text-primary transition-all duration-300">
              О нас
            </Link>
            <Link href="/contact" className="hover:text-primary transition-all duration-300">
              Контакты
            </Link>
          </nav>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-foreground mb-4">Контакты</h4>
          <ul className="space-y-4 text-base">
            <li>
              <span className="font-medium text-foreground block mb-2">Общие контакты</span>
              <div className="space-y-2 text-muted-foreground">
                {COMPANY_CITY_PHONE1 && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-muted-foreground shrink-0" />
                    <a href={`tel:${COMPANY_CITY_PHONE1.replace(/\D/g, '')}`} className="hover:text-primary transition-all duration-300">
                      {COMPANY_CITY_PHONE1}
                    </a>
                  </div>
                )}
                {COMPANY_CITY_PHONE2 && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-muted-foreground shrink-0" />
                    <a href={`tel:${COMPANY_CITY_PHONE2.replace(/\D/g, '')}`} className="hover:text-primary transition-all duration-300">
                      {COMPANY_CITY_PHONE2}
                    </a>
                  </div>
                )}
              </div>
            </li>
            <Separator className="bg-border mb-4" />
            <li>
              {/* <span className="font-medium text-foreground block mb-2">Алексей</span> */}
              <div className="space-y-2 text-muted-foreground">
                {ALEXEY_PHONE && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 mr-2 text-muted-foreground shrink-0" />
                    <a href={`tel:${ALEXEY_PHONE.replace(/\D/g, '')}`} className="hover:text-primary transition-all duration-300">
                      {ALEXEY_PHONE}
                    </a>
                  </div>
                )}
                {ALEXEY_EMAIL && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-muted-foreground shrink-0" />
                    <a href={`mailto:${ALEXEY_EMAIL}`} className="hover:text-primary transition-all duration-300 break-all">
                      {ALEXEY_EMAIL}
                    </a>
                  </div>
                )}
              </div>
            </li>
            <Separator className="bg-border mb-4" />
            <li>
              <div className="space-y-2 text-muted-foreground">
                {OLEG_EMAIL && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-muted-foreground shrink-0" />
                    <a href={`mailto:${OLEG_EMAIL}`} className="hover:text-primary transition-all duration-300 break-all">
                      {OLEG_EMAIL}
                    </a>
                  </div>
                )}
              </div>
            </li>
            <li>
              <Separator className="bg-border mb-4" />
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-muted-foreground">{COMPANY_ADDRESS}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <Separator className="bg-border mt-10" />
      <div className="container mx-auto text-center text-sm text-muted-foreground pt-8">
        © {new Date().getFullYear()} ТОО `{COMPANY_NAME}`. Все права защищены.
      </div>
    </footer>
  );
}