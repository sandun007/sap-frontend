import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { 
    Search, Plus, MoreVertical, FileText, Trash2, 
    Download, Calendar, User, ChevronLeft, ChevronRight,
    FileSpreadsheet, Receipt, Building2, Package, Calculator, Wallet, Landmark, CreditCard, Banknote, X
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { purchaseAPI } from '@/api/api';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ListPurchase() {
    const navigate = useNavigate();
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewDialog, setViewDialog] = useState({
        open: false,
        purchase: null,
        loading: false
    });
    const rowsPerPage = 10;

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        setLoading(true);
        try {
            const response = await purchaseAPI.getAll();
            setPurchases(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch purchases:', error);
            toast.error("Failed to load purchase history");
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        try {
            const dataToExport = filteredPurchases.map(p => ({
                'GRN ID': p.purchase_id,
                'Supplier': p.supplier_name || 'N/A',
                'Branch': p.branch_name || 'Main Warehouse',
                'Date': p.purchase_date,
                'Reference': p.reference_no || '-',
                'Subtotal': p.subtotal,
                'Tax': p.tax_amount,
                'Discount': p.discount,
                'Grand Total': p.grand_total
            }));
            
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchases');
            XLSX.writeFile(workbook, `GRN_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Excel report generated");
        } catch (error) {
            toast.error("Failed to export to Excel");
        }
    };

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text('Goods Received Note (GRN) Report', 14, 22);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.text(`Total Records: ${filteredPurchases.length}`, 14, 37);

            const tableColumn = ['GRN ID', 'Supplier', 'Date', 'Reference', 'Total'];
            const tableRows = filteredPurchases.map(p => [
                p.purchase_id,
                p.supplier_name || 'N/A',
                p.purchase_date,
                p.reference_no || '-',
                `Rs. ${parseFloat(p.grand_total || 0).toLocaleString()}`
            ]);

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [35, 55, 95] } // Matches your primary blue
            });

            doc.save(`GRN_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("PDF report generated");
        } catch (error) {
            toast.error("Failed to export to PDF");
        }
    };

    const handleViewDetails = async (id) => {
        setViewDialog({ open: true, purchase: null, loading: true });
        try {
            const response = await purchaseAPI.getById(id);
            setViewDialog({
                open: true,
                purchase: response.data.data,
                loading: false
            });
        } catch (error) {
            console.error('Failed to fetch details:', error);
            toast.error("Failed to load GRN details");
            setViewDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this GRN? This may affect stock levels.")) {
            try {
                await purchaseAPI.delete(id);
                toast.success("Purchase record deleted");
                fetchPurchases();
            } catch (error) {
                toast.error("Failed to delete record");
            }
        }
    };

    const filteredPurchases = purchases.filter(p => {
        const matchesSearch = p.purchase_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.reference_no?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDate = filterDate ? p.purchase_date === filterDate : true;
        
        return matchesSearch && matchesDate;
    });

    const totalPages = Math.ceil(filteredPurchases.length / rowsPerPage);
    const currentPurchases = filteredPurchases.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Purchase History (GRN)</h1>
                    <p className="text-muted-foreground">Monitor and manage all received goods</p>
                </div>
                <Button onClick={() => navigate('/purchases/add')} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-4 w-4" />
                    New GRN
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by GRN ID, Supplier or Invoice No..." 
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="w-full md:w-48 relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                type="date"
                                className="pl-10"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" className="gap-2" onClick={exportToExcel}>
                                <FileSpreadsheet className="h-4 w-4" />
                                Excel
                            </Button>
                            <Button variant="outline" className="gap-2" onClick={exportToPDF}>
                                <FileText className="h-4 w-4" />
                                PDF
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                    <CardDescription>
                        {filteredPurchases.length} records found
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead className="px-6 py-4">GRN ID</TableHead>
                                    <TableHead className="px-6 py-4">Supplier</TableHead>
                                    <TableHead className="px-6 py-4">Branch</TableHead>
                                    <TableHead className="px-6 py-4">Date</TableHead>
                                    <TableHead className="px-6 py-4 text-right">Total Amount</TableHead>
                                    <TableHead className="px-6 py-4 text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                                                Loading purchases...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : currentPurchases.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                            No purchase records found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentPurchases.map((p) => (
                                        <TableRow key={p.purchase_id} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="px-6 py-4 font-mono text-sm font-semibold text-primary">
                                                {p.purchase_id}
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{p.supplier_name || 'N/A'}</span>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <User className="h-3 w-3" /> Supplier ID: {p.supplier_id}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-gray-400" />
                                                    {p.branch_name || 'Main Warehouse'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    {p.purchase_date}
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right font-bold text-gray-900">
                                                Rs. {parseFloat(p.grand_total || 0).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40">
                                                        <DropdownMenuItem 
                                                            className="gap-2"
                                                            onClick={() => handleViewDetails(p.purchase_id)}
                                                        >
                                                            <FileText className="h-4 w-4" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            className="gap-2 text-destructive focus:text-destructive"
                                                            onClick={() => handleDelete(p.purchase_id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <p className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* View Details Dialog */}
            <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog(prev => ({ ...prev, open }))}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="border-b pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Receipt className="h-6 w-6 text-primary" />
                                    GRN Details
                                </DialogTitle>
                                <DialogDescription className="font-mono text-sm">
                                    ID: {viewDialog.purchase?.purchase_id}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {viewDialog.loading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            <p>Loading transaction details...</p>
                        </div>
                    ) : viewDialog.purchase ? (
                        <div className="space-y-8 py-4">
                            {/* Header Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Supplier</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm leading-none">{viewDialog.purchase.supplier_name}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">ID: {viewDialog.purchase.supplier_id}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Branch</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <p className="font-semibold text-sm">{viewDialog.purchase.branch_name}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Date</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <p className="font-semibold text-sm">{viewDialog.purchase.purchase_date}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info Banner */}
                            <div className="bg-slate-50 rounded-xl border p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-white border flex items-center justify-center">
                                        {viewDialog.purchase.payment_method === 'Bank' && <Landmark className="h-5 w-5 text-blue-500" />}
                                        {viewDialog.purchase.payment_method === 'Cash' && <Banknote className="h-5 w-5 text-green-500" />}
                                        {viewDialog.purchase.payment_method === 'Card' && <CreditCard className="h-5 w-5 text-purple-500" />}
                                        {viewDialog.purchase.payment_method === 'Loan' && <Receipt className="h-5 w-5 text-orange-500" />}
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-muted-foreground">Payment Method</p>
                                        <p className="font-bold text-sm">{viewDialog.purchase.payment_method}</p>
                                    </div>
                                </div>
                                {viewDialog.purchase.payment_method === 'Bank' && (
                                    <div className="md:col-span-2 flex items-center gap-8 border-l pl-8">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Bank Name</p>
                                            <p className="font-semibold text-sm">{viewDialog.purchase.bank_name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Reference No.</p>
                                            <p className="font-mono text-sm">{viewDialog.purchase.bank_reference || '-'}</p>
                                        </div>
                                    </div>
                                )}
                                {viewDialog.purchase.payment_method === 'Cash' && (
                                    <div className="md:col-span-2 flex items-center border-l pl-8">
                                        <p className="text-xs text-muted-foreground italic font-medium">Standard cash transaction. Paid in full at time of receipt.</p>
                                    </div>
                                )}
                            </div>

                            {/* Items Table */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                    Received Items List
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/50">
                                                <TableHead className="text-[11px] font-bold h-10">Product</TableHead>
                                                <TableHead className="text-[11px] font-bold h-10">Cost (Rs.)</TableHead>
                                                <TableHead className="text-[11px] font-bold h-10">Qty</TableHead>
                                                <TableHead className="text-[11px] font-bold h-10 text-right">Line Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {viewDialog.purchase.items?.map((item, idx) => (
                                                <TableRow key={idx} className="h-12">
                                                    <TableCell className="py-2">
                                                        <p className="font-semibold text-sm leading-tight">{item.product_name}</p>
                                                        <p className="text-[10px] font-mono text-muted-foreground">{item.product_code}</p>
                                                    </TableCell>
                                                    <TableCell className="py-2 text-sm">Rs. {parseFloat(item.stock_price).toLocaleString()}</TableCell>
                                                    <TableCell className="py-2 text-sm font-medium">{item.quantity} units</TableCell>
                                                    <TableCell className="py-2 text-right font-bold text-sm">
                                                        Rs. {parseFloat(item.subtotal).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Footer / Summary */}
                            <div className="flex flex-col md:flex-row justify-between items-start gap-8 pt-4 border-t">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Wallet className="h-4 w-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">Remarks / Notes</span>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-dashed">
                                        {viewDialog.purchase.notes || "No additional notes ."}
                                    </p>
                                </div>
                                <div className="w-full md:w-64 space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Subtotal</span>
                                        <span className="font-semibold">Rs. {parseFloat(viewDialog.purchase.subtotal).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground font-medium">Discount</span>
                                        <span className="text-destructive font-semibold">- Rs. {parseFloat(viewDialog.purchase.discount).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                        <span className="text-sm font-bold uppercase">Grand Total</span>
                                        <span className="text-xl font-black text-primary">Rs. {parseFloat(viewDialog.purchase.grand_total).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded bg-primary/5">
                                        <span className="text-[10px] font-bold uppercase">Amount Paid</span>
                                        <span className="text-sm font-bold">Rs. {parseFloat(viewDialog.purchase.amount_paid).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 rounded bg-destructive/5">
                                        <span className="text-[10px] font-bold uppercase text-destructive">Balance Due</span>
                                        <span className="text-sm font-bold text-destructive">Rs. {parseFloat(viewDialog.purchase.balance_due).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    );
}
