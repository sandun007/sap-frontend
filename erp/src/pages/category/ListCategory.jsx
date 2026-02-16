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
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
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
    AlertCircle,
    CheckCircle2,
    Package
} from 'lucide-react'
import api from '@/api/api'
import autoTable from "jspdf-autotable";

export default function ListCategory() {
    const [categories, setCategories] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null })
    const [editDialog, setEditDialog] = useState({ open: false, category: null })
    const [editForm, setEditForm] = useState({})
    const [importDialog, setImportDialog] = useState(false)
    const [importProgress, setImportProgress] = useState(null)
    const [importResult, setImportResult] = useState(null)
    const [importReview, setImportReview] = useState(null)
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
            const response = await api.get('/categories')
            setCategories(response.data.data || [])
        } catch (err) {
            console.error('Fetch categories error:', err)
            toast.error('Failed to load categories')
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
                    'Category Name': cat.category_name,
                    'Description': cat.description || '',
                    'Status': cat.status || (cat.is_active ? 'active' : 'inactive'),
                    'Category Code': cat.category_code
                }))
            )
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories')
            XLSX.writeFile(workbook, `categories_export_${new Date().toISOString().split('T')[0]}.xlsx`)
            toast.success("Categories exported!")
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

            const tableColumn = ['Category Code', 'Category Name', 'Description', 'Status', 'Created Date']
            const tableRows = filteredCategories.map(cat => [
                cat.category_code || '-',
                cat.category_name || '-',
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
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: 'array' })
                const worksheet = workbook.Sheets[workbook.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json(worksheet)

                const allRows = jsonData.map((item, index) => {
                    const rowNum = index + 2
                    const categoryName = (item['Category Name'] || '').trim()
                    
                    const existing = categories.find(c => 
                        (c.category_name || '').toLowerCase() === categoryName.toLowerCase()
                    )

                    const payload = {
                        category_name: categoryName,
                        category_code: existing?.category_code || generateCategoryId(),
                        description: item['Description'] || '',
                        status: (item['Status'] || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active'
                    }

                    const columnErrors = []
                    if (!categoryName) columnErrors.push({ column: 'Category Name', reason: 'Name is required' })

                    const changes = []
                    if (existing) {
                        const checkDiff = (label, key, newVal, oldVal) => {
                            if (newVal !== undefined && newVal !== null && String(newVal).trim() !== String(oldVal || '').trim()) {
                                changes.push({ label, key, newVal, oldVal: oldVal || '(empty)', confirmed: false })
                            }
                        }
                        checkDiff('Category Name', 'category_name', payload.category_name, existing.category_name)
                        checkDiff('Description', 'description', payload.description, existing.description)
                        checkDiff('Status', 'status', payload.status, existing.status || (existing.is_active ? 'active' : 'inactive'))
                    }

                    return { rowNum, categoryName, payload, existing, columnErrors, changes }
                })

                const toReview = allRows.filter(r => r.existing || r.columnErrors.length > 0)
                const toAuto = allRows.filter(r => !r.existing && r.columnErrors.length === 0)

                setImportDialog(false)

                let successCount = 0
                let errors = []

                if (toAuto.length > 0) {
                    setImportProgress({ current: 0, total: toAuto.length, errors: [] })
                    for (let i = 0; i < toAuto.length; i++) {
                        const row = toAuto[i]
                        try {
                            await api.post('/categories', row.payload)
                            successCount++
                        } catch (err) {
                            const responseData = err.response?.data
                            let msg = responseData?.message || err.message
                            if (responseData?.errors) {
                                msg = Object.entries(responseData.errors)
                                    .map(([f, ms]) => `${f}: ${Array.isArray(ms) ? ms.join(', ') : ms}`)
                                    .join(' | ')
                            }
                            errors.push({ row: row.rowNum, name: row.categoryName, message: msg })
                        }
                        setImportProgress(prev => ({ ...prev, current: i + 1, errors: [...errors] }))
                    }
                }

                if (toReview.length > 0) {
                    setImportReview({
                        rows: toReview,
                        currentIndex: 0,
                        processing: false,
                        successCount,
                        errors
                    })
                } else {
                    finishImport(successCount, errors)
                }
            } catch (error) {
                toast.error('Failed to read Excel file.')
                console.error(error)
            }
        }
        reader.readAsArrayBuffer(file)
    }

    const processImportRow = async (rowIndex, shouldSkip = false) => {
        setImportReview(prev => ({ ...prev, processing: true }))
        const row = importReview.rows[rowIndex]
        let currentSuccess = importReview.successCount
        let currentErrors = [...importReview.errors]

        if (shouldSkip) {
            moveToNextRow(currentSuccess, currentErrors)
            return
        }

        try {
            if (row.existing) {
                const confirmedPayload = {}
                row.changes.forEach(c => {
                    if (c.confirmed) confirmedPayload[c.key] = c.newVal
                })
                if (Object.keys(confirmedPayload).length > 0) {
                    await api.put(`/categories/${row.existing.category_id}`, confirmedPayload)
                }
            } else {
                await api.post('/categories', row.payload)
            }
            currentSuccess++
        } catch (err) {
            const msg = err.response?.data?.message || err.message
            currentErrors.push({ row: row.rowNum, name: row.categoryName, message: msg })
        }
        moveToNextRow(currentSuccess, currentErrors)
    }

    const moveToNextRow = (success, errors) => {
        const isLast = importReview.currentIndex === importReview.rows.length - 1
        if (isLast) {
            finishImport(success, errors)
        } else {
            setImportReview(prev => ({
                ...prev,
                currentIndex: prev.currentIndex + 1,
                processing: false,
                successCount: success,
                errors: errors
            }))
        }
    }

    const finishImport = async (success, errors) => {
        setImportProgress(null)
        setImportReview(null)
        await fetchCategories()
        setImportResult({ successCount: success, errors })
    }

    const downloadTemplate = () => {
        const template = [{
            'Category Name': 'Electronics',
            'Description': 'Gadgets and electronic devices',
            'Status': 'active'
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
            await api.delete(`/categories/${cat.category_id}`)
            toast.success('Category deleted')
            setDeleteDialog({ open: false, category: null })
            fetchCategories()
        } catch (err) {
            toast.error('Delete failed')
        }
    }
//Update
    const handleUpdate = async () => {
        if (!editForm?.category_id) return
        try {
            await api.put(`/categories/${editForm.category_id}`, editForm)
            toast.success('Category updated')
            setEditDialog({ open: false, category: null })
            fetchCategories()
        } catch (err) {
            toast.error('Update failed')
        }
    }

    const openEditDialog = (category) => {
        setEditDialog({ open: true, category })
        setEditForm({ ...category })
    }

    const handleAddCategory = () => {
        window.location.href = '/category/add'
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Import Progress Overlay */}
            {importProgress && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                        <h3 className="text-lg font-semibold">Importing Categories…</h3>
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-300" 
                                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {importProgress.current} of {importProgress.total} processed
                            </p>
                        </div>
                    </div>
                </div>
            )}
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
                                <TableHead>Category ID</TableHead>
                                <TableHead>Category Name</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.map((category) => (
                                <TableRow key={category.category_id || category.category.id }>
                                    <TableCell className="font-mono text-sm">
                                        {category.category_code || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                                <Tags className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <span className="font-medium text-foreground">{category.category_name || ''}</span>
                                        </div>
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
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Category</DialogTitle>
                        <DialogDescription>Update information for {editDialog.category?.category_name}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category Code</Label>
                                <Input value={editForm.category_code || ''} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-bold">Category Name *</Label>
                                <Input
                                    id="name"
                                    value={editForm.category_name || ''}
                                    onChange={e => setEditForm({ ...editForm, category_name: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={editForm.description || ''}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                className="min-h-[120px] resize-y"
                            />
                        </div>
                        <div className="flex items-center justify-between border-t pt-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="active">Active Status</Label>
                                <p className="text-xs text-muted-foreground">Enable or disable this category</p>
                            </div>
                            <Switch
                                id="active"
                                checked={editForm.status === 'active' || editForm.is_active}
                                onCheckedChange={checked => setEditForm({ 
                                    ...editForm, 
                                    status: checked ? 'active' : 'inactive',
                                    is_active: checked 
                                })}
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

            {/* Import Select Dialog */}
            <Dialog open={importDialog} onOpenChange={setImportDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Import Categories from Excel</DialogTitle>
                        <DialogDescription>
                            Upload an .xlsx file. The file should have a <strong>Category Name</strong> column.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                        <div
                            className="border-2 border-dashed border-primary/40 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mx-auto h-12 w-12 text-primary/40 mb-4" />
                            <p className="font-semibold text-foreground">Click to upload or drag & drop</p>
                            <p className="text-xs text-muted-foreground mt-1">Excel files only (.xlsx, .xls)</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>

                        <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
                            <p className="font-semibold text-foreground">Required columns:</p>
                            <p className="text-muted-foreground">Category Name</p>
                            <p className="text-muted-foreground italic mt-1">Optional: Description, Status</p>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="link" onClick={downloadTemplate} className="p-0 h-auto text-sm mr-auto">
                            Download template
                        </Button>
                        <Button variant="outline" onClick={() => setImportDialog(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Results Dialog */}
            {importResult && (
                <Dialog open={!!importResult} onOpenChange={() => setImportResult(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Import Results</DialogTitle>
                            <DialogDescription>
                                {importResult.successCount} succeeded, {importResult.errors.length} failed
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                            {importResult.successCount > 0 && (
                                <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                        {importResult.successCount} categories imported successfully
                                    </span>
                                </div>
                            )}
                            {importResult.errors.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-sm font-bold text-destructive flex items-center gap-2 uppercase tracking-tighter">
                                        <AlertCircle className="h-5 w-5 text-destructive" />
                                        Failed rows ({importResult.errors.length})
                                    </p>
                                    <div className="space-y-2">
                                        {importResult.errors.map((err, i) => (
                                            <div key={i} className="rounded-xl border border-destructive/20 bg-destructive/5 overflow-hidden shadow-sm">
                                                <div className="bg-destructive/10 px-3 py-1.5 border-b border-destructive/10">
                                                    <p className="text-[11px] font-bold text-destructive">Row {err.row} — {err.name}</p>
                                                </div>
                                                <div className="p-3">
                                                    <p className="text-xs text-muted-foreground leading-relaxed italic">{err.message}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setImportResult(null)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Import Review Dialog */}
            {importReview && importReview.rows[importReview.currentIndex] && (
                <Dialog open={!!importReview} onOpenChange={() => {
                    if (!importReview.processing) setImportReview(null);
                }}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>Review Import ({importReview.currentIndex + 1} / {importReview.rows.length})</DialogTitle>
                            <DialogDescription>
                                Row {importReview.rows[importReview.currentIndex].rowNum}: <strong>{importReview.rows[importReview.currentIndex].categoryName}</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-1">
                            <div className="rounded-xl border bg-amber-50/30 border-amber-200 p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <AlertCircle className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-900">Duplicate Detected</h4>
                                        <p className="text-xs text-amber-700">This category already exists. Choose fields to update:</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {importReview.rows[importReview.currentIndex].changes.map((change, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white border border-amber-100 shadow-sm">
                                            <div className="space-y-1">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{change.label}</p>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-muted-foreground line-through opacity-50 truncate max-w-[120px]">{change.oldVal}</span>
                                                    <span className="text-primary">→</span>
                                                    <span className="font-bold text-blue-600 truncate max-w-[150px]">{change.newVal}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {change.confirmed && <Badge className="bg-primary hover:bg-primary text-[9px] h-4">CONFIRMED</Badge>}
                                                <Switch 
                                                    checked={change.confirmed}
                                                    onCheckedChange={(val) => {
                                                        const newRows = [...importReview.rows];
                                                        newRows[importReview.currentIndex].changes[idx].confirmed = val;
                                                        setImportReview(prev => ({ ...prev, rows: newRows }));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button 
                                variant="ghost" 
                                onClick={() => processImportRow(importReview.currentIndex, true)}
                                disabled={importReview.processing}
                            >
                                Skip Row
                            </Button>
                            <Button 
                                onClick={() => processImportRow(importReview.currentIndex)}
                                disabled={importReview.processing}
                                className="min-w-[120px]"
                            >
                                {importReview.processing ? "Processing..." : "Confirm Update"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}