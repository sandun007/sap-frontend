import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Save, X, FolderOpen, Calendar, CheckCircle2 } from 'lucide-react'

export default function AddCategory() {
    const [formData, setFormData] = useState({
        category_name: '',
        description: '',
        created_date: '',
        is_active: true
    })

    const [categoryId, setCategoryId] = useState(generateCategoryId())

    // Generate category ID
    function generateCategoryId() {
        const timestamp = Date.now().toString().slice(-6)
        const random = Math.random().toString(36).substr(2, 4).toUpperCase()
        return `CAT-${timestamp}-${random}`
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
        if (!formData.category_name) {
            toast.error("Please enter category name")
            return
        }

        try {
            // API call would go here
            const response = await fetch('YOUR_API_URL/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer YOUR_TOKEN'
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                toast.success("Category added successfully!")

                // Reset
                setFormData({
                    category_name: '',
                    description: '',
                    created_date: '',
                    is_active: true
                })
                setCategoryId(generateCategoryId())
            } else {
                const error = await response.json()
                toast.error(error.message || "Failed to add category")
            }
        } catch (error) {
            console.error('Error:', error)
            toast.error("An error occurred while adding category")
        }
    }

    const handleClear = () => {
        setFormData({
            category_name: '',
            description: '',
            created_date: '',
            is_active: true
        })
        setCategoryId(generateCategoryId())
        toast.info("Form cleared")
    }

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Add New Category</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Create a new category in your system</p>
                </div>
                <Badge variant="secondary" className="text-sm px-3 py-1">
                    Category ID: {categoryId}
                </Badge>
            </div>

            <div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Category Details */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Information</CardTitle>
                                <CardDescription>Enter category basic details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category_name">Category Name *</Label>
                                    <div className="relative">
                                        <FolderOpen className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="category_name"
                                            value={formData.category_name}
                                            onChange={(e) => handleInputChange('category_name', e.target.value)}
                                            placeholder="Enter category name"
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Enter category description"
                                        rows={4}
                                    />
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
                    </div>

                    {/* Right Column - Status & Preview */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Category Status</CardTitle>
                                <CardDescription>Set category active status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className={`h-5 w-5 ${formData.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                                        <div>
                                            <Label htmlFor="is_active" className="cursor-pointer font-medium">
                                                Active Status
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {formData.is_active ? 'Category is active' : 'Category is inactive'}
                                            </p>
                                        </div>
                                    </div>
                                    <Switch
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Category Preview Card */}
                        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                            <CardHeader>
                                <CardTitle className="text-purple-900">Category Preview</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <FolderOpen className="h-5 w-5 text-purple-600 mt-0.5" />
                                    <div>
                                        <p className="font-semibold text-lg">{formData.category_name || 'Category Name'}</p>
                                        {formData.description && (
                                            <p className="text-sm text-gray-600 mt-1">{formData.description}</p>
                                        )}
                                    </div>
                                </div>

                                {formData.created_date && (
                                    <div className="flex items-center gap-2 text-sm pt-2 border-t">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                        <span>Created: {new Date(formData.created_date).toLocaleDateString()}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 pt-2">
                                    <Badge variant={formData.is_active ? "default" : "secondary"}>
                                        {formData.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Info Card */}
                        <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="pt-6">
                                <div className="flex gap-3">
                                    <div className="text-blue-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="text-sm text-blue-900">
                                        <p className="font-medium mb-1">Category Tips:</p>
                                        <ul className="space-y-1 text-blue-800">
                                            <li>• Use clear, descriptive names</li>
                                            <li>• Add detailed descriptions</li>
                                            <li>• Activate when ready to use</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t">
                    <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleClear}>
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                    <Button type="button" onClick={handleSubmit} className="w-full sm:w-auto gap-2">
                        <Save className="h-4 w-4" />
                        Save Category
                    </Button>
                </div>
            </div>
        </div>
    )
}