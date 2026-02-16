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
    Download, Calendar, Building2, User, ChevronLeft, ChevronRight,
    FileSpreadsheet
} from 'lucide-react';
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
                                    <TableHead className="px-6 py-4">Reference</TableHead>
                                    <TableHead className="px-6 py-4 text-right">Total Amount</TableHead>
                                    <TableHead className="px-6 py-4 w-[50px]"></TableHead>
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
                                            <TableCell className="px-6 py-4 font-medium">
                                                {p.reference_no || '-'}
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
                                                        <DropdownMenuItem className="gap-2">
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
        </div>
    );
}
