import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
    Save, X, User, Mail, Phone, MapPin,
    CreditCard, Briefcase, DollarSign, Calendar,
    Building2, Hash, ShieldCheck, Upload
} from 'lucide-react'
import axios from "axios";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AddEmployee() {
    const [formData, setFormData] = useState({
        employee_code:generateEmployeeId(),
        first_name: '',
        last_name: '',
        email: '',
        phone_num1: '',
        phone_num2: '',
        nic_num: '',
        hire_date: '',
        position: '',
        salary: '',
        address: '',
        date_of_birth: '',
        department_id: '',
        is_active: '1',
        password: '',
    })

    const [nicFront, setNicFront] = useState(null)
    const [nicBack, setNicBack] = useState(null)
    const [nicFrontPreview, setNicFrontPreview] = useState(null)
    const [nicBackPreview, setNicBackPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [departments, setDepartments] = useState([])

    const [employeeId] = useState(generateEmployeeId())

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get('/departments')
                setDepartments(response.data.data || [])
            } catch (error) {
                console.error('Failed to fetch departments:', error)
                toast.error('Failed to load departments')
            }
        }
        fetchDepartments()
    }, [])

    function generateEmployeeId() {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substr(2, 4).toUpperCase()
        return `EMP-${timestamp}-${random}`
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleFileChange = (side, file) => {
        if (!file) return
        if (side === 'front') {
            setNicFront(file)
            setNicFrontPreview(URL.createObjectURL(file))
        } else {
            setNicBack(file)
            setNicBackPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.first_name || !formData.last_name) {
            toast.error('First name and last name are required')
            return
        }
        if (!formData.email) {
            toast.error('Email is required')
            return
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error('Please enter a valid email address')
            return
        }
        if (!formData.password || formData.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        const formDataToSend = new FormData()
        Object.keys(formData).forEach(key => {
            formDataToSend.append(key, formData[key])
        })
        if (nicFront) formDataToSend.append('nic_front', nicFront)
        if (nicBack) formDataToSend.append('nic_back', nicBack)

        setLoading(true)

        try {
            const response = await axios.post('/employees', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
            const newEmployee = response.data?.data || response.data
            const realId = newEmployee?.employee_id || '—'

            toast.success(`Employee created successfully! ID: ${realId}`)
            setFormData({
               employee_code:generateEmployeeId(),
                first_name: '',
                last_name: '',
                email: '',
                phone_num1: '',
                phone_num2: '',
                nic_num: '',
                hire_date: '',
                position: '',
                salary: '',
                address: '',
                date_of_birth: '',
                department_id: '',
                is_active: '1',
                password: '',
        })
        } catch (err) {
            toast.error("Failed to create employee. Check console for details.")
            console.error("Employee creation failed:", err)
        }

    }


    const handleClear = () => {
        setFormData({
            employee_code:generateEmployeeId(),
            first_name: '',
            last_name: '',
            email: '',
            phone_num1: '',
            phone_num2: '',
            nic_num: '',
            hire_date: '',
            position: '',
            salary: '',
            address: '',
            date_of_birth: '',
            department_id: '',
            is_active: '1',
            password: '',
        })
        setNicFront(null)
        setNicBack(null)
        setNicFrontPreview(null)
        setNicBackPreview(null)
        toast.info('Form cleared')
    }

    const fullName = [formData.first_name, formData.last_name].filter(Boolean).join(' ')

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Add New Employee</h1>
                    <p className="text-muted-foreground">Register a new employee in the system</p>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                    {employeeId}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* LEFT COLUMN */}
                <div className="space-y-6">

                    {/* Personal Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Basic employee identity details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="first_name"
                                            value={formData.first_name}
                                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                                            placeholder="First name"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="last_name"
                                            value={formData.last_name}
                                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                                            placeholder="Last name"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_of_birth">Date of Birth</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="date_of_birth"
                                        type="date"
                                        value={formData.date_of_birth}
                                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="Residential address"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* NIC Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>NIC Details</CardTitle>
                            <CardDescription>National Identity Card information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nic_num">NIC Number</Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="nic_num"
                                        value={formData.nic_num}
                                        onChange={(e) => handleInputChange('nic_num', e.target.value)}
                                        placeholder="e.g. 123456789V"
                                        className="pl-10"
                                        maxLength={20}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* NIC Front */}
                                <div className="space-y-2">
                                    <Label>NIC Front</Label>
                                    <label
                                        htmlFor="nic_front"
                                        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors"
                                        style={{ minHeight: '120px' }}
                                    >
                                        {nicFrontPreview ? (
                                            <img src={nicFrontPreview} alt="NIC Front" className="h-20 object-cover rounded" />
                                        ) : (
                                            <>
                                                <Upload className="h-8 w-8 text-gray-400 mb-1" />
                                                <span className="text-xs text-gray-500">Upload front</span>
                                            </>
                                        )}
                                        <input
                                            id="nic_front"
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            className="hidden"
                                            onChange={(e) => handleFileChange('front', e.target.files[0])}
                                        />
                                    </label>
                                </div>

                                {/* NIC Back */}
                                <div className="space-y-2">
                                    <Label>NIC Back</Label>
                                    <label
                                        htmlFor="nic_back"
                                        className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors"
                                        style={{ minHeight: '120px' }}
                                    >
                                        {nicBackPreview ? (
                                            <img src={nicBackPreview} alt="NIC Back" className="h-20 object-cover rounded" />
                                        ) : (
                                            <>
                                                <Upload className="h-8 w-8 text-gray-400 mb-1" />
                                                <span className="text-xs text-gray-500">Upload back</span>
                                            </>
                                        )}
                                        <input
                                            id="nic_back"
                                            type="file"
                                            accept="image/jpeg,image/png,image/jpg"
                                            className="hidden"
                                            onChange={(e) => handleFileChange('back', e.target.files[0])}
                                        />
                                    </label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">

                    {/* Contact Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>Email and phone details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="employee@company.com"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone_num1">Phone 1</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="phone_num1"
                                            value={formData.phone_num1}
                                            onChange={(e) => handleInputChange('phone_num1', e.target.value)}
                                            placeholder="+94 XX XXX XXXX"
                                            className="pl-10"
                                            maxLength={20}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone_num2">Phone 2</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="phone_num2"
                                            value={formData.phone_num2}
                                            onChange={(e) => handleInputChange('phone_num2', e.target.value)}
                                            placeholder="+94 XX XXX XXXX"
                                            className="pl-10"
                                            maxLength={20}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Employment Details</CardTitle>
                            <CardDescription>Position, department and salary</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position</Label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="position"
                                            value={formData.position}
                                            onChange={(e) => handleInputChange('position', e.target.value)}
                                            placeholder="e.g. Developer"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department_id">Department </Label>
                                    <Select 
                                        value={formData.department_id?.toString()} 
                                        onValueChange={(value) => handleInputChange('department_id', value)}
                                    >
                                        <SelectTrigger id="department_id" className="w-full">
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.length > 0 ? (
                                                departments.map((dept) => (
                                                    <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                                                        {dept.department_name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="none" disabled>No departments found</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hire_date">Hire Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="hire_date"
                                            type="date"
                                            value={formData.hire_date}
                                            onChange={(e) => handleInputChange('hire_date', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salary">Salary</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="salary"
                                            type="number"
                                            value={formData.salary}
                                            onChange={(e) => handleInputChange('salary', e.target.value)}
                                            placeholder="0.00"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="is_active">Status</Label>
                                <select
                                    id="is_active"
                                    value={formData.is_active}
                                    onChange={(e) => handleInputChange('is_active', e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password </Label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder="Min. 6 characters"
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <Button type="button" variant="outline" onClick={handleClear}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                </Button>
                <Button type="button" onClick={handleSubmit} disabled={loading} className="gap-2">
                    <Save className="h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Employee'}
                </Button>
            </div>
        </div>
    )
}