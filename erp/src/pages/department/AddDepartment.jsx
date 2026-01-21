import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, X, Building, FileText, User, Calendar, GitBranch } from 'lucide-react'

export default function AddDepartment() {
    const [formData, setFormData] = useState({
        department_name: '',
        description: '',
        manager_id: '',
        branch_id: '',
        created_date: ''
    })

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

        try {
            const response = await fetch('YOUR_API_URL/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                toast.success('Department created successfully')
                setFormData({
                    department_name: '',
                    description: '',
                    manager_id: '',
                    branch_id: '',
                    created_date: ''
                })
            } else {
                toast.error(data.message || 'Failed to create department')
            }
        } catch (error) {
            toast.error('Server error')
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
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Add New Department</h1>
                    <p className="text-muted-foreground">
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
                            <Label>Branch ID *</Label>
                            <div className="relative">
                                <GitBranch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-10"
                                    placeholder="Branch ID"
                                    value={formData.branch_id}
                                    onChange={e => handleChange('branch_id', e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Manager ID</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-10"
                                    placeholder="Employee ID"
                                    value={formData.manager_id}
                                    onChange={e => handleChange('manager_id', e.target.value)}
                                />
                            </div>
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
            <div className="flex justify-end gap-4 mt-6">
                <Button variant="outline" onClick={handleClear}>
                    <X className="h-4 w-4 mr-2" /> Clear
                </Button>
                <Button onClick={handleSubmit}>
                    <Save className="h-4 w-4 mr-2" /> Save Department
                </Button>
            </div>
        </div>
    )
}
