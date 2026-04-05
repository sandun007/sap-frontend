import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
    User, 
    Mail, 
    Phone, 
    Building2, 
    MapPin, 
    CreditCard, 
    Calendar, 
    Save, 
    X, 
    Users,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react'
import axios from 'axios'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function AddCustomer() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        customer_code: '',
        first_name: '',
        last_name: '',
        company_name: '',
        email: '',
        phone: '',
        address: '',
        customer_type: '',
        registration_date: new Date().toISOString().split('T')[0],
        credit_limit: '',
        password: ''
    })
    const [customerCode, setCustomerCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    useEffect(() => {
        const newCode = generateCustomerCode()
        setCustomerCode(newCode)
        setFormData(prev => ({ ...prev, customer_code: newCode }))
    }, [])

    function generateCustomerCode() {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substr(2, 4).toUpperCase()
        return `CUST-${timestamp}-${random}`
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
            toast.error("Please fill in all required fields (First & Last Name, Email, Password)")
            return
        }

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email address")
            return
        }

        if (formData.password.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setLoading(true)
        try {
            const response = await axios.post('/customers', formData)

            if (response.data.success) {
                toast.success("Customer created successfully")
                setTimeout(() => {
                    navigate('/customer/list')
                }, 1500)
            } else {
                toast.error(response.data.message || "Failed to create customer")
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Server error"
            toast.error(errorMsg)
            console.error("Customer creation failed:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleClear = () => {
        const newCode = generateCustomerCode()
        setCustomerCode(newCode)
        setFormData({
            customer_code: newCode,
            first_name: '',
            last_name: '',
            company_name: '',
            email: '',
            phone: '',
            address: '',
            customer_type: '',
            registration_date: new Date().toISOString().split('T')[0],
            credit_limit: '',
            password: ''
        })
        toast.info("Form cleared")
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Add New Customer</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Register a new customer account</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-sm px-3 py-1">
                        Customer Code: {customerCode}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Personal Info & Credentials */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Primary customer contact details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="first_name">First Name *</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="first_name"
                                            className="pl-10"
                                            value={formData.first_name}
                                            onChange={e => handleInputChange('first_name', e.target.value)}
                                            placeholder=""
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="last_name">Last Name *</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="last_name"
                                            className="pl-10"
                                            value={formData.last_name}
                                            onChange={e => handleInputChange('last_name', e.target.value)}
                                            placeholder=""
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="email">Email Address *</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-10"
                                        value={formData.email}
                                        onChange={e => handleInputChange('email', e.target.value)}
                                        placeholder="customer@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="phone"
                                        className="pl-10"
                                        value={formData.phone}
                                        onChange={e => handleInputChange('phone', e.target.value)}
                                        placeholder="+94 XX XXX XXXX"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Account Credentials</CardTitle>
                            <CardDescription>Security settings for customer login</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="password">Login Password *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        className="pl-10 pr-10"
                                        value={formData.password}
                                        onChange={e => handleInputChange('password', e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Min. 6 characters. This will be the customer's initial login password.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Business Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Business Details</CardTitle>
                            <CardDescription>Customer classification & address</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="company_name">Company Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="company_name"
                                        className="pl-10"
                                        value={formData.company_name}
                                        onChange={e => handleInputChange('company_name', e.target.value)}
                                        placeholder="Company LLC"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="customer_type">Customer Type</Label>
                                    <Select 
                                        value={formData.customer_type} 
                                        onValueChange={(value) => handleInputChange('customer_type', value)}
                                    >
                                        <SelectTrigger id="customer_type" className="w-full">
                                            <div className="flex items-center">
                                                <Users className="mr-2 h-4 w-4 text-gray-400" />
                                                <SelectValue placeholder="Select type" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Retail">Retail</SelectItem>
                                            <SelectItem value="Wholesale">Wholesale</SelectItem>
                                            <SelectItem value="Distributor">Distributor</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="registration_date">Registration Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="registration_date"
                                            type="date"
                                            className="pl-10"
                                            value={formData.registration_date}
                                            onChange={e => handleInputChange('registration_date', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="address">Full Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="address"
                                        className="pl-10"
                                        value={formData.address}
                                        onChange={e => handleInputChange('address', e.target.value)}
                                        placeholder="Enter physical address"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Settings</CardTitle>
                            <CardDescription>Credit and billing limits</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <Label htmlFor="credit_limit">Credit Limit (LKR)</Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="credit_limit"
                                        type="number"
                                        className="pl-10"
                                        value={formData.credit_limit}
                                        onChange={e => handleInputChange('credit_limit', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
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
                    {loading ? 'Saving...' : 'Save Customer'}
                </Button>
            </div>
        </div>
    )
}
