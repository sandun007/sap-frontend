import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, X, Building2, Mail, Phone, MapPin, User, Calendar, CheckCircle } from 'lucide-react'

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
                <Badge variant="secondary">Branch</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left */}
                <Card>
                    <CardHeader>
                        <CardTitle>Branch Details</CardTitle>
                        <CardDescription>Basic branch information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Branch Name *</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-10"
                                    value={formData.branch_name}
                                    onChange={e => handleInputChange('branch_name', e.target.value)}
                                    placeholder="Enter branch name"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Address</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-10"
                                    value={formData.address}
                                    onChange={e => handleInputChange('address', e.target.value)}
                                    placeholder="Branch address"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-10"
                                    value={formData.phone}
                                    onChange={e => handleInputChange('phone', e.target.value)}
                                    placeholder="+94 XX XXX XXXX"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right */}
                <Card>
                    <CardHeader>
                        <CardTitle>Additional Info</CardTitle>
                        <CardDescription>Contact & management</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-10"
                                    value={formData.email}
                                    onChange={e => handleInputChange('email', e.target.value)}
                                    placeholder="branch@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Manager ID</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    className="pl-10"
                                    value={formData.manager_id}
                                    onChange={e => handleInputChange('manager_id', e.target.value)}
                                    placeholder="Employee ID"
                                />
                            </div>
                        </div>

                        <div>
                            <Label>Opening Date</Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    type="date"
                                    className="pl-10"
                                    value={formData.opening_date}
                                    onChange={e => handleInputChange('opening_date', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <Label>Active Branch</Label>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t">
                <Button variant="outline" className="w-full sm:w-auto" onClick={handleClear}>
                    <X className="h-4 w-4 mr-2" /> Clear
                </Button>
                <Button className="w-full sm:w-auto gap-2" onClick={handleSubmit}>
                    <Save className="h-4 w-4 mr-2" /> Save Branch
                </Button>
            </div>
        </div>
    )
}
