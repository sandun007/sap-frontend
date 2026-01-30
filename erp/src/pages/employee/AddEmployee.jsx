import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { User, Save, X, Upload } from 'lucide-react'

export default function AddEmployee() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        employee_id: '',
        position: '',
        department: '',
        join_date: new Date().toISOString().split('T')[0],
        is_active: true,
        address: '',
        emergency_contact: '',
        profile_picture: null,
    })

    const [employeeId, setEmployeeId] = useState(generateEmployeeId())
    const [profileImage, setProfileImage] = useState(null)
    const fileInputRef = useRef(null)

    // Generate employee ID (same pattern as product)
    function generateEmployeeId() {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substr(2, 4).toUpperCase()
        return `EMP-${timestamp}-${random}`
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleImageUpload = (event) => {
        const file = event.target.files[0]
        if (file) {
            setProfileImage(URL.createObjectURL(file))
            toast.success("Profile picture uploaded successfully")
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        // Basic validation
        if (!formData.full_name || !formData.email || !formData.position) {
            toast.error("Please fill in all required fields")
            return
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email address")
            return
        }

        const employeeData = {
            employee_id: employeeId,
            ...formData
        }

        console.log('Employee Data:', employeeData)
        toast.success("Employee added successfully!")

        // Reset form
        setFormData({
            full_name: '',
            email: '',
            phone: '',
            employee_id: '',
            position: '',
            department: '',
            join_date: new Date().toISOString().split('T')[0],
            is_active: true,
            address: '',
            emergency_contact: '',
            profile_picture: null,
        })
        setEmployeeId(generateEmployeeId())
        setProfileImage(null)
    }

    const handleClear = () => {
        setFormData({
            full_name: '',
            email: '',
            phone: '',
            employee_id: '',
            position: '',
            department: '',
            join_date: new Date().toISOString().split('T')[0],
            is_active: true,
            address: '',
            emergency_contact: '',
            profile_picture: null,
        })
        setEmployeeId(generateEmployeeId())
        setProfileImage(null)
        toast.info("Form cleared")
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Add New Employee</h1>
                    <p className="text-muted-foreground">Create a new employee record</p>
                </div>
                <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 py-0.5 sm:px-3 sm:py-1 self-start sm:self-auto">
                    Employee ID: {employeeId}
                </Badge>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Basic employee details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name">Full Name *</Label>
                                    <Input
                                        id="full_name"
                                        value={formData.full_name}
                                        onChange={(e) => handleInputChange('full_name', e.target.value)}
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="Enter email address"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="Enter full address"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Employment Details</CardTitle>
                                <CardDescription>Role and joining information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="position">Position*</Label>
                                        <Input
                                            id="position"
                                            value={formData.position}
                                            onChange={(e) => handleInputChange('position', e.target.value)}
                                            placeholder="Enter Employee Position"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="department">Department</Label>
                                        <Select
                                            value={formData.department}
                                            onValueChange={(value) => handleInputChange('department', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select department" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="development">Development</SelectItem>
                                                <SelectItem value="design">Design</SelectItem>
                                                <SelectItem value="marketing">Marketing</SelectItem>
                                                <SelectItem value="finance">Finance</SelectItem>
                                                <SelectItem value="hr">Human Resources</SelectItem>
                                                <SelectItem value="operations">Operations</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="join_date">Join Date</Label>
                                        <Input
                                            id="join_date"
                                            type="date"
                                            value={formData.join_date}
                                            onChange={(e) => handleInputChange('join_date', e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-8">
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Employee Status
                                        </Label>
                                        <Switch
                                            id="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Picture & Emergency Contact */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Picture</CardTitle>
                                <CardDescription>Upload employee photo</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    {profileImage ? (
                                        <div className="space-y-2">
                                            <img
                                                src={profileImage}
                                                alt="Profile"
                                                className="mx-auto h-32 w-32 object-cover rounded-full"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setProfileImage(null)}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <User className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="space-y-2">
                                                <p className="text-sm text-gray-600">Upload profile picture</p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    Upload
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Emergency Contact</CardTitle>
                                <CardDescription>Optional emergency information</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_contact">Emergency Contact Name</Label>
                                    <Input
                                        id="emergency_contact"
                                        value={formData.emergency_contact}
                                        onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                                        placeholder="Name of contact person"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency_phone">Emergency Phone</Label>
                                    <Input
                                        id="emergency_phone"
                                        value={formData.emergency_phone || ''}
                                        onChange={(e) => handleInputChange('emergency_phone', e.target.value)}
                                        placeholder="Phone Number"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={handleClear}
                    >
                        Clear
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto gap-2">
                        <Save className="h-4 w-4" />
                        Save Employee
                    </Button>
                </div>
            </form>
        </div>
    )
}