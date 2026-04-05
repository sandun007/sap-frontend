import React, { useState, useRef, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import axios from "axios"
import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import "jspdf-autotable"
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  FileText,
  Building,
  GitBranch,
  User,
} from "lucide-react"

/* Mock data removed */

export default function ListDepartment() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialog, setDeleteDialog] = useState({ open: false, dept: null })
  const [editDialog, setEditDialog] = useState({ open: false, dept: null })
  const [branches, setBranches] = useState([])
  const [employees, setEmployees] = useState([])
  const [editForm, setEditForm] = useState({})
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const [deptRes, branchRes, empRes] = await Promise.all([
        axios.get('/departments'),
        axios.get('/branches'),
        axios.get('/employees')
      ])
      setDepartments(deptRes.data.data || [])
      setBranches(branchRes.data.data || [])
      setEmployees(empRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch data:', error)
      toast.error("Failed to load departments, branches or employees")
    } finally {
      setLoading(false)
    }
  }

  /* ---------------- FILTER ---------------- */
  const filteredDepartments = departments.filter((d) => {
    const term = searchTerm.toLowerCase()
    const branchName = (d.branch?.branch_name || "").toLowerCase()
    const managerName = `${d.manager?.first_name || ''} ${d.manager?.last_name || ''}`.toLowerCase()

    return (
      d.department_name.toLowerCase().includes(term) ||
      (d.department_code || "").toLowerCase().includes(term) ||
      d.department_id.toString().includes(term) ||
      branchName.includes(term) ||
      managerName.includes(term)
    )
  })


  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/departments/${id}`)
      setDepartments(departments.filter((d) => d.department_id !== id))
      setDeleteDialog({ open: false, dept: null })
      toast.success("Department deleted successfully")
    } catch (error) {
      console.error('Failed to delete department:', error)
      toast.error("Failed to delete department")
    }
  }

  /* ---------------- EDIT ---------------- */
  const openEditDialog = (dept) => {
    setEditDialog({ open: true, dept })
    setEditForm(dept)
  }

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`/departments/${editForm.department_id}`, editForm)
      if (response.data.success) {
        setDepartments(
          departments.map((d) =>
            d.department_id === editForm.department_id ? { ...d, ...editForm } : d
          )
        )
        setEditDialog({ open: false, dept: null })
        toast.success("Department updated successfully")
      }
    } catch (error) {
      console.error('Failed to update department:', error)
      toast.error("Failed to update department")
    }
  }

  /* ---------------- EXPORT ---------------- */
  const exportToExcel = () => {
    const dataForExport = filteredDepartments.map(d => ({
      'Department Name': d.department_name,
      'Code': d.department_code || d.department_id,
      'Branch': d.branch?.branch_name || "-",
      'Manager': d.manager ? `${d.manager.first_name} ${d.manager.last_name}` : "-",
      'Status': d.is_active ? "Active" : "Inactive"
    }))
    const worksheet = XLSX.utils.json_to_sheet(dataForExport)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Departments")
    XLSX.writeFile(workbook, "departments.xlsx")
    toast.success("Exported to Excel")
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text("Department List", 14, 20)

    doc.autoTable({
      startY: 30,
      head: [["Department Name", "Code", "Branch", "Manager", "Status"]],
      body: filteredDepartments.map((d) => [
        d.department_name,
        d.department_code || d.department_id,
        d.branch?.branch_name || "-",
        d.manager ? `${d.manager.first_name} ${d.manager.last_name}` : "-",
        d.is_active ? "Active" : "Inactive",
      ]),
    })

    doc.save("departments.pdf")
    toast.success("PDF generated")
  }

  /* ---------------- ADD ---------------- */
  const handleAddDepartment = () => {
    window.location.href = "/department/add"
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Department List</h1>
          <p className="text-muted-foreground">
            Manage organization departments
          </p>
        </div>
        <Button onClick={handleAddDepartment} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Search & Actions */}
      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel} className="gap-2 flex-1 sm:flex-none">
              <Download className="h-4 w-4 mr-2" /> Excel
            </Button>
            <Button variant="outline" onClick={exportToPDF} className="gap-2 flex-1 sm:flex-none">
              <FileText className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>
            {filteredDepartments.length} departments found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                  <TableHead>Department Code</TableHead>
                <TableHead>Department Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((dept) => (
                <TableRow key={dept.id}>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                        {dept.department_code || "-"}
                    </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{dept.department_name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <GitBranch className="inline h-4 w-4 mr-1" />
                    {dept.branch?.branch_name || "-"}
                  </TableCell>
                  <TableCell>
                    <User className="inline h-4 w-4 mr-1" />
                    {dept.manager ? `${dept.manager.first_name} ${dept.manager.last_name}` : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(dept)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() =>
                            setDeleteDialog({ open: true, dept })
                          }
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
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={() => setDeleteDialog({ open: false, dept: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <b>{deleteDialog.dept?.department_name}</b>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, dept: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteDialog.dept?.department_id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
        <Dialog
          open={editDialog.open}
          onOpenChange={() => setEditDialog({ open: false, dept: null })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
              <DialogDescription>
                Update department details
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Department ID */}

                <div className="space-y-2">
                    <Label>Department Code</Label>
                    <Input
                        value={editForm.department_code || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, department_code: e.target.value })
                        }
                        className="font-mono"
                    />
                </div>

              {/* Name */}
              <div>
                <Label>Department Name</Label>
                <Input
                  value={editForm.department_name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, department_name: e.target.value })
                  }
                />
              </div>

              {/* Description */}


              {/* Branch */}
              <div>
                  <Label>Branch</Label>
                  <Select 
                      value={editForm.branch_id?.toString()} 
                      onValueChange={(value) => setEditForm({ ...editForm, branch_id: value })}
                  >
                      <SelectTrigger id="edit-branch" className="w-full">
                          <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                          {branches.map((branch) => (
                              <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                                  {branch.branch_name}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>

              {/* Manager */}
              <div>
                  <Label>Manager</Label>
                  <Select 
                      value={editForm.manager_id?.toString()} 
                      onValueChange={(value) => setEditForm({ ...editForm, manager_id: value })}
                  >
                      <SelectTrigger id="edit-manager" className="w-full">
                          <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                      <SelectContent>
                          {employees.map((emp) => (
                              <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
                                  {emp.first_name} {emp.last_name}
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              </div>

              {/* Branch */}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialog({ open: false, dept: null })}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate}>
                Update Department
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}
