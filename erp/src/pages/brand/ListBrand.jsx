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
const initialBrands = [
    {
        id: 1,
        brand_id: "BRAND-890123-AB4X",
        brand_name: "Apple",
        contact_person: "Tharindu Fernando",
        phone: "+94 77 123 4567",
        email: "contact@apple.com",
        website: "https://www.apple.com",
        is_active: true,
        created_date: "2024-01-05"
    },
    {
        id: 2,
        brand_id: "BRAND-890124-CD5Y",
        brand_name: "Samsung",
        contact_person: "Sachini Jayawardena",
        phone: "+94 71 987 6543",
        email: "support@samsung.com",
        website: "https://www.samsung.com",
        is_active: false,
        created_date: "2024-01-10"
    },
    {
        id: 3,
        brand_id: "BRAND-890125-EF6Z",
        brand_name: "Nike",
        contact_person: "Ishan Jayasinghe",
        phone: "+94 76 555 8888",
        email: "info@nike.com",
        website: "https://www.nike.com",
        is_active: true,
        created_date: "2024-02-15"
    }
]

export default function ListBrand() {
    const [brands, setBrands] = useState(initialBrands)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleteDialog, setDeleteDialog] = useState({ open: false, brand: null })
    const [editDialog, setEditDialog] = useState({ open: false, brand: null })
    const [importDialog, setImportDialog] = useState(false)
    const [editForm, setEditForm] = useState({})
    const fileInputRef = useRef(null)

  // Filter brand
    const filteredBrands = brands.filter(brand =>
        brand.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.brand_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (brand.email && brand.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )

  // Generate brand ID
    function generateBrandId() {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substr(2, 4).toUpperCase()
        return `BRAND-${timestamp}-${random}`
    }

  // Delete brand
    const handleDelete = (brandId) => {
        setBrands(brands.filter(b => b.id !== brandId))
        setDeleteDialog({ open: false, brand: null })
        toast.success("Brand has been successfully deleted.")
    }

  // Update brand
    const handleUpdate = () => {
        setBrands(brands.map(b =>
            b.id === editForm.id ? { ...b, ...editForm } : b
        ))
        setEditDialog({ open: false, brand: null })
        setEditForm({})
        toast.success("Brand information has been updated successfully.")
    }

  // Open edit dialog
    const openEditDialog = (brand) => {
        setEditDialog({ open: true, brand })
        setEditForm(brand)
    }

  // Export to Excel
    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(filteredBrands.map(b => ({
                'Brand ID': b.brand_id,
                'Brand Name': b.brand_name,
                'Contact Person': b.contact_person || '',
                'Phone': b.phone || '',
                'Email': b.email || '',
                'Website': b.website || '',
                'Status': b.is_active ? 'Active' : 'Inactive',
                'Created Date': b.created_date
            })))

            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Brands')
            XLSX.writeFile(workbook, `brands_export_${new Date().toISOString().split('T')[0]}.xlsx`)

            toast.success(`Exported ${filteredBrands.length} brands to Excel.`)
        } catch (error) {
            toast.error("Failed to export brands to Excel.")
        }
    }

  // Export to PDF
    const exportToPDF = () => {
        try {
            const doc = new jsPDF()

            // Title
            doc.setFontSize(20)
            doc.text('Brand List', 14, 22)
            doc.setFontSize(10)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
            doc.text(`Total Brands: ${filteredBrands.length}`, 14, 37)


            // Table data
            const tableColumn = ['Brand ID', 'Brand Name', 'Contact Person', 'Email', 'Status']
            const tableRows = filteredBrands.map(b => [
                b.brand_id,
                b.brand_name,
                b.contact_person || '-',
                b.email || '-',
                b.is_active ? 'Active' : 'Inactive'
            ])

             // Add table
            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [59, 130, 246] }
            })

            // Save PDF
            doc.save(`brands_report_${new Date().toISOString().split('T')[0]}.pdf`)

            toast.success(`Generated PDF report with ${filteredBrands.length} brands.`)
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

            // Validate and process imported data
                const newBrands = jsonData.map((item, index) => {
                    const baseId = Math.max(...brands.map(b => b.id), 0) + index + 1
                    return {
                        id: baseId,
                        brand_id: item['Brand ID'] || generateBrandId(),
                        brand_name: item['Brand Name'] || `Imported Brand ${index + 1}`,
                        contact_person: item['Contact Person'] || '',
                        phone: item['Phone'] || '',
                        email: item['Email'] || '',
                        website: item['Website'] || '',
                        is_active: item['Status']?.toLowerCase() === 'active',
                        created_date: new Date().toISOString().split('T')[0]
                    }
                })

                setBrands(prev => [...prev, ...newBrands])
                setImportDialog(false)

                toast.success(`Successfully imported ${newBrands.length} brands.`)
            } catch (error) {
                toast.error("Failed to process the Excel file. Please check the format.")
            }
        }
        reader.readAsArrayBuffer(file)
    }

  // Download template
    const downloadTemplate = () => {
        const templateData = [{
            'Brand ID': 'BRAND-XXXXXX-XXXX',
            'Brand Name': 'Sample Brand',
            'Contact Person': 'John Doe',
            'Phone': '+94 XX XXX XXXX',
            'Email': 'contact@brand.com',
            'Website': 'https://www.brand.com',
            'Status': 'Active'
        }]

        const worksheet = XLSX.utils.json_to_sheet(templateData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
        XLSX.writeFile(workbook, 'brand_import_template.xlsx')

        toast.success("Brand import template downloaded successfully.")
    }

  // Add new brand
    const handleAddBrand = () => {
        toast.info("Redirecting to add brand form...")
        window.location.href = '/brand/add'
    }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Brand List</h1>
          <p className="text-muted-foreground">Manage your brand inventory</p>
        </div>
        <Button onClick={handleAddBrand} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Brands
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands by name, ID or email..."
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
                <TableHead>Brand</TableHead>
                <TableHead>Brand ID</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                      <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                              <Building2 className="h-5 w-5" />
                          </div>
                          <div className="font-medium">{brand.brand_name}</div>
                      </div>
                  </TableCell>
                    <TableCell className="font-mono text-sm">{brand.brand_id}</TableCell>
                    <TableCell>{brand.contact_person || '-'}</TableCell>
                    <TableCell>{brand.email || '-'}</TableCell>
                    <TableCell>{brand.phone || '-'}</TableCell>
                    <TableCell>
                        <Badge variant={brand.is_active ? "default" : "secondary"}>
                            {brand.is_active ? "Active" : "Inactive"}
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
                                <DropdownMenuItem onClick={() => openEditDialog(brand)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => setDeleteDialog({ open: true, brand })}
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

          {filteredBrands.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No brands found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, brand: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete brand</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.brand?.brand_name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, brand: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteDialog.brand?.id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit brand Dialog */}
        <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, brand: null })}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Brand</DialogTitle>
                    <DialogDescription>
                        Update information for {editDialog.brand?.brand_name}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-brand-id">Brand ID</Label>
                            <Input
                                id="edit-brand-id"
                                value={editForm.brand_id || ''}
                                onChange={(e) => setEditForm({...editForm, brand_id: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-brand-name">Brand Name</Label>
                            <Input
                                id="edit-brand-name"
                                value={editForm.brand_name || ''}
                                onChange={(e) => setEditForm({...editForm, brand_name: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-contact">Contact Person</Label>
                            <Input
                                id="edit-contact"
                                value={editForm.contact_person || ''}
                                onChange={(e) => setEditForm({...editForm, contact_person: e.target.value})}
                            />
                        </div>
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
                        <div className="space-y-2">
                            <Label htmlFor="edit-website">Website</Label>
                            <Input
                                id="edit-website"
                                value={editForm.website || ''}
                                onChange={(e) => setEditForm({...editForm, website: e.target.value})}
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
                    <Button variant="outline" onClick={() => setEditDialog({ open: false, brand: null })}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate}>
                        Update Brand
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

      {/* Import Dialog */}
        <Dialog open={importDialog} onOpenChange={setImportDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Brands</DialogTitle>
                    <DialogDescription>
                        Upload an Excel file to import brands. Download the template first to ensure proper formatting.
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