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
import { Plus, Search, MoreVertical, Edit, Trash2, Download, Upload, FileText, User } from 'lucide-react'

// Temporary data
const initialCustomers = [
  {
    customer_id: "CUST-000001-ABCD",
    first_name: 'kavindu',
    last_name: 'Jayanath',
    company_name: 'Tech Solutions',
    email: 'kavindu@example.com',
    phone: '+94 71 123 4567',
    address: 'Colombo, Sri Lanka',
    customer_type: 'Regular',
    registration_date: '2025-01-01',
    credit_limit: 10000,
    is_active: true,
  },
  {
    customer_id: "CUST-000002-EFGH",
    first_name: 'Tharindu',
    last_name: 'Fernando',
    company_name: 'ABC Corp',
    email: 'tharindu@example.com',
    phone: '+94 77 765 4321',
    address: 'Kandy, Sri Lanka',
    customer_type: 'VIP',
    registration_date: '2025-01-15',
    credit_limit: 50000,
    is_active: false,
  },
]

export default function ListCustomer() {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, customer: null })
  const [editDialog, setEditDialog] = useState({ open: false, customer: null })
  const [importDialog, setImportDialog] = useState(false)
  const [editForm, setEditForm] = useState({})
  const fileInputRef = useRef(null)

  // Filter customers
  const filteredCustomers = customers.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Generate customer ID
  const generateCustomerId = () => `CUST-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

  // Delete customer
  const handleDelete = (customerId) => {
    setCustomers(customers.filter(c => c.customer_id !== customerId))
    setDeleteDialog({ open: false, customer: null })
    toast.success('Customer deleted successfully.')
  }

  // Update customer
  const handleUpdate = () => {
    setCustomers(customers.map(c =>
      c.customer_id === editForm.id ? { ...c, ...editForm } : c
    ))
    setEditDialog({ open: false, customer: null })
    setEditForm({})
    toast.success('Customer updated successfully.')
  }

  // Open edit dialog
  const openEditDialog = (customer) => {
    setEditDialog({ open: true, customer })
    setEditForm(customer)
  }

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredCustomers)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers')
    XLSX.writeFile(workbook, `customers_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Exported customers to Excel.')
  }

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('Customer List', 14, 22)
    doc.setFontSize(10)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)

    const tableColumn = ['ID', 'Name', 'Email', 'Phone', 'Customer Type', 'Status']
    const tableRows = filteredCustomers.map(c => [
        c.customer_id,
      `${c.first_name} ${c.last_name}`,
      c.email,
      c.phone || '-',
      c.customer_type || '-',
      c.is_active ? 'Active' : 'Inactive'
    ])

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    })

    doc.save(`customers_${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('PDF generated successfully.')
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

        const newCustomers = jsonData.map((item, index) => ({
          customer_id: generateCustomerId(),
          first_name: item['First Name'] || `First${index+1}`,
          last_name: item['Last Name'] || `Last${index+1}`,
          company_name: item['Company Name'] || '',
          email: item['Email'] || '',
          phone: item['Phone'] || '',
          address: item['Address'] || '',
          customer_type: item['Customer Type'] || '',
          registration_date: item['Registration Date'] || new Date().toISOString().split('T')[0],
          credit_limit: item['Credit Limit'] || 0,
          is_active: item['Status']?.toLowerCase() === 'active'
        }))

        setCustomers(prev => [...prev, ...newCustomers])
        setImportDialog(false)
        toast.success(`Imported ${newCustomers.length} customers.`)
      } catch (error) {
        toast.error('Failed to process Excel file.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Download template
  const downloadTemplate = () => {
    const template = [{
      'First Name': 'John',
      'Last Name': 'Doe',
      'Company Name': 'Example Corp',
      'Email': 'john@example.com',
      'Phone': '+94 XX XXX XXXX',
      'Address': 'Colombo',
      'Customer Type': 'Regular',
      'Registration Date': 'YYYY-MM-DD',
      'Credit Limit': 10000,
      'Status': 'Active'
    }]
    const worksheet = XLSX.utils.json_to_sheet(template)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
    XLSX.writeFile(workbook, 'customer_import_template.xlsx')
    toast.success('Template downloaded successfully.')
  }

  // Add new customer
  const handleAddCustomer = () => {
    toast.info('Redirecting to add customer form...')
    window.location.href = '/customer/add'
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Customer List</h1>
          <p className="text-muted-foreground">Manage your customers</p>
        </div>
        <Button onClick={handleAddCustomer} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Search and Export */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
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
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>{filteredCustomers.length} customers found</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                  <TableHead>Customer ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Customer Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((c) => (
                <TableRow key={c.customer_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-gray-400" />
                      {c.first_name} {c.last_name}
                    </div>
                  </TableCell>
                    <TableCell className="font-mono text-sm">
                        {c.customer_id}
                    </TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.phone || '-'}</TableCell>
                  <TableCell>{c.customer_type || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? 'default' : 'secondary'}>
                      {c.is_active ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => openEditDialog(c)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteDialog({ open: true, customer: c })}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No customers found</div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, customer: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.customer?.first_name} {deleteDialog.customer?.last_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, customer: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteDialog.customer?.id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, customer: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update information for {editDialog.customer?.first_name} {editDialog.customer?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={editForm.first_name || ''} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={editForm.last_name || ''} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })} />
              </div>
            </div>
              <div className="space-y-2">
                  <Label>Customer ID</Label>
                  <Input
                      value={editForm.customer_id || ''}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                  />
              </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Type</Label>
                <Input value={editForm.customer_type || ''} onChange={(e) => setEditForm({ ...editForm, customer_type: e.target.value })} />
              </div>
              <div className="flex items-center justify-between pt-4">
                <Label>Active Status</Label>
                <Switch checked={editForm.is_active ?? true} onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, customer: null })}>Cancel</Button>
            <Button onClick={handleUpdate}>Update Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Customers</DialogTitle>
            <DialogDescription>Upload an Excel file to import customers. Download the template first to ensure proper formatting.</DialogDescription>
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
            <Button variant="outline" onClick={() => setImportDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
