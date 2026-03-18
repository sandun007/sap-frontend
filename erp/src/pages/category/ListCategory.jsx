import React, { useState, useRef, useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
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
    Tags,
} from 'lucide-react'
import axios from 'axios'
import autoTable from "jspdf-autotable";

export default function ListCategory() {
    const [categories, setCategories] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null })
    const [editDialog, setEditDialog] = useState({ open: false, category: null })
    const [editForm, setEditForm] = useState({})
    const [importDialog, setImportDialog] = useState(false)
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const filteredCategories = categories.filter(cat => {
        if (!cat || typeof cat !== 'object') return false
        const term = searchTerm.toLowerCase()
        return (
            (typeof cat.category_name === 'string' && cat.category_name.toLowerCase().includes(term)) ||
            (typeof cat.category_id === 'string' && cat.category_id.toLowerCase().includes(term)) ||
            (typeof cat.description === 'string' && cat.description.toLowerCase().includes(term))
        )
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const response = await axios.get('/categories', {})
            const data = response.data.data || response.data || []
            setCategories(Array.isArray(data) ? data : [])
            toast.success('Categories loaded successfully')
        } catch (err) {
            console.error('Fetch categories error:', err)

            if (err.response?.status === 401) {
                toast.error('Unauthorized - Please log in again')
            } else if (err.response?.status === 403) {
                toast.error('You do not have permission to view categories')
            } else {
                toast.error('Failed to load categories. Please try again later.')
            }
        } finally {
            setLoading(false)
        }
    }

//generate ID
    const generateCategoryId = () => {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substr(2, 4).toUpperCase()
        return `CATE-${timestamp}-${random}`
    }
//Export to Excel
    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(
                filteredCategories.map(cat => ({
                    'Category Name': cat.name || '',
                    'Category ID': cat.category_id || '',
                    'Description': cat.description || '',
                    'Status': cat.is_active ? 'Active' : 'Inactive',
                    'Created Date': cat.created_date || ''
                }))
            )
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories')
            XLSX.writeFile(workbook, `categories_export_${new Date().toISOString().split('T')[0]}.xlsx`)
            toast.success(`Exported ${filteredCategories.length} categories`)
        } catch (error) {
            toast.error('Failed to export to Excel')
            console.error(error)
        }
    }

//Export to PDF
    const exportToPDF = () => {
        try {
            if (!filteredCategories || filteredCategories.length === 0) {
                toast.error("No brands to export")
                return
            }
            const doc = new jsPDF()
            doc.setFontSize(20)
            doc.text('Category List', 14, 22)
            doc.setFontSize(10)
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)
            doc.text(`Total: ${filteredCategories.length}`, 14, 37)

            const tableColumn = ['Name', 'ID', 'Description', 'Status', 'Created Date']
            const tableRows = filteredCategories.map(cat => [
                cat.category_name || '-',
                cat.category_id || '-',
                cat.description || '-',
                cat.is_active ? 'Active' : 'Inactive',
                cat.created_date || '-'
            ])

            autoTable(doc,{
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    overflow: 'linebreak'
                },

                headStyles: {
                    fillColor: [59, 130, 246] },
                textColor: 255,
                fontStyle: 'bold',
                columnStyles: {
                    4: { cellWidth: 30 }
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                margin: { top: 10 }
            })

            // Footer
            const pageCount = doc.internal.getNumberOfPages()
            doc.setFontSize(8)
            doc.setTextColor(150)
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                )
            }

            // PDF  download
            const fileName = `category_report_${new Date().toISOString().split('T')[0]}.pdf`
            doc.save(fileName)

            toast.success(`PDF generated! ${filteredCategories.length} category included.`)
        } catch (error) {
            console.error('PDF generation error:', error)
            toast.error(`Failed to generate PDF: ${error.message}`)
        }
    }

    // Handle Excel file import
    const handleFileUpload = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: 'array' })
                const worksheet = workbook.Sheets[workbook.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json(worksheet)

                const newCategories = jsonData.map((item, index) => ({
                    category_id: generateCategoryId(),
                    category_name: item['Category Name'] || `Imported ${index + 1}`,
                    description: item['Description'] || '',
                    is_active: String(item['Status'] || '').toLowerCase() === 'active',
                    created_date: new Date().toISOString().split('T')[0]
                }))

                setCategories(prev => [...prev, ...newCategories])
                setImportDialog(false)
                toast.success(`Imported ${newCategories.length} categories (refreshing list...)`)
                fetchCategories()
            } catch (error) {
                toast.error('Failed to read Excel file. Please check format.')
                console.error(error)
            }
        }
        reader.readAsArrayBuffer(file)
    }

    // Download import template
    const downloadTemplate = () => {
        const template = [{
            'Category ID': 'CAT-XXXXXX-XXXX',
            'Category Name': 'Sample Category',
            'Description': 'Category description here',
            'Status': 'Active'
        }]
        const ws = XLSX.utils.json_to_sheet(template)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Template')
        XLSX.writeFile(wb, 'category_import_template.xlsx')
        toast.success('Template downloaded')
    }
