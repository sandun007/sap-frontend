import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Save, X, Building2, Mail, Phone, MapPin, User, Calendar, CheckCircle, XCircle } from 'lucide-react'

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

        try {
            const response = await fetch('YOUR_API_URL/branches', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_ADMIN_TOKEN'
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
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
                toast.error(data.message || "Failed to create branch")
            }
        } catch (error) {
            toast.error("Server error")
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
                                <Label htmlFor="manager_id">Manager ID</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="manager_id"
                                        className="pl-10"
                                        value={formData.manager_id}
                                        onChange={e => handleInputChange('manager_id', e.target.value)}
                                        placeholder="Employee ID"
                                    />
                                </div>
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

                    {/* Branch Preview Card */}
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                        <CardHeader>
                            <CardTitle className="text-blue-800">Branch Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-blue-700" />
                                <span className="font-semibold">{formData.branch_name || 'Branch Name'}</span>
                            </div>
                            {formData.address && (
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-blue-800" />
                                    <span>{formData.address}</span>
                                </div>
                            )}
                            {formData.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-black" />
                                    <span>{formData.phone}</span>
                                </div>
                            )}
                            {formData.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-green-600" />
                                    <span>{formData.email}</span>
                                </div>
                            )}
                            {formData.manager_id && (
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-green-600" />
                                    <span>Manager: {formData.manager_id}</span>
                                </div>
                            )}
                            {formData.opening_date && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                    <span>Opening: {formData.opening_date}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-sm pt-2">
                                {formData.is_active ? (
                                    <>
                                        <CheckCircle className="h-4 w-4 text-blue-800" />
                                        <span className="text-blue-800 font-medium">Active</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 text-gray-500" />
                                        <span className="text-gray-600 font-medium">Inactive</span>
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
                <Button type="button" className="w-full sm:w-auto gap-2" onClick={handleSubmit}>
                    <Save className="h-4 w-4 mr-2" /> Save Branch
                </Button>
            </div>
        </div>
    )
}