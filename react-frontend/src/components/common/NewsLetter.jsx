import React from 'react';

const NewsLetter = () => {
    return (
        <section className="bg-bg-block py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-12">
                    {/* Текст */}
                    <h2 className="text-base sm:text-lg md:text-xl text-text text-center md:text-left">
                        Узнавайте о скидках первыми!
                    </h2>

                    {/* Форма */}
                    <form className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto max-w-md md:max-w-xl">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full sm:w-[280px] md:w-[320px] h-[50px] md:h-[60px] px-4 border border-gray-300 text-text rounded-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                            type="submit"
                            className="w-full sm:w-auto  btn btn-primary text-white uppercase px-8 h-[50px] md:h-[60px] rounded-none transition-colors duration-200 flex items-center justify-center tracking-wider"
                        >Отправить</button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default NewsLetter;
