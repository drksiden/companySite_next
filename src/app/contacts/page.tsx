'use client';

import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import { motion } from "framer-motion";
import { UserCircle, Phone, Mail, MapPin } from 'lucide-react';
import {
  COMPANY_NAME, COMPANY_ADDRESS,
  ALEXEY_PHONE, ALEXEY_EMAIL,
  OLEG_EMAIL,
  COMPANY_CITY_PHONE1, COMPANY_CITY_PHONE2
} from "@/data/constants";
import Head from 'next/head';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ContactForm } from '@/components/contact/ContactForm';

const ContactPage = () => {
  const mapState = { center: [43.248150, 76.870680], zoom: 16 };
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  return (
    <>
      <Head>
        <title>Контакты - {COMPANY_NAME}</title>
        <meta name="description" content={`Свяжитесь с ${COMPANY_NAME}. Адрес, телефоны, email и карта проезда.`} />
      </Head>
      <section className="py-16 lg:py-20 px-4 bg-background w-full">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-foreground mb-10 md:mb-12 text-center"
          >
            Наши Контакты
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {/* Левая колонка: Информация */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Контактные лица */}
              <Card className="mb-6 shadow-lg border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl text-foreground">
                    <UserCircle className="w-6 h-6 mr-3 text-primary shrink-0" />
                    Контактные лица
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Контакты Алексея */}
                    <div>
                      <h4 className="font-semibold text-lg text-foreground mb-2">Алексей</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center">
                          <Phone className="w-5 h-5 mr-2 text-muted-foreground shrink-0" />
                          <a
                            href={`tel:${ALEXEY_PHONE.replace(/\D/g, '')}`}
                            className="hover:text-primary transition-colors"
                          >
                            {ALEXEY_PHONE}
                          </a>
                        </li>
                        <li className="flex items-center">
                          <Mail className="w-5 h-5 mr-2 text-muted-foreground shrink-0" />
                          <a
                            href={`mailto:${ALEXEY_EMAIL}`}
                            className="hover:text-primary transition-colors break-all"
                          >
                            {ALEXEY_EMAIL}
                          </a>
                        </li>
                      </ul>
                    </div>
                    <Separator className="bg-border" />
                    {/* Контакты Олега */}
                    <div>
                      <h4 className="font-semibold text-lg text-foreground mb-2">Олег</h4>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-center">
                          <Mail className="w-5 h-5 mr-2 text-muted-foreground shrink-0" />
                          <a
                            href={`mailto:${OLEG_EMAIL}`}
                            className="hover:text-primary transition-colors break-all"
                          >
                            {OLEG_EMAIL}
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Адрес */}
              <Card className="mb-6 shadow-lg border-border">
                <CardHeader>
                  <CardTitle className="text-2xl text-foreground">
                    Адрес
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-muted-foreground">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 mr-3 mt-0.5 text-primary shrink-0" />
                      <span className="text-base">{COMPANY_ADDRESS}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Правая колонка: Карта */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="w-full h-80 md:h-full rounded-lg overflow-hidden shadow-lg border-border"
            >
              {apiKey ? (
                <YMaps query={{ apikey: apiKey, lang: 'ru_RU' }}>
                  <Map defaultState={mapState} width="100%" height="100%">
                    <Placemark
                      geometry={mapState.center}
                      properties={{ iconCaption: COMPANY_NAME }}
                    />
                  </Map>
                </YMaps>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                  Загрузка карты... (API ключ не найден)
                </div>
              )}
            </motion.div>
          </div>

          {/* Контактная форма */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 lg:mt-16"
          >
            <ContactForm className="max-w-2xl mx-auto" />
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default ContactPage;
