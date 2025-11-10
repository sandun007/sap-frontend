import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  FileText,
  Package
} from 'lucide-react'

// Temporary data
const initialProducts = [
  {
    id: 1,
    product_id: "PROD-890123-AB4X",
    product_name: "iPhone 15 Pro",
    description: "Latest Apple iPhone with A17 Pro chip",
    unit_price: 1299.99,
    cost_price: 899.99,
    barcode: "123456789012",
    weight: 0.187,
    dimensions: "146.7x70.6x8.25mm",
    is_active: true,
    category: "Electronics",
    brand: "Apple",
    supplier: "Supplier A",
    stock_quantity: 45,
    created_date: "2024-01-15"
  },
  {
    id: 2,
    product_id: "PROD-890124-CD5Y",
    product_name: "Samsung Galaxy S24",
    description: "Samsung flagship smartphone",
    unit_price: 899.99,
    cost_price: 650.00,
    barcode: "123456789013",
    weight: 0.167,
    dimensions: "147.0x70.6x7.6mm",
    is_active: true,
    category: "Electronics",
    brand: "Samsung",
    supplier: "Supplier B",
    stock_quantity: 32,
    created_date: "2024-01-10"
  },
  {
    id: 3,
    product_id: "PROD-890125-EF6Z",
    product_name: "Nike Air Max 270",
    description: "Comfortable running shoes",
    unit_price: 150.00,
    cost_price: 85.00,
    barcode: "123456789014",
    weight: 0.350,
    dimensions: "30x20x15cm",
    is_active: true,
    category: "Footwear",
    brand: "Nike",
    supplier: "Supplier C",
    stock_quantity: 12,
    created_date: "2024-01-08"
  }
]

