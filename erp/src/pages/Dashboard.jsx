import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    ArrowUpIcon,
    FileText,
    ShoppingCart,
    Package,
    BarChart3,
    TrendingUp,
    RotateCcw,
    Users,
    Building,
    CreditCard,
    Settings,
    Plus,
    AlertTriangle,
    Keyboard
} from "lucide-react"
import { toast } from "sonner"
import logo from "../assets/logo.png"

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex items-center gap-3">
            <img
                src={logo}
                alt="Logo"
                className="h-30 w-auto"
            />
        </div>

            {/* Key Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Data Sales</CardTitle>
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-800">Rs.45,230</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <ArrowUpIcon className="h-3 w-3 mr-1" />
                            1.12% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-600 shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700">Profit</CardTitle>
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-800">Rs.9,520</div>
                        <p className="text-xs text-emerald-600 flex items-center mt-1">
                            <ArrowUpIcon className="h-3 w-3 mr-1" />
                            1.8% growth
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-600 shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-amber-700">Pending Orders</CardTitle>
                        <ShoppingCart className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-800">128</div>
                        <p className="text-xs text-amber-600 mt-1">1.5% this week</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-600 shadow-sm hover:shadow transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-red-700">Low Stock</CardTitle>
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-800">23</div>
                        <p className="text-xs text-red-600 mt-1">Critical Items</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Quick Access Section – ALL BUTTONS INCLUDED */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Quick Access</CardTitle>
                            <CardDescription>Frequently used modules</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                                toast(
                                    <div style={{ whiteSpace: 'pre-line', fontFamily: 'monospace' }}>
                                        {`
                                            Ctrl + H    →  Home Dashboard
                                            Ctrl + P    →  Products
                                            Ctrl + C    →  Categories
                                            Ctrl + B    →  Brands
                                            Shift + B   →  Branches
                                            Ctrl + D    →  Departments
                                            Shift + C   →  Customers
                                            Ctrl + S    →  Suppliers
                                            Ctrl + E    →  Employees
                                            
                                            Press 1 anytime to show this list again
                                        `}
                                    </div>,
                                    { duration: 8000, position: 'top-center' }
                                )
                            }}
                            title="Keyboard Shortcuts"
                        >
                            <Keyboard className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-2">
                        {/* Row 1 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Button variant="outline" className="h-16 flex-col border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all">
                                <FileText className="h-5 w-5 mb-1 text-blue-600" />
                                <span className="text-xs text-blue-800 font-medium">Sales Invoice</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                                <ShoppingCart className="h-5 w-5 mb-1 text-indigo-600" />
                                <span className="text-xs text-indigo-800 font-medium">Purchases</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all">
                                <Package className="h-5 w-5 mb-1 text-teal-600" />
                                <span className="text-xs text-teal-800 font-medium">Live Stock</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300 transition-all">
                                <BarChart3 className="h-5 w-5 mb-1 text-cyan-600" />
                                <span className="text-xs text-cyan-800 font-medium">Sales Report</span>
                            </Button>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Button variant="outline" className="h-16 flex-col border-violet-200 hover:bg-violet-50 hover:border-violet-300 transition-all">
                                <BarChart3 className="h-5 w-5 mb-1 text-violet-600" />
                                <span className="text-xs text-violet-800 font-medium">Stock Report</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all">
                                <TrendingUp className="h-5 w-5 mb-1 text-emerald-600" />
                                <span className="text-xs text-emerald-800 font-medium">Profit Report</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-all">
                                <RotateCcw className="h-5 w-5 mb-1 text-orange-600" />
                                <span className="text-xs text-orange-800 font-medium">Return</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all">
                                <Package className="h-5 w-5 mb-1 text-blue-600" />
                                <span className="text-xs text-blue-800 font-medium">Product</span>
                            </Button>
                        </div>

                        {/* Row 3 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Button variant="outline" className="h-16 flex-col border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all">
                                <Package className="h-5 w-5 mb-1 text-purple-600" />
                                <span className="text-xs text-purple-800 font-medium">Category</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-pink-200 hover:bg-pink-50 hover:border-pink-300 transition-all">
                                <Package className="h-5 w-5 mb-1 text-pink-600" />
                                <span className="text-xs text-pink-800 font-medium">Brand</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-sky-200 hover:bg-sky-50 hover:border-sky-300 transition-all">
                                <Users className="h-5 w-5 mb-1 text-sky-600" />
                                <span className="text-xs text-sky-800 font-medium">Customer</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all">
                                <Users className="h-5 w-5 mb-1 text-emerald-600" />
                                <span className="text-xs text-emerald-800 font-medium">Supplier</span>
                            </Button>
                        </div>

                        {/* Row 4 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Button variant="outline" className="h-16 flex-col border-rose-200 hover:bg-rose-50 hover:border-rose-300 transition-all">
                                <Users className="h-5 w-5 mb-1 text-rose-600" />
                                <span className="text-xs text-rose-800 font-medium">Employee</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-all">
                                <CreditCard className="h-5 w-5 mb-1 text-amber-600" />
                                <span className="text-xs text-amber-800 font-medium">Expenses</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-lime-200 hover:bg-lime-50 hover:border-lime-300 transition-all">
                                <Building className="h-5 w-5 mb-1 text-lime-600" />
                                <span className="text-xs text-lime-800 font-medium">Branch</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-teal-200 hover:bg-teal-50 hover:border-teal-300 transition-all">
                                <Building className="h-5 w-5 mb-1 text-teal-600" />
                                <span className="text-xs text-teal-800 font-medium">Department</span>
                            </Button>
                        </div>

                        {/* Row 5 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Button variant="outline" className="h-16 flex-col border-cyan-200 hover:bg-cyan-50 hover:border-cyan-300 transition-all">
                                <CreditCard className="h-5 w-5 mb-1 text-cyan-600" />
                                <span className="text-xs text-cyan-800 font-medium">Bank</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-fuchsia-200 hover:bg-fuchsia-50 hover:border-fuchsia-300 transition-all">
                                <CreditCard className="h-5 w-5 mb-1 text-fuchsia-600" />
                                <span className="text-xs text-fuchsia-800 font-medium">Cheque</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-green-200 hover:bg-green-50 hover:border-green-300 transition-all">
                                <Building className="h-5 w-5 mb-1 text-green-600" />
                                <span className="text-xs text-green-800 font-medium">Stores</span>
                            </Button>
                            <Button variant="outline" className="h-16 flex-col border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                <Settings className="h-5 w-5 mb-1 text-gray-600" />
                                <span className="text-xs text-gray-800 font-medium">Setting</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Overview */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>Sales Overview</CardTitle>
                        <CardDescription>Monthly performance</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-2">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-blue-700">Current Month</span>
                                <span className="font-medium">4,500</span>
                            </div>
                            <Progress value={90} className="h-2.5 bg-blue-100 [&>div]:bg-blue-600" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-indigo-700">Last Month</span>
                                <span className="font-medium">4,000</span>
                            </div>
                            <Progress value={80} className="h-2.5 bg-indigo-100 [&>div]:bg-indigo-600" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-violet-700">2 Months Ago</span>
                                <span className="font-medium">3,500</span>
                            </div>
                            <Progress value={70} className="h-2.5 bg-violet-100 [&>div]:bg-violet-600" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-purple-700">3 Months Ago</span>
                                <span className="font-medium">3,000</span>
                            </div>
                            <Progress value={60} className="h-2.5 bg-purple-100 [&>div]:bg-purple-600" />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-fuchsia-700">4 Months Ago</span>
                                <span className="font-medium">2,500</span>
                            </div>
                            <Progress value={50} className="h-2.5 bg-fuchsia-100 [&>div]:bg-fuchsia-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* Stock Status */}
                <Card className="lg:col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>Stock Status</CardTitle>
                        <CardDescription>Current inventory levels</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <div className="grid gap-5 md:grid-cols-3">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-emerald-700">Available</span>
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">1,245 items</Badge>
                                </div>
                                <Progress value={75} className="h-2.5 bg-emerald-100 [&>div]:bg-emerald-600" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-amber-700">Reserved</span>
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">89 items</Badge>
                                </div>
                                <Progress value={15} className="h-2.5 bg-amber-100 [&>div]:bg-amber-600" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-red-700">Spot</span>
                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">23 items</Badge>
                                </div>
                                <Progress value={10} className="h-2.5 bg-red-100 [&>div]:bg-red-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest transactions and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-green-100 p-2">
                                <Plus className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-sm font-medium">New sale completed - Order #00125</span>
                        </div>
                        <span className="text-xs text-muted-foreground">2 min ago</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-yellow-100 p-2">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            </div>
                            <span className="text-sm font-medium">Low stock alert - Product ABC</span>
                        </div>
                        <span className="text-xs text-muted-foreground">1 hour ago</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="rounded-full bg-blue-100 p-2">
                                <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="text-sm font-medium">New customer registered</span>
                        </div>
                        <span className="text-xs text-muted-foreground">3 hours ago</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}