import { useState } from 'react'
import { Link } from "react-router-dom"
import FeatherIcon from "feather-icons-react"


export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const navItems = [
        { name: 'О НАС', href: '/about' },
        { name: 'КАТАЛОГ', href: '/catalog' },
        { name: 'НОВИНКИ', href: '/news' },
        { name: 'ПАРТНЕРАМ', href: '/partners' },
    ]

    return (
        <header className="bg-bg-block fixed top-0 left-0 w-full z-50 shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Логотип */}
                <div className="flex items-center space-x-3">
                    <img src="/logo.svg" alt="Логотип" className="h-10 w-auto" />
                    <span className="text-xl font-prosto text-text">Ассамика</span>
                </div>

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
                    <Link to={`/profile`}>
                        <FeatherIcon
                            icon="user"
                            strokeWidth={2.3}
                            className="text-text-title w-9 h-auto active:opacity-90 hover:text-primary transition-all duration-100"
                        />
                    </Link>
                    <Link to={`/cart`}>
                        <FeatherIcon
                            icon="shopping-cart"
                            strokeWidth={2.3}
                            className="text-text-title w-9 h-auto active:opacity-90 hover:text-primary transition-all duration-300"
                        />
                    </Link>
                </div>

                {/* Кнопка бургера (мобильная версия) */}
                <button
                    className="md:hidden flex items-center justify-center w-8 h-8 focus:outline-none z-53 relative"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Меню"
                >
                    <div className="relative w-6 h-6 flex flex-col justify-between items-center">
                        <span
                            className={`absolute  top-0 left-0 w-full h-[2px] bg-black transition-all duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 top-1/2 -translate-y-1/2' : ''
                                }`}
                        ></span>
                        <span
                            className={`absolute top-1/2 -translate-y-1/2  left-0 w-full h-[2px] mb-[2px] bg-black transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : 'opacity-100'
                                }`}
                        ></span>
                        <span
                            className={`absolute bottom-0 left-0 w-full h-[2px] bg-black transition-all duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 top-1/2 -translate-y-1/2' : ''
                                }`}
                        ></span>
                    </div>
                </button>
            </div>

            {/* Затемнение фона */}
            <div
                className={`fixed inset-0 bg-black/40 transition-opacity duration-300 z-51 md:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setIsMenuOpen(false)}
            ></div>

            {/* Мобильное меню (слева) */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-bg-base border-r border-gray-200 p-6 transform transition-transform duration-300 md:hidden z-52 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
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
                    <Link to={`/profile`} onClick={() => setIsMenuOpen(false)}>
                        <FeatherIcon
                            icon="user"
                            strokeWidth={2.3}
                            className="text-text-title w-7 h-auto hover:text-primary transition-all"
                        />
                    </Link>
                    <Link to={`/cart`} onClick={() => setIsMenuOpen(false)}>
                        <FeatherIcon
                            icon="shopping-cart"
                            strokeWidth={2.3}
                            className="text-text-title w-7 h-auto hover:text-primary transition-all"
                        />
                    </Link>
                </div>
            </div>
        </header>
    )
}
