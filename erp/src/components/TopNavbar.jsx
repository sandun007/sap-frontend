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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown, LogOut, Home, User, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

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
                title: "Sub Category",
                subItems: [
                    { title: "Add Sub Category", url: "/subcategory/add" },
                    { title: "Sub Category List", url: "/subcategory/list" },
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
            {
                title: "Returns",
                subItems: [
                    { title: "Customer Returns", url: "/#" }
                ],
            },
            {
                title: "Purchases",
                subItems: [
                    { title: "Add Purchase", url: "/purchases/add" },
                    { title: "Purchase List", url: "/purchases/list" },
                ],
            },
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
        ],
    },
];

function DesktopNav() {
    const location = useLocation();

    return (
        <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList className="gap-1.5">
                <NavigationMenuItem>
                    <Link
                        to="/"
                        className={cn(
                            navigationMenuTriggerStyle(),
                            "bg-transparent text-gray-100 hover:bg-slate-700 hover:text-white transition-colors rounded-md"
                        )}
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Home
                    </Link>
                </NavigationMenuItem>

                {navGroups.map((group) => (
                    <NavigationMenuItem key={group.title}>
                        <NavigationMenuTrigger
                            className=" px-3 py-2 bg-transparent text-gray-100 hover:bg-slate-700 data-[state=open]:bg-slate-600
                            data-[state=open]:text-slate-800 transition-colors rounded-md ">
                            {group.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent className="bg-slate-800 border border-l-slate-50000 text-gray-100 ">
                            <ul className="grid w-[400px] gap-3 p-4 lg:w-[500px] lg:grid-cols-2">
                                {group.items.map((item) => (
                                    <li key={item.title}>
                                        {item.subItems ? (
                                            <div className="block select-none space-y-1 rounded-md p-3 leading-none
                                            outline-none transition-colors hover:bg-slate-700">
                                                <div className="text-sm font-medium leading-none mb-2.5 text-gray-100 ">
                                                    {item.title}
                                                </div>
                                                <ul className="space-y-1.5">
                                                    {item.subItems.map((sub) => (
                                                        <li key={sub.title}>
                                                            <NavigationMenuLink asChild>
                                                                <Link
                                                                    to={sub.url}
                                                                    className={cn(
                                                                        "block select-none rounded-md px-3 py-1.5 " +
                                                                        "text-sm leading-none no-underline outline-none " +
                                                                        "transition-colors text-gray-300 hover:bg-slate-600 " +
                                                                        "hover:text-red-400",
                                                                        location.pathname === sub.url &&
                                                                        "bg-slate-600 text-white font-medium"
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
                                                        "w-full justify-start bg-transparent text-gray-100 hover:bg-slate-700 transition-colors",
                                                        location.pathname === item.url &&
                                                        "bg-slate-600 text-white font-medium"
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
    const [expandedItems, setExpandedItems] = useState({});

    const toggleExpand = (title) => {
        setExpandedItems((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-gray-100 hover:bg-slate-700 transition-colors"
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>

            <SheetContent
                side="left"
                className="w-[85vw] max-w-sm p-0 flex flex-col bg-slate-500 text-gray-100 border-r border-slate-700"
            >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                {/* Fixed header */}
                <div className="border-b border-slate-700 px-5 py-4 shrink-0 bg-slate-800/40">
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 font-bold text-lg text-gray-100"
                        onClick={() => setOpen(false)}
                    >
                        <Home className="h-5 w-5 text-blue-300" />
                        <span>ISURU SUPER</span>
                    </Link>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">
                    {navGroups.map((group) => (
                        <div key={group.title} className="mb-8 last:mb-0">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                                {group.title}
                            </h4>

                            {group.title === "Master File" ? (
                                <div className="space-y-1">
                                    {group.items.map((item) => {
                                        const isExpanded = expandedItems[item.title] || false;
                                        return (
                                            <div key={item.title}>
                                                <button
                                                    onClick={() => toggleExpand(item.title)}
                                                    className={cn(
                                                        "flex w-full items-center justify-between py-2.5 px-3 text-sm font-medium rounded-md transition-colors text-gray-100",
                                                        isExpanded ? "bg-slate-700" : "hover:bg-slate-800"
                                                    )}
                                                >
                                                    <span>{item.title}</span>
                                                    <ChevronRight
                                                        className={cn(
                                                            "h-4 w-4 transition-transform text-slate-800",
                                                            isExpanded && "rotate-90"
                                                        )}
                                                    />
                                                </button>

                                                {isExpanded && (
                                                    <div className="pl-7 pb-1 pt-0.5">
                                                        <div className="space-y-0.5 border-l border-slate-700/50 pl-4">
                                                            {item.subItems?.map((sub) => (
                                                                <Link
                                                                    key={sub.title}
                                                                    to={sub.url}
                                                                    className={cn(
                                                                        "block py-2 px-3 text-sm rounded-md transition-colors text-gray-300",
                                                                        location.pathname === sub.url
                                                                            ? "bg-slate-700 text-white font-medium"
                                                                            : "hover:bg-slate-100 hover:text-gray-100"
                                                                    )}
                                                                    onClick={() => setOpen(false)}
                                                                >
                                                                    {sub.title}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {group.items.map((item) => (
                                        <div key={item.title}>
                                            {item.subItems ? (
                                                <>
                                                    <div className="text-sm font-medium py-2 px-3 text-slate-300">
                                                        {item.title}
                                                    </div>
                                                    <div className="ml-4 space-y-0.5 border-l border-slate-700/50 pl-4">
                                                        {item.subItems.map((sub) => (
                                                            <Link
                                                                key={sub.title}
                                                                to={sub.url}
                                                                className={cn(
                                                                    "block py-2 px-3 text-sm rounded-md transition-colors text-gray-300",
                                                                    location.pathname === sub.url
                                                                        ? "bg-slate-700 text-white font-medium"
                                                                        : "hover:bg-slate-800 hover:text-gray-100"
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
                                                        "block py-2.5 px-3 text-sm rounded-md transition-colors text-gray-100 hover:bg-slate-800",
                                                        location.pathname === item.url
                                                            ? "bg-slate-700 text-white font-medium"
                                                            : ""
                                                    )}
                                                    onClick={() => setOpen(false)}
                                                >
                                                    {item.icon && (
                                                        <item.icon className="inline mr-2.5 h-4 w-4 text-gray-300" />
                                                    )}
                                                    {item.title}
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </SheetContent>
        </Sheet>
    );
}

export function TopNavbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-slate-900 backdrop-blur-md border-slate-700 text-gray-100">
            <div className="flex h-14 items-center justify-between px-4 md:px-6 max-w-screen-2xl mx-auto">
                <div className="flex items-center gap-4">
                    <MobileNav />
                    <Link to="/" className="flex items-center gap-2 font-bold text-lg">
                        <span className="text-gray-100">ISURU SUPER</span>
                    </Link>
                </div>

                <div className="flex-1 flex justify-center lg:justify-end">
                    <DesktopNav />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="gap-2 text-gray-100 hover:bg-slate-100">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline-block font-medium">Admin</span>
                            <ChevronDown className="h-4 w-4 opacity-70" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-56 bg-slate-900 text-gray-100 border border-slate-700 hover:text-gray-100"
                    >
                        <DropdownMenuItem asChild>
                            <Link to="/profile" className="hover:bg-slate-700 focus:bg-slate-100 ">
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/settings" className="hover:bg-slate-700 focus:bg-slate-100 ">
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                to="/login"
                                className="text-red-400 hover:bg-slate-700 focus:bg-slate-100 flex items-center"
                            >
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