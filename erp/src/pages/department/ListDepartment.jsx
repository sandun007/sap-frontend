import React, { useState, useRef } from "react"
import { Switch } from "@/components/ui/switch"

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
  Upload,
  FileText,
  Building,
  GitBranch,
  User,
} from "lucide-react"

/* ---------------- TEMP DATA ---------------- */
const initialDepartments = [
  {
    id: 1,
    department_id: "DEP-001",
    department_name: "Human Resources",
    description: "Employee management",
    branch_id: "BR-001",
    manager_id: "EMP-10",
    is_active: true,
    created_date: "2024-01-10",
  },
  {
    id: 2,
    department_id: "DEP-002",
    department_name: "IT Department",
    description: "System & infrastructure",
    branch_id: "BR-002",
    manager_id: "EMP-03",
    is_active: false,
    created_date: "2024-02-01",
  },
]

export default function ListDepartment() {
  const [departments, setDepartments] = useState(initialDepartments)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialog, setDeleteDialog] = useState({ open: false, dept: null })
  const [editDialog, setEditDialog] = useState({ open: false, dept: null })
  const [editForm, setEditForm] = useState({})
  const fileInputRef = useRef(null)

  /* ---------------- FILTER ---------------- */
  const filteredDepartments = departments.filter((d) => {
  const term = searchTerm.toLowerCase()

  return (
    d.department_name.toLowerCase().includes(term) ||
    d.department_id.toLowerCase().includes(term) ||
    d.branch_id.toLowerCase().includes(term) ||
    (d.manager_id && d.manager_id.toLowerCase().includes(term))
  )
})


  /* ---------------- DELETE ---------------- */
  const handleDelete = (id) => {
    setDepartments(departments.filter((d) => d.id !== id))
    setDeleteDialog({ open: false, dept: null })
    toast.success("Department deleted successfully")
  }

  /* ---------------- EDIT ---------------- */
  const openEditDialog = (dept) => {
    setEditDialog({ open: true, dept })
    setEditForm(dept)
  }

  const handleUpdate = () => {
    setDepartments(
      departments.map((d) =>
        d.id === editForm.id ? { ...d, ...editForm } : d
      )
    )
    setEditDialog({ open: false, dept: null })
    toast.success("Department updated successfully")
  }

  /* ---------------- EXPORT ---------------- */
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredDepartments)
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
      head: [["ID", "Name", "Branch", "Manager", "Status"]],
      body: filteredDepartments.map((d) => [
        d.department_id,
        d.department_name,
        d.branch_id,
        d.manager_id || "-",
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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Department List</h1>
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
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToExcel}>
              <Download className="h-4 w-4 mr-2" /> Excel
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
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
                <TableHead>Department</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{dept.department_name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {dept.department_id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <GitBranch className="inline h-4 w-4 mr-1" />
                    {dept.branch_id}
                  </TableCell>
                  <TableCell>
                    <User className="inline h-4 w-4 mr-1" />
                    {dept.manager_id || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={dept.is_active ? "default" : "secondary"}>
                      {dept.is_active ? "Active" : "Inactive"}
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
              onClick={() => handleDelete(deleteDialog.dept?.id)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
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
        <Input
          value={editForm.branch_id || ""}
          onChange={(e) =>
            setEditForm({ ...editForm, branch_id: e.target.value })
          }
        />
      </div>

      {/* Manager */}
      <div>
        <Label>Manager</Label>
        <Input
          value={editForm.manager_id || ""}
          onChange={(e) =>
            setEditForm({ ...editForm, manager_id: e.target.value })
          }
        />
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <Label>Status</Label>
        <div className="flex items-center gap-3">
          <span className="text-sm">
            {editForm.is_active ? "Active" : "Inactive"}
          </span>
          <Switch
            checked={!!editForm.is_active}
            onCheckedChange={(value) =>
              setEditForm({ ...editForm, is_active: value })
            }
          />
        </div>
      </div>
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
