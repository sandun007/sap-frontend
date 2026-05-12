import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Loader2, 
  Package, 
  Search, 
  Filter, 
  Tag, 
  Layers, 
  AlertTriangle,
  ArrowUpDown,
  History
} from 'lucide-react';
import { branchAPI, brandAPI, categoryAPI, stockAPI } from '@/api/api';
import { toast } from 'sonner';

const LiveStock = () => {
  const [branches, setBranches] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stocks, setStocks] = useState([]);
  
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedBrandId, setSelectedBrandId] = useState('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedBranchId) {
      fetchStock(selectedBranchId);
    }
  }, [selectedBranchId]);

  const fetchInitialData = async () => {
    setInitialLoading(true);
    try {
      const [branchesRes, brandsRes, categoriesRes] = await Promise.all([
        branchAPI.getAll(),
        brandAPI.getAll(),
        categoryAPI.getAll()
      ]);

      const branchesData = branchesRes.data.data || [];
      const brandsData = brandsRes.data.data || [];
      const categoriesData = categoriesRes.data.data || [];

      setBranches(branchesData);
      setBrands(brandsData);
      setCategories(categoriesData);
      
      if (branchesData.length > 0) {
        const mainBranch = branchesData.find(b => 
          b.branch_name.toLowerCase().includes('main')
        ) || branchesData[0];
        
        setSelectedBranchId(mainBranch.branch_id.toString());
      }
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      toast.error('Failed to load filter options');
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchStock = async (branchId) => {
    setStockLoading(true);
    try {
      const res = await stockAPI.getByBranch(branchId);
      setStocks(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch stock:', error);
      toast.error('Failed to load stock data for this branch');
    } finally {
      setStockLoading(false);
    }
  };

  const filteredStocks = stocks.filter(stock => {
    const pName = stock.product_name || stock.product?.product_name || '';
    const pCode = stock.product?.product_code || '';
    
    const matchesSearch = pName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          pCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const stockCatId = stock.product?.category_id || stock.category_id;
    const stockBrandId = stock.product?.brand_id || stock.brand_id;

    const matchesCategory = selectedCategoryId === 'all' || 
                           (stockCatId && stockCatId.toString() === selectedCategoryId);
    
    const matchesBrand = selectedBrandId === 'all' || 
                        (stockBrandId && stockBrandId.toString() === selectedBrandId);
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Live Stock</h1>
              <p className="text-sm text-muted-foreground">Monitor real-time inventory levels</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1.5 rounded-lg">
              Total Products: {filteredStocks.length}
            </Badge>
          </div>
        </div>

        <Card className="border-primary/10 shadow-sm">
          <CardContent className="pt-6">
            {initialLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Loading options...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Branch Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    Branch
                  </label>
                  <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                    <SelectTrigger className="h-11 border-primary/10 bg-background focus:ring-primary/20">
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                          {branch.branch_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Product Search */}
                <div className="space-y-2 relative group">
                  <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                    <Search className="h-3.5 w-3.5 text-primary" />
                    Search Products
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Name or Product Code..." 
                      className="h-11 pl-10 border-primary/10 bg-background focus:ring-primary/20"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                    />
                    
                    {/* Search Suggestions Dropdown */}
                    {showSuggestions && searchTerm.length >= 1 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-60 overflow-auto py-1 animate-in fade-in zoom-in-95 duration-100">
                        {(() => {
                          const matches = stocks
                            .map(s => ({
                              name: s.product_name || s.product?.product_name || 'Unnamed',
                              code: s.product?.product_code || ''
                            }))
                            .filter((item, index, self) => 
                              (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               item.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
                              self.findIndex(t => t.name === item.name && t.code === item.code) === index
                            )
                            .slice(0, 8);

                          if (matches.length === 0) {
                            return <div className="px-3 py-2 text-xs text-muted-foreground italic">No products found</div>;
                          }

                          return matches.map((item, idx) => (
                            <button
                              key={idx}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between group/item"
                              onClick={() => {
                                setSearchTerm(item.name);
                                setShowSuggestions(false);
                              }}
                            >
                              <span className="font-medium truncate mr-2">{item.name}</span>
                              {item.code && (
                                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground group-hover/item:bg-primary/20 group-hover/item:text-primary transition-colors">
                                  {item.code}
                                </span>
                              )}
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                  
                  {/* Click overlay to close suggestions */}
                  {showSuggestions && (
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowSuggestions(false)}
                    />
                  )}
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-primary" />
                    Category
                  </label>
                  <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                    <SelectTrigger className="h-11 border-primary/10 bg-background focus:ring-primary/20">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.category_id} value={category.category_id.toString()}>
                          {category.category_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    Brand
                  </label>
                  <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                    <SelectTrigger className="h-11 border-primary/10 bg-background focus:ring-primary/20">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.brand_id} value={brand.brand_id.toString()}>
                          {brand.brand_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Table Card */}
        <Card className="border-primary/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent border-primary/5">
                  <TableHead className="w-[100px] font-bold text-xs uppercase tracking-wider">Product Code</TableHead>
                  <TableHead className="min-w-[200px] font-bold text-xs uppercase tracking-wider">Product Name</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Category</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Brand</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Quantity</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                        <p className="text-sm text-muted-foreground animate-pulse">Fetching live inventory data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStocks.length > 0 ? (
                  filteredStocks.map((stock, index) => (
                    <TableRow key={stock.stock_id || index} className="hover:bg-primary/[0.02] border-primary/5 transition-colors group">
                      <TableCell className="font-mono text-[11px] font-semibold text-muted-foreground group-hover:text-primary">
                        {stock.product?.product_code || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-sm group-hover:translate-x-1 transition-transform duration-200">
                          {stock.product_name || stock.product?.product_name || 'Unnamed Product'}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-muted/30 font-normal text-[11px]">
                          {(() => {
                            const catId = stock.product?.category_id || stock.category_id;
                            const cat = categories.find(c => c.category_id?.toString() === catId?.toString());
                            return cat?.category_name || stock.category_name || stock.product?.category?.category_name || 'General';
                          })()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-muted/30 font-normal text-[11px]">
                          {(() => {
                            const brandId = stock.product?.brand_id || stock.brand_id;
                            const brand = brands.find(b => b.brand_id?.toString() === brandId?.toString());
                            return brand?.brand_name || stock.brand_name || stock.product?.brand?.brand_name || 'N/A';
                          })()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-bold tabular-nums ${Number(stock.quantity || 0) <= 5 ? 'text-destructive' : 'text-foreground'}`}>
                          {(Number(stock.quantity || 0)).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {Number(stock.quantity || 0) <= 0 ? (
                          <Badge className="bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20">Out of Stock</Badge>
                        ) : Number(stock.quantity || 0) <= 5 ? (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">Low Stock</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">In Stock</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Package className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm font-medium text-muted-foreground">No stock found matching your criteria</p>
                        <button 
                          onClick={() => {setSearchTerm(''); setSelectedBrandId('all'); setSelectedCategoryId('all');}}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Clear all filters
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LiveStock;
