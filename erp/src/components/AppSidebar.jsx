import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { 
  Home, 
  Package, 
  ShoppingCart, 
  RotateCcw, 
  BarChart3, 
  PackageSearch, 
  TrendingUp, 
  BookOpen, 
  CreditCard, 
  Receipt, 
  Users, 
  KeyRound, 
  Settings,
  Plus,
  List,
  ChevronDown,
  ChevronRight,
  LogOut,
  ArrowRightLeft
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useState } from "react"

const menuItems = [
  {
    title: "Master File",
    items: [
      { 
        title: "Products", 
        url: "/products", 
        icon: Package,
        subItems: [
          { title: "Add Product", url: "/products/add", icon: Plus },
          { title: "Product List", url: "/products/list", icon: List },
        ]
      },
      { 
        title: "Category", 
        url: "/category", 
        icon: Package,
        subItems: [
          { title: "Add Category", url: "/category/add", icon: Plus },
          { title: "Category List", url: "/category/list", icon: List },
        ]
      },
      { 
        title: "Brand", 
        url: "/brand", 
        icon: Package,
        subItems: [
          { title: "Add Brand", url: "/brand/add", icon: Plus },
          { title: "Brand List", url: "/brand/list", icon: List },
        ]
      },
      { 
        title: "Branch", 
        url: "/branch", 
        icon: Package,
        subItems: [
          { title: "Add Branch", url: "/branch/add", icon: Plus },
          { title: "Branch List", url: "/branch/list", icon: List },
        ]
      },
      { 
        title: "Department", 
        url: "/department", 
        icon: Package,
        subItems: [
          { title: "Add Department", url: "/department/add", icon: Plus },
          { title: "Department List", url: "/department/list", icon: List },
        ]
      },
      { 
        title: "Customer", 
        url: "/customer", 
        icon: Users,
        subItems: [
          { title: "Add Customer", url: "/customer/add", icon: Plus },
          { title: "Customer List", url: "/customer/list", icon: List },
        ]
      },
      { 
        title: "Supplier", 
        url: "/supplier", 
        icon: Users,
        subItems: [
          { title: "Add Supplier", url: "/supplier/add", icon: Plus },
          { title: "Supplier List", url: "/supplier/list", icon: List },
        ]
      },
      {
        title: "Employee",
        url: "/employee",
        icon: Users,
        subItems: [
          { title: "Add Employee", url: "/employee/add", icon: Plus },
          { title: "Employee List", url: "/employee/list", icon: List },
        ]
      },
      { 
        title: "Bank", 
        url: "/bank", 
        icon: CreditCard,
        subItems: [
          { title: "Add Bank", url: "/bank/add", icon: Plus },
          { title: "Bank List", url: "/bank/list", icon: List },
        ]
      },
      { 
        title: "Store", 
        url: "/store", 
        icon: Package,
        subItems: [
          { title: "Add Store", url: "/store/add", icon: Plus },
          { title: "Store List", url: "/store/list", icon: List },
        ]
      },
    ]
  },
  {
    title: "Data Capture",
    items: [
      { title: "Sales", url: "/sales", icon: ShoppingCart },
      { 
        title: "Purchases", 
        url: "/purchases", 
        icon: ShoppingCart,
        subItems: [
          { title: "Add Purchase", url: "/purchases/add", icon: Plus },
          { title: "Purchase List", url: "/purchases/list", icon: List },
        ]
      },
      { title: "Returns", url: "/returns", icon: RotateCcw },
      { 
        title: "Stock", 
        url: "/stock", 
        icon: ArrowRightLeft,
        subItems: [
          { title: "Stock Adjustment", url: "/stock/adjustment", icon: ArrowRightLeft },
        ]
      },
    ]
  },
  {
    title: "Reports",
    items: [
      { title: "Sales Report", url: "/reports/sales", icon: BarChart3 },
      { title: "Stock Report", url: "/reports/stock", icon: PackageSearch },
      { title: "Profit Report", url: "/reports/profit", icon: TrendingUp },
    ]
  },
  {
    title: "Accounts",
    items: [
      { title: "Ledger", url: "/accounts/ledger", icon: BookOpen },
      { title: "Payments", url: "/accounts/payments", icon: CreditCard },
      { title: "Expenses", url: "/accounts/expenses", icon: Receipt },
    ]
  },
  {
    title: "Administration",
    items: [
      { title: "Users", url: "/admin/users", icon: Users },
      { title: "Roles", url: "/admin/roles", icon: KeyRound },
      { title: "Settings", url: "/admin/settings", icon: Settings },
       { title: "Logout", url: "/login", icon: LogOut },
    ]
  }
]

export function AppSidebar() {
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState(new Set())

  const toggleExpanded = (title) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(title)) {
        newSet.delete(title)
      } else {
        newSet.add(title)
      }
      return newSet
    })
  }

  const isItemActive = (url, subItems) => {
    if (location.pathname === url) return true
    if (subItems) {
      return subItems.some(subItem => location.pathname === subItem.url)
    }
    return false
  }

  return (
    <Sidebar>
      <SidebarContent>
        {/* Home Menu Item */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                  <Link to="/">
                    <Home />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Menu Groups */}
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {item.subItems ? (
                      <>
                        <SidebarMenuButton 
                          asChild
                          isActive={isItemActive(item.url, item.subItems)}
                          onClick={() => toggleExpanded(item.title)}
                        >
                          <div className="cursor-pointer">
                            <item.icon />
                            <span>{item.title}</span>
                            {expandedItems.has(item.title) ? (
                              <ChevronDown className="ml-auto" size={16} />
                            ) : (
                              <ChevronRight className="ml-auto" size={16} />
                            )}
                          </div>
                        </SidebarMenuButton>
                        {expandedItems.has(item.title) && (
                          <SidebarMenuSub>
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton 
                                  asChild 
                                  isActive={location.pathname === subItem.url}
                                >
                                  <Link to={subItem.url}>
                                    <subItem.icon />
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </>
                    ) : (
                      <SidebarMenuButton 
                        asChild 
                        isActive={location.pathname === item.url}
                      >
                        <Link to={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}