import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { User, Mail, Phone, Lock, Building, CreditCard, Calendar, MapPin } from 'lucide-react'

export default function AddCustomer() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        company_name: '',
        email: '',
        phone: '',
        address: '',
        customer_type: '',
        registration_date: '',
        credit_limit: ''
    })

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
            toast.error('Please fill required fields')
            return
        }

        try {
            const res = await fetch('YOUR_API_URL/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ADMIN_TOKEN'
                },
                body: JSON.stringify(formData)
            })

            const data = await res.json()

            if (res.ok) {
                toast.success('Customer created successfully')
                setFormData({
                    first_name: '',
                    last_name: '',
                    company_name: '',
                    email: '',
                    phone: '',
                    address: '',
                    customer_type: '',
                    registration_date: '',
                    credit_limit: ''
                })
            } else {
                toast.error(data.message || 'Failed to create customer')
            }
        } catch (error) {
            toast.error('Server error')
        }
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Add Customer</h1>
                    <p className="text-muted-foreground">Create new customer account</p>
                </div>
                <Badge variant="secondary">Customer</Badge>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                            <CardDescription>Customer personal details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InputField label="First Name *" icon={User}
                                        value={formData.first_name}
                                        onChange={v => handleChange('first_name', v)}
                            />
                            <InputField label="Last Name *" icon={User}
                                        value={formData.last_name}
                                        onChange={v => handleChange('last_name', v)}
                            />
                            <InputField label="Email *" icon={Mail}
                                        value={formData.email}
                                        onChange={v => handleChange('email', v)}
                            />
                        </CardContent>
                    </Card>

                    {/* Other Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Details</CardTitle>
                            <CardDescription>Optional information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <InputField label="Company Name" icon={Building}
                                        value={formData.company_name}
                                        onChange={v => handleChange('company_name', v)}
                            />
                            <InputField label="Phone" icon={Phone}
                                        value={formData.phone}
                                        onChange={v => handleChange('phone', v)}
                            />
                            <InputField label="Address" icon={MapPin}
                                        value={formData.address}
                                        onChange={v => handleChange('address', v)}
                            />
                            <InputField label="Customer Type"
                                        value={formData.customer_type}
                                        onChange={v => handleChange('customer_type', v)}
                            />
                            <InputField label="Registration Date" type="date" icon={Calendar}
                                        value={formData.registration_date}
                                        onChange={v => handleChange('registration_date', v)}
                            />
                            <InputField label="Credit Limit" type="number" icon={CreditCard}
                                        value={formData.credit_limit}
                                        onChange={v => handleChange('credit_limit', v)}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end mt-6">
                    <Button type="submit">Save Customer</Button>
                </div>
            </form>
        </div>
    )
}

/* Reusable input */
function InputField({ label, value, onChange, type = 'text', icon: Icon }) {
    return (
        <div>
            <Label>{label}</Label>
            <div className="relative">
                {Icon && <Icon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />}
                <Input
                    type={type}
                    className={Icon ? 'pl-10' : ''}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                />
            </div>
        </div>
    )
}
