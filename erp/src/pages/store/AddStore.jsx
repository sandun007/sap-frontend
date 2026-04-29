import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, X, Store } from 'lucide-react'
import axios from 'axios'

export default function AddStore() {

    function generateStoreCode() {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substr(2,4).toUpperCase()
        return `STORE-${timestamp}-${random}`
    }

    const [formData, setFormData] = useState({
        store_code: generateStoreCode(),
        store_name: ''
    })

    const handleInputChange = (field,value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async(e) => {
        e.preventDefault()

        if(!formData.store_name){
            toast.error("Store name is required")
            return
        }

        try{
            const response = await axios.post('/stores', formData)

            const newStore = response.data?.data || response.data
            const realId = newStore?.store_id || '—'

            toast.success(`Store created successfully! ID: ${realId}`)

            setFormData({
                store_code: generateStoreCode(),
                store_name: ''
            })

        } catch(error){
            console.error(error)
            toast.error("Failed to create store")
        }
    }

    const handleClear = () => {
        setFormData({
            store_code: generateStoreCode(),
            store_name: ''
        })

        toast.info("Form cleared")
    }

    return (
        <div className="container mx-auto px-4 py-6">

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">
                        Add New Store
                    </h1>

                    <p className="text-muted-foreground">
                        Create a new store record
                    </p>
                </div>

                <Badge variant="secondary">
                    Store Code: {formData.store_code}
                </Badge>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Store Information</CardTitle>
                        <CardDescription>
                            Enter store details
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="store_code">
                                Store Code
                            </Label>

                            <Input
                                id="store_code"
                                value={formData.store_code}
                                readOnly
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="store_name">
                                Store Name
                            </Label>

                            <div className="relative">
                                <Store className="absolute left-3 top-3 h-4 w-4 text-gray-400"/>

                                <Input
                                    id="store_name"
                                    value={formData.store_name}
                                    onChange={(e)=>
                                        handleInputChange(
                                            'store_name',
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter store name"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 mt-8">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClear}
                    >
                        <X className="mr-2 h-4 w-4"/>
                        Clear
                    </Button>

                    <Button type="submit">
                        <Save className="mr-2 h-4 w-4"/>
                        Save Store
                    </Button>
                </div>

            </form>

        </div>
    )
}