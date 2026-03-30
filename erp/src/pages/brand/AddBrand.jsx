import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, X, Building2, Mail, Phone, Globe, User } from 'lucide-react'
import axios from 'axios'

export default function AddBrand() {
    // function format date as YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const [formData, setFormData] = useState({
        brand_code:generateBrandId(),
        brand_name: '',
        contact_person: '',
        phone: '',
        email: '',
        website: '',
        created_date: formatDate(new Date())
    })

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
            toast.error("Brand name is required")
            return
        }

        try {
            const response = await axios.post('/brands', formData)
            const newBrand = response.data?.data || response.data
            const realId = newBrand?.brand_id || '—'

            toast.success(`Brand created successfully! ID: ${realId}`)

            // Reset
            setFormData({
                brand_code: generateBrandId(),
                brand_name: '',
                contact_person: '',
                phone: '',
                email: '',
                website: '',
                created_date: formatDate(new Date())
            })
        } catch (err) {
            toast.error("Failed to create brands. Check console for details.")
            console.error("Brand creation failed:", err)
        }
    }

    const handleClear = () => {
        setFormData({
            brand_code: generateBrandId(),
            brand_name: '',
            contact_person: '',
            phone: '',
            email: '',
            website: '',
            created_date: formatDate(new Date())
        })

        toast.info("Form cleared")
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Add New Brand</h1>
                    <p className="text-muted-foreground">Create a new brand record</p>
                </div>
                <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 py-0.5 sm:px-3 sm:py-1 self-start sm:self-auto">
                    Brand Code: {formData.brand_code}
                </Badge>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Brand Information</CardTitle>
                        <CardDescription>Basic details and primary contact</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="brand_name">Brand Name</Label>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <Label htmlFor="phone">Phone Number</Label>
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
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
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-8 pt-6 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={handleClear}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear Form
                    </Button>
                    <Button type="submit" className="w-full sm:w-auto gap-2">
                        <Save className="h-4 w-4" />
                        Save Brand
                    </Button>
                </div>
            </form>
        </div>
    )
}