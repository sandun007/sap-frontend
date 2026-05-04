import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Save, X, ShoppingCart, FileText, Calendar, User, History, 
    ChevronDown, Building2, Package, Calculator, Wallet, Landmark, CreditCard, Banknote, Search, Check, ReceiptText, RotateCcw
} from 'lucide-react';
import api, { purchaseAPI, bankAPI } from '@/api/api';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AddPurchase() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    
    function generatePurchaseId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `GRN-${timestamp}-${random}`;
    }
    
    const [purchaseId] = useState(generatePurchaseId());
    
    // Data for selects
    const [suppliers, setSuppliers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);
    const [banks, setBanks] = useState([]);
    
    // Search and Dropdown states
    const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
    const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [activeProductSearchIndex, setActiveProductSearchIndex] = useState(null);
    const [bankSearchTerm, setBankSearchTerm] = useState('');
    const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
    const [productHistory, setProductHistory] = useState({
        loading: false,
        data: [],
        productName: '',
        productId: null
    });
    const [activeHistoryIndex, setActiveHistoryIndex] = useState(0);

    // Form state
    const [formData, setFormData] = useState({
        supplier_id: '',
        branch_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        reference_no: '',
        notes: '',
        items: [
            { product_id: '', product_name: '', product_code: '', brand_name: '', category_name: '', quantity: 1, stock_price: 0, selling_price: 0, discount: 0, subtotal: 0 }
        ],
        discount: 0,
        // Payment fields
        payment_method: 'Cash',
        amount_paid: 0,
        payment_notes: '',
        bank_details: {
            bank_name: '',
            reference_no: ''
        },
        card_details: {
            card_type: '',
            last_four: ''
        },
        loan_details: {
            interest_rate: 0,
            term_months: 12
        }
    });

    // Totals
    const [totals, setTotals] = useState({
        subtotal: 0,
        tax_amount: 0,
        grand_total: 0,
        balance_due: 0
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [supRes, branchRes, prodRes, bankRes] = await Promise.all([
                api.get('/suppliers'),
                api.get('/branches'),
                api.get('/products'),
                bankAPI.getAll()
            ]);
            
            const suppliersData = supRes.data.data || [];
            const branchesData = branchRes.data.data || [];
            const productsData = prodRes.data.data || [];
            const banksData = bankRes.data.data || [];
            
            setSuppliers(suppliersData);
            setBranches(branchesData);
            setProducts(productsData);
            setBanks(banksData);

            // Default to "Main Branch"
            if (branchesData.length > 0) {
                const mainBranch = branchesData.find(b => 
                    b.branch_name.toLowerCase().includes('main')
                ) || branchesData[0];
                
                setFormData(prev => ({ 
                    ...prev, 
                    branch_id: mainBranch.branch_id.toString() 
                }));
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error("Failed to load initial data");
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = async (index, field, value) => {
        const newItems = [...formData.items];
        const item = { ...newItems[index] };

        if (field === 'product_id') {
            const product = products.find(p => p.product_id.toString() === value);
            if (product) {
                item.product_id = value;
                item.product_name = product.product_name;
                item.product_code = product.product_code;
                item.brand_name = product.brand?.brand_name || 'N/A';
                item.category_name = product.subcategory?.category?.category_name || 'N/A';
                item.stock_price = product.cost_price || 0;
                item.selling_price = product.price || 0;
                item.discount = 0;
                item.subtotal = (item.quantity || 1) * (item.selling_price || 0);
                
                // Fetch purchase history for this product
                setActiveHistoryIndex(index);
                fetchProductHistory(product);
            }
        } else {
            item[field] = value;
        }

        const qty = parseFloat(item.quantity || 0);
        const price = parseFloat(item.selling_price || 0);
        const disc = parseFloat(item.discount || 0);
        
        // Total = (Selling Price per item - Discount per item) * Quantity
        item.subtotal = (price - disc) * qty;
        
        newItems[index] = item;
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const fetchProductHistory = async (product) => {
        if (!product || !product.product_id) return;
        if (productHistory.productId === product.product_id && !productHistory.loading) return;

        setProductHistory({ loading: true, data: [], productName: product.product_name, productId: product.product_id });
        try {
            const response = await purchaseAPI.getProductHistory(product.product_id);
            setProductHistory({
                loading: false,
                data: response.data.data || [],
                productName: product.product_name,
                productId: product.product_id
            });
        } catch (error) {
            console.error('Failed to fetch product history:', error);
            setProductHistory(prev => ({ ...prev, loading: false }));
        }
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { product_id: '', product_name: '', product_code: '', brand_name: '', category_name: '', quantity: 1, stock_price: 0, selling_price: 0, discount: 0, subtotal: 0 }]
        }));
    };

    const removeItem = (index) => {
        if (formData.items.length === 1) {
            toast.error("At least one item is required");
            return;
        }
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    useEffect(() => {
        const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
        const grandTotal = subtotal - (parseFloat(formData.discount) || 0);
        const balanceDue = grandTotal - (parseFloat(formData.amount_paid) || 0);

        setTotals({
            subtotal,
            tax_amount: 0,
            grand_total: Math.max(0, grandTotal),
            balance_due: Math.max(0, balanceDue)
        });

        // Smart History Logic: Ensure we are showing history for a valid product in the list
        const validItems = formData.items.filter(item => item.product_id);
        if (validItems.length > 0) {
            // If current history product is gone or not set, pick the last valid item
            const currentItemExists = validItems.some(item => item.product_id.toString() === productHistory.productId?.toString());
            if (!currentItemExists && !productHistory.loading) {
                const latestItem = validItems[validItems.length - 1];
                const productObj = products.find(p => p.product_id.toString() === latestItem.product_id.toString());
                if (productObj) {
                    fetchProductHistory(productObj);
                    const idx = formData.items.findIndex(item => item.product_id === latestItem.product_id);
                    setActiveHistoryIndex(idx);
                }
            }
        } else if (productHistory.productId) {
            setProductHistory({ loading: false, data: [], productName: '', productId: null });
        }
    }, [formData.items, formData.discount, formData.amount_paid]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.supplier_id || !formData.branch_id) {
            toast.error("Please select a supplier and branch");
            return;
        }

        const validItems = formData.items.filter(item => item.product_id);
        if (validItems.length === 0) {
            toast.error("Please add at least one product");
            return;
        }

        if (formData.payment_method === 'Bank') {
            if (!formData.bank_details.bank_name) {
                toast.error("Please select a bank for bank transfer payment");
                return;
            }
            const selectedBank = banks.find(b => b.bank_name === formData.bank_details.bank_name);
            if (selectedBank) {
                const remaining = (parseFloat(selectedBank.amount) || 0) - (parseFloat(formData.amount_paid) || 0);
                if (remaining < 0) {
                    toast.error("Insufficient funds in the selected bank account");
                    return;
                }
            }
        }

        if (formData.payment_method === 'Cash') {
            const minPayment = totals.grand_total / 3;
            if (formData.amount_paid < minPayment) {
                toast.error(`For cash payments, at least 1/3 (Rs. ${Math.ceil(minPayment).toLocaleString()}) must be paid upfront.`);
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                purchase_id: purchaseId,
                ...formData,
                items: validItems,
                ...totals
            };

            await purchaseAPI.create(payload);
            toast.success("Purchase recorded successfully!");
            navigate('/purchases/list');
        } catch (error) {
            console.error('Failed to save purchase:', error);
            toast.error(error.response?.data?.message || "Failed to record purchase");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-slate-900">
                        <ShoppingCart className="h-8 w-8 text-slate-500" />
                        New Goods Received Note
                    </h1>
                    <p className="text-muted-foreground">Record incoming stock from suppliers</p>
                </div>
                <Badge variant="outline" className="text-sm px-4 py-1.5 border-slate-200 bg-slate-50 text-slate-600 font-mono">
                    ID: {purchaseId}
                </Badge>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Received Items Picker */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between border-b bg-gray-50/50">
                        <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-gray-500" />
                                Received Items
                            </CardTitle>
                            <CardDescription>Add products being received in this shipment</CardDescription>
                        </div>
                        <Button type="button" onClick={addItem} size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Item
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead className="w-[40%] px-4">Product</TableHead>
                                        <TableHead className="px-4">Brand</TableHead>
                                        <TableHead className="px-4">Category</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {formData.items.map((item, index) => (
                                        <TableRow key={index} className="group transition-colors hover:bg-primary/5">
                                            <TableCell className="p-4">
                                                <DropdownMenu 
                                                    open={activeProductSearchIndex === index} 
                                                    onOpenChange={(open) => setActiveProductSearchIndex(open ? index : null)}
                                                >
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            type="button"
                                                            variant="outline"
                                                            className={`w-full justify-between font-normal bg-white h-10 ${!item.product_id ? "text-muted-foreground" : "font-medium"}`}
                                                        >
                                                            <span className="truncate max-w-[200px]">
                                                                {item.product_name || "Search Product..."}
                                                            </span>
                                                            <Search className="h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-[350px] p-2 space-y-2" align="start">
                                                        <div className="relative">
                                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input 
                                                                placeholder="Type product name or code..." 
                                                                className="pl-8 h-9" 
                                                                value={productSearchTerm}
                                                                onChange={(e) => setProductSearchTerm(e.target.value)}
                                                                autoFocus
                                                                onKeyDown={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div className="max-h-60 overflow-auto custom-scrollbar">
                                                            {products.filter(p => 
                                                                p.product_name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                                                p.product_code.toLowerCase().includes(productSearchTerm.toLowerCase())
                                                            ).length > 0 ? (
                                                                products
                                                                    .filter(p => 
                                                                        p.product_name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
                                                                        p.product_code.toLowerCase().includes(productSearchTerm.toLowerCase())
                                                                    )
                                                                    .map(p => (
                                                                        <div 
                                                                            key={p.product_id}
                                                                            className={`p-2 text-sm hover:bg-primary/10 cursor-pointer rounded-sm flex flex-col transition-colors ${
                                                                                item.product_id === p.product_id.toString() ? "bg-primary/5 border-l-2 border-primary" : ""
                                                                            }`}
                                                                            onClick={() => {
                                                                                handleItemChange(index, 'product_id', p.product_id.toString());
                                                                                setActiveProductSearchIndex(null);
                                                                            }}
                                                                        >
                                                                            <span className="font-medium">{p.product_name}</span>
                                                                            <span className="text-xs text-muted-foreground flex justify-between">
                                                                                <span>Code: {p.product_code}</span>
                                                                                <span>Brand: {p.brand?.brand_name || 'N/A'}</span>
                                                                            </span>
                                                                        </div>
                                                                    ))
                                                            ) : (
                                                                <div className="p-4 text-center text-sm text-muted-foreground italic">
                                                                    No products found matching "{productSearchTerm}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                            <TableCell className="p-4">
                                                <span className="text-sm text-muted-foreground">{item.brand_name || '-'}</span>
                                            </TableCell>
                                            <TableCell className="p-4">
                                                <span className="text-sm text-muted-foreground">{item.category_name || '-'}</span>
                                            </TableCell>
                                            <TableCell className="p-4">
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Basic Details & Payment Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="border-b bg-gray-50/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-5 w-5 text-gray-500" />
                                Basic Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Supplier *</Label>
                                    <DropdownMenu open={isSupplierDropdownOpen} onOpenChange={setIsSupplierDropdownOpen}>
                                        <DropdownMenuTrigger asChild>
                                            <Button 
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-between font-normal"
                                            >
                                                <span className={formData.supplier_id ? "" : "text-muted-foreground"}>
                                                    {formData.supplier_id 
                                                        ? suppliers.find(s => s.supplier_id.toString() === formData.supplier_id)?.supplier_name 
                                                        : "Select Supplier"}
                                                </span>
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[300px] p-2 space-y-2" align="start">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input 
                                                    placeholder="Search supplier..." 
                                                    className="pl-8 h-9" 
                                                    value={supplierSearchTerm}
                                                    onChange={(e) => setSupplierSearchTerm(e.target.value)}
                                                    autoFocus
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                            <div className="max-h-60 overflow-auto custom-scrollbar">
                                                {suppliers.filter(s => 
                                                    s.supplier_name.toLowerCase().includes(supplierSearchTerm.toLowerCase())
                                                ).length > 0 ? (
                                                    suppliers
                                                        .filter(s => s.supplier_name.toLowerCase().includes(supplierSearchTerm.toLowerCase()))
                                                        .map(s => (
                                                            <div 
                                                                key={s.supplier_id}
                                                                className={`p-2 text-sm hover:bg-primary/10 cursor-pointer rounded-sm flex items-center justify-between transition-colors ${
                                                                    formData.supplier_id === s.supplier_id.toString() ? "bg-primary/5 font-medium text-primary" : ""
                                                                }`}
                                                                onClick={() => {
                                                                    handleInputChange('supplier_id', s.supplier_id.toString());
                                                                    setIsSupplierDropdownOpen(false);
                                                                    setSupplierSearchTerm('');
                                                                }}
                                                            >
                                                                {s.supplier_name}
                                                                {formData.supplier_id === s.supplier_id.toString() && <Check className="h-4 w-4" />}
                                                            </div>
                                                        ))
                                                ) : (
                                                    <div className="p-4 text-center text-sm text-muted-foreground italic">
                                                        No suppliers found matching "{supplierSearchTerm}"
                                                    </div>
                                                )}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="space-y-2">
                                    <Label>Receiving Branch *</Label>
                                    <Select 
                                        value={formData.branch_id} 
                                        onValueChange={(v) => handleInputChange('branch_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map(b => (
                                                <SelectItem key={b.branch_id} value={b.branch_id.toString()}>
                                                    {b.branch_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Purchase Date</Label>
                                    <Input 
                                        type="date" 
                                        value={formData.purchase_date} 
                                        onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reference / Invoice No.</Label>
                                    <Input 
                                        placeholder="e.g. INV-12345" 
                                        value={formData.reference_no} 
                                        onChange={(e) => handleInputChange('reference_no', e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="border-b bg-gray-50/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Wallet className="h-5 w-5 text-gray-500" />
                                Payment Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Payment Method</Label>
                                        <Select 
                                            value={formData.payment_method} 
                                            onValueChange={(v) => handleInputChange('payment_method', v)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Method" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Cash">
                                                    <div className="flex items-center gap-2">
                                                        <Banknote className="h-4 w-4 text-green-500" /> Cash
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Bank">
                                                    <div className="flex items-center gap-2">
                                                        <Landmark className="h-4 w-4 text-blue-500" /> Bank Transfer
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Card">
                                                    <div className="flex items-center gap-2">
                                                        <CreditCard className="h-4 w-4 text-purple-500" /> Credit Card
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="Loan">
                                                    <div className="flex items-center gap-2">
                                                        <ReceiptText className="h-4 w-4 text-orange-500" /> Loan / Credit
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label>Amount Paid (Rs.)</Label>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-6 text-xs text-primary"
                                                onClick={() => handleInputChange('amount_paid', totals.grand_total)}
                                            >
                                                Pay Full
                                            </Button>
                                        </div>
                                        <Input 
                                            type="number" 
                                            value={formData.amount_paid} 
                                            onChange={(e) => handleInputChange('amount_paid', parseFloat(e.target.value) || 0)}
                                            className="text-lg font-semibold"
                                        />
                                        {formData.payment_method === 'Cash' && (parseFloat(formData.amount_paid) || 0) < (totals.grand_total / 3) && (
                                            <p className="text-[10px] text-destructive mt-1 italic font-medium animate-pulse">
                                                ⚠️ Minimum upfront: Rs. {Math.ceil(totals.grand_total / 3).toLocaleString()} (1/3 of total)
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 bg-gray-50/50 p-4 rounded-lg border border-dashed">
                                    {formData.payment_method === 'Bank' && (
                                        <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
                                            <div className="space-y-2">
                                                <Label>Select Bank</Label>
                                                <DropdownMenu open={isBankDropdownOpen} onOpenChange={setIsBankDropdownOpen}>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button 
                                                            type="button"
                                                            variant="outline"
                                                            className="w-full justify-between font-normal h-10"
                                                        >
                                                            <span className={formData.bank_details.bank_name ? "" : "text-muted-foreground"}>
                                                                {formData.bank_details.bank_name || "Choose a bank"}
                                                            </span>
                                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-[350px] p-2 space-y-2" align="start">
                                                        <div className="relative">
                                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                                            <Input 
                                                                placeholder="Search bank name or account..." 
                                                                className="pl-8 h-9" 
                                                                value={bankSearchTerm}
                                                                onChange={(e) => setBankSearchTerm(e.target.value)}
                                                                autoFocus
                                                                onKeyDown={(e) => e.stopPropagation()}
                                                            />
                                                        </div>
                                                        <div className="max-h-60 overflow-auto custom-scrollbar">
                                                            {banks.filter(bank => 
                                                                bank.bank_name.toLowerCase().includes(bankSearchTerm.toLowerCase()) ||
                                                                bank.account_number.toLowerCase().includes(bankSearchTerm.toLowerCase())
                                                            ).length > 0 ? (
                                                                banks
                                                                    .filter(bank => 
                                                                        bank.bank_name.toLowerCase().includes(bankSearchTerm.toLowerCase()) ||
                                                                        bank.account_number.toLowerCase().includes(bankSearchTerm.toLowerCase())
                                                                    )
                                                                    .map(bank => (
                                                                        <div 
                                                                            key={bank.id}
                                                                            className={`p-2 text-sm hover:bg-primary/10 cursor-pointer rounded-sm flex flex-col transition-colors ${
                                                                                formData.bank_details.bank_name === bank.bank_name ? "bg-primary/5 border-l-2 border-primary" : ""
                                                                            }`}
                                                                            onClick={() => {
                                                                                handleInputChange('bank_details', { ...formData.bank_details, bank_name: bank.bank_name });
                                                                                setIsBankDropdownOpen(false);
                                                                                setBankSearchTerm('');
                                                                            }}
                                                                        >
                                                                            <span className="font-medium text-slate-900">{bank.bank_name}</span>
                                                                            <div className="flex justify-between text-[11px] text-muted-foreground">
                                                                                <span>{bank.account_number}</span>
                                                                                <span>{bank.branch_name}</span>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                            ) : (
                                                                <div className="p-4 text-center text-sm text-muted-foreground italic">
                                                                    No banks found matching "{bankSearchTerm}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Reference / Cheque No.</Label>
                                                <Input 
                                                    placeholder="Ref #" 
                                                    value={formData.bank_details.reference_no}
                                                    onChange={(e) => handleInputChange('bank_details', { ...formData.bank_details, reference_no: e.target.value })}
                                                />
                                            </div>

                                            {(() => {
                                                const selectedBank = banks.find(b => b.bank_name === formData.bank_details.bank_name);
                                                if (selectedBank) {
                                                    const remaining = (parseFloat(selectedBank.amount) || 0) - (parseFloat(formData.amount_paid) || 0);
                                                    return (
                                                        <div className="pt-3 mt-1 border-t border-dashed border-slate-300">
                                                            <div className="flex justify-between items-center text-[11px] text-slate-500">
                                                                <span>Current Bank Balance:</span>
                                                                <span className="font-medium">Rs. {(parseFloat(selectedBank.amount) || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-[11px] mt-1">
                                                                <span className="font-semibold uppercase tracking-tight text-slate-600">Projected Balance:</span>
                                                                <span className={`font-bold ${remaining < 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                                                                    Rs. {remaining.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {remaining < 0 && (
                                                                <p className="text-[10px] text-destructive mt-1 italic font-medium">
                                                                    ⚠️ Insufficient funds in this account
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    )}

                                    {formData.payment_method === 'Card' && (
                                        <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
                                            <div className="space-y-2">
                                                <Label>Card Type</Label>
                                                <Select 
                                                    value={formData.card_details.card_type}
                                                    onValueChange={(v) => handleInputChange('card_details', { ...formData.card_details, card_type: v })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Visa / Master" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Visa">Visa</SelectItem>
                                                        <SelectItem value="MasterCard">MasterCard</SelectItem>
                                                        <SelectItem value="Amex">Amex</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Last 4 Digits (Optional)</Label>
                                                <Input 
                                                    placeholder="1234" 
                                                    maxLength={4}
                                                    value={formData.card_details.last_four}
                                                    onChange={(e) => handleInputChange('card_details', { ...formData.card_details, last_four: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {formData.payment_method === 'Loan' && (
                                        <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
                                            <div className="space-y-2">
                                                <Label>Loan Interest Rate (%)</Label>
                                                <Input 
                                                    type="number" 
                                                    value={formData.loan_details.interest_rate}
                                                    onChange={(e) => handleInputChange('loan_details', { ...formData.loan_details, interest_rate: parseFloat(e.target.value) || 0 })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Term (Months)</Label>
                                                <Input 
                                                    type="number" 
                                                    value={formData.loan_details.term_months}
                                                    onChange={(e) => handleInputChange('loan_details', { ...formData.loan_details, term_months: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {formData.payment_method === 'Cash' && (
                                        <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-muted-foreground py-4">
                                            <Banknote className="h-10 w-10 opacity-20" />
                                            <p className="text-xs italic">Standard cash payment. No additional details required.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label>Payment Notes</Label>
                                <Input 
                                    placeholder="Add any specific instructions or remarks..." 
                                    value={formData.payment_notes}
                                    onChange={(e) => handleInputChange('payment_notes', e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* 3. Condition: if product selected, show History and Pricing */}
                {formData.items.some(item => item.product_id) && (
                    <div className="space-y-6">
                        <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <CardHeader className="border-b bg-gray-50/50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Calculator className="h-5 w-5 text-gray-500" />
                                    Item Details & Pricing
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gray-50/50">
                                                <TableHead className="px-4 w-[120px]">Code</TableHead>
                                                <TableHead className="px-4 min-w-[200px]">Name</TableHead>
                                                <TableHead className="px-4 w-[140px] text-right">Stock Price (Rs.)</TableHead>
                                                <TableHead className="px-4 w-[140px] text-right">Selling Price (Rs.)</TableHead>
                                                <TableHead className="px-4 w-[120px] text-right">Discount (Rs.)</TableHead>
                                                <TableHead className="px-4 w-[100px] text-right">Quantity</TableHead>
                                                <TableHead className="px-4 w-[150px] text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {formData.items.filter(item => item.product_id).map((item, index) => {
                                                const realIndex = formData.items.findIndex(i => i === item);
                                                const isActive = activeHistoryIndex === realIndex;
                                                return (
                                                    <TableRow 
                                                        key={realIndex}
                                                        className={`transition-colors cursor-pointer ${isActive ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''}`}
                                                        onClick={() => {
                                                            setActiveHistoryIndex(realIndex);
                                                            const productObj = products.find(p => p.product_id.toString() === item.product_id.toString());
                                                            if (productObj) fetchProductHistory(productObj);
                                                        }}
                                                    >
                                                        <TableCell className="px-4 font-mono text-xs">
                                                            <div className="flex items-center gap-2">
                                                                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                                                                {item.product_code}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-4 font-medium">{item.product_name}</TableCell>
                                                        <TableCell className="px-4">
                                                            <Input 
                                                                type="number" 
                                                                className="h-8 w-full text-right bg-white"
                                                                value={item.stock_price}
                                                                onChange={(e) => handleItemChange(realIndex, 'stock_price', e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-4">
                                                            <Input 
                                                                type="number" 
                                                                className="h-8 w-full text-right bg-white"
                                                                value={item.selling_price}
                                                                onChange={(e) => handleItemChange(realIndex, 'selling_price', e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-4">
                                                            <Input 
                                                                type="number" 
                                                                className="h-8 w-full text-right bg-white"
                                                                value={item.discount}
                                                                onChange={(e) => handleItemChange(realIndex, 'discount', e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-4">
                                                            <Input 
                                                                type="number" 
                                                                min="1"
                                                                className="h-8 w-full text-right bg-white"
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemChange(realIndex, 'quantity', e.target.value)}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="px-4 text-right font-bold text-primary whitespace-nowrap">
                                                            Rs. {(parseFloat(item.subtotal) || 0).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                                
                                <div className="p-6 bg-gray-50/30 border-t">
                                    <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-8">
                                        <div className="flex items-center gap-4">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Discount (Rs.)</Label>
                                            <Input 
                                                type="number" 
                                                className="h-9 w-32 bg-white" 
                                                value={formData.discount} 
                                                onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                                            />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grand Total</span>
                                            <span className="text-2xl font-bold text-gray-900">Rs. {(totals.grand_total || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col items-end border-l pl-8 border-gray-200">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Balance Due</span>
                                            <span className={`text-lg font-semibold ${(totals.balance_due || 0) > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                                Rs. {(totals.balance_due || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Product Purchase History Table (Bottom) */}
                        {(productHistory.loading || (productHistory.data && productHistory.data.length > 0)) && (
                            <Card className="border-none shadow-sm bg-slate-50/50 animate-in fade-in slide-in-from-top-4 duration-300">
                                <CardHeader className="pb-3 px-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                                <History className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-bold">Previous Purchase History</CardTitle>
                                                <CardDescription className="text-[11px]">
                                                    Recent 5 purchases for: <span className="font-semibold text-amber-700">{productHistory.productName}</span>
                                                </CardDescription>
                                            </div>
                                        </div>
                                        {productHistory.loading && (
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-600 border-t-transparent"></div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="px-4 pb-4">
                                    <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                                    <TableHead className="text-[11px] font-bold h-10">GRN ID</TableHead>
                                                    <TableHead className="text-[11px] font-bold h-10">Date</TableHead>
                                                    <TableHead className="text-[11px] font-bold h-10">Supplier</TableHead>
                                                    <TableHead className="text-[11px] font-bold h-10">Qty</TableHead>
                                                    <TableHead className="text-[11px] font-bold h-10">Cost (Rs.)</TableHead>
                                                    <TableHead className="text-[11px] font-bold h-10 text-right">Selling (Rs.)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {productHistory.data && productHistory.data.map((history, idx) => (
                                                    <TableRow key={idx} className="h-10 hover:bg-slate-50/30 transition-colors">
                                                        <TableCell className="py-2 text-[11px] font-mono font-medium text-slate-500">
                                                            {history.purchase_id}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-[11px] font-medium">
                                                            {history.purchase_date}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-[11px] font-semibold text-slate-700">
                                                            {history.supplier_name}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-[11px] font-bold">
                                                            {history.quantity}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-[11px] font-bold text-primary">
                                                            Rs. {parseFloat(history.stock_price).toLocaleString()}
                                                        </TableCell>
                                                        <TableCell className="py-2 text-[11px] font-bold text-right text-emerald-600">
                                                            Rs. {parseFloat(history.selling_price).toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4 border-t">
                    <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate('/purchases/list')}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 min-w-[150px]" 
                        disabled={loading}
                    >
                        <Save className="h-4 w-4" />
                        {loading ? "Processing..." : "Complete GRN"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
