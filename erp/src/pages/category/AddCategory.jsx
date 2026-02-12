import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, X, FolderOpen, Calendar, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function AddCategory() {
    const generateCategoryId = () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `CAT-${timestamp}-${random}`;
    };

    const [categoryId] = useState(generateCategoryId());
    const [formData, setFormData] = useState({
        category_name: '',
        description: '',
        created_date: '',
        is_active: true,
    });

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.category_name.trim()) {
            toast.error('Please enter category name');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const payload = {
                category_name: formData.category_name,
                category_code: categoryId,
                description: formData.description || null,
                created_date: formData.created_date || null,
                is_active: formData.is_active ? 1 : 0,
            };

            const response = await axios.post(
                'http://127.0.0.1:8000/api/categories',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            toast.success(response.data.message || 'Category added successfully!');

            // Reset form
            setFormData({
                category_name: '',
                description: '',
                created_date: '',
                is_active: true,
            });

        } catch (error) {
            console.error(error);
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to add category';
            toast.error(msg);
        }
    };

    const handleClear = () => {
        setFormData({
            category_name: '',
            description: '',
            created_date: '',
            is_active: true,
        });
        toast.info('Form cleared');
    };

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Add New Category</h1>
                    <p className="text-muted-foreground">
                        Create a new category for your products/items
                    </p>
                </div>
                <Badge variant="secondary" className="text-base px-4 py-1.5">
                    Category ID: {categoryId}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Information</CardTitle>
                            <CardDescription>Basic details of the category</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="category_name">Category Name *</Label>
                                <div className="relative">
                                    <FolderOpen className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="category_name"
                                        value={formData.category_name}
                                        onChange={(e) => handleInputChange('category_name', e.target.value)}
                                        placeholder="e.g. Electronics, Clothing, Books..."
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
                                    placeholder="Brief description about this category (optional)"
                                    rows={4}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Additional Details</CardTitle>
                            <CardDescription>Date and status settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="created_date">Created Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
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

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2
                                        className={`h-5 w-5 ${
                                            formData.is_active ? 'text-green-600' : 'text-gray-400'
                                        }`}
                                    />
                                    <div>
                                        <p className="font-medium">Active Status</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formData.is_active
                                                ? 'This category is visible and usable'
                                                : 'This category is hidden/inactive'}
                                        </p>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={handleClear}
                >
                    <X className="h-4 w-4 mr-2" />
                    Clear Form
                </Button>
                <Button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full sm:w-auto gap-2"
                >
                    <Save className="h-4 w-4" />
                    Save Category
                </Button>
            </div>
        </div>
    );
}