export default function ListProduct() {
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null })
  const [editDialog, setEditDialog] = useState({ open: false, product: null })
  const [importDialog, setImportDialog] = useState(false)
  const [editForm, setEditForm] = useState({})
  const fileInputRef = useRef(null)

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.product_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.barcode.includes(searchTerm)
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = ['all', ...new Set(products.map(p => p.category))]

  // Generate product ID
  function generateProductId() {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `PROD-${timestamp}-${random}`
  }

  // Delete product
  const handleDelete = (productId) => {
    setProducts(products.filter(product => product.id !== productId))
    setDeleteDialog({ open: false, product: null })
    toast.success("Product has been successfully deleted.")
  }

  // Update product
  const handleUpdate = () => {
    setProducts(products.map(product => 
      product.id === editForm.id ? { ...product, ...editForm } : product
    ))
    setEditDialog({ open: false, product: null })
    setEditForm({})
    toast.success("Product information has been updated successfully.")
  }

  // Open edit dialog
  const openEditDialog = (product) => {
    setEditDialog({ open: true, product })
    setEditForm(product)
  }

  // Export to Excel
  const exportToExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredProducts.map(product => ({
        'Product ID': product.product_id,
        'Product Name': product.product_name,
        'Description': product.description,
        'Unit Price': product.unit_price,
        'Cost Price': product.cost_price,
        'Barcode': product.barcode,
        'Category': product.category,
        'Brand': product.brand,
        'Supplier': product.supplier,
        'Stock Quantity': product.stock_quantity,
        'Status': product.is_active ? 'Active' : 'Inactive',
        'Created Date': product.created_date
      })))
      
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')
      XLSX.writeFile(workbook, `products_export_${new Date().toISOString().split('T')[0]}.xlsx`)
      
      toast.success(`Exported ${filteredProducts.length} products to Excel.`)
    } catch (error) {
      toast.error("Failed to export products to Excel.")
    }
  }

  // Export to PDF
  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(20)
      doc.text('Product List', 14, 22)
      doc.setFontSize(10)
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30)
      doc.text(`Total Products: ${filteredProducts.length}`, 14, 37)

      // Table data
      const tableColumn = ['Product', 'Product ID', 'Category', 'Price', 'Stock', 'Status']
      const tableRows = filteredProducts.map(product => [
        product.product_name,
        product.product_id,
        product.category,
        `Rs.${product.unit_price}`,
        product.stock_quantity.toString(),
        product.is_active ? 'Active' : 'Inactive'
      ])

      // Add table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      })

      // Save PDF
      doc.save(`products_report_${new Date().toISOString().split('T')[0]}.pdf`)
      
      toast.success(`Generated PDF report with ${filteredProducts.length} products.`)
    } catch (error) {
      toast.error("Failed to generate PDF report.")
    }
  }

  // Handle Excel import
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Validate and process imported data
        const newProducts = jsonData.map((item, index) => ({
          id: products.length + index + 1,
          product_id: generateProductId(),
          product_name: item['Product Name'] || `Imported Product ${index + 1}`,
          description: item['Description'] || '',
          unit_price: parseFloat(item['Unit Price']) || 0,
          cost_price: parseFloat(item['Cost Price']) || 0,
          barcode: item['Barcode'] || `BC-${Date.now()}-${index}`,
          weight: parseFloat(item['Weight']) || 0,
          dimensions: item['Dimensions'] || '',
          is_active: item['Status'] === 'Active',
          category: item['Category'] || 'General',
          brand: item['Brand'] || 'Unknown',
          supplier: item['Supplier'] || 'Unknown',
          stock_quantity: parseInt(item['Stock Quantity']) || 0,
          created_date: new Date().toISOString().split('T')[0]
        }))

        setProducts(prev => [...prev, ...newProducts])
        setImportDialog(false)
        
        toast.success(`Successfully imported ${newProducts.length} products.`)
      } catch (error) {
        toast.error("Failed to process the Excel file. Please check the format.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Download template
  const downloadTemplate = () => {
    const templateData = [{
      'Product Name': 'Sample Product',
      'Description': 'Product description',
      'Unit Price': 100.00,
      'Cost Price': 60.00,
      'Barcode': '123456789',
      'Weight': 0.5,
      'Dimensions': '10x10x10cm',
      'Category': 'Electronics',
      'Brand': 'Sample Brand',
      'Supplier': 'Sample Supplier',
      'Stock Quantity': 50,
      'Status': 'Active'
    }]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
    XLSX.writeFile(workbook, 'product_import_template.xlsx')
    
    toast.success("Product import template downloaded successfully.")
  }

  // Add new product
  const handleAddProduct = () => {
    toast.info("Redirecting to add product form...")
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Product List</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <Button onClick={handleAddProduct} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, Product ID, or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToExcel} className="gap-2">
                <Download className="h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={exportToPDF} className="gap-2">
                <FileText className="h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => setImportDialog(true)} className="gap-2">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            {filteredProducts.length} products found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{product.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.barcode}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{product.product_id}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>
                    <div className="font-medium">Rs.{product.unit_price}</div>
                    <div className="text-sm text-muted-foreground">
                      Cost: Rs.{product.cost_price}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={product.stock_quantity > 10 ? "default" : 
                              product.stock_quantity > 0 ? "secondary" : "destructive"}
                    >
                      {product.stock_quantity} in stock
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.is_active ? "default" : "secondary"}>
                      {product.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, product })}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={() => setDeleteDialog({ open: false, product: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deleteDialog.product?.product_name}"? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, product: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteDialog.product?.id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, product: null })}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information for {editDialog.product?.product_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.product_name || ''}
                  onChange={(e) => setEditForm({...editForm, product_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product-id">Product ID</Label>
                <Input
                  id="edit-product-id"
                  value={editForm.product_id || ''}
                  onChange={(e) => setEditForm({...editForm, product_id: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Unit Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editForm.unit_price || ''}
                  onChange={(e) => setEditForm({...editForm, unit_price: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cost">Cost Price</Label>
                <Input
                  id="edit-cost"
                  type="number"
                  value={editForm.cost_price || ''}
                  onChange={(e) => setEditForm({...editForm, cost_price: parseFloat(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Quantity</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editForm.stock_quantity || ''}
                  onChange={(e) => setEditForm({...editForm, stock_quantity: parseInt(e.target.value)})}
                />
              </div>
              <div className="flex items-center justify-between space-y-0 pt-6">
                <Label htmlFor="edit-status">Active Status</Label>
                <Switch
                  id="edit-status"
                  checked={editForm.is_active || false}
                  onCheckedChange={(checked) => setEditForm({...editForm, is_active: checked})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, product: null })}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialog} onOpenChange={setImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Products</DialogTitle>
            <DialogDescription>
              Upload an Excel file to import products. Download the template first to ensure proper formatting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Click to upload Excel file</p>
              <p className="text-xs text-gray-500 mt-1">.xlsx, .xls files supported</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <Button variant="link" onClick={downloadTemplate} className="p-0 h-auto">
                Download template file
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}