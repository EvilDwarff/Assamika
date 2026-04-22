
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "./common/Hero";
import Advantages from "./common/Advantage";
import NewArrivals from "./common/NewArrivals";
import NewsLetter from "./common/NewsLetter";
import Suppliers from "./common/Suppliers";
import Layout from "./common/Layout";

const Home = () => {
useEffect(() => {
    const hash = location.hash;
    if (!hash) return;

    // Функция для попытки скролла
    const tryScroll = (retries = 5) => {
        const element = document.querySelector(hash);
        
        if (element) {
            // Элемент найден — скроллим
            setTimeout(() => {
                element.scrollIntoView({ behavior: "smooth" });
                window.history.replaceState(null, "", window.location.pathname + window.location.search);
            }, 100);
        } else if (retries > 0) {
            // Если элемента еще нет (React не отрисовал), пробуем снова через 100мс
            setTimeout(() => tryScroll(retries - 1), 100);
        }
    };

    tryScroll();
}, [location]);




    return (
        <Layout>
            <Hero />
            <Advantages />
            <NewArrivals />
            <NewsLetter />
            <Suppliers />
        </Layout>
    )
}

export default Home