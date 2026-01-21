import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, X, Building2, Mail, Phone, Globe, User, Calendar } from 'lucide-react'

export default function AddBrand() {
    const [formData, setFormData] = useState({
        brand_name: '',
        contact_person: '',
        phone: '',
        email: '',
        website: '',
        created_date: ''
    })

    const [brandId, setBrandId] = useState(generateBrandId())

    // Generate brand ID
    function generateBrandId() {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substr(2, 4).toUpperCase()
        return `BRAND-${timestamp}-${random}`
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Basic validation
        if (!formData.brand_name) {
            toast.error("Please enter brand name")
            return
        }

        // Email validation
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            toast.error("Please enter a valid email address")
            return
        }

        try {
            // API call would go here
            const response = await fetch('YOUR_API_URL/brands', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_TOKEN'
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                toast.success("Brand added successfully!")

                // Reset
                setFormData({
                    brand_name: '',
                    contact_person: '',
                    phone: '',
                    email: '',
                    website: '',
                    created_date: ''
                })
                setBrandId(generateBrandId())
            } else {
                const error = await response.json()
                toast.error(error.message || "Failed to add brand")
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error("An error occurred while adding brand")
        }
    }

    const handleClear = () => {
        setFormData({
            brand_name: '',
            contact_person: '',
            phone: '',
            email: '',
            website: '',
            created_date: ''
        })
        setBrandId(generateBrandId())
        toast.info("Form cleared")
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Add New Brand</h1>
                    <p className="text-muted-foreground">Create a new brand in your system</p>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                    Brand ID: {brandId}
                </Badge>
            </div>

            <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Brand Details */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Brand Information</CardTitle>
                                <CardDescription>Enter brand basic details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="brand_name">Brand Name *</Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="brand_name"
                                            value={formData.brand_name}
                                            onChange={(e) => handleInputChange('brand_name', e.target.value)}
                                            placeholder="Enter brand name"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contact_person">Contact Person</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="contact_person"
                                            value={formData.contact_person}
                                            onChange={(e) => handleInputChange('contact_person', e.target.value)}
                                            placeholder="Enter contact person name"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="+94 XX XXX XXXX"
                                            className="pl-10"
                                            maxLength={20}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Contact Details */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                                <CardDescription>Email and website details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="brand@example.com"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="website">Website</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="website"
                                            value={formData.website}
                                            onChange={(e) => handleInputChange('website', e.target.value)}
                                            placeholder="https://www.example.com"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="created_date">Created Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="created_date"
                                            type="date"
                                            value={formData.created_date}
                                            onChange={(e) => handleInputChange('created_date', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Brand Preview Card */}
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-900">Brand Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                    <span className="font-semibold">{formData.brand_name || 'Brand Name'}</span>
                                </div>
                                {formData.contact_person && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-blue-600" />
                                        <span>{formData.contact_person}</span>
                                    </div>
                                )}
                                {formData.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-blue-600" />
                                        <span>{formData.phone}</span>
                                    </div>
                                )}
                                {formData.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-blue-600" />
                                        <span>{formData.email}</span>
                                    </div>
                                )}
                                {formData.website && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="h-4 w-4 text-blue-600" />
                                        <span className="text-blue-600 underline">{formData.website}</span>
                                    </div>
                                )}
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
                    <Button type="button" onClick={handleSubmit} className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Brand
                    </Button>
                </div>
            </div>
        </div>
    )
}