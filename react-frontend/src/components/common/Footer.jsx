import { Link } from "react-router-dom"

export default function Footer() {
    const navItems = [
        { name: 'О НАС', href: '/#about' },
        { name: 'КАТАЛОГ', href: '/catalog' },
        { name: 'НОВИНКИ', href: '/#news' },
        { name: 'ПАРТНЕРАМ', href: '/#partners' },
    ]

    return (
        <footer className="bg-bg-block border-t border-gray-200">
            <div className="container mx-auto px-4 py-6">
                {/* Десктоп версия */}
                <div className="hidden lg:flex justify-between items-center"> {/* Изменено на items-center */}
                    {/* Логотип и название */}
                    <div className="flex items-center space-x-3">
                        <img src="/logo.svg" alt="Логотип" className="h-10 w-auto" />
                        <span className="text-xl font-prosto text-text">Ассамика</span>
                    </div>

                    {/* Навигация - выровнена по центру */}
                    <nav className="flex space-x-8">
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

                    {/* Контакты с иконками */}
                    <div className="flex flex-col space-y-2">
                        <span className="text-text font-montserrat mb-2">КОНТАКТЫ</span>
                        
                        {/* Email */}
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span className="text-text font-montserrat text-sm">email@example.com</span>
                        </div>
                        
                        {/* Телефон */}
                        <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            <a 
                                href="tel:+989173038406" 
                                className="text-text font-montserrat text-sm hover:text-primary transition-colors"
                            >
                                +98 917 303 8406
                            </a>
                        </div>
                    </div>
                </div>

                {/* Мобильная версия */}
                <div className="lg:hidden">
                    <div className="flex flex-col items-center space-y-4">
                        {/* Логотип и название */}
                        <div className="flex items-center space-x-3">
                            <img src="/logo.svg" alt="Логотип" className="h-8 w-auto" />
                            <span className="text-lg font-prosto text-text">Ассамика</span>
                        </div>

                        {/* Контакты - вертикальное расположение */}
                        <div className="flex flex-col items-center space-y-3">
                            {/* Телефон */}
                            <a 
                                href="tel:+989173038406" 
                                className="flex items-center space-x-2 text-text font-montserrat hover:text-primary transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>+98 917 303 8406</span>
                            </a>
                            
                            {/* Email */}
                            <a 
                                href="mailto:email@example.com" 
                                className="flex items-center space-x-2 text-text font-montserrat hover:text-primary transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>email@example.com</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Нижняя часть */}
                <div className="border-t border-gray-200 mt-6 pt-4 text-center">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Ассамика. Все права защищены.
                    </p>
                </div>
            </div>
        </footer>
    )
}