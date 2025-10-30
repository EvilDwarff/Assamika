import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './components/Home';
import CatalogPage from './components/Catalog';
import ProductPage from './components/ProductPage';
import CartPage from './components/CartPage';
import Login from './components/admin/Login';
import { ToastContainer } from 'react-toastify';
import Dashboard from './components/admin/Dashboard';
import { AdminRequireAuth } from './components/admin/AdminRequireAuth';

function App() {


  return (
    <>

      <BrowserRouter>
        <Routes>
           <Route path='/' element={<Home />} />
           <Route path='/catalog' element={<CatalogPage />} />
           <Route path='/product' element={<ProductPage />} />
           <Route path='/cart' element={<CartPage />} />
           <Route path='/admin/login' element={<Login />} />







          {/* Admin Routs */}
          <Route path='/admin/dashboard' element={
            <AdminRequireAuth>
              <Dashboard />
            </AdminRequireAuth>
          } />

        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </>
  )
}

export default App
