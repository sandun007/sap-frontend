import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Download,
    Upload,
    FileText,
    Building2,
    Package,
    AlertCircle,
    CheckCircle2
} from 'lucide-react'
import api from '@/api/api'

// ListBrand Component
export default function ListBrand() {
    const [brands, setBrands] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteDialog, setDeleteDialog] = useState({ open: false, brand: null })
    const [editDialog, setEditDialog] = useState({ open: false, brand: null })
    const [importDialog, setImportDialog] = useState(false)
    const [importProgress, setImportProgress] = useState(null)
    const [importResult, setImportResult] = useState(null)
    const [importReview, setImportReview] = useState(null)
    const [editForm, setEditForm] = useState({})
    const fileInputRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null);
    const filteredBrands = brands.filter(brand =>
        (brand.brand_name ? brand.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (brand.brand_id  ? String(brand.brand_id).toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (brand.contact_person ? brand.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (brand.email ? brand.email.toLowerCase().includes(searchTerm.toLowerCase()) : false)
    );

    useEffect(() => {
        fetchBrands()
    }, [])

    const fetchBrands = async () => {
        try {
            setLoading(true)
            const response = await api.get('/brands')
            setBrands(response.data.data || [])
        } catch (err) {
            console.error('Fetch brands error:', err)
            toast.error('Failed to load brands')
        } finally {
            setLoading(false)
        }
    }
//generate id
    function generateBrandId() {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substr(2, 4).toUpperCase()
        return `BR-${timestamp}-${random}`
    }
//Export to Excel
    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(filteredBrands.map(b => ({
                'Brand Code': b.brand_code || '',
                'Brand Name': b.brand_name || '',
                'Contact Person': b.contact_person || '',
                'Phone': b.phone || '',
                'Email': b.email || '',
                'Website': b.website || ''
            })))

            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Brands')
            XLSX.writeFile(workbook, `brands_export_${new Date().toISOString().split('T')[0]}.xlsx`)
            toast.success("Brands exported!")
        } catch (error) {
            console.error(error)
            toast.error("Failed to export brands to Excel.")
        }
    }
//Export to PDF
    const exportToPDF = () => {
        try {
            if (!filteredBrands || filteredBrands.length === 0) {
                toast.error("No brands to export")
                return
            }
            const doc = new jsPDF()
            doc.setFontSize(20)
            doc.setTextColor(0, 0, 0)
            doc.text('Brand List Report', 14, 22)

            doc.setFontSize(10)
            doc.setTextColor(100)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
            doc.text(`Total Brands: ${filteredBrands.length}`, 14, 37)
            const tableColumn = ['Brand Code', 'Brand Name', 'Contact', 'Email', 'Phone', 'Website']
            const tableRows = filteredBrands.map(brand => [
                brand.brand_code || '-',
                brand.brand_name || '-',
                brand.contact_person || '-',
                brand.email || '-',
                brand.phone || '-',
                brand.website || '-',
            ])

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    overflow: 'linebreak'
                },
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 30 },
                    3: { cellWidth: 45 },
                    4: { cellWidth: 25 },
                    5: { cellWidth: 20, halign: 'center' }
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                margin: { top: 10 }
            })

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

            const fileName = `brands_report_${new Date().toISOString().split('T')[0]}.pdf`
            doc.save(fileName)

            toast.success(`PDF generated! ${filteredBrands.length} brands included.`)
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
                    const brandName = (item['Brand Name'] || '').trim()
                    
                    const existing = brands.find(b => 
                        (b.brand_name || '').toLowerCase() === brandName.toLowerCase()
                    )

                    const payload = {
                        brand_name: brandName,
                        brand_code: existing?.brand_code || generateBrandId(),
                        contact_person: item['Contact Person'] || '',
                        phone: item['Phone'] || '',
                        email: item['Email'] || '',
                        website: item['Website'] || ''
                    }

                    const columnErrors = []
                    if (!brandName) columnErrors.push({ column: 'Brand Name', reason: 'Name is required' })

                    const changes = []
                    if (existing) {
                        const checkDiff = (label, key, newVal, oldVal) => {
                            if (newVal !== undefined && newVal !== null && String(newVal).trim() !== String(oldVal || '').trim()) {
                                changes.push({ label, key, newVal, oldVal: oldVal || '(empty)', confirmed: false })
                            }
                        }
                        checkDiff('Brand Name', 'brand_name', payload.brand_name, existing.brand_name)
                        checkDiff('Contact Person', 'contact_person', payload.contact_person, existing.contact_person)
                        checkDiff('Phone', 'phone', payload.phone, existing.phone)
                        checkDiff('Email', 'email', payload.email, existing.email)
                        checkDiff('Website', 'website', payload.website, existing.website)
                    }

                    return { rowNum, brandName, payload, existing, columnErrors, changes }
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
                            await api.post('/brands', row.payload)
                            successCount++
                        } catch (err) {
                            const responseData = err.response?.data
                            let msg = responseData?.message || err.message
                            if (responseData?.errors) {
                                msg = Object.entries(responseData.errors)
                                    .map(([f, ms]) => `${f}: ${Array.isArray(ms) ? ms.join(', ') : ms}`)
                                    .join(' | ')
                            }
                            errors.push({ row: row.rowNum, name: row.brandName, message: msg })
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
                    await api.put(`/brands/${row.existing.brand_id}`, confirmedPayload)
                }
            } else {
                await api.post('/brands', row.payload)
            }
            currentSuccess++
        } catch (err) {
            const msg = err.response?.data?.message || err.message
            currentErrors.push({ row: row.rowNum, name: row.brandName, message: msg })
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
        await fetchBrands()
        setImportResult({ successCount: success, errors })
    }

    const downloadTemplate = () => {
        const templateData = [{
            'Brand Name': 'Apple',
            'Contact Person': 'John Doe',
            'Phone': '+94 11 234 5678',
            'Email': 'contact@apple.com',
            'Website': 'https://www.apple.com'
        }]
        const worksheet = XLSX.utils.json_to_sheet(templateData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
        XLSX.writeFile(workbook, 'brand_import_template.xlsx')
        toast.success("Template downloaded")
    }

    //DELETE
    const handleDelete = async (brandId) => {
        try {
            await api.delete(`/brands/${brandId}`);
            toast.success('Brand deleted');
            setDeleteDialog({ open: false, brand: null });
            fetchBrands();
        } catch (error) {
            toast.error('Delete failed')
        }
    }

    //UPDATE
    const handleUpdate = async () => {
        try {
            await api.put(`/brands/${editForm.brand_id}`, editForm);
            toast.success('Brand updated successfully');
            setEditDialog({ open: false, brand: null });
            fetchBrands();
        } catch (error) {
            toast.error('Failed to update brand')
        }
    }

    const openEditDialog = (brand) => {
        setEditDialog({ open: true, brand })
        setEditForm(brand)
    }

    const handleAddBrand = () => {
        window.location.href = '/brand/add'
    }


    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6">
            {/* Import Progress Overlay */}
            {importProgress && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                        <h3 className="text-lg font-semibold text-foreground tracking-tight">Importing Brands…</h3>
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-300" 
                                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">
                                {importProgress.current} of {importProgress.total} processed
                            </p>
                        </div>
                    </div>
                </div>
            )}
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold">Brand List</CardTitle>
                    <CardDescription>Manage your brand inventory</CardDescription>
                </div>
                <Button onClick={handleAddBrand} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Brand
                </Button>
            </div>

            {/* Search  */}
            <Card>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search brands..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
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

            {/* Brands Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Brands</CardTitle>
                    <CardDescription>
                        {filteredBrands.length} brands found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Brand Code</TableHead>
                                <TableHead>Brand</TableHead>
                                <TableHead>Contact Person</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Web Site</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Created Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {filteredBrands.map((brand) => (
                                <TableRow key={brand.id || brand.brand_id}>
                                    <TableCell className="font-mono text-sm">
                                        {brand.brand_code || '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <span className="font-medium text-foreground">{brand.brand_name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{brand.contact_person || '-'}</TableCell>
                                    <TableCell>{brand.email || '-'}</TableCell>
                                    <TableCell>{brand.website || '-'}</TableCell>
                                    <TableCell>{brand.phone || '-'}</TableCell>
                                     <TableCell>
                                         {brand.created_date ? new Date(brand.created_date).toLocaleDateString() : '-'}
                                     </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => openEditDialog(brand)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteDialog({ open: true, brand })}
                                                    className="text-destructive focus:text-destructive"
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

                    {filteredBrands.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <Package className="h-12 w-12 mx-auto mb-4 opacity-70" />
                            <p>No brands found</p>
                            {searchTerm && <p className="text-sm mt-2">Try adjusting your search</p>}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, brand: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Brand</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.brand?.brand_name}"?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, brand: null })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(deleteDialog.brand?.brand_id)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Brand Dialog */}
            <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, brand: null })}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit Brand</DialogTitle>
                        <DialogDescription>
                            Update information for {editDialog.brand?.brand_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Brand Code</Label>
                                <Input value={editForm.brand_code || ''} disabled className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-brand-name" className="font-bold">Brand Name *</Label>
                                <Input
                                    id="edit-brand-name"
                                    value={editForm.brand_name || ''}
                                    onChange={(e) => setEditForm({ ...editForm, brand_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-contact">Contact Person</Label>
                                <Input
                                    id="edit-contact"
                                    value={editForm.contact_person || ''}
                                    onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-website">Website</Label>
                                <Input
                                    id="edit-website"
                                    value={editForm.website || ''}
                                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={editForm.phone || ''}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.email || ''}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                        </div>

                        </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, brand: null })}>
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
                        <DialogTitle>Import Brands from Excel</DialogTitle>
                        <DialogDescription>
                            Upload an .xlsx file. The file should have a <strong>Brand Name</strong> column.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
                        <div
                            className="border-2 border-dashed border-primary/40 rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="mx-auto h-12 w-12 text-primary/40 mb-4" />
                            <p className="font-semibold text-foreground uppercase tracking-tight">Click to upload or drag & drop</p>
                            <p className="text-xs text-muted-foreground mt-1">Excel files only (.xlsx, .xls)</p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>

                        <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1 border">
                            <p className="font-bold text-foreground">Required columns:</p>
                            <p className="text-muted-foreground">• Brand Name</p>
                            <p className="text-muted-foreground italic mt-2">Optional: Contact Person, Phone, Email, Website</p>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="link" onClick={downloadTemplate} className="p-0 h-auto text-sm mr-auto font-medium">
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
                    <DialogContent className="max-w-2xl text-foreground">
                        <DialogHeader>
                            <DialogTitle>Import Results</DialogTitle>
                            <DialogDescription>
                                {importResult.successCount} succeeded, {importResult.errors.length} failed
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                            {importResult.successCount > 0 && (
                                <div className="flex items-center gap-2 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-4 shadow-sm">
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-bold text-green-700 dark:text-green-400">
                                        {importResult.successCount} brands imported successfully
                                    </span>
                                </div>
                            )}
                            {importResult.errors.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-destructive flex items-center gap-2 uppercase tracking-widest">
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
                            <Button onClick={() => setImportResult(null)}>Close Results</Button>
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
                                Row {importReview.rows[importReview.currentIndex].rowNum}: <strong>{importReview.rows[importReview.currentIndex].brandName}</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-1 text-foreground">
                            <div className="rounded-xl border bg-amber-50/30 border-amber-200 p-4 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <AlertCircle className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-900 uppercase tracking-tight">Duplicate Detected</h4>
                                        <p className="text-xs text-amber-700 font-medium">This brand name already exists. Choose fields to update:</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {importReview.rows[importReview.currentIndex].changes.map((change, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-100 shadow-sm transition-all hover:border-amber-200">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{change.label}</p>
                                                <div className="flex items-center gap-2 text-[11px]">
                                                    <span className="text-muted-foreground line-through opacity-40 truncate max-w-[120px]">{change.oldVal}</span>
                                                    <span className="text-primary font-bold">→</span>
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
                                className="text-xs"
                            >
                                Skip Brand
                            </Button>
                            <Button 
                                onClick={() => processImportRow(importReview.currentIndex)}
                                disabled={importReview.processing}
                                className="min-w-[130px] font-bold"
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