import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

const MainLayout = ({children}) => {
  return (
    <div className='min-h-screen w-full' >
        <Navbar />
        <Outlet />
    </div>
  )
}

export default MainLayout