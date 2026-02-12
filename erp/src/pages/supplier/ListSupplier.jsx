import React, { useState, useRef, useEffect} from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { toast } from 'sonner'
import 'jspdf-autotable'

import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Building2,
    Download,
    FileText,
    Upload
} from 'lucide-react'
import axios from 'axios'

// Temporary data
const initialSuppliers = [
    {
        supplier_id: "SUP-000001-ABCD",
        supplier_name: "Tech Solutions Inc",
        contact_person: "John Doe",
        phone: "+94771234567",
        email: "john@techsolutions.com",
        address: "123 Main St, Colombo",
        tax_id: "TAX123456",
        payment_terms: "Net 30",
        created_date: "2024-01-05"
    },
    {
        supplier_id: "SUP-000002-EFGH",
        supplier_name: "Global Traders Ltd",
        contact_person: "Jane Smith",
        phone: "+94772345678",
        email: "jane@globaltraders.com",
        address: "456 Galle Road, Colombo",
        tax_id: "TAX789012",
        payment_terms: "Net 45",
        created_date: "2024-01-12"
    }
]

export default function ListSupplier() {
    const [suppliers, setSuppliers] = useState(initialSuppliers)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteDialog, setDeleteDialog] = useState({ open: false, supplier: null })
    const [editDialog, setEditDialog] = useState({ open: false, supplier: null })
    const [editForm, setEditForm] = useState({})
    const [importDialog, setImportDialog] = useState(false)
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const filteredSuppliers = suppliers.filter(sup =>
        (sup.supplier_name ? sup.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (sup.supplier_id ? String(sup.supplier_id).toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (sup.contact_person ? sup.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (sup.email ? sup.email.toLowerCase().includes(searchTerm.toLowerCase()) : false)
    );

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const fetchSuppliers = async () => {
        setLoading(true)
        const response = await axios.get('/suppliers')
        setSuppliers(response.data.data || [])
        toast.success('Suppliers loaded')
    }

    // Generate unique supplier ID
    const generateSupplierId = () => {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substr(2, 4).toUpperCase()
        return `SUP-${timestamp}-${random}`
    }

    // Export to Excel
    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(filteredSuppliers.map(sup => ({
                'Supplier Name': sup.supplier_name,
                'Contact Person': sup.contact_person || '',
                'Phone': sup.phone || '',
                'Email': sup.email || '',
                'Address': sup.address || '',
                'Tax ID': sup.tax_id || '',
                'Payment Terms': sup.payment_terms || '',
                'Created Date': sup.created_date
            })))
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers')
            XLSX.writeFile(workbook, `suppliers_export_${new Date().toISOString().split('T')[0]}.xlsx`)
            toast.success(`Exported ${filteredSuppliers.length} suppliers to Excel.`)
        } catch (error) {
            toast.error("Failed to export suppliers to Excel.")
        }
    }

    // Export to PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF()
            doc.setFontSize(20)
            doc.text('Supplier List', 14, 22)
            doc.setFontSize(10)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
            doc.text(`Total Suppliers: ${filteredSuppliers.length}`, 14, 37)

            const tableColumn = ['Name', 'Contact', 'Phone', 'Email', 'Terms']
            const tableRows = filteredSuppliers.map(sup => [
                sup.supplier_name,
                sup.contact_person || '-',
                sup.phone || '-',
                sup.email || '-',
                sup.payment_terms || '-'
            ])

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [59, 130, 246] }
            })

            doc.save(`suppliers_report_${new Date().toISOString().split('T')[0]}.pdf`)
            toast.success(`Generated PDF report with ${filteredSuppliers.length} suppliers.`)
        } catch (error) {
            toast.error("Failed to generate PDF report.")
        }
    }

    // Handle Excel file import
    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: 'array' })
                const worksheet = workbook.Sheets[workbook.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json(worksheet)

                const newSuppliers = jsonData.map((item, index) => ({
                    supplier_id: generateSupplierId(),
                    supplier_name: item['Supplier Name'] || `Imported Supplier ${index + 1}`,
                    contact_person: item['Contact Person'] || '',
                    phone: item['Phone'] || '',
                    email: item['Email'] || '',
                    address: item['Address'] || '',
                    tax_id: item['Tax ID'] || '',
                    payment_terms: item['Payment Terms'] || '',
                    created_date: new Date().toISOString().split('T')[0]
                }))

                axios.post('/suppliers/import', { suppliers: newSuppliers })
                    .then(response => {
                        const { imported, skipped } = response.data;
                        fetchSuppliers();
                        setImportDialog(false);
                        if (skipped > 0) {
                            toast.info(`Imported ${imported} • ${skipped} skipped (duplicates)`);
                        } else {
                            toast.success(`Imported ${imported} suppliers`);
                        }
                    })
                    .catch((error) => {
                        const message = error.response?.data?.message || "Failed to save imported suppliers to server.";
                        toast.error(message);
                    })

            } catch (error) {
                toast.error("Failed to process the Excel file. Please check the format.")
            }
        }
        reader.readAsArrayBuffer(file)
    }

    // Download import template
    const downloadTemplate = () => {
        const templateData = [{
            'Supplier Name': 'Sample Supplier',
            'Contact Person': 'Sample Contact',
            'Phone': '+94xxxxxxxxx',
            'Email': 'sample@email.com',
            'Address': 'Sample Address',
            'Tax ID': 'TAXxxxxxx',
            'Payment Terms': 'Net 30'
        }]

        const worksheet = XLSX.utils.json_to_sheet(templateData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
        XLSX.writeFile(workbook, 'supplier_import_template.xlsx')

        toast.success("Supplier import template downloaded successfully.")
    }

    const handleDelete = async (supplierId) => {
        try {
            await axios.delete(`/suppliers/${supplierId}`);
            toast.success('Supplier deleted successfully');
            setDeleteDialog({ open: false, supplier: null });
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to delete supplier: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdate = async () => {
        try {
            await axios.put(`/suppliers/${editForm.supplier_id}`, editForm);
            toast.success('Supplier updated successfully');
            setEditDialog({ open: false, supplier: null });
            setEditForm({});
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to update supplier: ' + (error.response?.data?.message || error.message));
        }
    };

    const openEditDialog = (supplier) => {
        setEditDialog({ open: true, supplier })
        setEditForm(supplier)
    }

    const handleAddSupplier = () => {
        window.location.href = '/supplier/add'
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold">
                        Supplier List
                    </CardTitle>
                    <CardDescription>Manage your supplier inventory</CardDescription>
                </div>
                <Button onClick={handleAddSupplier} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Supplier
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                            <Input
                                placeholder="Search suppliers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={exportToExcel} className="gap-2 flex-1 sm:flex-none">
                                <Download className="h-4 w-4" />
                                Excel
                            </Button>
                            <Button variant="outline" onClick={exportToPDF} className="gap-2 flex-1 sm:flex-none">
                                <FileText className="h-4 w-4" />
                                PDF
                            </Button>
                            <Button variant="outline" onClick={() => setImportDialog(true)} className="gap-2 flex-1 sm:flex-none">
                                <Upload className="h-4 w-4" />
                                Import
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Suppliers</CardTitle>
                    <CardDescription>{filteredSuppliers.length} suppliers found</CardDescription>
                </CardHeader>

                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Supplier Name</TableHead>
                                <TableHead>Supplier ID</TableHead>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Payment Terms</TableHead>
                                <TableHead>Created Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredSuppliers.map((supplier) => (
                                <TableRow key={supplier.supplier_id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Building2 className="h-5 w-5 text-muted-foreground" />
                                            <span>{supplier.supplier_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {supplier.supplier_id}
                                    </TableCell>
                                    <TableCell>{supplier.contact_person || '-'}</TableCell>
                                    <TableCell>{supplier.phone || '-'}</TableCell>
                                    <TableCell>{supplier.email || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {supplier.payment_terms || 'N/A'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{supplier.created_date}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(supplier)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteDialog({ open: true, supplier })}
                                                    className="text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, supplier: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Supplier</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.supplier?.supplier_name}"?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, supplier: null })}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleDelete(deleteDialog.supplier?.supplier_id)}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, supplier: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Supplier</DialogTitle>
                        <DialogDescription>
                            Update {editDialog.supplier?.supplier_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-supplier-name">Supplier Name</Label>
                            <Input
                                id="edit-supplier-name"
                                placeholder="Supplier Name"
                                value={editForm.supplier_name || ''}
                                onChange={(e) => setEditForm({ ...editForm, supplier_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-supplier-id">Supplier ID</Label>
                            <Input
                                id="edit-supplier-id"
                                value={editForm.supplier_id || ''}
                                readOnly
                                className="bg-muted cursor-not-allowed"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-contact-person">Contact Person</Label>
                                <Input
                                    id="edit-contact-person"
                                    placeholder="Contact Person"
                                    value={editForm.contact_person || ''}
                                    onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Phone Number</Label>
                                <Input
                                    id="edit-phone"
                                    placeholder="Phone"
                                    value={editForm.phone || ''}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                placeholder="Email"
                                value={editForm.email || ''}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Address</Label>
                            <Input
                                id="edit-address"
                                placeholder="Address"
                                value={editForm.address || ''}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, supplier: null })}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={importDialog} onOpenChange={setImportDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Suppliers</DialogTitle>
                        <DialogDescription>
                            Upload an Excel file to import suppliers. Download the template first to ensure proper formatting.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600">Click to upload Excel file</p>
                            <p className="text-xs text-gray-500 mt-1">.xlsx, .xls files supported</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            <Button variant="link" onClick={downloadTemplate} className="p-0 h-auto">
                                Download template file
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setImportDialog(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
