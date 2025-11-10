import { BrowserRouter, Routes, Route } from "react-router-dom"
import { DashboardLayout } from "./pages/layout/DashboardLayout"
import HomePage from "./pages/Dashboard"
import InboxPage from "./pages/InboxPage"
import CalendarPage from "./pages/CalendarPage"
import SearchPage from "./pages/SearchPage"
import SettingsPage from "./pages/SettingsPage"
import AddProduct from "./pages/product/AddProduct"
import ListProduct from "./pages/product/ListProduct"
import { Toaster } from "@/components/ui/sonner"
import Login from "./pages/auth/login"

function App() {
  return (
    <BrowserRouter>
     <Toaster />
      <Routes>
        
        <Route path="/" element={<DashboardLayout />}>
        
          <Route index element={<HomePage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="settings" element={<SettingsPage />} />
          
          
          {/* product */}
          <Route path="/products/add*" element={<AddProduct/>} />
          <Route path="/products/list*" element={<ListProduct/>} />
        </Route>
        <Route path="/login" element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
