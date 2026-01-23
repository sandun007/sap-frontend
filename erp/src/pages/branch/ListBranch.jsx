import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Download,
    Upload,
    FileText,
    Building2
} from 'lucide-react'

// Temporary data
const initialBranches = [
    {
        id: 1,
        branch_id: "BRNCH-890123-AB4X",
        branch_name: "Negombo Main",
        address: "No 45, Colombo Road, Negombo",
        phone: "+94 31 222 3456",
        email: "negombo@store.lk",
        manager_id: "EMP-001",
        opening_date: "2024-01-15",
        is_active: true
    },
    {
        id: 2,
        branch_id: "BRNCH-890124-CD5Y",
        branch_name: "Ja-Ela",
        address: "251/A, Negombo Road, Ja-Ela",
        phone: "+94 11 223 5678",
        email: "jaela@store.lk",
        manager_id: "EMP-007",
        opening_date: "2024-03-10",
        is_active: true
    },
    {
        id: 3,
        branch_id: "BRNCH-890125-EF6Z",
        branch_name: "Gampaha",
        address: "112 Station Road, Gampaha",
        phone: "+94 33 445 6789",
        email: "gampaha@store.lk",
        manager_id: "EMP-014",
        opening_date: "2024-06-22",
        is_active: false
    }
]

