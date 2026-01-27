import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Save, X } from 'lucide-react'

export default function AddSupplier() {
    const [formData, setFormData] = useState({
        supplier_name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        tax_id: '',
        payment_terms: '',
        created_date: ''
    })

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!formData.supplier_name) {
            toast.error("Supplier name is required")
            return
        }

        console.log('Supplier Data:', formData)
        toast.success("Supplier added successfully!")

        // Reset form
        setFormData({
            supplier_name: '',
            contact_person: '',
            phone: '',
            email: '',
            address: '',
            tax_id: '',
            payment_terms: '',
            created_date: ''
        })
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Add New Supplier</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Enter supplier details</p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Supplier Information</CardTitle>
                        <CardDescription>Fill in supplier details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="supplier_name">Supplier Name *</Label>
                            <Input
                                id="supplier_name"
                                value={formData.supplier_name}
                                onChange={(e) => handleInputChange('supplier_name', e.target.value)}
                                placeholder="Enter supplier name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contact_person">Contact Person</Label>
                            <Input
                                id="contact_person"
                                value={formData.contact_person}
                                onChange={(e) => handleInputChange('contact_person', e.target.value)}
                                placeholder="Enter contact person"
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

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                value={formData.address}
                                onChange={(e) => handleInputChange('address', e.target.value)}
                                placeholder="Enter address"
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tax_id">Tax ID</Label>
                            <Input
                                id="tax_id"
                                value={formData.tax_id}
                                onChange={(e) => handleInputChange('tax_id', e.target.value)}
                                placeholder="Enter tax ID"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="payment_terms">Payment Terms</Label>
                            <Input
                                id="payment_terms"
                                value={formData.payment_terms}
                                onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                                placeholder="Enter payment terms"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="created_date">Created Date</Label>
                            <Input
                                id="created_date"
                                type="date"
                                value={formData.created_date}
                                onChange={(e) => handleInputChange('created_date', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => {
                        setFormData({
                            supplier_name: '',
                            contact_person: '',
                            phone: '',
                            email: '',
                            address: '',
                            tax_id: '',
                            payment_terms: '',
                            created_date: ''
                        })
                        toast.info("Form cleared")
                    }}>
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                    <Button type="submit" className="gap-2">
                        <Save className="h-4 w-4" />
                        Save Supplier
                    </Button>
                </div>
            </form>
        </div>
    )
}
