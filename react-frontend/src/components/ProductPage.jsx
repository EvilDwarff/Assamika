import React, { useState } from "react";
import Header from "./common/Header";
import Footer from "./common/Footer";
import Image1 from "../assets/img/products/image1.webp";
import Image2 from "../assets/img/products/image2.webp";
import Image3 from "../assets/img/products/image3.webp";
import NewArrivals from "./common/NewArrivals";

const ProductPage = () => {
    const [selectedImage, setSelectedImage] = useState(Image1);
    const [quantity, setQuantity] = useState(1);
    const [inCart, setInCart] = useState(false);

    const [isAnimating, setIsAnimating] = useState(false);

    const images = [Image1, Image2, Image3, Image1];

    const increaseQuantity = () => setQuantity((q) => q + 1);
    const decreaseQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

    const handleAddToCart = () => {
        setIsAnimating(true);
        setTimeout(() => {
            setInCart(true);
            setIsAnimating(false);
        }, 200);
    };

    return (
        <>
            <Header />
            <section className=" pt-24 md:pt-28 pb-12 md:pb-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Основной контейнер */}
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">

                        {/* Левая часть — Слайдер */}
                        <div className="w-full lg:w-1/2 flex flex-col items-center">
                            {/* Основное изображение */}
                            <div className="w-full max-w-md aspect-square overflow-hidden rounded-none shadow">
                                <img
                                    src={selectedImage}
                                    alt="Товар"
                                    className="w-full h-full object-contain"
                                />
                            </div>

                            {/* Миниатюры */}
                            <div className="flex justify-center gap-3 mt-4 overflow-x-auto">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(img)}
                                        className={`w-16 h-16 sm:w-20 sm:h-20 border-2 rounded-md overflow-hidden ${selectedImage === img
                                                ? "border-orange-600"
                                                : "border-transparent"
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`thumb-${index}`}
                                            className="w-full h-full object-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Правая часть — Информация */}
                        <div className="w-full lg:w-1/2 text-text">
                            <h1 className="title mb-4">
                                Чай чёрный "NAYRYZ" гранулированный
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 mb-6 text-[28px] md:text-[32px] lg:text-[36px] text-lg">
                                <p className="font-medium">227 ₽</p>
                                <p className="font-medium">Вес: 250 гр</p>
                            </div>

                            <div className="text-base sm:text-md mb-8 leading-relaxed max-w-prose">
                                <p>
                                    Чёрный байховый листовой чай с выраженным вкусом и ароматом.
                                    Он идеально подходит тем, кто предпочитает пить чай без
                                    молока. Его вкус обладает насыщенностью и терпкостью, но без
                                    горечи. Чай "NAYRYZ" — не просто вкусный и бодрящий, но и
                                    полезный. В нём содержится достаточное количество кофеина,
                                    который стимулирует работу мозга и способствует наполнению
                                    энергией. Обладает антиоксидантными свойствами.
                                </p>
                            </div>

                            {/* Кнопка / счётчик */}
                            <div
                                className={`transition-all duration-500 ease-in-out transform ${isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
                                    }`}
                            >
                                {!inCart ? (
                                    <button
                                        onClick={handleAddToCart}
                                        className="bg-orange-600 hover:bg-orange-700 text-white uppercase px-10 py-4 text-lg transition-colors"
                                    >
                                        В корзину
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center border border-gray-300 text-lg">
                                            <button
                                                onClick={decreaseQuantity}
                                                className="px-4 py-2 font-bold hover:bg-gray-100"
                                            >
                                                –
                                            </button>
                                            <span className="px-6">{quantity}</span>
                                            <button
                                                onClick={increaseQuantity}
                                                className="px-4 py-2 font-bold hover:bg-gray-100"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 uppercase text-lg transition-colors">
                                            В корзине
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <NewArrivals />
            <Footer />
        </>
    );
};

export default ProductPage;
