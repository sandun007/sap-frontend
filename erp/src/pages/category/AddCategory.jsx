import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();
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

            setTimeout(() => {
                navigate('/category/list')
            }, 1500)

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
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Add New Category</h1>
                    <p className="text-muted-foreground">Create a new category for your products/items</p>
                </div>
                <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 py-0.5 sm:px-3 sm:py-1 self-start sm:self-auto">
                    Category Code: {formData.category_code}
                </Badge>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Category Information</CardTitle>
                        <CardDescription>Basic details of the category</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="category_name">Category Name</Label>
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
                                placeholder="Brief description about this category"
                                rows={4}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                            <div className="space-y-2">
                                <Label>Status</Label>
                                <div className="flex items-center justify-between p-2.5 border rounded-md h-[40px]">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2
                                            className={`h-4 w-4 ${formData.is_active ? 'text-green-600' : 'text-gray-400'}`}
                                        />
                                        <span className="text-sm font-medium">Active</span>
                                    </div>
                                    <Switch
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                                    />
                                </div>
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
                        Save Category
                    </Button>
                </div>
            </form>
        </div>
    );
}