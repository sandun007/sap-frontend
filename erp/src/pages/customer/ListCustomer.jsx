import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Plus, Search, MoreVertical, Edit, Trash2, Download, Upload, FileText, User, Mail, Phone, Briefcase, Users } from 'lucide-react'
import axios from 'axios'

export default function ListCustomer() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, customer: null })
  const [editDialog, setEditDialog] = useState({ open: false, customer: null })
  const [importDialog, setImportDialog] = useState(false)
  const [editForm, setEditForm] = useState({})
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/customers')
      setCustomers(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      toast.error("Failed to load customers")
    } finally {
      setLoading(false)
    }
  }

  // Filter customers
  const filteredCustomers = customers.filter(c => {
    const term = searchTerm.toLowerCase()
    return (
        `${c.first_name} ${c.last_name}`.toLowerCase().includes(term) ||
        (c.customer_code || "").toLowerCase().includes(term) ||
        (c.email || "").toLowerCase().includes(term) ||
        (c.customer_type || "").toLowerCase().includes(term)
    )
  })

  // Delete customer
  const handleDelete = async (customerId) => {
    try {
      await axios.delete(`/customers/${customerId}`)
      setCustomers(customers.filter(c => c.customer_id !== customerId))
      setDeleteDialog({ open: false, customer: null })
      toast.success('Customer deleted successfully.')
    } catch (error) {
      console.error('Failed to delete customer:', error)
      toast.error('Failed to delete customer')
    }
  }

  // Update customer
  const handleUpdate = async () => {
    try {
      const response = await axios.put(`/customers/${editForm.customer_id}`, editForm)
      if (response.data.success) {
        setCustomers(customers.map(c =>
          c.customer_id === editForm.customer_id ? { ...c, ...editForm } : c
        ))
        setEditDialog({ open: false, customer: null })
        setEditForm({})
        toast.success('Customer updated successfully.')
      }
    } catch (error) {
      console.error('Failed to update customer:', error)
      toast.error('Failed to update customer')
    }
  }

  // Open edit dialog
  const openEditDialog = (customer) => {
    setEditDialog({ open: true, customer })
    setEditForm(customer)
  }

  // Export to Excel
  const exportToExcel = () => {
    const dataToExport = filteredCustomers.map(c => ({
      'Code': c.customer_code || '-',
      'Name': `${c.first_name} ${c.last_name}`,
      'Email': c.email,
      'Phone': c.phone || '-',
      'Type': c.customer_type || '-',
      'Company': c.company_name || '-'
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataToExport)
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

    const tableColumn = ['Code', 'Name', 'Email', 'Phone', 'Type']
    const tableRows = filteredCustomers.map(c => [
      c.customer_code || '-',
      `${c.first_name} ${c.last_name}`,
      c.email,
      c.phone || '-',
      c.customer_type || '-'
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

  const handleAddCustomer = () => {
    window.location.href = '/customer/add'
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Customer List</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
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
              placeholder="Search by name, email, or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel} className="gap-2 flex-1 sm:flex-none">
              <Download className="h-4 w-4" /> Excel
            </Button>
            <Button variant="outline" onClick={exportToPDF} className="gap-2 flex-1 sm:flex-none">
              <FileText className="h-4 w-4" /> PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>
              {loading ? 'Loading customers...' : `${filteredCustomers.length} customers found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead>Customer Code</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((c) => (
                <TableRow key={c.customer_id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                        {c.customer_code || "-"}
                    </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="font-medium text-sm">
                        {c.first_name} {c.last_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{c.email}</TableCell>
                  <TableCell className="text-sm">{c.phone || '-'}</TableCell>
                  <TableCell>
                      <Badge variant="outline" className="font-normal">
                          {c.customer_type || 'Regular'}
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

          {!loading && filteredCustomers.length === 0 && (
            <div className="text-center py-12">
               <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
               <h3 className="text-lg font-medium text-gray-900">No customers found</h3>
               <p className="text-gray-500 mt-1">Try adjusting your search or add a new customer.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, customer: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <b>{deleteDialog.customer?.first_name} {deleteDialog.customer?.last_name}</b>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, customer: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteDialog.customer?.customer_id)}>
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
              Update records for {editForm.first_name} {editForm.last_name}
            </DialogDescription>
          </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                        value={editForm.first_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input
                        value={editForm.last_name || ''}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Customer Code</Label>
                    <Input
                        value={editForm.customer_code || ''}
                        onChange={(e) => setEditForm({ ...editForm, customer_code: e.target.value })}
                        className="font-mono"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Customer Type</Label>
                    <Select 
                        value={editForm.customer_type || ""} 
                        onValueChange={(value) => setEditForm({ ...editForm, customer_type: value })}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Retail">Retail</SelectItem>
                            <SelectItem value="Wholesale">Wholesale</SelectItem>
                            <SelectItem value="Distributor">Distributor</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="col-span-2 space-y-2">
                    <Label>Address</Label>
                    <Input
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                </div>
            </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, customer: null })}>Cancel</Button>
            <Button onClick={handleUpdate}>Update Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
