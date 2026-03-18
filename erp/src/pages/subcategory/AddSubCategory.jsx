import React, { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, X, FolderOpen, Calendar } from 'lucide-react';
import axios from 'axios';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns'

export default function AddSubCategory() {
    const generateSubCategoryCode = () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `SUB-${timestamp}-${random}`;
    };

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        subcategory_code: generateSubCategoryCode(),
        subcategory_name: '',
        description: '',
        category_id: '',
        created_date: format(new Date(), 'yyyy-MM-dd'),
    });

    useEffect(() => {
        axios
            .get('/categories')
            .then((res) => {
                const data = res.data.data || res.data || [];
                setCategories(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.subcategory_name.trim()) {
            toast.error('Please enter subcategory name');
            return;
        }
        if (!formData.category_id) {
            toast.error('Please select parent category');
            return;
        }

        try {
            await axios.post('/subcategories', formData);
            toast.success('Subcategory created successfully!');

            const newCode = generateSubCategoryCode();
            setFormData({
                subcategory_code: newCode,
                subcategory_name: '',
                description: '',
                category_id: '',
                created_date: format(new Date(), 'yyyy-MM-dd'),
            });
        } catch (error) {
            console.error(error);
            const msg =
                error.response?.data?.message ||
                error.message ||
                'Failed to add subcategory';
            toast.error(msg);
        }
    };

    const handleClear = () => {
        const newCode = generateSubCategoryCode();
        setFormData({
            subcategory_code: newCode,
            subcategory_name: '',
            description: '',
            category_id: '',
            created_date: format(new Date(), 'yyyy-MM-dd'),
        });
        toast.info('Form cleared');
    };

    return (
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Add New Subcategory</h1>
                    <p className="text-muted-foreground">
                        Create a new subcategory under a parent category
                    </p>
                </div>
                <Badge variant="secondary" className="text-base px-4 py-1.5">
                    Subcategory Code: {formData.subcategory_code}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Identification */}
                <Card>
                    <CardHeader>
                        <CardTitle>Identification</CardTitle>
                        <CardDescription>Core identifiers of the subcategory</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="category_id">Parent Category *</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) => handleInputChange('category_id', value)}
                            >
                                <SelectTrigger className="pl-10">
                                    <SelectValue placeholder="Select parent category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.category_id} value={cat.category_id}>
                                            {cat.category_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="subcategory_name">Subcategory Name *</Label>
                            <div className="relative">
                                <FolderOpen className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="subcategory_name"
                                    value={formData.subcategory_name}
                                    onChange={(e) => handleInputChange('subcategory_name', e.target.value)}
                                    placeholder="e.g. Smartphones, T-Shirts, Fiction..."
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Subcategory Code</Label>
                            <Input
                                value={formData.subcategory_code}
                                readOnly
                                className="bg-muted cursor-not-allowed"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* RIGHT CARD - Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Details</CardTitle>
                        <CardDescription>Additional information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Brief description about this subcategory (optional)"
                                rows={6}
                            />
                        </div>
                    </CardContent>
                </Card>
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
                    Save Subcategory
                </Button>
            </div>
        </div>
    );
}