export default function ListBranch() {
    const [branches, setBranches] = useState(initialBranches)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteDialog, setDeleteDialog] = useState({ open: false, branch: null })
    const [editDialog, setEditDialog] = useState({ open: false, branch: null })
    const [importDialog, setImportDialog] = useState(false)
    const [editForm, setEditForm] = useState({})
    const fileInputRef = useRef(null)

    // Filter branches
    const filteredBranches = branches.filter(branch =>
        branch.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.branch_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (branch.address && branch.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (branch.manager_id && branch.manager_id.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Delete branch
    const handleDelete = (branchId) => {
        setBranches(branches.filter(b => b.id !== branchId))
        setDeleteDialog({ open: false, branch: null })
        toast.success("Branch has been successfully deleted.")
    }

    // Update branch
    const handleUpdate = () => {
        setBranches(branches.map(b =>
            b.id === editForm.id ? { ...b, ...editForm } : b
        ))
        setEditDialog({ open: false, branch: null })
        setEditForm({})
        toast.success("Branch information has been updated successfully.")
    }

    // Open edit dialog
    const openEditDialog = (branch) => {
        setEditDialog({ open: true, branch })
        setEditForm(branch)
    }

    // Export to Excel
    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(filteredBranches.map(b => ({
                'Branch ID': b.branch_id,
                'Branch Name': b.branch_name,
                'Address': b.address || '',
                'Phone': b.phone || '',
                'Email': b.email || '',
                'Manager ID': b.manager_id || '',
                'Opening Date': b.opening_date || '',
                'Status': b.is_active ? 'Active' : 'Inactive'
            })))

            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Branches')
            XLSX.writeFile(workbook, `branches_export_${new Date().toISOString().split('T')[0]}.xlsx`)

            toast.success(`Exported ${filteredBranches.length} branches to Excel.`)

        } catch (error) {
            toast.error("Failed to export branches to Excel.")
        }
    }

    // Export to PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF()

            doc.setFontSize(20)
            doc.text('Branch List', 14, 22)
            doc.setFontSize(10)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
            doc.text(`Total Branches: ${filteredBranches.length}`, 14, 37)

            const tableColumn = ['Branch ID', 'Branch Name', 'Address', 'Phone', 'Manager ID', 'Status']
            const tableRows = filteredBranches.map(b => [
                b.branch_id,
                b.branch_name,
                b.address || '-',
                b.phone || '-',
                b.manager_id || '-',
                b.is_active ? 'Active' : 'Inactive'
            ])

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [59, 130, 246] }
            })

            doc.save(`branches_report_${new Date().toISOString().split('T')[0]}.pdf`)

            toast.success(`Generated PDF report with ${filteredBranches.length} branches.`)
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error("Failed to generate PDF report.")
        }
    }

    // Handle Excel import
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

                const newBranches = jsonData.map((item, index) => {
                    const baseId = Math.max(...branches.map(b => b.id), 0) + index + 1
                    return {
                        id: baseId,
                        branch_id: item['Branch ID'] || generateBranchId(),
                        branch_name: item['Branch Name'] || `Imported Branch ${index + 1}`,
                        address: item['Address'] || '',
                        phone: item['Phone'] || '',
                        email: item['Email'] || '',
                        manager_id: item['Manager ID'] || '',
                        opening_date: item['Opening Date'] || new Date().toISOString().split('T')[0],
                        is_active: item['Status']?.toLowerCase() === 'active'
                    }
                })

                setBranches(prev => [...prev, ...newBranches])
                setImportDialog(false)

                toast.success(`Successfully imported ${newBranches.length} branches.`)

            } catch (error) {
                toast.error("Failed to process the Excel file. Please check the format.")
            }
        }
        reader.readAsArrayBuffer(file)
    }

    // Download template
    const downloadTemplate = () => {
        const templateData = [{
            'Branch ID': 'BRNCH-XXXXXX-XXXX',
            'Branch Name': 'Negombo Central',
            'Address': 'No 123, Main Street, Negombo',
            'Phone': '+94 31 222 3456',
            'Email': 'negombo@store.lk',
            'Manager ID': 'EMP-001',
            'Opening Date': '2024-01-15',
            'Status': 'Active'
        }]

        const worksheet = XLSX.utils.json_to_sheet(templateData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
        XLSX.writeFile(workbook, 'branch_import_template.xlsx')

        toast.success("Branch import template downloaded successfully.")
    }

    // Generate branch ID
    function generateBranchId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `BRNCH-${timestamp}-${random}`;
    }

    // Placeholder for add branch
    const handleAddBranch = () => {
        toast.info("Redirecting to add branch form...");
        window.location.href = '/branch/add'
    };

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Branch List</h1>
                    <p className="text-muted-foreground">Manage your store branches</p>
                </div>
                <Button onClick={handleAddBranch} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Branch
                </Button>
            </div>

            {/* Search & Actions */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by branch name, ID, address or manager..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={exportToExcel} className="gap-2">
                                <Download className="h-4 w-4" />
                                Excel
                            </Button>
                            <Button variant="outline" onClick={exportToPDF} className="gap-2">
                                <FileText className="h-4 w-4" />
                                PDF
                            </Button>
                            <Button variant="outline" onClick={() => setImportDialog(true)} className="gap-2">
                                <Upload className="h-4 w-4" />
                                Import
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Branches Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Branches</CardTitle>
                    <CardDescription>
                        {filteredBranches.length} branches found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Branch</TableHead>
                                <TableHead>Branch ID</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Manager ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBranches.map((branch) => (
                                <TableRow key={branch.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <div className="font-medium">{branch.branch_name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{branch.branch_id}</TableCell>
                                    <TableCell className="max-w-xs truncate">{branch.address || '-'}</TableCell>
                                    <TableCell>{branch.phone || '-'}</TableCell>
                                    <TableCell>{branch.manager_id || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={branch.is_active ? "default" : "secondary"}>
                                            {branch.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(branch)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteDialog({ open: true, branch })}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredBranches.length === 0 && (
                        <div className="text-center py-8">
                            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No branches found</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, branch: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Branch</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.branch?.branch_name}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, branch: null })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(deleteDialog.branch?.id)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Branch Dialog */}
            <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, branch: null })}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Branch</DialogTitle>
                        <DialogDescription>
                            Update information for {editDialog.branch?.branch_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-branch-id">Branch ID</Label>
                                <Input
                                    id="edit-branch-id"
                                    value={editForm.branch_id || ''}
                                    onChange={(e) => setEditForm({...editForm, branch_id: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-branch-name">Branch Name</Label>
                                <Input
                                    id="edit-branch-name"
                                    value={editForm.branch_name || ''}
                                    onChange={(e) => setEditForm({...editForm, branch_name: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Address</Label>
                            <Input
                                id="edit-address"
                                value={editForm.address || ''}
                                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={editForm.phone || ''}
                                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.email || ''}
                                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-manager-id">Manager ID</Label>
                                <Input
                                    id="edit-manager-id"
                                    value={editForm.manager_id || ''}
                                    onChange={(e) => setEditForm({...editForm, manager_id: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-opening-date">Opening Date</Label>
                                <Input
                                    id="edit-opening-date"
                                    type="date"
                                    value={editForm.opening_date || ''}
                                    onChange={(e) => setEditForm({...editForm, opening_date: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4">
                            <Label htmlFor="edit-status">Active Branch</Label>
                            <Switch
                                id="edit-status"
                                checked={editForm.is_active ?? true}
                                onCheckedChange={(checked) => setEditForm({...editForm, is_active: checked})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, branch: null })}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Update Branch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={importDialog} onOpenChange={setImportDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Branches</DialogTitle>
                        <DialogDescription>
                            Upload an Excel file to import branches. Download the template first to ensure proper formatting.
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