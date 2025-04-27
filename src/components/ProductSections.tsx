import { ProductSection } from './ProductSection';

const tekoSlides = [
  {
    id: 'teko-sh',
    imageUrl: '/images/teko/teko-sh.png',
    alt: 'Security Hub TEKO',
    title: 'Security Hub',
    description:
      'Беспроводная GSM сигнализация для квартиры, загородного дома и т.п. с видеонаблюдением, 433 МГц, емкость до 32 радиодатчиков, мобильное приложение',
    catalogUrl: '/catalog/teko/security-hub',
    sizes: "(max-width: 768px) 100vw, 50vw",  // Добавляем sizes
    priority: true, // Если это важное изображение, добавляем priority
  },
  {
    id: 'teko-astra-prime',
    imageUrl: '/images/teko/teko-astra-prime.png',
    alt: 'Астра-Прайм TEKO',
    title: 'Астра-Прайм',
    description:
      'Организация на объекте беспроводной охранной и пожарной сигнализации с использованием адресных радиоканальных извещателей и оповещателей Астра-Прайм',
    catalogUrl: '/catalog/teko/astra-prime',
    sizes: "(max-width: 768px) 100vw, 50vw", // Добавляем sizes
  },
  {
    id: 'teko-astra-ri-m',
    imageUrl: '/images/teko/teko-astra-ri-m.png',
    alt: 'Астра-РИ-М TEKO',
    title: 'Астра-РИ-М',
    description:
      'Организация на объекте беспроводной охранной, пожарной и других видов сигнализации (тревожной, аварийной и т.п.) с использованием адресных радиоканальных извещателей системы Астра-РИ-М. Емкость 192 радиоустройства, интерфейс RS-485 для подключения проводной части системы',
    catalogUrl: '/catalog/teko/astra-ri-m',
    sizes: "(max-width: 768px) 100vw, 50vw",  // Добавляем sizes
  },
  {
    id: 'teko-astra-a',
    imageUrl: '/images/teko/teko-astra-a.png',
    alt: 'Астра-А TEKO',
    title: 'Астра-А',
    description:
      'Организация на объекте адресной пожарной сигнализации с использованием адресных проводных извещателей и адресных устройств управления СОУЭ, клапанами дымоудаления',
    catalogUrl: '/catalog/teko/astra-a',
    sizes: "(max-width: 768px) 100vw, 50vw",  // Добавляем sizes
  },
  {
    id: 'teko-astra-r',
    imageUrl: '/images/teko/teko-astra-r.png',
    alt: 'Астра-Р TEKO',
    title: 'Астра-Р',
    description:
      'Организация индивидуальной защиты, охраны объектов и дистанционного управления путем беспроводной передачи извещений при нажатии на кнопку малогабаритных радиопередающих устройств и управления реле радиоприемного устройства при идентификации источника извещения',
    catalogUrl: '/catalog/teko/astra-r',
    sizes: "(max-width: 768px) 100vw, 50vw",  // Добавляем sizes
  },
];

const flexemSlides = [
  {
    id: 'flex-hmi',
    imageUrl: '/images/flexem/flexemHmiBanner.png',
    alt: 'HMI-панели FLEXEM',
    title: 'HMI-панели',
    description: 'Интуитивные панели управления для автоматизации.',
    catalogUrl: '/catalog/flexem/hmi-panels',
    sizes: "(max-width: 768px) 100vw, 50vw", // Добавляем sizes
  },
  {
    id: 'flex-plc',
    imageUrl: '/images/flexem/flexemPLCBanner.png',
    alt: 'ПЛК FLEXEM',
    title: 'ПЛК',
    description: 'Модульные контроллеры для управления процессами.',
    catalogUrl: '/catalog/flexem/plc-controllers',
    sizes: "(max-width: 768px) 100vw, 50vw", // Добавляем sizes
  },
  {
    id: 'flex-servo',
    imageUrl: '/images/flexem/flexemServoBanner.png',
    alt: 'Сервоприводы FLEXEM',
    title: 'Сервоприводы',
    description:
      'Высокопроизводительные сервоприводы FLEXEM обеспечивают клиентам высокоэффективное управление движением с высоким откликом и высокой точностью. Оснащены отладочным программным обеспечением FSC для высокопроизводительных сервоприводов. Поддерживает импульсный, EtherCAT, Modbus методы управления, мощность от 100 Вт до 7,5 кВт.',
    catalogUrl: '/catalog/flexem/servo',
    sizes: "(max-width: 768px) 100vw, 50vw", // Добавляем sizes
  },
  {
    id: 'flex-iot-gateway',
    imageUrl: '/images/flexem/flexemIoTGateway.png',
    alt: 'IoT-шлюз FLEXEM',
    title: 'IoT-шлюз',
    description:
      'Серия Fbox - это продукты IoT-шлюза компании Flexem. Они обеспечивают подключение к Ethernet, 4G и WiFi для локальных промышленных терминалов, таких как ПЛК, HMI, инверторы, датчики и другие устройства на объекте.',
    catalogUrl: '/catalog/flexem/iot-gateway',
    sizes: "(max-width: 768px) 100vw, 50vw", // Добавляем sizes
  },
];

