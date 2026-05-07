import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import {
    ArrowRightLeft,
    Building2,
    RefreshCw,
    Loader2,
    Package,
    ArrowRight,
    Send,
    Trash2,
    PlusCircle,
    Search,
    ChevronDown,
    Check,
    Calendar,
    Clock
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axios from 'axios'

export default function StockAdjustment() {
    const [branches, setBranches] = useState([])
    const [fromBranch, setFromBranch] = useState(null)
    const [toBranch, setToBranch] = useState(null)
    const [branchLoading, setBranchLoading] = useState(true)

    // Stock state
    const [stocks, setStocks] = useState([])
    const [stockLoading, setStockLoading] = useState(false)

    // Cart / Transfer list state
    const [transferItems, setTransferItems] = useState([])
    const [transferring, setTransferring] = useState(false)
    const [productSearchTerm, setProductSearchTerm] = useState('')
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false)

    useEffect(() => {
        fetchBranches()
    }, [])

    // Fetch stock whenever both branches are set
    useEffect(() => {
        if (fromBranch && toBranch) {
            fetchStock(fromBranch.branch_id)
        } else {
            setStocks([])
        }
    }, [fromBranch, toBranch])

    const fetchBranches = async () => {
        setBranchLoading(true)
        try {
            const res = await axios.get('/branches')
            const data = res.data.data || []
            setBranches(data)
            if (data.length > 0) setFromBranch(data[0])
        } catch (error) {
            console.error('Failed to fetch branches:', error)
            toast.error('Failed to load branches')
        } finally {
            setBranchLoading(false)
        }
    }

    const fetchStock = async (branchId) => {
        setStockLoading(true)
        try {
            const res = await axios.get(`/stocks/branch/${branchId}`)
            setStocks(res.data.data || [])
        } catch (error) {
            console.error('Failed to fetch stock:', error)
            toast.error('Failed to load stock for this branch')
        } finally {
            setStockLoading(false)
        }
    }

    const handleFromChange = (branchId) => {
        const branch = branches.find(b => b.branch_id.toString() === branchId)
        setFromBranch(branch || null)
        if (toBranch?.branch_id.toString() === branchId) setToBranch(null)
        setStocks([])
        setTransferItems([])
    }

    const handleToChange = (branchId) => {
        const branch = branches.find(b => b.branch_id.toString() === branchId)
        setToBranch(branch || null)
        setTransferItems([])
    }

    const handleAddProduct = (stockId) => {
        if (!stockId) return
        const stock = stocks.find(s => s.stock_id.toString() === stockId)
        if (!stock) return

        if (transferItems.find(item => item.stock.stock_id === stock.stock_id)) {
            toast.info(`${stock.product_name} is already in the transfer list`)
            return
        }

        setTransferItems([...transferItems, { stock, quantity: 1, notes: '', showNote: false }])
    }

    const updateTransferItem = (stockId, field, value) => {
        setTransferItems(transferItems.map(item => {
            if (item.stock.stock_id === stockId) {
                return { ...item, [field]: value }
            }
            return item
        }))
    }

    const removeTransferItem = (stockId) => {
        setTransferItems(transferItems.filter(item => item.stock.stock_id !== stockId))
    }

    const handleBulkTransfer = async () => {
        if (transferItems.length === 0) return

        // Validate quantities
        const invalidItem = transferItems.find(item => item.quantity < 1 || item.quantity > item.stock.quantity)
        if (invalidItem) {
            toast.error(`Invalid quantity for ${invalidItem.stock.product_name}. Maximum available is ${invalidItem.stock.quantity}.`)
            return
        }

        setTransferring(true)
        const referenceNumber = `TRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        
        try {
            // Process sequentially to avoid overlapping DB transactions or deadlocks
            for (const item of transferItems) {
                await axios.post('/stocks/transfer', {
                    product_id: item.stock.product_id,
                    from_branch_id: fromBranch.branch_id,
                    to_branch_id: toBranch.branch_id,
                    quantity: item.quantity,
                    notes: item.notes,
                    reference_number: referenceNumber
                })
            }
            toast.success(`Successfully transferred ${transferItems.length} products (ID: ${referenceNumber})`)
            setTransferItems([])
            fetchStock(fromBranch.branch_id) // Refresh stock
        } catch (error) {
            console.error('Transfer error:', error)
            toast.error(error.response?.data?.message || 'Some transfers failed. Please check your stock.')
            // Refresh stock anyway in case some succeeded
            fetchStock(fromBranch.branch_id)
        } finally {
            setTransferring(false)
        }
    }



    return (
        <div className="min-h-screen bg-background">

            {/* ── Page Header ── */}
            <div className="border-b bg-card">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <ArrowRightLeft className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">Stock Adjustment</h1>
                                <p className="text-sm text-muted-foreground">Transfer inventory between branches</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                {/* ── Transfer Route Card ── */}
                <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b bg-muted/30 flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4 text-primary" />
                        <span className="font-semibold text-sm">Transfer Route</span>
                        
                        <div className="hidden sm:flex items-center gap-1.5 ml-4 text-[11px] font-medium text-muted-foreground bg-background/50 px-2.5 py-1 rounded-full border border-border/50">
                            <Calendar className="h-3 w-3 text-primary" />
                            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>

                        {fromBranch && toBranch && (
                            <Badge variant="secondary" className="ml-auto text-xs gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                                Route Set
                            </Badge>
                        )}
                    </div>

                    <div className="p-6">
                        {branchLoading ? (
                            <div className="flex items-center gap-3 text-muted-foreground py-4">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Loading branches...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">

                                {/* FROM */}
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
                                        From Branch
                                    </label>
                                    <Select value={fromBranch?.branch_id?.toString() || ''} onValueChange={handleFromChange}>
                                        <SelectTrigger className="h-11 text-sm font-medium border-blue-200 dark:border-blue-900">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-blue-500 shrink-0" />
                                                <SelectValue placeholder="Select source branch" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((branch, index) => (
                                                <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                                                    <div className="flex items-center gap-2">
                                                        <span>{branch.branch_name}</span>
                                                        {index === 0 && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">Main</Badge>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fromBranch && (
                                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                                            {fromBranch.branch_code || '—'}{fromBranch.address ? ` · ${fromBranch.address}` : ''}
                                        </p>
                                    )}
                                </div>

                                {/* Arrow */}
                                <div className="flex items-center justify-center sm:pb-6 sm:px-1">
                                    <div className="flex items-center gap-1">
                                        <div className="h-px w-5 bg-border hidden sm:block" />
                                        <div className="h-9 w-9 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
                                            <ArrowRight className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="h-px w-5 bg-border hidden sm:block" />
                                    </div>
                                </div>

                                {/* TO */}
                                <div className="flex-1 space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                                        To Branch
                                    </label>
                                    <Select value={toBranch?.branch_id?.toString() || ''} onValueChange={handleToChange}>
                                        <SelectTrigger className="h-11 text-sm font-medium border-green-200 dark:border-green-900">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-green-500 shrink-0" />
                                                <SelectValue placeholder="Select destination branch" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches
                                                .filter(b => b.branch_id !== fromBranch?.branch_id)
                                                .map((branch) => (
                                                    <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                                                        {branch.branch_name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                    {toBranch && (
                                        <p className="text-[11px] text-muted-foreground font-mono truncate">
                                            {toBranch.branch_code || '—'}{toBranch.address ? ` · ${toBranch.address}` : ''}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Add Product & Transfer List ── */}
                {fromBranch && toBranch && (
                    <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col">
                        {/* Product Selector Header */}
                        <div className="px-6 py-4 border-b bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-sm">
                                    Available Stock from <span className="text-primary">{fromBranch.branch_name}</span>
                                </span>
                            </div>

                            <div className="w-full sm:w-80">
                                {stockLoading ? (
                                    <div className="h-10 px-3 py-2 border rounded-md bg-muted text-sm text-muted-foreground flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Loading products...
                                    </div>
                                ) : (
                                    <DropdownMenu open={isProductDropdownOpen} onOpenChange={setIsProductDropdownOpen}>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                className="h-10 w-full bg-background border-primary/20 hover:border-primary/50 transition-colors shadow-sm justify-between px-3 font-normal"
                                            >
                                                <div className="flex items-center gap-2 text-primary">
                                                    <PlusCircle className="h-4 w-4" />
                                                    <span>Select product to add to transfer...</span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[350px] p-2 space-y-2" align="end">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    placeholder="Search product name or code..." 
                                                    className="pl-8 h-9" 
                                                    value={productSearchTerm}
                                                    onChange={(e) => setProductSearchTerm(e.target.value)}
                                                    autoFocus
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <div className="max-h-64 overflow-auto custom-scrollbar">
                                                {stocks.filter(s => s.quantity > 0).filter(s => 
                                                    s.product_name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                                    (s.product?.product_code || '').toLowerCase().includes(productSearchTerm.toLowerCase())
                                                ).length > 0 ? (
                                                    stocks
                                                        .filter(s => s.quantity > 0)
                                                        .filter(s => 
                                                            s.product_name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                                            (s.product?.product_code || '').toLowerCase().includes(productSearchTerm.toLowerCase())
                                                        )
                                                        .map(stock => (
                                                            <div 
                                                                key={stock.stock_id}
                                                                className={`p-2 text-sm hover:bg-primary/10 cursor-pointer rounded-sm flex flex-col transition-colors mb-1 ${
                                                                    transferItems.find(item => item.stock.stock_id === stock.stock_id) ? "bg-primary/5 opacity-60" : ""
                                                                }`}
                                                                onClick={() => {
                                                                    handleAddProduct(stock.stock_id.toString());
                                                                    setIsProductDropdownOpen(false);
                                                                    setProductSearchTerm('');
                                                                }}
                                                            >
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className="font-medium truncate">{stock.product_name}</span>
                                                                    {transferItems.find(item => item.stock.stock_id === stock.stock_id) && (
                                                                        <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-0.5">
                                                                    <span className="font-mono">{stock.product?.product_code || 'No Code'}</span>
                                                                    <span className="bg-muted px-1.5 py-0.5 rounded font-bold">
                                                                        Stock: {stock.quantity}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                ) : (
                                                    <div className="p-4 text-center text-sm text-muted-foreground italic">
                                                        {stocks.filter(s => s.quantity > 0).length === 0 
                                                            ? "No items in stock at this branch" 
                                                            : `No products match "${productSearchTerm}"`}
                                                    </div>
                                                )}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>

                        {/* Transfer List Table */}
                        {transferItems.length > 0 ? (
                            <div className="flex flex-col">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/10">
                                            <TableRow>
                                                <TableHead className="w-[30%]">Product</TableHead>
                                                <TableHead>Available</TableHead>
                                                <TableHead className="w-[15%]">Transfer Qty</TableHead>
                                                <TableHead className="w-[35%]">Notes (Optional)</TableHead>
                                                <TableHead className="text-right">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transferItems.map((item) => (
                                                <TableRow key={item.stock.stock_id}>
                                                    <TableCell>
                                                        <div className="font-medium">{item.stock.product_name}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">
                                                            {item.stock.product?.product_code || 'N/A'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-mono bg-muted/50">
                                                            {item.stock.quantity}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            max={item.stock.quantity}
                                                            value={item.quantity}
                                                            onChange={(e) => updateTransferItem(item.stock.stock_id, 'quantity', parseInt(e.target.value) || 0)}
                                                            className={`h-9 ${item.quantity > item.stock.quantity || item.quantity < 1 ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                                                        />
                                                        {(item.quantity > item.stock.quantity || item.quantity < 1) && (
                                                            <span className="text-[10px] text-destructive absolute mt-1">Invalid qty</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center gap-2">
                                                                <Checkbox 
                                                                    id={`note-${item.stock.stock_id}`}
                                                                    checked={item.showNote}
                                                                    onCheckedChange={(checked) => updateTransferItem(item.stock.stock_id, 'showNote', !!checked)}
                                                                    className="h-4 w-4 border-primary/30 data-[state=checked]:bg-primary"
                                                                />
                                                                <Label 
                                                                    htmlFor={`note-${item.stock.stock_id}`}
                                                                    className="text-[10px] uppercase font-bold text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                                                                >
                                                                    {item.showNote ? 'Hide Note' : 'Add Note'}
                                                                </Label>
                                                            </div>
                                                            
                                                            {item.showNote && (
                                                                <Textarea
                                                                    value={item.notes}
                                                                    onChange={(e) => updateTransferItem(item.stock.stock_id, 'notes', e.target.value)}
                                                                    placeholder="Reason for transfer..."
                                                                    className="min-h-[60px] h-auto py-2 resize-none text-xs bg-muted/50 border-primary/10 focus-visible:ring-primary/20 animate-in fade-in slide-in-from-top-1 duration-200"
                                                                />
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-8 w-8"
                                                            onClick={() => removeTransferItem(item.stock.stock_id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                          {/* Table Footer Actions */}
                                <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
                                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                        <div>Total Products: <span className="font-bold text-foreground">{transferItems.length}</span></div>
                                        <div>Total Quantity: <span className="font-bold text-primary">{transferItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0).toLocaleString()}</span></div>
                                    </div>
                                    <Button
                                        onClick={handleBulkTransfer}
                                        disabled={transferring || transferItems.some(item => item.quantity < 1 || item.quantity > item.stock.quantity)}
                                        className="gap-2"
                                    >
                                        {transferring ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                                        ) : (
                                            <><Send className="h-4 w-4" /> Confirm Transfer</>
                                        )}
                                    </Button>
                                </div>                        </div>
                            </div>
                        ) : (
                            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                                <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                                    <Package className="h-8 w-8 text-primary/40" />
                                </div>
                                <h3 className="font-semibold text-lg mb-1">No products selected</h3>
                                <p className="text-muted-foreground text-sm max-w-sm">
                                    Select a product from the dropdown above to add it to your transfer list.
                                </p>
                            </div>
                        )}
                    </div>
                )}



            </div>
        </div>
    )
}
