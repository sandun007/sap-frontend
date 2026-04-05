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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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
import axios from 'axios'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null })
  const [editDialog, setEditDialog] = useState({ open: false, product: null })
  const [importDialog, setImportDialog] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [branches, setBranches] = useState([])
  const fileInputRef = useRef(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory])

  useEffect(() => {
    fetchProducts()
    fetchMetadata()
  }, [])

  const fetchMetadata = async () => {
    try {
      const [brandRes, catRes, subRes, branchRes] = await Promise.all([
        axios.get('/brands'),
        axios.get('/categories'),
        axios.get('/subcategories'),
        axios.get('/branches')
      ])
      setBrands(brandRes.data.data || [])
      setCategories(catRes.data.data || [])
      setSubcategories(subRes.data.data || [])
      setBranches(branchRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch metadata:', error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/products')
      setProducts(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error("Failed to load products from database")
    } finally {
      setLoading(false)
    }
  }

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = (product.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.product_code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand?.brand_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || 
                           product.subcategory?.subcategory_name === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const renderPaginationItems = () => {
    let items = []
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            items.push(
                <PaginationItem key={i}>
                  <PaginationLink 
                    onClick={(e) => { e.preventDefault(); setCurrentPage(i); }} 
                    isActive={currentPage === i}
                    className="cursor-pointer"
                  >
                    {i}
                  </PaginationLink>
                </PaginationItem>
            )
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            items.push(
                <PaginationItem key={`ellipsis-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
            )
        }
    }
    return items
  }

  // Get unique categories for filtering
  const filterCategories = ['all', ...new Set(products.map(p => p.subcategory?.subcategory_name).filter(Boolean))]

  // Generate product ID
  function generateProductId() {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `PROD-${timestamp}-${random}`
  }

  // Delete product
  const handleDelete = async (productId) => {
    try {
      await axios.delete(`/products/${productId}`)
      setProducts(products.filter(product => product.product_id !== productId))
      setDeleteDialog({ open: false, product: null })
      toast.success("Product has been successfully deleted.")
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error("Failed to delete product")
    }
  }

  // Update product
  const handleUpdate = async () => {
    try {
      const response = await axios.put(`/products/${editForm.product_id}`, editForm)
      if (response.data.success) {
        // Handle Stock Update/Create
        if (editForm.branch_id && editForm.quantity !== undefined) {
          try {
            const currentStock = editDialog.product.stocks?.[0]
            if (currentStock) {
              // Update existing stock
              await axios.put(`/stocks/${currentStock.stock_id}`, {
                quantity: parseInt(editForm.quantity),
                branch_id: parseInt(editForm.branch_id)
              })
            } else {
              // Create new stock if none exists
              await axios.post('/stocks', {
                product_id: editForm.product_id,
                branch_id: parseInt(editForm.branch_id),
                brand_id: parseInt(editForm.brand_id),
                category_id: parseInt(editForm.category_id),
                subcategory_id: parseInt(editForm.subcategory_id),
                product_name: editForm.product_name,
                quantity: parseInt(editForm.quantity)
              })
            }
          } catch (stockError) {
            console.error('Failed to update stock:', stockError)
            toast.warning("Product updated, but stock update failed")
          }
        }

        toast.success("Product updated successfully!")
        setEditDialog({ open: false, product: null })
        setEditForm({})
        fetchProducts() // Refresh to get latest stock data
      }
    } catch (error) {
      console.error('Failed to update product:', error)
      toast.error("Failed to update product")
    }
  }

  // Open edit dialog
  const openEditDialog = (product) => {
    setEditDialog({ open: true, product })
    // Pre-populate form with product data including relationship IDs
    const currentStock = product.stocks?.[0]
    setEditForm({
      ...product,
      category_id: product.subcategory?.category_id,
      subcategory_id: product.subcategory_id,
      unit_price: product.price,
      branch_id: currentStock?.branch_id?.toString() || '',
      quantity: currentStock?.quantity?.toString() || '0'
    })
  }

  const exportToExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(filteredProducts.map(product => ({
        'Product Code': product.product_code,
        'Product Name': product.product_name,
        'Description': product.description,
        'Price': product.price,
        'Cost Price': product.cost_price,
        'Barcode': product.barcode,
        'Category': product.subcategory?.category?.category_name || 'N/A',
        'Subcategory': product.subcategory?.subcategory_name || 'N/A',
        'Brand': product.brand?.brand_name || 'N/A',
        'Stock Quantity': product.stocks?.[0]?.quantity || 0,
        'Status': product.status || (product.is_active ? 'active' : 'inactive'),
        'Created Date': product.created_at ? new Date(product.created_at).toLocaleDateString() : 'N/A'
      })))
      
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Products')
      XLSX.writeFile(workbook, `products_export_${new Date().toISOString().split('T')[0]}.xlsx`)
      
      toast.success(`Exported ${filteredProducts.length} products to Excel.`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error("Failed to export products to Excel.")
    }
  }

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
      const tableColumn = ['Product Code', 'Product Name', 'Brand', 'Category', 'Price', 'Stock']
      const tableRows = filteredProducts.map(product => [
        product.product_code || 'N/A',
        product.product_name,
        product.brand?.brand_name || 'N/A',
        product.subcategory?.category?.category_name || 'N/A',
        `Rs.${product.price}`,
        (product.stocks?.[0]?.quantity || 0).toString()
      ])

      // Add table
      autoTable(doc, {
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
      console.error('PDF export failed:', error)
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
    navigate('/products/add')
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Product List</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your product inventory</p>
        </div>
        <Button onClick={handleAddProduct} className="gap-2 w-full sm:w-auto">
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
                placeholder="Search products by name, brand, code, or barcode..."
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
                {filterCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportToExcel} className="gap-2 flex-1 sm:flex-none">
                <Download className="h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={exportToPDF} className="gap-2 flex-1 sm:flex-none">
                <FileText className="h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => setImportDialog(true)} className="gap-2 flex-1 sm:flex-none">
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
                <TableHead>Product Code</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                       <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                       Loading products...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedProducts.map((product) => (
                <TableRow key={product.product_id}>
                  <TableCell className="font-mono text-sm">{product.product_code}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium">{product.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.barcode || 'No Barcode'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.subcategory?.category?.category_name || 'N/A'}</TableCell>
                  <TableCell>{product.brand?.brand_name || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="font-medium">Rs.{product.price}</div>
                    {product.cost_price && (
                      <div className="text-sm text-muted-foreground">
                        Cost: Rs.{product.cost_price}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={(product.stocks?.[0]?.quantity || 0) > 10 ? "default" : 
                              (product.stocks?.[0]?.quantity || 0) > 0 ? "secondary" : "destructive"}
                    >
                      {product.stocks?.[0]?.quantity || 0} in stock
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.status === 'active' || product.is_active ? "default" : "secondary"}>
                      {product.status || (product.is_active ? "active" : "inactive")}
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
                        <DropdownMenuItem onClick={() => setDeleteDialog({ open: true, product })}
                          className="text-destructive focus:text-destructive"
                        >
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.max(1, p - 1)) }} 
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {renderPaginationItems()}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => { e.preventDefault(); setCurrentPage(p => Math.min(totalPages, p + 1)) }} 
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
        </div>
      )}

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
            <Button variant="destructive" onClick={() => handleDelete(deleteDialog.product?.product_id)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editDialog.open} onOpenChange={() => setEditDialog({ open: false, product: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product information for {editDialog.product?.product_name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="edit-name">Product Name</Label>
                      <Input
                          id="edit-name"
                          value={editForm.product_name || ''}
                          onChange={(e) => setEditForm({ ...editForm, product_name: e.target.value })}
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="edit-product-code">Product Code</Label>
                      <Input
                          id="edit-product-code"
                          value={editForm.product_code || ''}
                          onChange={(e) => setEditForm({ ...editForm, product_code: e.target.value })}
                      />
                  </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                      id="edit-description"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="edit-price">Unit Price (Rs.)</Label>
                      <Input
                          id="edit-price"
                          type="number"
                          value={editForm.price || ''}
                          onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) })}
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="edit-cost">Cost Price (Rs.)</Label>
                      <Input
                          id="edit-cost"
                          type="number"
                          value={editForm.cost_price || ''}
                          onChange={(e) => setEditForm({ ...editForm, cost_price: parseFloat(e.target.value) })}
                      />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="edit-barcode">Barcode</Label>
                      <Input
                          id="edit-barcode"
                          value={editForm.barcode || ''}
                          onChange={(e) => setEditForm({ ...editForm, barcode: e.target.value })}
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="edit-weight">Weight (kg)</Label>
                      <Input
                          id="edit-weight"
                          value={editForm.weight || ''}
                          onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="edit-dimensions">Dimensions</Label>
                      <Input
                          id="edit-dimensions"
                          value={editForm.dimensions || ''}
                          onChange={(e) => setEditForm({ ...editForm, dimensions: e.target.value })}
                      />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                      <Label>Category</Label>
                      <Select 
                        value={editForm.category_id?.toString() || ''} 
                        onValueChange={(val) => setEditForm({...editForm, category_id: val})}
                      >
                          <SelectTrigger>
                              <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent>
                              {categories.map(c => (
                                  <SelectItem key={c.category_id} value={c.category_id.toString()}>
                                      {c.category_name}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label>Subcategory</Label>
                      <Select 
                        value={editForm.subcategory_id?.toString() || ''} 
                        onValueChange={(val) => setEditForm({...editForm, subcategory_id: val})}
                      >
                          <SelectTrigger>
                              <SelectValue placeholder="Select Subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                              {subcategories
                                .filter(s => String(s.category_id) === String(editForm.category_id))
                                .map(s => (
                                  <SelectItem key={s.subcategory_id} value={s.subcategory_id.toString()}>
                                      {s.subcategory_name}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label>Brand</Label>
                      <Select 
                        value={editForm.brand_id?.toString() || ''} 
                        onValueChange={(val) => setEditForm({...editForm, brand_id: val})}
                      >
                          <SelectTrigger>
                              <SelectValue placeholder="Select Brand" />
                          </SelectTrigger>
                          <SelectContent>
                              {brands.map(b => (
                                  <SelectItem key={b.brand_id} value={b.brand_id.toString()}>
                                      {b.brand_name}
                                  </SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-branch">Stock Branch</Label>
                    <Select 
                      value={editForm.branch_id || ''} 
                      onValueChange={(v) => setEditForm({...editForm, branch_id: v})}
                    >
                        <SelectTrigger id="edit-branch">
                            <SelectValue placeholder="Select Branch" />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map(b => (
                                <SelectItem key={b.branch_id} value={b.branch_id.toString()}>
                                    {b.branch_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-quantity">Stock Quantity</Label>
                    <Input
                        id="edit-quantity"
                        type="number"
                        value={editForm.quantity || '0'}
                        onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    />
                  </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="edit-status">Active Status</Label>
                    <Switch
                        id="edit-status"
                        checked={editForm.status === 'active' || editForm.is_active}
                        onCheckedChange={(checked) => setEditForm({ 
                          ...editForm, 
                          status: checked ? 'active' : 'inactive',
                          is_active: checked 
                        })}
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