//delete
    const handleDelete = async () => {
        const cat = deleteDialog.category
        if (!cat?.category_id) return

        try {
            await axios.delete(`/categories/${cat.category_id}`)
            toast.success('Category deleted')
            setDeleteDialog({ open: false, category: null })
            fetchCategories()
        } catch (err) {
            toast.error('Delete failed: ' + (err.response?.data?.message || 'Unknown error'))
        }
    }
//Update
    const handleUpdate = async () => {
        if (!editForm?.category_id) return

        try {
            await axios.put(`/categories/${editForm.category_id}`, editForm)
            toast.success('Category updated')
            setEditDialog({ open: false, category: null })
            setEditForm({})
            fetchCategories()
        } catch (err) {
            toast.error('Update failed: ' + (err.response?.data?.message || 'Unknown error'))
        }
    }

    const openEditDialog = (category) => {
        setEditDialog({ open: true, category })
        setEditForm({ ...category })
    }

    const handleAddCategory = () => {
        window.location.href = '/category/add'
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <p className="text-lg text-muted-foreground animate-pulse">Loading categories...</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold">Category List</CardTitle>
                    <CardDescription>Manage your product categories</CardDescription>
                </div>
                <Button onClick={handleAddCategory} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Category
                </Button>
            </div>

            {/* Search */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={exportToExcel} className="gap-2">
                                <Download className="h-4 w-4" /> Excel
                            </Button>
                            <Button variant="outline" onClick={exportToPDF} className="gap-2">
                                <FileText className="h-4 w-4" /> PDF
                            </Button>
                            <Button variant="outline" onClick={() => setImportDialog(true)} className="gap-2">
                                <Upload className="h-4 w-4" /> Import
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Category Table */}
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
                                <TableHead>Category Name</TableHead>
                                <TableHead>Category ID</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((category) => (
                                <TableRow key={category.category_id || category.category.id }>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Tags className="h-5 w-5 text-muted-foreground" />
                                            <span>{category.category_name || ''}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {category.category_code || '-'}
                                    </TableCell>
                                    <TableCell className="max-w-md truncate">
                                        {category.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={category.is_active ? "default" : "secondary"}>
                                            {category.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {category.created_date || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => setDeleteDialog({ open: true, category })}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredCategories.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Tags className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No categories found</p>
                            {searchTerm && <p className="text-sm mt-1">Try adjusting your search</p>}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, category: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{deleteDialog.category?.name || 'this category'}</strong>?<br />
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, category: null })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, category: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>Update information for {editDialog.category?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Category ID</Label>
                            <Input value={editForm.category_code || ''} readOnly className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name *</Label>
                            <Input
                                id="name"
                                value={editForm.category_name || ''}
                                onChange={e => setEditForm({ ...editForm, category_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={editForm.description || ''}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="active">Active Status</Label>
                            <Switch
                                id="active"
                                checked={editForm.is_active ?? true}
                                onCheckedChange={checked => setEditForm({ ...editForm, is_active: checked })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, category: null })}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={importDialog} onOpenChange={setImportDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import Categories</DialogTitle>
                        <DialogDescription>
                            Upload .xlsx or .xls file. Use the template for correct column names.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div
                            className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                            <p className="font-medium">Click to upload or drag & drop</p>
                            <p className="text-sm text-muted-foreground mt-1">Excel files only (.xlsx, .xls)</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            <Button variant="link" className="p-0 h-auto" onClick={downloadTemplate}>
                                Download import template
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setImportDialog(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}