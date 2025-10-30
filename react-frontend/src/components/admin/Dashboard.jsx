
import React, { useContext } from 'react'
import { AdminAuthContext } from '../context/AdminAuth'

const Dashboard = () => {
    const { logout } = useContext(AdminAuthContext);
  return (
    <>
    <div>Dashboard</div>
    <a href="#" onClick={logout}>Logout</a>
    </>
  )
}

export default Dashboard