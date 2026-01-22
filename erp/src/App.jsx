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
import {AuthProvider} from "./Context/AuthContext"
import AddBrand from "@/pages/brand/AddBrand";
import ListBrand from "@/pages/brand/ListBrand";
import AddCategory from "@/pages/category/AddCategory";
import ListCategory from "@/pages/category/ListCategory";
import AddBranch from "@/pages/branch/AddBranch";
import AddDepartment from "@/pages/department/AddDepartment";
import AddCustomer from "@/pages/customer/AddCustomer.jsx";
import AddSupplier from "@/pages/supplier/AddSupplier.jsx";
// import ListBranch from "@/pages/branch/ListBranch";


function App() {
    return (
        <AuthProvider>
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

                    {/* brand */}
                    <Route path="/brand/add*" element={<AddBrand/>} />
                    <Route path="/brand/list*" element={<ListBrand/>} />

                    {/* category */}
                    <Route path="/category/add*" element={<AddCategory/>} />
                    <Route path="/category/list*" element={<ListCategory/>} />

                    {/* branch */}
                    <Route path="/branch/add*" element={<AddBranch/>} />


                    {/* department */}
                    <Route path="/department/add*" element={<AddDepartment/>} />

                    {/* customer */}
                    <Route path="/customer/add*" element={<AddCustomer/>} />

                    {/* supplier */}
                    <Route path="/supplier/add*" element={<AddSupplier/>} />


                </Route>
                <Route path="/login" element={<Login/>}/>
            </Routes>
        </BrowserRouter>
        </AuthProvider>
    )
}

export default App