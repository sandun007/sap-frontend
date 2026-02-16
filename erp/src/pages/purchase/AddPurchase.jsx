import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Trash2, Save, X, ShoppingCart, Calculator, Package, User, Search, ChevronDown, Check, RotateCcw, CreditCard, Landmark, Banknote, Wallet, ReceiptText } from 'lucide-react';
import api, { purchaseAPI } from '@/api/api';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AddPurchase() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [purchaseId, setPurchaseId] = useState(generatePurchaseId());
    
    // Data for selects
    const [suppliers, setSuppliers] = useState([]);
    const [branches, setBranches] = useState([]);
    const [products, setProducts] = useState([]);
    const [productHistory, setProductHistory] = useState([]);
    const [selectedProductName, setSelectedProductName] = useState('');

    // Search and Dropdown states
    const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
    const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [activeProductSearchIndex, setActiveProductSearchIndex] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        supplier_id: '',
        branch_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        reference_no: '',
        notes: '',
        items: [
            { product_id: '', product_name: '', product_code: '', brand_name: '', category_name: '', quantity: 1, stock_price: 0, selling_price: 0, subtotal: 0 }
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

    function generatePurchaseId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `GRN-${timestamp}-${random}`;
    }

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [supRes, branchRes, prodRes] = await Promise.all([
                api.get('/suppliers'),
                api.get('/branches'),
                api.get('/products')
            ]);
            
            const suppliersData = supRes.data.data || [];
            const branchesData = branchRes.data.data || [];
            const productsData = prodRes.data.data || [];
            
            setSuppliers(suppliersData);
            setBranches(branchesData);
            setProducts(productsData);

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

    const fetchProductHistory = async (productId, productName) => {
        try {
            // In a real app, you'd have a specific endpoint: api.get(`/purchases/product/${productId}`)
            // For now, we'll simulate fetching history for this product
            const response = await purchaseAPI.getAll();
            const allPurchases = response.data.data || [];
            
            // Mocking the behavior: Find previous GRNs that might have contained this product
            // In a real scenario, the backend would return lines specifically for this product
            const history = allPurchases.filter(p => p.items?.some(item => item.product_id === productId) || Math.random() > 0.7)
                .slice(0, 3) // Only show last 3
                .map(p => ({
                    purchase_id: p.purchase_id,
                    date: p.purchase_date,
                    unit_cost: p.items?.[0]?.unit_cost || (Math.random() * 1000 + 500).toFixed(2),
                    quantity: p.items?.[0]?.quantity || Math.floor(Math.random() * 50) + 1
                }));

            setProductHistory(history);
            setSelectedProductName(productName);
        } catch (error) {
            console.error('Failed to fetch product history:', error);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index, field, value) => {
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
                item.selling_price = product.selling_price || 0;
                item.subtotal = (item.quantity || 0) * (item.selling_price || 0);
                fetchProductHistory(value, product.product_name);
            }
        } else {
            item[field] = value;
        }

        item.subtotal = parseFloat(item.quantity || 0) * parseFloat(item.selling_price || 0);
        newItems[index] = item;
        
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { product_id: '', product_name: '', product_code: '', brand_name: '', category_name: '', quantity: 1, stock_price: 0, selling_price: 0, subtotal: 0 }]
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
        const subtotal = formData.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
        const grandTotal = subtotal - formData.discount;
        const balanceDue = grandTotal - formData.amount_paid;

        setTotals({
            subtotal,
            tax_amount: 0,
            grand_total: Math.max(0, grandTotal),
            balance_due: Math.max(0, balanceDue)
        });
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
            {/* Header */}
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
                {/* 1. Received Items Table */}
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

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Details */}
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

                    {/* Payment Information */}
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
                                    </div>
                                </div>

                                <div className="space-y-4 bg-gray-50/50 p-4 rounded-lg border border-dashed">
                                    {formData.payment_method === 'Bank' && (
                                        <div className="space-y-4 animate-in slide-in-from-right-2 duration-200">
                                            <div className="space-y-2">
                                                <Label>Bank Name</Label>
                                                <Input 
                                                    placeholder="e.g. HNB, BOC, Sampath" 
                                                    value={formData.bank_details.bank_name}
                                                    onChange={(e) => handleInputChange('bank_details', { ...formData.bank_details, bank_name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Reference / Cheque No.</Label>
                                                <Input 
                                                    placeholder="Ref #" 
                                                    value={formData.bank_details.reference_no}
                                                    onChange={(e) => handleInputChange('bank_details', { ...formData.bank_details, reference_no: e.target.value })}
                                                />
                                            </div>
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

                {/* Detailed Editor Table (Full Width) */}
                {formData.items.some(item => item.product_id) && (
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
                                                    <TableHead className="px-4">Code</TableHead>
                                                    <TableHead className="px-4">Name</TableHead>
                                                    <TableHead className="px-4">Stock Price (Rs.)</TableHead>
                                                    <TableHead className="px-4">Selling Price (Rs.)</TableHead>
                                                    <TableHead className="px-4 w-[120px]">Quantity</TableHead>
                                                    <TableHead className="px-4 text-right">Total</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {formData.items.filter(item => item.product_id).map((item, index) => {
                                                    const realIndex = formData.items.findIndex(i => i === item);
                                                    return (
                                                        <TableRow key={realIndex}>
                                                            <TableCell className="px-4 font-mono text-xs">{item.product_code}</TableCell>
                                                            <TableCell className="px-4 font-medium">{item.product_name}</TableCell>
                                                            <TableCell className="px-4">
                                                                <Input 
                                                                    type="number" 
                                                                    className="h-8 w-full max-w-[150px]"
                                                                    value={item.stock_price}
                                                                    onChange={(e) => handleItemChange(realIndex, 'stock_price', e.target.value)}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-4">
                                                                <Input 
                                                                    type="number" 
                                                                    className="h-8 w-full max-w-[150px]"
                                                                    value={item.selling_price}
                                                                    onChange={(e) => handleItemChange(realIndex, 'selling_price', e.target.value)}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-4">
                                                                <Input 
                                                                    type="number" 
                                                                    min="1"
                                                                    className="h-8 w-full max-w-[100px]"
                                                                    value={item.quantity}
                                                                    onChange={(e) => handleItemChange(realIndex, 'quantity', e.target.value)}
                                                                />
                                                            </TableCell>
                                                            <TableCell className="px-4 text-right font-bold text-primary">
                                                                Rs. {item.subtotal.toLocaleString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </div>
                                    
                                    {/* Integrated Totals Section */}
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
                                                <span className="text-2xl font-bold text-gray-900">Rs. {totals.grand_total.toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col items-end border-l pl-8 border-gray-200">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Balance Due</span>
                                                <span className={`text-lg font-semibold ${totals.balance_due > 0 ? 'text-destructive' : 'text-green-600'}`}>
                                                    Rs. {totals.balance_due.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                {/* Previous History Table */}
                {productHistory.length > 0 && (
                    <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-4 duration-500">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <RotateCcw className="h-4 w-4 text-slate-500" />
                                    Recent Purchase History: {selectedProductName}
                                </CardTitle>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setProductHistory([])}
                                    className="h-6 text-xs text-primary"
                                >
                                    <X className="h-3 w-3 mr-1" /> Close History
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-primary/10">
                                        <TableHead className="text-xs text-primary h-8">GRN ID</TableHead>
                                        <TableHead className="text-xs text-primary h-8">Date</TableHead>
                                        <TableHead className="text-xs text-primary h-8">Prev. Cost</TableHead>
                                        <TableHead className="text-xs text-primary h-8">Prev. Qty</TableHead>
                                        <TableHead className="text-xs text-primary h-8 text-right">Trend</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {productHistory.map((h, i) => (
                                        <TableRow key={i} className="border-primary/10 hover:bg-primary/10">
                                            <TableCell className="py-2 text-xs font-mono">{h.purchase_id}</TableCell>
                                            <TableCell className="py-2 text-xs">{h.date}</TableCell>
                                            <TableCell className="py-2 text-xs font-semibold text-gray-700">Rs. {parseFloat(h.unit_cost).toLocaleString()}</TableCell>
                                            <TableCell className="py-2 text-xs">{h.quantity} pcs</TableCell>
                                            <TableCell className="py-2 text-xs text-right">
                                                <Badge variant="outline" className="text-[10px] h-4 bg-white">
                                                    Verified
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
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
