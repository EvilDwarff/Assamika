import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './components/Home';
import CatalogPage from './components/Catalog';
import ProductPage from './components/ProductPage';
import CartPage from './components/CartPage';

function App() {


  return (
    <>
      <BrowserRouter>
        <Routes>
           <Route path='/' element={<Home />} />
           <Route path='/catalog' element={<CatalogPage />} />
           <Route path='/product' element={<ProductPage />} />
           <Route path='/cart' element={<CartPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
