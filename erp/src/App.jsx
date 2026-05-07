import { BrowserRouter, Routes, Route } from "react-router-dom"
import { DashboardLayout } from "./pages/layout/DashboardLayout"
import HomePage from "./pages/Dashboard"
import InboxPage from "./pages/InboxPage"
import CalendarPage from "./pages/CalendarPage"
import SearchPage from "./pages/SearchPage"
import SettingsPage from "./pages/SettingsPage"
import PrintingSettings from "./pages/PrintingSettings"
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
import ListCustomer from "./pages/customer/ListCustomer";
import ListDepartment from "./pages/department/ListDepartment";
import ListBranch from "@/pages/branch/ListBranch";
import ListSupplier from "@/pages/supplier/ListSupplier.jsx";
import AddEmployee from "@/pages/employee/AddEmployee.jsx";
import ListEmployee from "@/pages/employee/ListEmployee.jsx";
import AddSubCategory from "@/pages/subcategory/AddSubCategory.jsx";
import ListSubCategories from "@/pages/subcategory/ListSubCategory.jsx";
import AddPurchase from "./pages/purchase/AddPurchase";
import ListPurchase from "./pages/purchase/ListPurchase";
import AddStore from "@/pages/store/AddStore";
import ListStore from "@/pages/store/ListStore";
import AddBank from "@/pages/bank/AddBank";
import ListBank from "@/pages/bank/ListBank";
import StockAdjustment from "@/pages/stock/StockAdjustment";



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
                    <Route path="admin/settings/general" element={<SettingsPage />} />
                    <Route path="admin/settings/printing" element={<PrintingSettings />} />


                    {/* product */}
                    <Route path="/products/add/*" element={<AddProduct/>} />
                    <Route path="/products/list/*" element={<ListProduct/>} />

                    {/* brand */}
                    <Route path="/brand/add/*" element={<AddBrand/>} />
                    <Route path="/brand/list/*" element={<ListBrand/>} />

                    {/* category */}
                    <Route path="/category/add/*" element={<AddCategory/>} />
                    <Route path="/category/list/*" element={<ListCategory/>} />

                    {/* sub category */}
                    <Route path="/subcategory/add*" element={<AddSubCategory/>} />
                    <Route path="/subcategory/list*" element={<ListSubCategories/>} />

                    {/* branch */}
                    <Route path="/branch/add/*" element={<AddBranch/>} />
                    <Route path="/branch/list/*" element={<ListBranch/>} />

                    {/* department */}
                    <Route path="/department/add/*" element={<AddDepartment/>} />
                    <Route path="/department/list/*" element={<ListDepartment/>} />

                    {/* customer */}
                    <Route path="/customer/add/*" element={<AddCustomer/>} />
                    <Route path="/customer/list/*" element={<ListCustomer/>} />

                    {/* supplier */}
                    <Route path="/supplier/add/*" element={<AddSupplier/>} />
                    <Route path="/supplier/list/*" element={<ListSupplier/>} />

                    {/*employee*/}
                    <Route path="/employee/add/*" element={<AddEmployee/>} />
                    <Route path="/employee/list/*" element={<ListEmployee/>} />

                    {/* purchase */}
                    <Route path="/purchases/add/*" element={<AddPurchase/>} />
                    <Route path="/purchases/list/*" element={<ListPurchase/>} />

                    {/* stock */}
                    <Route path="/stock/adjustment" element={<StockAdjustment/>} />

                    {/*store*/}
                    <Route path="/store/add/*" element={<AddStore/>} />
                    <Route path="/store/list/*" element={<ListStore/>} />

                    {/*bank*/}
                    <Route path="/bank/add/*" element={<AddBank/>} />
                    <Route path="/bank/list/*" element={<ListBank/>} />

                </Route>
                <Route path="/login" element={<Login/>}/>
            </Routes>
        </BrowserRouter>
        </AuthProvider>
    )
}

export default App