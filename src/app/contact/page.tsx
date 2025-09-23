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
// import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

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
              {/* Контакт Алексея */}
              <Card className="mb-6 shadow-lg border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-foreground">
                    <UserCircle className="w-6 h-6 mr-3 text-primary shrink-0" />
                    {/* Алексей */}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-muted-foreground shrink-0" />
                      <Button
                        variant="link"
                        asChild
                        className="p-0 h-auto text-muted-foreground hover:text-primary text-sm"
                      >
                        <a
                          href={`tel:${ALEXEY_PHONE.replace(/\D/g, '')}`}
                          aria-label={`Позвонить Алексею по номеру ${ALEXEY_PHONE}`}
                        >
                          {ALEXEY_PHONE}
                        </a>
                      </Button>
                    </li>
                    <li className="flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-muted-foreground shrink-0" />
                      <Button
                        variant="link"
                        asChild
                        className="p-0 h-auto text-muted-foreground hover:text-primary text-sm"
                      >
                        <a
                          href={`mailto:${ALEXEY_EMAIL}`}
                          aria-label={`Отправить email Алексею на ${ALEXEY_EMAIL}`}
                        >
                          {ALEXEY_EMAIL}
                        </a>
                      </Button>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Контакт Олега */}
              <Card className="mb-6 shadow-lg border-border">
                <CardHeader>
                  <CardTitle className="flex items-center text-xl text-foreground">
                    <UserCircle className="w-6 h-6 mr-3 text-primary shrink-0" />
                    {/* Олег */}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    {/* <li className="flex items-center">
                      <Phone className="w-5 h-5 mr-2 text-muted-foreground shrink-0" />
                      <Button
                        variant="link"
                        asChild
                        className="p-0 h-auto text-muted-foreground hover:text-primary text-sm"
                      >
                        <a
                          href={`tel:${OLEG_PHONE.replace(/\D/g, '')}`}
                          aria-label={`Позвонить Олегу по номеру ${OLEG_PHONE}`}
                        >
                          {OLEG_PHONE}
                        </a>
                      </Button>
                    </li> */}
                    <li className="flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-muted-foreground shrink-0" />
                      <Button
                        variant="link"
                        asChild
                        className="p-0 h-auto text-muted-foreground hover:text-primary text-sm"
                      >
                        <a
                          href={`mailto:${OLEG_EMAIL}`}
                          aria-label={`Отправить email Олегу на ${OLEG_EMAIL}`}
                        >
                          {OLEG_EMAIL}
                        </a>
                      </Button>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Адрес */}
              <Card className="shadow-lg border-border">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Адрес
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 text-muted-foreground">
                    {/* {(COMPANY_CITY_PHONE1 || COMPANY_CITY_PHONE2) && (
                      <li>
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
                    )} */}
                    <li className="flex items-start">
                      <MapPin className="w-5 h-5 mr-3 mt-0.5 text-primary shrink-0" />
                      <span className="text-sm">{COMPANY_ADDRESS}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Правая колонка: Карта */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="w-full h-96 md:h-full rounded-lg overflow-hidden shadow-lg border-border"
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
        </div>
      </section>
    </>
  );
};

export default ContactPage;