import React from 'react'
import LandingImage2 from '../../assets/img/LandingImage2.png'
const Suppliers = () => {
  return (
     <div id="partners" className="container mx-auto px-1 sm:px-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-20 md:py-40 items-center">
            
                <div className="col-span-1 md:col-span-7 flex flex-col items-start gap-6 md:px-0">
                    <div className="col-span-1 md:col-span-7 flex flex-col items-start gap-6 md:px-0 text-center md:text-left">
                        <h1 className="title">
                            Партнерам
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl text-justify">
                           Магазин Ассамика открыт для сотрудничества с производителями и дистрибьюторами товаров из Казахстана. Мы стремимся предлагать нашим покупателям только качественные и натуральные продукты, поэтому тщательно выбираем партнеров.
                        </p>

                        <p className="text-lg sm:text-xl md:text-2xl text-left">
                          Для связи с нами: partners@assamika.ru
                        </p>
                        
                     
                    </div>
                </div>
                <div className="col-span-1 lg:col-span-5 flex">
                    <img
                        src={LandingImage2}
                        alt="LamdingImage"
                        className="hidden lg:block max-w-full h-auto"
                    />
                </div>


            </div>
        </div>
  )
}

export default Suppliers