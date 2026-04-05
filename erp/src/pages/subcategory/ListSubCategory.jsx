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
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Download,
} from 'lucide-react';
import {SelectContent, SelectItem, SelectTrigger, SelectValue} from "@radix-ui/react-select";
import {Label, Select} from "radix-ui";
import axios from 'axios';

export default function ListSubCategories() {
    const [subcategories, setSubcategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
    const [editDialog, setEditDialog] = useState({ open: false, subcategory: null });
    const [editForm, setEditForm] = useState({});
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const filteredSubcategories = subcategories.filter(sub => {
        const term = searchTerm.toLowerCase();
        return (
            (sub.subcategory_name?.toLowerCase()?.includes(term) ?? false) ||
            (sub.subcategory_code?.toLowerCase()?.includes(term) ?? false) ||
            (sub.description?.toLowerCase()?.includes(term) ?? false) ||
            (sub.category?.category_name?.toLowerCase()?.includes(term) ?? false)
        );
    });

    useEffect(() => {
        fetchSubcategories();
        fetchCategories();
    }, []);

    const fetchSubcategories = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/subcategories');
            const data = res.data.data || res.data || [];
            setSubcategories(Array.isArray(data) ? data : []);
            toast.success('Subcategories loaded');
        } catch (err) {
            console.error(err);
            toast.error('Failed to load subcategories');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/categories');
            const data = res.data.data || res.data || [];
            setCategories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.id) return;
        try {
            await axios.delete(`/subcategories/${deleteDialog.id}`);
            toast.success('Subcategory deleted');
            fetchSubcategories();
        } catch (err) {
            toast.error('Failed to delete subcategory' , err);
        } finally {
            setDeleteDialog({ open: false, id: null });
        }
    };

    const handleUpdate = async () => {
        if (!editForm.subcategory_id) return;
        try {
            await axios.put(`/subcategories/${editForm.subcategory_id}`, editForm);
            toast.success('Subcategory updated');
            fetchSubcategories();
            setEditDialog({ open: false, subcategory: null });
        } catch (err) {
            toast.error('Failed to update subcategory' , err);
        }
    };

    const exportToExcel = () => {
        try {
            const worksheet = XLSX.utils.json_to_sheet(
                filteredSubcategories.map(sub => ({
                    'Subcategory Name': sub.subcategory_name || '',
                    'Code': sub.subcategory_code || '',
                    'Parent Category': sub.category?.category_name || '',
                    'Description': sub.description || '',
                    'Created Date': sub.created_date || ''
                }))
            );
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Subcategories');
            XLSX.writeFile(workbook, `subcategories_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success(`Exported ${filteredSubcategories.length} items`);
        } catch (err) {
            toast.error('Export failed', err);
        }
    };

    const exportToPDF = () => {
        try {
            if (!filteredSubcategories.length) {
                toast.error('No data to export');
                return;
            }
            const doc = new jsPDF();
            doc.setFontSize(20);
            doc.text('Subcategories List', 14, 22);
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
            doc.text(`Total: ${filteredSubcategories.length}`, 14, 37);

            autoTable(doc, {
                head: [['Name', 'Code', 'Parent', 'Description', 'Created']],
                body: filteredSubcategories.map(sub => [
                    sub.subcategory_name || '-',
                    sub.subcategory_code || '-',
                    sub.category?.category_name || '-',
                    sub.description || '-',
                    sub.created_date || '-'
                ]),
                startY: 45,
                styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
                headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] },
                margin: { top: 10 }
            });

            doc.save(`subcategories_report_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('PDF exported');
        } catch (err) {
            toast.error('PDF export failed', err);
        }
    };

    return (
        <div className="container py-6 mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Subcategories</h1>
                    <p className="text-muted-foreground">Manage all subcategories</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={exportToExcel}>
                        <Download className="mr-2 h-4 w-4" />
                        Excel
                    </Button>
                    <Button variant="outline" onClick={exportToPDF}>
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                    </Button>
                    <Button asChild>
                        <a href="/subcategory/add">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Subcategory
                        </a>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle>Subcategories List</CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search subcategories..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Parent Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSubcategories.map(sub => (
                                <TableRow key={sub.subcategory_id}>
                                    <TableCell>
                                        {sub.subcategory_code || '-'}
                                    </TableCell>
                                    <TableCell className="font-medium">{sub.subcategory_name}</TableCell>
                                    <TableCell>{sub.category?.category_name || '-'}</TableCell>
                                    <TableCell className="max-w-xs truncate">
                                        {sub.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {sub.created_date
                                            ? new Date(sub.created_date).toLocaleDateString()
                                            : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setEditForm({ ...sub });
                                                        setEditDialog({ open: true, subcategory: sub });
                                                    }}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() => setDeleteDialog({ open: true, id: sub.subcategory_id })}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredSubcategories.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No subcategories found</p>
                            {searchTerm && <p className="text-sm mt-1">Try adjusting your search</p>}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, id: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Subcategory</DialogTitle>
                        <DialogDescription>
                            Are you sure? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, id: null })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, subcategory: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Subcategory</DialogTitle>
                        <DialogDescription>Update subcategory details</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Subcategory Code</Label>
                            <Input value={editForm.subcategory_code || ''} readOnly className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subcategory_name">Name *</Label>
                            <Input
                                id="subcategory_name"
                                value={editForm.subcategory_name || ''}
                                onChange={e => setEditForm({ ...editForm, subcategory_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category_id">Parent Category</Label>
                            <Select
                                value={editForm.category_id?.toString() || ''}
                                onValueChange={val => setEditForm({ ...editForm, category_id: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select parent" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.category_id} value={cat.category_id.toString()}>
                                            {cat.category_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={editForm.description || ''}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialog({ open: false, subcategory: null })}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}