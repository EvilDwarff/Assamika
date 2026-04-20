import { useState, useEffect } from 'react'
import { Link } from "react-router-dom"
import PersonIcon from '../../assets/img/Icons/Person.svg'
import CartIcon from '../../assets/img/Icons/local_mall.svg'
import Logo from '../../assets/logo.svg';
import { apiUrl, userToken } from '@components/common/http';

// Создаём глобальный объект событий для корзины
export const cartEvents = new EventTarget();
export const CART_UPDATED_EVENT = 'cart:updated';

//  Глобальная функция для обновления корзины из любого места
export const refreshCartBadge = () => {
    cartEvents.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT));
};

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [cartQuantity, setCartQuantity] = useState(0)

    // Загрузка количества товаров в корзине
    useEffect(() => {
        fetchCartQuantity()

        // Подписка на событие обновления корзины
        const handleCartUpdate = () => fetchCartQuantity();
        cartEvents.addEventListener(CART_UPDATED_EVENT, handleCartUpdate);

        return () => {
            cartEvents.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate);
        }
    }, [])

    const fetchCartQuantity = async () => {
        try {
           const res = await fetch(`${apiUrl}/cart/quantity`, {
                headers: {
                    Authorization: `Bearer ${userToken()}`,
                },
            });
                          
            if (res.ok) {
                const data = await res.json()
                setCartQuantity(data.quantity)
            }
        } catch (error) {
            console.error('Ошибка получения корзины:', error)
        }
    }
   
    const navItems = [
        { name: 'О НАС', href: '/#about' },
        { name: 'КАТАЛОГ', href: '/catalog' },
        { name: 'НОВИНКИ', href: '/#news' },
        { name: 'ПАРТНЕРАМ', href: '/#partners' },
    ]

    // Компонент бейджа корзины (переиспользуемый)
    const CartBadge = () => (
        <div className="relative">
            <img src={CartIcon} width={32} height={32} alt="Корзина" />
            {cartQuantity > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] animate-pulse-once">
                    {cartQuantity > 99 ? '99+' : cartQuantity}
                </span>
            )}
        </div>
    )

    return (
        <header className="bg-bg-block sticky top-0 left-0 w-full z-50 shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Логотип */}
                <Link to="/">
                    <div className="flex items-center space-x-3">
                        <img 
                            src={Logo} 
                            alt="Логотип" 
                            className="h-10 w-auto" 
                            style={{ WebkitUserDrag: 'none' }}
                            draggable="false" 
                        />
                        <span className="text-xl font-prosto text-text">Ассамика</span>
                    </div>
                </Link>

                {/* Меню (десктоп) */}
                <nav className="hidden md:flex space-x-8">
                    {navItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className="text-text font-montserrat hover:text-primary transition-colors"
                        >
                            {item.name}
                        </a>
                    ))}
                </nav>

                {/* Иконки (десктоп) */}
                <div className="hidden md:flex items-center space-x-4">
                    <Link className="ms-3" to="/account">
                        <img src={PersonIcon} width={32} height={32} alt="Профиль" />
                    </Link>

                    <Link className="ms-3 cart-bucket" to="/cart">
                        <CartBadge />
                    </Link>
                </div>

                {/* Кнопка бургера */}
                <button
                    className="md:hidden flex items-center justify-center w-8 h-8 focus:outline-none z-53 relative"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Меню"
                >
                    <div className="relative w-6 h-6 flex flex-col justify-between items-center">
                        <span className={`absolute top-0 left-0 w-full h-[2px] bg-black transition-all duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 top-1/2 -translate-y-1/2' : ''}`}></span>
                        <span className={`absolute top-1/2 -translate-y-1/2 left-0 w-full h-[2px] mb-[2px] bg-black transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                        <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-black transition-all duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 top-1/2 -translate-y-1/2' : ''}`}></span>
                    </div>
                </button>
            </div>

            {/* Затемнение фона */}
            <div
                className={`fixed inset-0 bg-black/40 transition-opacity duration-300 z-51 md:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            {/* Мобильное меню */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-bg-base border-r border-gray-200 p-6 transform transition-transform duration-300 md:hidden z-52 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <nav className="space-y-4 mt-8">
                    {navItems.map((item, i) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className="block text-text hover:text-primary text-lg transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                            style={{ transitionDelay: `${i * 50}ms` }}
                        >
                            {item.name}
                        </a>
                    ))}
                </nav>

                <div className="flex space-x-6 mt-8">
                    <Link className="ms-3" to="/account">
                        <img src={PersonIcon} width={32} height={32} alt="Профиль" />
                    </Link>

                    <Link className="ms-3 cart-bucket" to="/cart">
                        <CartBadge />
                    </Link>
                </div>
            </div>
        </header>
    )
}