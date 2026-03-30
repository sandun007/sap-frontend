import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Save, X, Building2, Mail, Phone, MapPin, User, Calendar, CheckCircle, XCircle } from 'lucide-react'
import axios from 'axios'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AddBranch() {
    const [formData, setFormData] = useState({
        branch_name: '',
        address: '',
        phone: '',
        email: '',
        manager_id: '',
        opening_date: '',
        is_active: true
    })

    const [branchId, setBranchId] = useState(generateBranchId())
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axios.get('/employees')
                setEmployees(response.data.data || [])
            } catch (error) {
                console.error('Failed to fetch employees:', error)
            }
        }
        fetchEmployees()
    }, [])

    // Generate branch ID
    function generateBranchId() {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substr(2, 4).toUpperCase()
        return `BRANCH-${timestamp}-${random}`
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.branch_name) {
            toast.error("Please enter branch name")
            return
        }

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email address")
            return
        }

        setLoading(true)
        try {
            const response = await axios.post('/branches', formData)

            if (response.data.success) {
                toast.success("Branch created successfully")
                setFormData({
                    branch_name: '',
                    address: '',
                    phone: '',
                    email: '',
                    manager_id: '',
                    opening_date: '',
                    is_active: true
                })
                setBranchId(generateBranchId())
            } else {
                toast.error(response.data.message || "Failed to create branch")
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Server error"
            toast.error(errorMsg)
            console.error("Branch creation failed:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        setFormData({
            branch_name: '',
            address: '',
            phone: '',
            email: '',
            manager_id: '',
            opening_date: '',
            is_active: true
        })
        setBranchId(generateBranchId())
        toast.info("Form cleared")
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Add New Branch</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Create a new branch</p>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                    Branch ID: {branchId}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Branch Details</CardTitle>
                            <CardDescription>Basic branch information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="branch_name">Branch Name *</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="branch_name"
                                        className="pl-10"
                                        value={formData.branch_name}
                                        onChange={e => handleInputChange('branch_name', e.target.value)}
                                        placeholder="Enter branch name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="address"
                                        className="pl-10"
                                        value={formData.address}
                                        onChange={e => handleInputChange('address', e.target.value)}
                                        placeholder="Branch address"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="phone"
                                        className="pl-10"
                                        value={formData.phone}
                                        onChange={e => handleInputChange('phone', e.target.value)}
                                        placeholder="+94 XX XXX XXXX"
                                        maxLength={20}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Info</CardTitle>
                            <CardDescription>Contact & management</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-10"
                                        value={formData.email}
                                        onChange={e => handleInputChange('email', e.target.value)}
                                        placeholder="branch@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="manager_id">Manager</Label>
                                <Select 
                                    value={formData.manager_id?.toString()} 
                                    onValueChange={(value) => handleInputChange('manager_id', value)}
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
                                <Label htmlFor="opening_date">Opening Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="opening_date"
                                        type="date"
                                        className="pl-10"
                                        value={formData.opening_date}
                                        onChange={e => handleInputChange('opening_date', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Branch Status</Label>
                                    <div className="text-sm text-muted-foreground">
                                        Set branch as active or inactive
                                    </div>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                {formData.is_active ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-blue-800" />
                                        <span className="text-sm font-medium text-blue-800">Active</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-500">Inactive</span>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t">
                <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleClear}>
                    <X className="h-4 w-4 mr-2" /> Clear
                </Button>
                <Button type="button" className="w-full sm:w-auto gap-2" onClick={handleSubmit} disabled={loading}>
                    <Save className="h-4 w-4" /> 
                    {loading ? 'Saving...' : 'Save Branch'}
                </Button>
            </div>
        </div>
    )
}