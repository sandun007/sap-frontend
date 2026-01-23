import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

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
    Building2
} from 'lucide-react'

// Temporary data
const initialSuppliers = [
    {
        supplier_id: 1,
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
        supplier_id: 2,
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
    useRef(null);
    const filteredSuppliers = suppliers.filter(sup =>
        sup.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sup.contact_person && sup.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sup.email && sup.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const handleDelete = (supplierId) => {
        setSuppliers(suppliers.filter(sup => sup.supplier_id !== supplierId))
        setDeleteDialog({ open: false, supplier: null })
        toast.success("Supplier deleted successfully")
    }

    const handleUpdate = () => {
        setSuppliers(suppliers.map(sup =>
            sup.supplier_id === editForm.supplier_id ? { ...sup, ...editForm } : sup
        ))
        setEditDialog({ open: false, supplier: null })
        setEditForm({})
        toast.success("Supplier updated successfully")
    }

    const openEditDialog = (supplier) => {
        setEditDialog({ open: true, supplier })
        setEditForm(supplier)
    }

    const handleAddSupplier = () => {
        window.location.href = '/supplier/add'
    }

    return (
        <div className="container mx-auto p-6 space-y-6">

            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-3xl font-bold flex items-center gap-2">
                                <Building2 className="h-8 w-8" />
                                Supplier List
                            </CardTitle>
                            <CardDescription>Manage your supplier inventory</CardDescription>
                        </div>
                        <Button onClick={handleAddSupplier} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Add Supplier
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Search */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                        <Input
                            placeholder="Search suppliers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
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
                                        {supplier.supplier_name}
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Supplier</DialogTitle>
                        <DialogDescription>
                            Update {editDialog.supplier?.supplier_name}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <Input
                            placeholder="Supplier Name"
                            value={editForm.supplier_name || ''}
                            onChange={(e) => setEditForm({ ...editForm, supplier_name: e.target.value })}
                        />
                        <Input
                            placeholder="Contact Person"
                            value={editForm.contact_person || ''}
                            onChange={(e) => setEditForm({ ...editForm, contact_person: e.target.value })}
                        />
                        <Input
                            placeholder="Phone"
                            value={editForm.phone || ''}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                        <Input
                            placeholder="Email"
                            value={editForm.email || ''}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
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

        </div>
    )
}
