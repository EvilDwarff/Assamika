import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "./common/Layout";
import NewArrivals from "./common/NewArrivals";
import { apiUrl, apiPhoto } from "@components/common/http";

const money = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return v ?? "-";
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
};

const ProductPage = () => {
  const { id } = useParams();

  // product from API
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // slider state
  const [idx, setIdx] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [direction, setDirection] = useState(""); // "left" | "right"
  const [autoPlay, setAutoPlay] = useState(true);

  // cart UI state (пока локально как у тебя)
  const [quantity, setQuantity] = useState(1);
  const [inCart, setInCart] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleAddToCart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setInCart(true);
      setIsAnimating(false);
    }, 200);
  };

  // fetch product
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/products/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Ошибка загрузки товара");
        setProduct(data.data);
        setIdx(0);
        setAutoPlay(true);
      } catch (e) {
        console.error(e);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // build images array from API:
  // - prefer gallery images
  // - include main image if exists and not duplicated
  const images = useMemo(() => {
    if (!product) return [];
    const list = [];

    // 1) main image first (если есть)
    if (product.image) list.push(`${apiPhoto}/${product.image}`);

    // 2) gallery images
    if (Array.isArray(product.images)) {
      for (const im of product.images) {
        if (!im?.image) continue;
        const url = `${apiPhoto}/${im.image}`;
        if (!list.includes(url)) list.push(url);
      }
    }

    return list;
  }, [product]);

  // sold out condition
  const soldOut = useMemo(() => {
    if (!product) return false;
    return product.status === "sold_out" || Number(product.reserve) <= 0;
  }, [product]);

  // pricing
  const hasDiscount = useMemo(() => {
    if (!product) return false;
    const dp = product.discount_price;
    return dp !== null && dp !== undefined && dp !== "" && Number(dp) > 0 && Number(dp) < Number(product.price);
  }, [product]);

  const finalPrice = useMemo(() => {
    if (!product) return null;
    return hasDiscount ? Number(product.discount_price) : Number(product.price);
  }, [product, hasDiscount]);

  const discountPercent = useMemo(() => {
    if (!product || !hasDiscount) return null;
    const p = Number(product.price);
    const dp = Number(product.discount_price);
    if (!p || !dp) return null;
    return Math.round(((p - dp) / p) * 100);
  }, [product, hasDiscount]);

  // autoplay slider
  useEffect(() => {
    if (!autoPlay) return;
    if (!images.length) return;

    const timer = setInterval(() => {
      setDirection("left");
      setIdx((i) => (i + 1) % images.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [images.length, autoPlay, images]);

  // swipe handlers
  const onTouchStart = (e) => {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setTouchStart(x);
  };

  const onTouchEnd = (e) => {
    if (touchStart === null) return;
    setAutoPlay(false);

    const x = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const diff = touchStart - x;

    if (Math.abs(diff) > 40 && images.length) {
      setDirection(diff > 0 ? "left" : "right");
      diff > 0
        ? setIdx((i) => (i + 1) % images.length)
        : setIdx((i) => (i - 1 + images.length) % images.length);
    }

    setTouchStart(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-500">
          Загрузка...
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-gray-500">
          Товар не найден
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-4 md:pt-8 pb-12 md:pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Левая часть — Слайдер */}
            <div className="w-full lg:w-1/2 flex flex-col items-center select-none">
              <div
                className="w-full max-w-md aspect-square overflow-hidden bg-bg-base rounded-none shadow relative"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                onMouseDown={onTouchStart}
                onMouseUp={onTouchEnd}
              >
                {images.length ? (
                  <img
                    key={idx}
                    src={images[idx]}
                    alt={product.name}
                    className={`w-full h-full object-contain absolute inset-0 transition-all duration-700 ease-in-out
                      ${direction === "left" ? "animate-slideLeft" : "animate-slideRight"}`}
                    draggable={false}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    Нет фото
                  </div>
                )}

                {/* Бейдж скидки на фото */}
                {hasDiscount && discountPercent !== null ? (
                  <div className="absolute top-3 left-3 bg-orange-600 text-white text-sm px-3 py-1 rounded-full shadow">
                    -{discountPercent}%
                  </div>
                ) : null}

                {/* Бейдж распродано */}
                {soldOut ? (
                  <div className="absolute top-3 right-3 bg-red-600 text-white text-sm px-3 py-1 rounded-full shadow">
                    Распродано
                  </div>
                ) : null}
              </div>

              {/* Миниатюры */}
              {images.length > 1 && (
                <div className="flex justify-center gap-3 mt-4 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={img}
                      onClick={() => {
                        setAutoPlay(false);
                        setDirection(index > idx ? "left" : "right");
                        setIdx(index);
                      }}
                      className={`w-16 h-16 sm:w-20 sm:h-20 border-2 rounded-md overflow-hidden ${
                        idx === index ? "border-orange-600" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt={`thumb-${index}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Правая часть — Информация */}
            <div className="w-full lg:w-1/2 text-text">
              <h1 className="title mb-4">{product.name}</h1>

              {/* Цена + вес */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-lg md:text-[32px]">
                {hasDiscount ? (
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-medium text-orange-700">{money(finalPrice)}</span>
                    <span className="text-gray-500 line-through text-lg md:text-2xl">
                      {money(product.price)}
                    </span>
                  </div>
                ) : (
                  <p className="font-medium">{money(product.price)}</p>
                )}

                {product.weight ? (
                  <p className="font-medium text-base md:text-2xl">Вес: {product.weight}</p>
                ) : null}
              </div>

              {/* Описание */}
              {product.description ? (
                <div className="text-base text-justify sm:text-md mb-8 leading-relaxed max-w-prose">
                  <p>{product.description}</p>
                </div>
              ) : null}

              {/* Кнопка / счетчик / распродано */}
              <div
                className={`transition-all duration-500 ease-in-out transform ${
                  isAnimating ? "scale-95 opacity-0" : "scale-100 opacity-100"
                }`}
              >
                {soldOut ? (
                  <div className="inline-flex items-center gap-3 bg-red-50 text-red-700 border border-red-200 px-6 py-4">
                    Товар распродан
                  </div>
                ) : !inCart ? (
                  <button
                    onClick={handleAddToCart}
                    className="bg-orange-600 hover:bg-orange-700 text-white uppercase px-10 py-4 text-lg transition-colors"
                  >
                    В корзину
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
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
                    <button className="bg-gray-400 text-white px-8 py-3 uppercase text-lg transition-colors">
                      В корзине
                    </button>
                  </div>
                )}
              </div>

              {/* Наличие */}
              <div className="mt-6 text-sm text-gray-600">
                {soldOut ? (
                  <span className="text-red-700 font-medium">Нет в наличии</span>
                ) : (
                  <span className="text-green-700 font-medium">В наличии: {product.reserve}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewArrivals />
    </Layout>
  );
};

export default ProductPage;
