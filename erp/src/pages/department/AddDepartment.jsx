import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, X, Building, FileText, User, Calendar, GitBranch } from 'lucide-react'
import axios from 'axios'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AddDepartment() {
    const [formData, setFormData] = useState({
        department_name: '',
        description: '',
        manager_id: '',
        branch_id: '',
        created_date: ''
    })
    const [branches, setBranches] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [branchRes, empRes] = await Promise.all([
                    axios.get('/branches'),
                    axios.get('/employees')
                ])
                setBranches(branchRes.data.data || [])
                setEmployees(empRes.data.data || [])
            } catch (error) {
                console.error('Failed to fetch initial data:', error)
                toast.error('Failed to load branches or employees')
            }
        }
        fetchData()
    }, [])

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.department_name) {
            toast.error('Please enter department name')
            return
        }

        if (!formData.branch_id) {
            toast.error('Please select branch')
            return
        }

        setLoading(true)
        try {
            const response = await axios.post('/departments', formData)

            if (response.data.success) {
                toast.success('Department created successfully')
                setFormData({
                    department_name: '',
                    description: '',
                    manager_id: '',
                    branch_id: '',
                    created_date: ''
                })
            } else {
                toast.error(response.data.message || 'Failed to create department')
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Server error'
            toast.error(errorMsg)
            console.error('Department creation failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setFormData({
            department_name: '',
            description: '',
            manager_id: '',
            branch_id: '',
            created_date: ''
        })
        toast.info('Form cleared')
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Add New Department</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Create and manage departments
                    </p>
                </div>
                <Badge variant="secondary">Department</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left */}
                <Card>
                    <CardHeader>
                        <CardTitle>Department Details</CardTitle>
                        <CardDescription>Basic information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Department Name *</Label>
                            <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-10"
                                    placeholder="Department name"
                                    value={formData.department_name}
                                    onChange={e => handleChange('department_name', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Description</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-10"
                                    placeholder="Department description"
                                    value={formData.description}
                                    onChange={e => handleChange('description', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assignment</CardTitle>
                        <CardDescription>Branch & manager</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Branch *</Label>
                            <Select 
                                value={formData.branch_id?.toString()} 
                                onValueChange={(value) => handleChange('branch_id', value)}
                            >
                                <SelectTrigger id="branch_id" className="w-full">
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branches.length > 0 ? (
                                        branches.map((branch) => (
                                            <SelectItem key={branch.branch_id} value={branch.branch_id.toString()}>
                                                {branch.branch_name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>No branches found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Manager</Label>
                            <Select 
                                value={formData.manager_id?.toString()} 
                                onValueChange={(value) => handleChange('manager_id', value)}
                            >
                                <SelectTrigger id="manager_id" className="w-full">
                                    <SelectValue placeholder="Select manager" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.length > 0 ? (
                                        employees.map((emp) => (
                                            <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
                                                {emp.first_name} {emp.last_name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="none" disabled>No employees found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Created Date</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="date"
                                    className="pl-10"
                                    value={formData.created_date}
                                    onChange={e => handleChange('created_date', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t">
                <Button variant="outline" className="w-full sm:w-auto" onClick={handleClear}>
                    <X className="h-4 w-4 mr-2" /> Clear
                </Button>
                <Button onClick={handleSubmit} className="w-full sm:w-auto gap-2" disabled={loading}>
                    <Save className="h-4 w-4" /> 
                    {loading ? 'Saving...' : 'Save Department'}
                </Button>
            </div>
        </div>
    )
}
