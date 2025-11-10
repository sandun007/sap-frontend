import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
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
  AlertTriangle
} from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">PosXpress</h1>
        <h2 className="text-2xl font-semibold text-muted-foreground">ISURU SUPER</h2>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.45,230</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpIcon className="h-3 w-3 text-green-600 mr-1" />
              1.12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs.9,520</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <ArrowUpIcon className="h-3 w-3 text-green-600 mr-1" />
              1.8% growth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">128</div>
            <p className="text-xs text-muted-foreground">1.5% this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Critical Items</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Access Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Access File</CardTitle>
            <CardDescription>Frequently accessed modules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* First Row */}
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <FileText className="h-5 w-5 mb-1" />
                <span className="text-xs">Sales Invoice</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <ShoppingCart className="h-5 w-5 mb-1" />
                <span className="text-xs">Purchases</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <Package className="h-5 w-5 mb-1" />
                <span className="text-xs">Live Stock</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <BarChart3 className="h-5 w-5 mb-1" />
                <span className="text-xs">Sales Report</span>
              </Button>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <BarChart3 className="h-5 w-5 mb-1" />
                <span className="text-xs">Stock Report</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <TrendingUp className="h-5 w-5 mb-1" />
                <span className="text-xs">Profit Report</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <RotateCcw className="h-5 w-5 mb-1" />
                <span className="text-xs">Return</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <Package className="h-5 w-5 mb-1" />
                <span className="text-xs">Product</span>
              </Button>
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <Package className="h-5 w-5 mb-1" />
                <span className="text-xs">Category</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <Package className="h-5 w-5 mb-1" />
                <span className="text-xs">Brand</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <Users className="h-5 w-5 mb-1" />
                <span className="text-xs">Customer</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <Users className="h-5 w-5 mb-1" />
                <span className="text-xs">Supplier</span>
              </Button>
            </div>

            {/* Fourth Row */}
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <Users className="h-5 w-5 mb-1" />
                <span className="text-xs">Employee</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <CreditCard className="h-5 w-5 mb-1" />
                <span className="text-xs">Expenses</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <Building className="h-5 w-5 mb-1" />
                <span className="text-xs">Branch</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <Building className="h-5 w-5 mb-1" />
                <span className="text-xs">Department</span>
              </Button>
            </div>

            {/* Fifth Row */}
            <div className="grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <CreditCard className="h-5 w-5 mb-1" />
                <span className="text-xs">Bank</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <CreditCard className="h-5 w-5 mb-1" />
                <span className="text-xs">Cheque</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <Building className="h-5 w-5 mb-1" />
                <span className="text-xs">Stores</span>
              </Button>
              <Button variant="outline" size="sm" className="h-16 flex-col">
                <Settings className="h-5 w-5 mb-1" />
                <span className="text-xs">Setting</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sales Overview & Stock Status */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Simple Bar Chart Representation */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Current Month</span>
                <span className="text-sm font-medium">4,500</span>
              </div>
              <Progress value={90} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Month</span>
                <span className="text-sm font-medium">4,000</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">2 Months Ago</span>
                <span className="text-sm font-medium">3,500</span>
              </div>
              <Progress value={70} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">3 Months Ago</span>
                <span className="text-sm font-medium">3,000</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">4 Months Ago</span>
                <span className="text-sm font-medium">2,500</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Stock Status */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Stock Status</CardTitle>
            <CardDescription>Current inventory levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Available</span>
                  <Badge variant="secondary">1,245 items</Badge>
                </div>
                <Progress value={75} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Reserved</span>
                  <Badge variant="secondary">89 items</Badge>
                </div>
                <Progress value={15} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Spot</span>
                  <Badge variant="secondary">23 items</Badge>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest transactions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4 text-green-600" />
                <span className="text-sm">New sale completed - Order #00125</span>
              </div>
              <span className="text-sm text-muted-foreground">2 min ago</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Low stock alert - Product ABC</span>
              </div>
              <span className="text-sm text-muted-foreground">1 hour ago</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm">New customer registered</span>
              </div>
              <span className="text-sm text-muted-foreground">3 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}