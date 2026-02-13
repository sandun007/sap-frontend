import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button.jsx";
import { Menu, ChevronDown, LogOut, Home, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet.jsx";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.jsx";
import { cn } from "@/lib/utils.js";


const navGroups = [
    {
        title: "Master File",
        items: [
            {
                title: "Products",
                subItems: [
                    { title: "Add Product", url: "/products/add" },
                    { title: "Product List", url: "/products/list" },
                ],
            },
            {
                title: "Category",
                subItems: [
                    { title: "Add Category", url: "/category/add" },
                    { title: "Category List", url: "/category/list" },
                ],
            },
            {
                title: "Brand",
                subItems: [
                    { title: "Add Brand", url: "/brand/add" },
                    { title: "Brand List", url: "/brand/list" },
                ],
            },
            {
                title: "Branch",
                subItems: [
                    { title: "Add Branch", url: "/branch/add" },
                    { title: "Branch List", url: "/branch/list" },
                ],
            },
            {
                title: "Department",
                subItems: [
                    { title: "Add Department", url: "/department/add" },
                    { title: "Department List", url: "/department/list" },
                ],
            },
            {
                title: "Customer",
                subItems: [
                    { title: "Add Customer", url: "/customer/add" },
                    { title: "Customer List", url: "/customer/list" },
                ],
            },
            {
                title: "Supplier",
                subItems: [
                    { title: "Add Supplier", url: "/supplier/add" },
                    { title: "Supplier List", url: "/supplier/list" },
                ],
            },
            {
                title: "Employee",
                subItems: [
                    { title: "Add Employee", url: "/employee/add" },
                    { title: "Employee List", url: "/employee/list" },
                ],
            },
        ],
    },
    {
        title: "Data Capture",
        items: [
            { title: "Sales", url: "/sales" },
            { title: "Purchases", url: "/purchases" },
            { title: "Returns", url: "/returns" },
        ],
    },
    {
        title: "Reports",
        items: [
            { title: "Sales Report", url: "/reports/sales" },
            { title: "Stock Report", url: "/reports/stock" },
            { title: "Profit Report", url: "/reports/profit" },
        ],
    },
    {
        title: "Accounts",
        items: [
            { title: "Ledger", url: "/accounts/ledger" },
            { title: "Payments", url: "/accounts/payments" },
            { title: "Expenses", url: "/accounts/expenses" },
        ],
    },
    {
        title: "Administration",
        items: [
            { title: "Users", url: "/admin/users" },
            { title: "Roles", url: "/admin/roles" },
            { title: "Settings", url: "/admin/settings" },
            { title: "Logout", url: "/login", icon: LogOut },
        ],
    },
];

function DesktopNav() {
    const location = useLocation();

    return (
        <NavigationMenu className="hidden lg:flex mx-6">
            <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                    <Link to="/" className={navigationMenuTriggerStyle()}>
                        <Home className="mr-2 h-4 w-4" />
                        Home
                    </Link>
                </NavigationMenuItem>

                {navGroups.map((group) => (
                    <NavigationMenuItem key={group.title}>
                        <NavigationMenuTrigger className="px-3 py-2">
                            {group.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[380px] gap-2 p-4 lg:w-[500px] lg:grid-cols-2">
                                {group.items.map((item) => (
                                    <li key={item.title} className="row-span-3">
                                        {item.subItems ? (
                                            <div className="block select-none space-y-1 rounded-md p-3 leading-none outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                                                <div className="text-sm font-medium leading-none mb-2">{item.title}</div>
                                                <ul className="space-y-1.5">
                                                    {item.subItems.map((sub) => (
                                                        <li key={sub.title}>
                                                            <NavigationMenuLink asChild>
                                                                <Link
                                                                    to={sub.url}
                                                                    className={cn(
                                                                        "block select-none rounded px-3 py-1.5 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent/80",
                                                                        location.pathname === sub.url &&
                                                                        "bg-accent text-accent-foreground font-medium"
                                                                    )}
                                                                >
                                                                    {sub.title}
                                                                </Link>
                                                            </NavigationMenuLink>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ) : (
                                            <NavigationMenuLink asChild>
                                                <Link
                                                    to={item.url}
                                                    className={cn(
                                                        navigationMenuTriggerStyle(),
                                                        "justify-start",
                                                        location.pathname === item.url && "bg-accent text-accent-foreground"
                                                    )}
                                                >
                                                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                                    {item.title}
                                                </Link>
                                            </NavigationMenuLink>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                ))}
            </NavigationMenuList>
        </NavigationMenu>
    );
}

function MobileNav() {
    const [open, setOpen] = useState(false);
    const location = useLocation();

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 sm:w-96">
                <div className="flex flex-col gap-6 py-6">
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-lg font-semibold"
                        onClick={() => setOpen(false)}
                    >
                        <Home className="h-5 w-5" />
                        <span>Home</span>
                    </Link>

                    {navGroups.map((group) => (
                        <div key={group.title} className="space-y-3">
                            <div className="font-medium text-muted-foreground uppercase text-xs tracking-wider">
                                {group.title}
                            </div>
                            <div className="space-y-1 pl-2 border-l border-border">
                                {group.items.map((item) => (
                                    <div key={item.title}>
                                        {item.subItems ? (
                                            <>
                                                <div className="text-sm font-medium py-1">{item.title}</div>
                                                <div className="space-y-1 pl-4">
                                                    {item.subItems.map((sub) => (
                                                        <Link
                                                            key={sub.title}
                                                            to={sub.url}
                                                            className={cn(
                                                                "block text-sm py-1.5 text-muted-foreground hover:text-foreground",
                                                                location.pathname === sub.url && "text-foreground font-medium"
                                                            )}
                                                            onClick={() => setOpen(false)}
                                                        >
                                                            {sub.title}
                                                        </Link>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <Link
                                                to={item.url}
                                                className={cn(
                                                    "block text-sm py-1.5 hover:text-foreground",
                                                    location.pathname === item.url && "text-foreground font-medium"
                                                )}
                                                onClick={() => setOpen(false)}
                                            >
                                                {item.title}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function TopNavbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
            <div className=" flex h-14 items-center justify-between px-4 md:px-6 mx-auto">

                {/* Logo */}
                <div className="flex items-center gap-4">
                    <MobileNav />
                    <Link to="/" className="flex items-center gap-2 font-bold text-lg">
                        <span className="text-primary">ISURU SUPER</span>
                    </Link>
                </div>

                <div className="flex-1 flex justify-end">
                    <DesktopNav />
                </div>

                {/* User/Admin dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 ml-4">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline-block">Admin</span>
                            <ChevronDown className="h-4 w-4 opacity-60" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem asChild>
                            <Link to="/profile">Profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/settings">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/login" className="flex items-center text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}