const antSlides = [
  {
    id: 'ant-poe',
    imageUrl: '/images/flexem/flexemIoTGateway.png',
    alt: 'PoE Коммутатор ANT',
    title: 'PoE Коммутаторы',
    description: 'Надежные коммутаторы с питанием по Ethernet для IP-камер и точек доступа.',
    catalogUrl: '/catalog/ant/poe-switches',
    sizes: "(max-width: 768px) 100vw, 50vw", // Добавляем sizes
  },
  {
    id: 'ant-ind',
    imageUrl: '/images/flexem/flexemIoTGateway.png',
    alt: 'Промышленный коммутатор ANT',
    title: 'Промышленные Ethernet',
    description: 'Оборудование для стабильной работы сети в сложных промышленных условиях.',
    catalogUrl: '/catalog/ant/industrial-switches',
    sizes: "(max-width: 768px) 100vw, 50vw", // Добавляем sizes
  },
  {
    id: 'ant-media',
    imageUrl: '/images/flexem/flexemIoTGateway.png',
    alt: 'Медиаконвертер ANT',
    title: 'Медиаконвертеры',
    description: 'Преобразование среды передачи данных между медью и оптикой.',
    catalogUrl: '/catalog/ant/media-converters',
    sizes: "(max-width: 768px) 100vw, 50vw", // Добавляем sizes
  },
];

export const TekoSection: React.FC = () => (
  <ProductSection
    slides={tekoSlides}
    brandName="TEKO"
    brandLogoUrl="/images/logos/teko-logo.svg"
    brandTagline="Надежные Системы Безопасности"
    description='Полный спектр оборудования НПО "ТЕКО" в Казахстане. От радиоканальных систем "Астра" до адресных решений для защиты вашего объекта.'
    catalogLink="/catalog/manufacturer/teko"
    badgeText="Официальный дилер"
    sectionBgClass="bg-gray-50 dark:bg-gray-900"
  />
);

export const FlexemSection: React.FC = () => (
  <ProductSection
    slides={flexemSlides}
    brandName="FLEXEM"
    brandLogoUrl="/images/logos/flexem-logo-white.png"
    brandTagline="Инновационные Решения"
    description="Современное оборудование FLEXEM для автоматизации и управления. Надежные HMI-панели и IoT-решения для промышленности и бизнеса в Казахстане."
    catalogLink="/catalog/manufacturer/flexem"
    badgeText="Официальный дистрибьютор"
    sectionBgClass="bg-white dark:bg-gray-800"
  />
);

export const AntSection: React.FC = () => (
  <ProductSection
    slides={antSlides}
    brandName="ANT"
    brandLogoUrl="/images/logos/teko-logo.svg"
    brandTagline="Сетевое Оборудование"
    description="Профессиональные решения ANT для создания надежных и масштабируемых сетевых инфраструктур."
    catalogLink="/catalog/manufacturer/ant"
    badgeText="Сетевые решения"
    sectionBgClass="bg-gray-50 dark:bg-gray-900"
  />
);
