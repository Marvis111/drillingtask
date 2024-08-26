import { BrowserRouter,Routes, Route } from 'react-router-dom';
import React from 'react'
import Test from '../screens/Test';
import HomeScreen from '../screens/Home';

export default function WebRoute() {
  return (
    <BrowserRouter >
    <Routes>
        <Route path='/' element={<HomeScreen  />} />
    </Routes>
    </BrowserRouter>
  )
}
