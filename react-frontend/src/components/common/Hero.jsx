import React from 'react'
import { Link } from "react-router";
import LandingImage from '../../assets/img/LandinImage.png'

const Hero = () => {
    return (
        <div id="about" className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 py-20 md:py-30 items-center">
                <div className="col-span-1 lg:col-span-5 flex">
                    <img
                        src={LandingImage}
                        alt="LamdingImage"
                        className="hidden lg:block max-w-full h-auto"
                    />
                </div>
                <div className="col-span-1 md:col-span-7 flex flex-col items-start gap-6 md:px-0">
                    <div className="col-span-1 md:col-span-7 flex flex-col items-start gap-6 md:px-0 text-left">
                        <h1 className="title">
                            Ассамика — вкус Казахстана в&nbsp;каждом доме
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl text-justify">
                            Наш магазин — это пространство, где оживают казахские традиции. Мы предлагаем различные товары от лучших производителей страны, чтобы вы могли почувствовать тепло и энергию родной земли.
                            Здесь каждый найдет свой вкус: от бодрящего чая до натуральной муки для домашней выпечки.
                        </p>

                        {/* Кнопка по центру */}
                        <div className="w-full flex justify-center mt-2">
                            <Link
                                to={`catalog`}
                                className="btn btn-primary w-auto"
                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            >
                                ПОСМОТРЕТЬ ТОВАРЫ
                            </Link>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
}

export default Hero