import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import {
    Plus, Search, MoreVertical, Edit, Trash2, Download, Upload, User, FileText
} from 'lucide-react'

// Temporary mock data (same structure as your products)
const initialEmployees = [
    {
        id: 1,
        employee_id: "EMP-123456-ABCD",
        full_name: "Nimal Perera",
        email: "nimal@company.lk",
        phone: "+94771234567",
        position: "Senior Developer",
        department: "Development",
        join_date: "2023-05-15",
        is_active: true,
        address: "Colombo 07",
        emergency_contact: "Kamal Perera - +94719876543",
    },
    {
        id: 2,
        employee_id: "EMP-789012-EFGH",
        full_name: "Kamal Fernando",
        email: "kamal@company.lk",
        phone: "+94772345678",
        position: "Accountant",
        department: "Finance",
        join_date: "2024-01-10",
        is_active: true,
        address: "Galle",
        emergency_contact: "Sunil Fernando - +94716543210",
    },
    {
        id: 3,
        employee_id: "EMP-345678-IJKL",
        full_name: "Samanthi Silva",
        email: "samanthi@company.lk",
        phone: "+94773456789",
        position: "HR Manager",
        department: "Human Resources",
        join_date: "2022-11-20",
        is_active: true,
        address: "Kandy",
        emergency_contact: "Ruwan Silva - +94717766554",
    }
]

export default function ListEmployee() {
    const [employees, setEmployees] = useState(initialEmployees)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState('all')
    const [deleteDialog, setDeleteDialog] = useState({ open: false, employee: null })
    const [editDialog, setEditDialog] = useState({ open: false, employee: null })
    const [editForm, setEditForm] = useState({})

    // Filter employees
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment
        return matchesSearch && matchesDepartment
    })

    // Get unique departments
    const departments = ['all', ...new Set(employees.map(e => e.department))]

    // Delete employee
    const handleDelete = (employeeId) => {
        setEmployees(employees.filter(emp => emp.id !== employeeId))
        setDeleteDialog({ open: false, employee: null })
        toast.success("Employee has been successfully deleted.")
    }

    // Update employee
    const handleUpdate = () => {
        setEmployees(employees.map(emp =>
            emp.id === editForm.id ? { ...emp, ...editForm } : emp
        ))
        setEditDialog({ open: false, employee: null })
        setEditForm({})
        toast.success("Employee information has been updated successfully.")
    }

    // Open edit dialog
    const openEditDialog = (employee) => {
        setEditDialog({ open: true, employee })
        setEditForm(employee)
    }

    // Export to Excel
    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(filteredEmployees.map(emp => ({
                'Employee ID': emp.employee_id,
                'Full Name': emp.full_name,
                'Email': emp.email,
                'Phone': emp.phone,
                'Position': emp.position,
                'Department': emp.department,
                'Join Date': emp.join_date,
                'Status': emp.is_active ? 'Active' : 'Inactive',
                'Address': emp.address,
                'Emergency Contact': emp.emergency_contact
            })))

            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees')
            XLSX.writeFile(workbook, `employees_export_${new Date().toISOString().split('T')[0]}.xlsx`)

            toast.success(`Exported ${filteredEmployees.length} employees to Excel.`)
        } catch (error) {
            toast.error("Failed to export employees to Excel.")
        }
    }

    // Export to PDF (simplified version)
    const exportToPDF = () => {
        try {
            const doc = new jsPDF()
            doc.setFontSize(20)
            doc.text('Employee List', 14, 22)
            doc.setFontSize(10)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
            doc.text(`Total Employees: ${filteredEmployees.length}`, 14, 37)

            const tableColumn = ['Name', 'ID', 'Position', 'Department', 'Join Date', 'Status']
            const tableRows = filteredEmployees.map(emp => [
                emp.full_name,
                emp.employee_id,
                emp.position,
                emp.department,
                emp.join_date,
                emp.is_active ? 'Active' : 'Inactive'
            ])

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 45,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [59, 130, 246] }
            })

            doc.save(`employees_report_${new Date().toISOString().split('T')[0]}.pdf`)
            toast.success(`Generated PDF report with ${filteredEmployees.length} employees.`)
        } catch (error) {
            toast.error("Failed to generate PDF report.")
        }
    }

    // Add new employee redirect
    const handleAddEmployee = () => {
        toast.info("Redirecting to add employee form...")
        // window.location.href = '/employees/add'  // or use react-router
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Employee List</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Manage your team members</p>
                </div>
                <Button onClick={handleAddEmployee} className="gap-2 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Add Employee
                </Button>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, employee ID, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="w-full sm:w-[180px]">
                                <SelectValue placeholder="Filter by department" />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map(dept => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept === 'all' ? 'All Departments' : dept}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={exportToExcel} className="gap-2 flex-1 sm:flex-none">
                                <Download className="h-4 w-4" />
                                Excel
                            </Button>
                            <Button variant="outline" onClick={exportToPDF} className="gap-2 flex-1 sm:flex-none">
                                <FileText className="h-4 w-4" />
                                PDF
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Employees Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Employees</CardTitle>
                    <CardDescription>
                        {filteredEmployees.length} employees found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Employee ID</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Join Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.map((emp) => (
                                <TableRow key={emp.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{emp.full_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {emp.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{emp.employee_id}</TableCell>
                                    <TableCell>{emp.position}</TableCell>
                                    <TableCell>{emp.department}</TableCell>
                                    <TableCell>{emp.join_date}</TableCell>
                                    <TableCell>
                                        <Badge variant={emp.is_active ? "default" : "secondary"}>
                                            {emp.is_active ? "Active" : "Inactive"}
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
                                                <DropdownMenuItem onClick={() => openEditDialog(emp)}>
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, employee: emp })}>
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

                    {filteredEmployees.length === 0 && (
                        <div className="text-center py-8">
                            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No employees found</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, employee: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Employee</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.employee?.full_name}"?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, employee: null })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={() => handleDelete(deleteDialog.employee?.id)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Employee Dialog */}
            <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, employee: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                        <DialogDescription>
                            Update information for {editDialog.employee?.full_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Full Name</Label>
                            <Input
                                id="edit-name"
                                value={editForm.full_name || ''}
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editForm.email || ''}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    value={editForm.phone || ''}
                                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-position">Position</Label>
                                <Input
                                    id="edit-position"
                                    value={editForm.position || ''}
                                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-department">Department</Label>
                                <Input
                                    id="edit-department"
                                    value={editForm.department || ''}
                                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between space-y-0 pt-6">
                            <Label htmlFor="edit-status">Active Status</Label>
                            <Switch
                                id="edit-status"
                                checked={editForm.is_active || false}
                                onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, employee: null })}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>
                            Update Employee
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}