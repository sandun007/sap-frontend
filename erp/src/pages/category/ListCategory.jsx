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
    Tags
} from 'lucide-react'

// Temporary data
const initialCategories = [
    {
        id: 1,
        category_id: "CATE-890123-AB4X",
        name: "Electronics",
        description: "All electronic devices and gadgets",
        product_count: 45,
        is_active: true,
        created_date: "2024-01-05"
    },
    {
        id: 2,
        category_id: "CATE-890123-AB5X",
        name: "Footwear",
        description: "Shoes, sandals, and boots",
        product_count: 28,
        is_active: true,
        created_date: "2024-01-07"
    },
    {
        id: 3,
        category_id: "CATE-890123-AB6X",
        name: "Clothing",
        description: "Apparel for men, women, and children",
        product_count: 67,
        is_active: true,
        created_date: "2024-01-12"
    },
    {
        id: 4,
        category_id: "CATE-890123-AB7X",
        name: "Home & Kitchen",
        description: "Kitchenware, home decor, and appliances",
        product_count: 19,
        is_active: false,
        created_date: "2024-02-01"
    }
]

export default function ListCategory() {
    const [categories, setCategories] = useState(initialCategories)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null })
    const [editDialog, setEditDialog] = useState({ open: false, category: null })
    const [importDialog, setImportDialog] = useState(false)
    const [editForm, setEditForm] = useState({})
    const fileInputRef = useRef(null)

    // Filter category
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    // Generate category ID
    function generateCategoryId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `CATE-${timestamp}-${random}`;
    }

    // Delete category
    const handleDelete = (categoryId) => {
        setCategories(categories.filter(cat => cat.id !== categoryId))
        setDeleteDialog({ open: false, category: null })
        toast.success("Category has been successfully deleted.")
    }

    // Update category
    const handleUpdate = () => {
        setCategories(categories.map(cat =>
            cat.id === editForm.id ? { ...cat, ...editForm } : cat
        ))
        setEditDialog({ open: false, category: null })
        setEditForm({})
        toast.success("Category information has been updated successfully.")
    }

    // Open edit dialog
    const openEditDialog = (category) => {
        setEditDialog({ open: true, category })
        setEditForm(category)
    }

    // Export to Excel
    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(filteredCategories.map(cat => ({
                'Category Name': cat.name,
                'Description': cat.description || '',
                'Product Count': cat.product_count,
                'Status': cat.is_active ? 'Active' : 'Inactive',
                'Created Date': cat.created_date
            })))

            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories')
            XLSX.writeFile(workbook, `categories_export_${new Date().toISOString().split('T')[0]}.xlsx`)

            toast.success(`Exported ${filteredCategories.length} categories to Excel.`)
        } catch (error) {
            toast.error("Failed to export categories to Excel.")
        }
    }

    // Export to PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF()

            doc.setFontSize(20)
            doc.text('Category List', 14, 22)
            doc.setFontSize(10)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
            doc.text(`Total Categories: ${filteredCategories.length}`, 14, 37)

            const tableColumn = ['Category Name', 'Description', 'Products', 'Status']
            const tableRows = filteredCategories.map(cat => [
                cat.name,
                cat.description || '-',
                cat.product_count.toString(),
                cat.is_active ? 'Active' : 'Inactive'
            ])

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [59, 130, 246] }
            })

            doc.save(`categories_report_${new Date().toISOString().split('T')[0]}.pdf`)

            toast.success(`Generated PDF report with ${filteredCategories.length} categories.`)
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

                const newCategories = jsonData.map((item, index) => {
                    const baseId = Math.max(...categories.map(c => c.id), 0) + index + 1
                    return {
                        id: baseId,
                        category_id: generateCategoryId(),
                        name: item['Category Name'] || `Imported Category ${index + 1}`,
                        description: item['Description'] || '',
                        product_count: parseInt(item['Product Count']) || 0,
                        is_active: item['Status']?.toLowerCase() === 'active',
                        created_date: new Date().toISOString().split('T')[0]
                    }
                })

                setCategories(prev => [...prev, ...newCategories])
                setImportDialog(false)

                toast.success(`Successfully imported ${newCategories.length} categories.`)
            } catch (error) {
                toast.error("Failed to process the Excel file. Please check the format.")
            }
        }
        reader.readAsArrayBuffer(file)
    }

    // Download template
    const downloadTemplate = () => {
        const templateData = [{
            'Category Name': 'Sample Category',
            'Description': 'Category description',
            'Product Count': 0,
            'Status': 'Active'
        }]

        const worksheet = XLSX.utils.json_to_sheet(templateData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
        XLSX.writeFile(workbook, 'category_import_template.xlsx')

        toast.success("Category import template downloaded successfully.")
    }

    // Add new category
    const handleAddCategory = () => {
        toast.info("Redirecting to add category form...")
        window.location.href = '/category/add'
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Category List</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Manage your category inventory</p>
                </div>
                <Button onClick={handleAddCategory} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                </Button>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories by name, Category ID or description..."
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

            {/* category Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>
                        {filteredCategories.length} categories found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Category ID</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Products</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                                <Tags className="h-5 w-5" />
                                            </div>
                                            <div className="font-medium">{category.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {category.category_id}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {category.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={category.product_count > 0 ? "default" : "secondary"}>
                                            {category.product_count} products
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={category.is_active ? "default" : "secondary"}>
                                            {category.is_active ? "Active" : "Inactive"}
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
                                                <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteDialog({ open: true, category })}
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

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-8">
                            <Tags className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No categories found</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, category: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.category?.name}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, category: null })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(deleteDialog.category?.id)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit category Dialog */}
            <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, category: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>
                            Update information for {editDialog.category?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-category-id">Category ID</Label>
                            <Input
                                id="edit-category-id"
                                value={editForm.category_id || ''}
                                onChange={(e) => setEditForm({...editForm, category_id: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Category Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Input
                                id="edit-description"
                                value={editForm.description || ''}
                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            />
                        </div>
                        <div className="flex items-center justify-between pt-4">
                            <Label htmlFor="edit-status">Active Status</Label>
                            <Switch
                                id="edit-status"
                                checked={editForm.is_active ?? true}
                                onCheckedChange={(checked) => setEditForm({...editForm, is_active: checked})}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, category: null })}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Update Category
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={importDialog} onOpenChange={setImportDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Categories</DialogTitle>
                        <DialogDescription>
                            Upload an Excel file to import categories. Download the template first to ensure proper formatting.
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