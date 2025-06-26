import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingCart, 
  User, 
  MapPin, 
  CheckCircle,
  Loader2,
  Phone,
  Mail,
  Package,
  ArrowLeft
} from 'lucide-react';

// Типы для товаров в корзине
interface CartItem {
  id: string | number;
  name: string;
  price: number | string;
  quantity: number;
  image?: string;
  size?: string;
}

// Простая форма
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

const CheckoutPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Алматы',
    notes: ''
  });

  // Загружаем корзину из localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart.items || parsedCart || []);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  const total = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Простая валидация
    const requiredFields: (keyof FormData)[] = ['firstName', 'lastName', 'email', 'phone', 'address'];
    const missing = requiredFields.filter(field => !formData[field].trim());
    
    if (missing.length > 0) {
      alert(`Заполните обязательные поля: ${missing.join(', ')}`);
      return;
    }

    if (cartItems.length === 0) {
      alert('Корзина пуста');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Подготавливаем данные заказа
      const orderData = {
        customer: formData,
        items: cartItems,
        total: total,
        createdAt: new Date().toISOString()
      };

      console.log('Order data:', orderData);
      
      // Имитация отправки заказа
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Очищаем корзину
      localStorage.removeItem('cart');
      
      // Показываем успех
      setOrderSuccess(true);
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Ошибка при оформлении заказа');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-lg text-slate-600">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-8 bg-white rounded-2xl shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Заказ оформлен!</h2>
            <p className="text-slate-600 mb-6">Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Вернуться на главную
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-orange-100 rounded-full">
                <ShoppingCart className="w-12 h-12 text-orange-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Корзина пуста</h2>
            <p className="text-slate-600 mb-6">Добавьте товары в корзину перед оформлением заказа</p>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Вернуться к покупкам
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <motion.div 
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Заголовок */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Оформление заказа</h1>
          <p className="text-slate-600">Заполните форму для завершения покупки</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Форма */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Контактная информация</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Имя *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Иван"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Фамилия *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Иванов"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="ivan@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="+7 (700) 123-45-67"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-8 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Адрес доставки</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Адрес *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="ул. Абая, д. 123, кв. 45"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Город *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Комментарий</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Дополнительные пожелания..."
                />
              </div>
            </div>
          </div>

          {/* Корзина */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Ваш заказ</h2>
            </div>

            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
              {cartItems.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg"
                >
                  <div className="w-16 h-16 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 truncate">{item.name}</h3>
                    <p className="text-sm text-slate-600">Количество: {item.quantity}</p>
                    {item.size && <p className="text-xs text-slate-500">Размер: {item.size}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">
                      {((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity).toLocaleString()} ₸
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Итого:</span>
                <span className="text-blue-600">{total.toLocaleString()} ₸</span>
              </div>
            </div>

            <div className="space-y-3">
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Оформление...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Оформить заказ
                  </>
                )}
              </motion.button>

              <button
                onClick={() => window.history.back()}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Вернуться к корзине
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;