import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const Layout = () => {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Sidebar/>
      <div className="flex-1 bg-zinc-800 p-4 overflow-auto">
        <Outlet/>
      </div>
    </div>
  )
}

export default Layout