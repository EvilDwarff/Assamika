import React from 'react'
import AdminHeader from '@components/admin/common/AdminHeader'

function AdminLayout({ children }) {
    return (
        <div className='min-h-screen flex flex-col'>
            <AdminHeader />

            <div className='flex-1'>{children}</div>


        </div>
    )
}

export default AdminLayout