import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Info,
  Building2,
  Truck,
  Loader2,
  Package,
  Search
} from 'lucide-react';
import { branchAPI, productAPI, stockAPI } from '@/api/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const BinCard = () => {
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['ALL']);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [initialLoading, setInitialLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedBranchId && selectedProductId) {
      fetchBinCardData(pagination.currentPage);
    } else {
      setHistory([]);
    }
  }, [selectedBranchId, selectedProductId, fromDate, toDate, selectedTypes, pagination.currentPage]);

  const fetchInitialData = async () => {
    setInitialLoading(true);
    try {
      const [branchesRes, productsRes] = await Promise.all([
        branchAPI.getAll(),
        productAPI.getAll()
      ]);

      const branchesData = branchesRes.data.data || [];
      const productsData = productsRes.data.data || [];

      setBranches(branchesData);
      setProducts(productsData);
      
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

  const fetchBinCardData = async (page = 1) => {
    setHistoryLoading(true);
    try {
      const res = await stockAPI.getHistory({
        branch_id: selectedBranchId,
        product_id: selectedProductId,
        from_date: fromDate,
        to_date: toDate,
        types: selectedTypes.join(','),
        page: page,
        per_page: 10
      });
      
      setHistory(res.data.data || []);
      if (res.data.meta) {
        setPagination({
          currentPage: res.data.meta.current_page,
          lastPage: res.data.meta.last_page,
          total: res.data.meta.total
        });
      }
    } catch (error) {
      console.error('Failed to fetch bin card data:', error);
      toast.error('Failed to load transaction history');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.product_code.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 8);
  const handleRowClick = (item) => {
    // Show details for Adjustments (Transfers) and GRN (Purchases)
    if (item.type === 'TRANSFER_IN' || item.type === 'TRANSFER_OUT' || item.type === 'PURCHASE') {
      setSelectedTransaction(item);
      setIsDetailDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bin Card</h1>
              <p className="text-sm text-muted-foreground">Track product movement history</p>
            </div>
          </div>
        </div>

        <Card className="border-primary/10 shadow-sm overflow-visible">
          <CardContent className="pt-6">
            {initialLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground py-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Loading options...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

                {/* Product Search & Selection */}
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-primary" />
                    Product
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search product..." 
                      className="h-11 pl-10 border-primary/10 bg-background focus:ring-primary/20"
                      value={productSearch}
                      onChange={(e) => {
                        setProductSearch(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                    />
                    
                    {showSuggestions && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-lg z-50 max-h-60 overflow-auto py-1">
                        {(() => {
                          const list = productSearch.length > 0 
                            ? products.filter(p => 
                                p.product_name.toLowerCase().includes(productSearch.toLowerCase()) ||
                                p.product_code.toLowerCase().includes(productSearch.toLowerCase())
                              ).slice(0, 20)
                            : products.slice(0, 50); // Show more when empty

                          if (list.length === 0) {
                            return <div className="px-3 py-2 text-xs text-muted-foreground italic">No products found</div>;
                          }

                          return list.map((p) => (
                            <button
                              key={p.product_id}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground flex items-center justify-between"
                              onClick={() => {
                                setSelectedProductId(p.product_id.toString());
                                setProductSearch(p.product_name);
                                setShowSuggestions(false);
                              }}
                            >
                              <span className="font-medium truncate mr-2">{p.product_name}</span>
                              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                {p.product_code}
                              </span>
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                  {showSuggestions && (
                    <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                  )}
                </div>

                {/* Date Range Filters */}
                <div className="flex gap-4 col-span-1 md:col-span-2 lg:col-span-1">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      From
                    </label>
                    <Input 
                      type="date" 
                      className="h-11 border-primary/10 bg-background focus:ring-primary/20"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      To
                    </label>
                    <Input 
                      type="date" 
                      className="h-11 border-primary/10 bg-background focus:ring-primary/20"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Transaction Type Filter Buttons */}
                <div className="space-y-3 col-span-1 md:col-span-3">
                  <label className="text-xs font-bold uppercase tracking-tight text-muted-foreground flex items-center gap-1.5 px-1">
                    <History className="h-3.5 w-3.5 text-primary" />
                    Quick Filter
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'ALL', label: 'All Transactions', icon: History },
                      { id: 'GRN', label: 'GRN (Purchases)', icon: Package },
                      { id: 'TRANSFER', label: 'Adjustments', icon: ArrowUpRight },
                      { id: 'ADJUSTMENT', label: 'Manual', icon: ClipboardList }
                    ].map((type) => {
                      const isActive = selectedTypes.includes(type.id);
                      const Icon = type.icon;
                      
                      const toggleType = (id) => {
                        setSelectedTypes(prev => {
                          if (id === 'ALL') return ['ALL'];
                          
                          let newTypes = prev.filter(t => t !== 'ALL');
                          if (newTypes.includes(id)) {
                            newTypes = newTypes.filter(t => t !== id);
                            return newTypes.length === 0 ? ['ALL'] : newTypes;
                          } else {
                            return [...newTypes, id];
                          }
                        });
                        setPagination(prev => ({ ...prev, currentPage: 1 }));
                      };

                      return (
                        <Button
                          key={type.id}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleType(type.id)}
                          className={`h-9 px-4 rounded-full transition-all duration-200 gap-2 ${
                            isActive 
                              ? 'shadow-md shadow-primary/20 scale-105' 
                              : 'border-primary/10 hover:border-primary/30 hover:bg-primary/5'
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                          <span className="font-medium">{type.label}</span>
                          {isActive && (
                            <span className="flex h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse ml-1" />
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-end pb-1 lg:col-span-3">
                  {selectedProductId && (
                    <div className="flex gap-2">
                      <Badge variant="outline" className="h-11 px-4 bg-primary/5 border-primary/20 text-primary flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Showing {history.length} Transactions
                      </Badge>
                      {(fromDate || toDate) && (
                        <button 
                          onClick={() => {setFromDate(''); setToDate('');}}
                          className="text-xs text-muted-foreground hover:text-primary transition-colors underline px-2"
                        >
                          Clear Dates
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bin Card Table */}
        <Card className="border-primary/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="hover:bg-transparent border-primary/5">
                  <TableHead className="w-[100px] font-bold text-xs uppercase tracking-wider">Date</TableHead>
                  <TableHead className="w-[120px] font-bold text-xs uppercase tracking-wider">Type</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Reference No</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider">Details</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-right">In</TableHead>
                  <TableHead className="font-bold text-xs uppercase tracking-wider text-right">Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historyLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
                        <p className="text-sm text-muted-foreground animate-pulse">Retrieving transaction history...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : !selectedProductId ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Package className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm font-medium text-muted-foreground">Please select a product to view its Bin Card</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : history.length > 0 ? (
                  history.map((item, index) => {
                    const isIN = item.type === 'IN' || item.type === 'PURCHASE' || item.type === 'ADJUSTMENT_ADD' || item.type === 'TRANSFER_IN';
                    return (
                      <TableRow 
                        key={item.id || index} 
                        className={`transition-colors group border-primary/5 cursor-pointer ${
                          isIN 
                            ? 'bg-emerald-50/30 hover:bg-emerald-50/60' 
                            : 'bg-rose-50/20 hover:bg-rose-50/50'
                        }`}
                        style={{ 
                          backgroundColor: isIN 
                            ? 'rgba(16, 185, 129, 0.08)' 
                            : 'rgba(239, 68, 68, 0.05)' 
                        }}
                        onClick={() => handleRowClick(item)}
                      >
                        <TableCell>
                          <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                            {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isIN ? (
                              <ArrowDownLeft className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3 text-rose-500" />
                            )}
                            <span className={`text-[11px] font-bold uppercase tracking-tight ${isIN ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {item.type === 'PURCHASE' ? 'GRN' : 
                               item.type === 'TRANSFER_IN' ? 'ADJ IN' :
                               item.type === 'TRANSFER_OUT' ? 'ADJ OUT' :
                               item.type === 'IN' || item.type === 'OUT' ? 'MANUAL ' + item.type :
                               item.type.replace('_', ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-[11px] bg-muted px-2 py-1 rounded">
                            {item.reference_no || 'N/A'}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] text-muted-foreground italic">
                            {item.notes || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${isIN ? 'text-emerald-600' : 'text-muted-foreground/30'}`}>
                            {isIN ? `+${parseFloat(item.quantity).toLocaleString()}` : '0'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-bold ${!isIN ? 'text-rose-600' : 'text-muted-foreground/30'}`}>
                            {!isIN ? `-${parseFloat(item.quantity).toLocaleString()}` : '0'}
                          </span>
                        </TableCell>

                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <History className="h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm font-medium text-muted-foreground">No transaction history found for this product</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {history.length > 0 && pagination.lastPage > 1 && (
            <div className="px-6 py-4 border-t border-primary/5 bg-muted/20 flex items-center justify-between">
              <div className="text-xs text-muted-foreground font-medium">
                Showing page <span className="text-foreground">{pagination.currentPage}</span> of <span className="text-foreground">{pagination.lastPage}</span> ({pagination.total} total transactions)
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  className="h-8 w-8 p-0 border-primary/10 hover:bg-primary/5"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.lastPage))].map((_, i) => {
                    let pageNum;
                    if (pagination.lastPage <= 5) pageNum = i + 1;
                    else if (pagination.currentPage <= 3) pageNum = i + 1;
                    else if (pagination.currentPage >= pagination.lastPage - 2) pageNum = pagination.lastPage - 4 + i;
                    else pageNum = pagination.currentPage - 2 + i;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                        className={`h-8 w-8 p-0 text-xs ${pagination.currentPage === pageNum ? 'shadow-sm' : 'hover:bg-primary/5'}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.currentPage >= pagination.lastPage}
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  className="h-8 w-8 p-0 border-primary/10 hover:bg-primary/5"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                {selectedTransaction?.type === 'PURCHASE' ? (
                  <Truck className="h-4 w-4 text-primary" />
                ) : (
                  <ClipboardList className="h-4 w-4 text-primary" />
                )}
              </div>
              {selectedTransaction?.type === 'PURCHASE' ? 'GRN / Purchase Details' : 'Adjustment Details'}
            </DialogTitle>
            <DialogDescription>
              Detailed information about this {selectedTransaction?.type === 'PURCHASE' ? 'purchase' : 'stock adjustment'}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Transaction Type</p>
                  <Badge variant="secondary" className="font-bold">
                    {selectedTransaction.type === 'PURCHASE' ? 'GRN (Purchase)' : 
                     selectedTransaction.type === 'TRANSFER_IN' ? 'ADJ IN (Transfer Received)' : 
                     'ADJ OUT (Transfer Sent)'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reference No</p>
                  <p className="text-sm font-mono font-bold">{selectedTransaction.reference_no || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {selectedTransaction.type === 'PURCHASE' ? 'Supplier Name' : 
                   selectedTransaction.type === 'TRANSFER_IN' ? 'Source Branch' : 
                   'Destination Branch'}
                </p>
                <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3">
                  {selectedTransaction.type === 'PURCHASE' ? (
                    <Truck className="h-5 w-5 text-primary" />
                  ) : (
                    <Building2 className="h-5 w-5 text-primary" />
                  )}
                  <p className="text-sm font-bold text-primary">
                    {(() => {
                      const notes = selectedTransaction.notes || '';
                      
                      // 1. Look for bracketed info [Branch Name] or [Supplier Name]
                      const bracketMatch = notes.match(/\[(.*?)\]/);
                      if (bracketMatch) return bracketMatch[1];
                      
                      // 2. Look for "Supplier" keyword specifically
                      if (notes.includes('Supplier')) {
                         const supplierMatch = notes.split('Supplier')[1];
                         if (supplierMatch) return supplierMatch.trim().replace(/^[:\s\[]+|[\s\]]+$/g, '');
                      }

                      // 3. Fallback for older Branch IDs
                      const idMatch = notes.match(/Branch ID (\d+)/);
                      if (idMatch) {
                        const branchId = idMatch[1];
                        const branch = branches.find(b => b.branch_id.toString() === branchId);
                        return branch ? branch.branch_name : `Branch ID: ${branchId}`;
                      }
                      
                      // 4. Fallback for older GRNs (Reference Number)
                      if (selectedTransaction.type === 'PURCHASE') {
                        return selectedTransaction.reference_no || 'Reference in Notes';
                      }

                      return 'Check System Notes';
                    })()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Quantity</p>
                  {(() => {
                    const isTransIn = selectedTransaction.type === 'TRANSFER_IN' || 
                                     selectedTransaction.type === 'PURCHASE' || 
                                     selectedTransaction.type === 'IN' || 
                                     selectedTransaction.type === 'ADJUSTMENT_ADD';
                    return (
                      <p className={`text-lg font-bold ${isTransIn ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isTransIn ? '+' : '-'}{selectedTransaction.quantity.toLocaleString()} units
                      </p>
                    );
                  })()}
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date & Time</p>
                  <p className="text-sm font-medium">{new Date(selectedTransaction.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-border">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">System Notes</p>
                <p className="text-sm text-muted-foreground italic leading-relaxed">
                  {selectedTransaction.notes}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BinCard;
