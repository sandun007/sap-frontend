import React, { useState, useEffect } from 'react'
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
import autoTable from 'jspdf-autotable'
import {
    Plus, Search, MoreVertical, Edit, Trash2, Download, Upload, User, FileText
} from 'lucide-react'
import axios from 'axios'

export default function ListEmployee() {
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState('all')
    const [deleteDialog, setDeleteDialog] = useState({ open: false, employee: null })
    const [editDialog, setEditDialog] = useState({ open: false, employee: null })
    const [editForm, setEditForm] = useState({})
    const [allDepartments, setAllDepartments] = useState([])
    const [editNicFrontPreview, setEditNicFrontPreview] = useState(null)
    const [editNicBackPreview, setEditNicBackPreview] = useState(null)
    const [editNicFrontFile, setEditNicFrontFile] = useState(null)
    const [editNicBackFile, setEditNicBackFile] = useState(null)

    useEffect(() => {
        fetchEmployees()
        const fetchDepts = async () => {
            try {
                const response = await axios.get('/departments')
                setAllDepartments(response.data.data || [])
            } catch (err) {
                console.error("Failed to fetch departments", err)
            }
        }
        fetchDepts()
    }, [])

    const fetchEmployees = async () => {
        setLoading(true)
        try {
            const response = await axios.get('/employees')
            setEmployees(response.data.data || [])
        } catch (error) {
            console.error('Failed to fetch employees:', error)
            toast.error("Failed to load employees from database")
        } finally {
            setLoading(false)
        }
    }

    // Filter employees
    const filteredEmployees = employees.filter(emp => {
        const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase()
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            (emp.employee_code && emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesDepartment = selectedDepartment === 'all' || emp.department?.department_name === selectedDepartment
        return matchesSearch && matchesDepartment
    })

    // Get unique departments
    const departments = ['all', ...new Set(employees.map(e => e.department?.department_name).filter(Boolean))]

    // Delete employee
    const handleDelete = async (employeeId) => {
        try {
            await axios.delete(`/employees/${employeeId}`)
            setEmployees(employees.filter(emp => emp.employee_id !== employeeId))
            setDeleteDialog({ open: false, employee: null })
            toast.success("Employee has been successfully deleted.")
        } catch (error) {
            console.error('Failed to delete employee:', error)
            toast.error("Failed to delete employee")
        }
    }

    // Update employee
    const handleUpdate = async () => {
        try {
            const formData = new FormData();
            const expectedFields = [
                'first_name', 'last_name', 'email', 'phone_num1', 'phone_num2', 
                'nic_num', 'hire_date', 'position', 'salary', 'address', 
                'date_of_birth', 'department_id', 'is_active', 'employee_code'
            ];

            expectedFields.forEach(key => {
                let value = editForm[key];
                if (key === 'is_active') {
                    value = value ? '1' : '0';
                }
                if (value !== null && value !== undefined) {
                    formData.append(key, value);
                }
            });

            if (editNicFrontFile) {
                formData.append('nic_front', editNicFrontFile);
            }
            if (editNicBackFile) {
                formData.append('nic_back', editNicBackFile);
            }
            formData.append('_method', 'PUT');

            const response = await axios.post(`/employees/${editForm.employee_id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                const updatedDept = allDepartments.find(d => String(d.department_id) === String(editForm.department_id))
                const updatedEmployee = response.data.data || {
                    ...editForm,
                    department: updatedDept ? { ...updatedDept } : editForm.department
                }

                setEmployees(prev => prev.map(emp =>
                    emp.employee_id === editForm.employee_id ? { ...emp, ...updatedEmployee } : emp
                ))
                
                setEditDialog({ open: false, employee: null })
                setEditForm({})
                setEditNicFrontPreview(null)
                setEditNicBackPreview(null)
                setEditNicFrontFile(null)
                setEditNicBackFile(null)
                toast.success("Employee information has been updated successfully.")
            }
        } catch (error) {
            console.error('Failed to update employee:', error)
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Failed to update employee";
            toast.error(errorMsg)
        }
    }

    const handleEditFileChange = (side, file) => {
        if (!file) return
        if (side === 'front') {
            setEditNicFrontFile(file)
            setEditNicFrontPreview(URL.createObjectURL(file))
        } else {
            setEditNicBackFile(file)
            setEditNicBackPreview(URL.createObjectURL(file))
        }
    }

    // Open edit dialog
    const openEditDialog = (employee) => {
        setEditDialog({ open: true, employee })
        const deptId = employee.department?.department_id || employee.department_id || ""
        setEditForm({
            ...employee,
            department_id: String(deptId)
        })
        setEditNicFrontPreview(employee.nic_front_url)
        setEditNicBackPreview(employee.nic_back_url)
        setEditNicFrontFile(null)
        setEditNicBackFile(null)
    }

    // Export to Excel
    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(filteredEmployees.map(emp => ({
                'Employee Code': emp.employee_code,
                'Full Name': `${emp.first_name} ${emp.last_name}`,
                'Email': emp.email,
                'Phone': emp.phone_num1,
                'Position': emp.position,
                'Department': emp.department?.department_name || 'N/A',
                'Join Date': emp.hire_date,
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
                `${emp.first_name} ${emp.last_name}`,
                emp.employee_code,
                emp.position,
                emp.department?.department_name || 'N/A',
                emp.hire_date,
                emp.is_active ? 'Active' : 'Inactive'
            ])

            autoTable(doc, {
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
        window.location.href = '/employee/add'
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
                                                <div className="font-medium">{emp.first_name} {emp.last_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {emp.email}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">{emp.employee_code}</TableCell>
                                    <TableCell>{emp.position}</TableCell>
                                    <TableCell>{emp.department?.department_name || 'N/A'}</TableCell>
                                    <TableCell>{new Date(emp.hire_date).toLocaleDateString()}</TableCell>
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
                        <Button variant="destructive" onClick={() => handleDelete(deleteDialog.employee?.employee_id)}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Employee Dialog */}
            <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, employee: null })}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Employee</DialogTitle>
                        <DialogDescription>
                            Update information for {editDialog.employee?.full_name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-first-name">First Name</Label>
                                <Input
                                    id="edit-first-name"
                                    value={editForm.first_name || ''}
                                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-last-name">Last Name</Label>
                                <Input
                                    id="edit-last-name"
                                    value={editForm.last_name || ''}
                                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-dob">Date of Birth</Label>
                            <Input
                                id="edit-dob"
                                type="date"
                                value={editForm.date_of_birth || ''}
                                onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Address</Label>
                            <Input
                                id="edit-address"
                                value={editForm.address || ''}
                                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                placeholder="Residential address"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-nic">NIC Number</Label>
                            <Input
                                id="edit-nic"
                                value={editForm.nic_num || ''}
                                onChange={(e) => setEditForm({ ...editForm, nic_num: e.target.value })}
                                placeholder="e.g. 123456789V"
                                maxLength={20}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>NIC Front</Label>
                                <label
                                    htmlFor="edit-nic-front"
                                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors"
                                    style={{ minHeight: '120px' }}
                                >
                                    {editNicFrontPreview ? (
                                        <img src={editNicFrontPreview} alt="NIC Front" className="h-20 object-cover rounded" />
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-500">Upload front</span>
                                        </>
                                    )}
                                    <input
                                        id="edit-nic-front"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        className="hidden"
                                        onChange={(e) => handleEditFileChange('front', e.target.files[0])}
                                    />
                                </label>
                            </div>
                            <div className="space-y-2">
                                <Label>NIC Back</Label>
                                <label
                                    htmlFor="edit-nic-back"
                                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors"
                                    style={{ minHeight: '120px' }}
                                >
                                    {editNicBackPreview ? (
                                        <img src={editNicBackPreview} alt="NIC Back" className="h-20 object-cover rounded" />
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8 text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-500">Upload back</span>
                                        </>
                                    )}
                                    <input
                                        id="edit-nic-back"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        className="hidden"
                                        onChange={(e) => handleEditFileChange('back', e.target.files[0])}
                                    />
                                </label>
                            </div>
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
                                <Label htmlFor="edit-phone">Phone 1</Label>
                                <Input
                                    id="edit-phone"
                                    value={editForm.phone_num1 || ''}
                                    onChange={(e) => setEditForm({ ...editForm, phone_num1: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Phone 2</Label>
                                <Input
                                    id="edit-phone"
                                    value={editForm.phone_num2 || ''}
                                    onChange={(e) => setEditForm({ ...editForm, phone_num2: e.target.value })}
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
                                <Select 
                                    value={editForm.department_id ? String(editForm.department_id) : ""} 
                                    onValueChange={(value) => setEditForm({ ...editForm, department_id: value })}
                                >
                                    <SelectTrigger id="edit-department" className="w-full">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {allDepartments && allDepartments.length > 0 ? (
                                            allDepartments.map((dept) => (
                                                <SelectItem key={dept.department_id || Math.random()} value={dept.department_id ? String(dept.department_id) : ""}>
                                                    {dept.department_name || "Untitled Department"}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>No departments found</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-hire-date">Hire Date</Label>
                                <Input
                                    id="edit-hire-date"
                                    type="date"
                                    value={editForm.hire_date || ''}
                                    onChange={(e) => setEditForm({ ...editForm, hire_date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-salary">Salary</Label>
                                <Input
                                    id="edit-salary"
                                    type="number"
                                    value={editForm.salary || ''}
                                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                                    placeholder="0.00"
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

                        <div className="space-y-2">
                            <Label htmlFor="edit-password">New Password</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={editForm.password || ''}
                                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                placeholder="Leave blank to keep current"
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