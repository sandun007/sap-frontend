import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, X } from 'lucide-react'
import axios from 'axios'
import { format } from 'date-fns'

export default function AddSupplier() {
    const [formData, setFormData] = useState({
        supplier_id: generateSupplierCode(),
        supplier_name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        tax_id: '',
        payment_terms: '',
        created_date: format(new Date(), 'yyyy-MM-dd'),
    })

    // Generate unique supplier code
    function generateSupplierCode() {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substr(2, 4).toUpperCase()
        return `SUP-${timestamp}-${random}`
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.supplier_name) {
            toast.error("Supplier name is required")
            return
        }

        try {
            const response = await axios.post('/suppliers', formData)
            const newSupplier = response.data?.data || response.data
            const realId = newSupplier?.supplier_id || '—'

            toast.success(`Supplier created successfully! ID: ${realId}`)

            setFormData({
                supplier_id: generateSupplierCode(),
                supplier_name: '',
                contact_person: '',
                phone: '',
                email: '',
                address: '',
                tax_id: '',
                payment_terms: '',
                created_date: format(new Date(), 'yyyy-MM-dd'),
            })
        } catch (err) {
            toast.error("Failed to create supplier. Check console for details.")
            console.error("Supplier creation failed:", err)
        }
    }

    const handleClear = () => {
        setFormData({
            supplier_id: generateSupplierCode(),
            supplier_name: '',
            contact_person: '',
            phone: '',
            email: '',
            address: '',
            tax_id: '',
            payment_terms: '',
            created_date: format(new Date(), 'yyyy-MM-dd'),
        })
        toast.info("Form cleared")
    }

    return (
        <div className="container px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Add New Supplier</h1>
                    <p className="text-muted-foreground">Create a new supplier record</p>
                </div>
                <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 py-0.5 sm:px-3 sm:py-1 self-start sm:self-auto">
                    Supplier ID: {formData.supplier_id}
                </Badge>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/*  Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Supplier Information</CardTitle>
                                <CardDescription>Basic details and primary contact</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="supplier_name">Supplier Name *</Label>
                                    <Input
                                        id="supplier_name"
                                        value={formData.supplier_name}
                                        onChange={(e) => handleInputChange('supplier_name', e.target.value)}
                                        placeholder="Enter Supplier name"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contact_person">Contact Person</Label>
                                        <Input
                                            id="contact_person"
                                            value={formData.contact_person}
                                            onChange={(e) => handleInputChange('contact_person', e.target.value)}
                                            placeholder="Enter Contact Person"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="Enter Phone Number"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Enter Email Address"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Full Address</Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        placeholder="Enter Full Address"
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Business */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Business Details</CardTitle>
                                <CardDescription>Tax, payment & identification</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tax_id">Tax ID</Label>
                                    <Input
                                        id="tax_id"
                                        value={formData.tax_id}
                                        onChange={(e) => handleInputChange('tax_id', e.target.value)}
                                        placeholder="Enter Tax ID"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="payment_terms">Payment Terms</Label>
                                    <Input
                                        id="payment_terms"
                                        value={formData.payment_terms}
                                        onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                                        placeholder="Cash on Delivery"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

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
                        Save Supplier
                    </Button>
                </div>
            </form>
        </div>
    )
}