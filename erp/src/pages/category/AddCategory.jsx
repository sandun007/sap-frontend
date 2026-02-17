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
        category_code:generateCategoryId(),
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
             await axios.post('/categories', formData)


            toast.success(`Category created successfully!`)


            // Reset form
            setFormData({
                category_code:generateCategoryId(),
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
            category_code:generateCategoryId(),
            category_name: '',
            description: '',
            created_date: '',
            is_active: true,
        });
        toast.info('Form cleared');
    };

    return (
        <div className="container px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Add New Category</h1>
                    <p className="text-muted-foreground">
                        Create a new category for your products/items
                    </p>
                </div>
                <Badge variant="secondary" className="text-base px-4 py-1.5">
                    Category ID: {formData.category_code}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
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

                <div className="space-y-6 lg:sticky lg:top-6 h-fit">
                    <Card className="border-purple-200 bg-linear-to-br from-purple-50/70 to-pink-50/40 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-blue-800">Live Preview</CardTitle>
                            <CardDescription>How this category will appear</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-purple-100 p-2 mt-0.5">
                                    <FolderOpen className="h-5 w-5 text-blue-800" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-lg">
                                        {formData.category_name.trim() || 'Category Name'}
                                    </p>
                                    {formData.description.trim() && (
                                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                            {formData.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-purple-100 flex flex-wrap gap-3 text-sm">
                                {formData.created_date && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-purple-600" />
                                        <span>
                      Created:{' '}
                                            {new Date(formData.created_date).toLocaleDateString()}
                    </span>
                                    </div>
                                )}

                                <Badge
                                    variant={formData.is_active ? 'default' : 'secondary'}
                                    className={
                                        formData.is_active
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : ''
                                    }
                                >
                                    {formData.is_active ? 'Active' : 'Inactive'}
                                </Badge>

                                <Badge variant="outline">ID: {categoryId}</Badge>
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