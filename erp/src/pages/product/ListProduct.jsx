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
import { Textarea } from '@/components/ui/textarea'
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
  Package,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import api from '@/api/api'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ListProduct Component
export default function ListProduct() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null })
  const [editDialog, setEditDialog] = useState({ open: false, product: null })
  const [importDialog, setImportDialog] = useState(false)
  const [importProgress, setImportProgress] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [importReview, setImportReview] = useState(null) // { rows: [], currentIndex: 0, processing: false }
  const [editForm, setEditForm] = useState({})
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
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
      const [brandRes, catRes, subRes, branchRes, supRes] = await Promise.all([
        api.get('/brands'),
        api.get('/categories'),
        api.get('/subcategories'),
        api.get('/branches'),
        api.get('/suppliers')
      ])
      setBrands(brandRes.data.data || [])
      setCategories(catRes.data.data || [])
      setSubcategories(subRes.data.data || [])
      setBranches(branchRes.data.data || [])
      setSuppliers(supRes.data.data || [])
    } catch (error) {
      console.error('Failed to fetch metadata:', error)
    }
  }

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await api.get('/products')
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
      await api.delete(`/products/${productId}`)
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
      const response = await api.put(`/products/${editForm.product_id}`, editForm)
      if (response.data.success) {
        // Handle Stock Update/Create
        if (editForm.branch_id && editForm.quantity !== undefined) {
          try {
            const currentStock = editDialog.product.stocks?.[0]
            if (currentStock) {
              // Update existing stock
              await api.put(`/stocks/${currentStock.stock_id}`, {
                quantity: parseInt(editForm.quantity),
                branch_id: parseInt(editForm.branch_id)
              })
            } else {
              // Create new stock if none exists
              await api.post('/stocks', {
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
      const worksheet = XLSX.utils.json_to_sheet(filteredProducts.map(product => {
        const stock = product.stocks?.[0]
        const branchName = stock?.branch?.branch_name ||
          branches.find(b => b.branch_id === stock?.branch_id)?.branch_name ||
          'N/A'
        const supplierName = product.supplier?.supplier_name ||
          suppliers.find(s => s.supplier_id === product.supplier_id)?.supplier_name ||
          'N/A'

        return {
          'Product Code': product.product_code,
          'Product Name': product.product_name,
          'Description': product.description || '',
          'Unit Price': product.price,
          'Cost Price': product.cost_price || 0,
          'Barcode': product.barcode || '',
          'Weight': product.weight || 0,
          'Dimensions': product.dimensions || '',
          'Category': product.subcategory?.category?.category_name || '',
          'Subcategory': product.subcategory?.subcategory_name || '',
          'Brand': product.brand?.brand_name || '',
          'Supplier': supplierName !== 'N/A' ? supplierName : '',
          'Branch': branchName !== 'N/A' ? branchName : '',
          'Initial Stock': stock?.quantity || 0,
          'Status': product.status || (product.is_active ? 'active' : 'inactive'),
          'Created Date': product.created_at ? new Date(product.created_at).toLocaleDateString() : ''
        }
      }))

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
      const tableColumn = ['Product Code', 'Product Name', 'Brand', 'Category', 'Branch', 'Stock']
      const tableRows = filteredProducts.map(product => {
        const stock = product.stocks?.[0]
        const branchName = stock?.branch?.branch_name ||
          branches.find(b => b.branch_id === stock?.branch_id)?.branch_name ||
          'N/A'

        return [
          product.product_code || 'N/A',
          product.product_name,
          product.brand?.brand_name || 'N/A',
          product.subcategory?.category?.category_name || 'N/A',
          branchName,
          (stock?.quantity || 0).toString()
        ]
      })

      // Add table
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        styles: { fontSize: 7 },
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

  // Interactive Import Process
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    event.target.value = ''

    // Field mapping for user-friendly display
    const fieldToColumn = {
      product_name: 'Product Name',
      price: 'Unit Price',
      cost_price: 'Cost Price',
      barcode: 'Barcode',
      weight: 'Weight',
      dimensions: 'Dimensions',
      brand_name: 'Brand',
      subcategory_name: 'Subcategory',
      supplier_name: 'Supplier',
      status: 'Status',
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (jsonData.length === 0) {
          toast.error("The Excel file is empty.")
          return
        }

        // Prepare lookup maps
        const brandMap = {}
        brands.forEach(b => { brandMap[b.brand_name.toLowerCase()] = b.brand_id })
        const subcategoryMap = {}
        subcategories.forEach(s => { subcategoryMap[s.subcategory_name.toLowerCase()] = s.subcategory_id })
        const supplierMap = {}
        suppliers.forEach(s => { supplierMap[(s.supplier_name || '').toLowerCase()] = s.supplier_id })
        const branchLookup = {}
        branches.forEach(b => { branchLookup[(b.branch_name || '').toLowerCase()] = b.branch_id })

        const cleanNum = (val) => {
          if (typeof val === 'number') return val
          if (!val) return 0
          const cleaned = String(val).replace(/[^0-9.-]+/g, "")
          return parseFloat(cleaned) || 0
        }

        const allRows = jsonData.map((item, index) => {
          const rowNum = index + 2
          const productName = (item['Product Name'] || '').trim()
          const barcode = (item['Barcode'] || '').toString()

          const existing = products.find(p =>
            (p.product_name || '').toLowerCase() === productName.toLowerCase() ||
            (barcode && (p.barcode || '') === barcode)
          )

          const brandId = brandMap[(item['Brand'] || '').toLowerCase()] || null
          const subcategoryId = subcategoryMap[(item['Subcategory'] || '').toLowerCase()] || null
          const supplierId = supplierMap[(item['Supplier'] || '').toLowerCase()] || null

          const payload = {
            product_name: productName,
            product_code: existing?.product_code || generateProductId(),
            description: item['Description'] || '',
            price: Math.max(0.01, cleanNum(item['Unit Price'] || item['Price'])),
            unit: 'pcs',
            status: (item['Status'] || 'active').toLowerCase() === 'inactive' ? 'inactive' : 'active',
            brand_id: brandId || '',
            subcategory_id: subcategoryId || '',
            barcode: barcode || '',
            cost_price: cleanNum(item['Cost Price'] || item['Cost']),
            weight: (item['Weight'] || '').toString(),
            dimensions: item['Dimensions'] || '',
            supplier_id: supplierId || '',
          }

          const stockData = {
            branch_id: branchLookup[(item['Branch'] || '').toLowerCase()] || branches[0]?.branch_id,
            quantity: parseFloat(item['Initial Stock'] || item['Stock Quantity'] || item['Current Stock'] || 0)
          }

          const columnErrors = []
          if (!productName) columnErrors.push({ column: 'Product Name', reason: 'Missing name' })
          if (!payload.price) columnErrors.push({ column: 'Unit Price', reason: 'Missing or zero price' })

          // Only error on missing classification if the cell isn't empty (ignore "N/A" or empty)
          const brandVal = (item['Brand'] || '').trim()
          if (brandVal && brandVal !== 'N/A' && !brandId) columnErrors.push({ column: 'Brand', reason: `"${brandVal}" not found.` })

          const subcatVal = (item['Subcategory'] || '').trim()
          if (subcatVal && subcatVal !== 'N/A' && !subcategoryId) columnErrors.push({ column: 'Subcategory', reason: `"${subcatVal}" not found.` })

          const supplierVal = (item['Supplier'] || '').trim()
          if (supplierVal && supplierVal !== 'N/A' && !supplierId) columnErrors.push({ column: 'Supplier', reason: `"${supplierVal}" not found.` })

          const changes = []
          if (existing) {
            const checkDiff = (label, key, newVal, oldVal) => {
              if (newVal != oldVal) {
                changes.push({
                  label,
                  key,
                  newVal,
                  oldVal: oldVal ?? 'N/A',
                  confirmed: false
                })
              }
            }

            checkDiff('Product Name', 'product_name', payload.product_name, existing.product_name)
            checkDiff('Unit Price', 'price', payload.price, existing.price)
            checkDiff('Cost Price', 'cost_price', payload.cost_price, existing.cost_price)
            checkDiff('Status', 'status', payload.status, existing.status)
            checkDiff('Weight', 'weight', payload.weight, existing.weight)
            checkDiff('Dimensions', 'dimensions', payload.dimensions, existing.dimensions)

            // Stock/Branch updates
            const currentStock = existing.stocks?.[0]
            checkDiff('Stock quantity', 'quantity', stockData.quantity, currentStock?.quantity || 0)

            const currentBranch = branches.find(b => b.branch_id === currentStock?.branch_id)
            const importedBranchName = (item['Branch'] || '').trim()
            if (importedBranchName && currentBranch?.branch_name?.toLowerCase() !== importedBranchName.toLowerCase()) {
              const newBranch = branches.find(b => b.branch_name.toLowerCase() === importedBranchName.toLowerCase())
              if (newBranch) {
                changes.push({
                  label: 'Branch',
                  key: 'branch_id',
                  newVal: newBranch.branch_id,
                  newValLabel: newBranch.branch_name,
                  oldVal: currentBranch?.branch_name || 'N/A',
                  confirmed: false
                })
              }
            }
          }

          return { rowNum, productName, payload, stockData, existing, columnErrors, changes }
        })

        const toReview = allRows.filter(row => row.existing || row.columnErrors.length > 0)
        const toAuto = allRows.filter(row => !row.existing && row.columnErrors.length === 0)

        setImportDialog(false)

        let successCount = 0
        let errors = []

        if (toAuto.length > 0) {
          setImportProgress({ current: 0, total: toAuto.length, errors: [] })
          for (let i = 0; i < toAuto.length; i++) {
            const row = toAuto[i]
            try {
              console.log(`Importing Row ${row.rowNum} payload:`, row.payload)
              const res = await api.post('/products', row.payload)

              // Handle initial stock in secondary call
              if (row.stockData.quantity > 0 && row.stockData.branch_id && res.data.data) {
                const subcat = subcategories.find(s => s.subcategory_id === row.payload.subcategory_id)
                try {
                  await api.post('/stocks', {
                    product_id: res.data.data.product_id,
                    branch_id: row.stockData.branch_id,
                    brand_id: row.payload.brand_id,
                    category_id: subcat?.category_id,
                    subcategory_id: row.payload.subcategory_id,
                    quantity: row.stockData.quantity,
                    product_name: row.productName
                  })
                } catch (sErr) { console.error('Initial stock failed', sErr) }
              }

              successCount++
            } catch (err) {
              console.error(`Error importing Row ${row.rowNum}:`, err.response?.data || err.message)
              const responseData = err.response?.data
              let msg = responseData?.message || err.message
              if (responseData?.errors) {
                // Format Laravel style errors if possible
                msg = Object.entries(responseData.errors)
                  .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                  .join(' | ') || msg
              }
              errors.push({ row: row.rowNum, name: row.productName, message: msg })
            }
            setImportProgress(prev => ({ ...prev, current: i + 1, errors: [...errors] }))
          }
          setImportProgress(null)
        }

        if (toReview.length > 0) {
          setImportReview({
            rows: toReview,
            currentIndex: 0,
            processing: false,
            successCount: successCount,
            errors: errors
          })
        } else {
          finishImport(successCount, errors)
        }
      } catch (error) {
        console.error('Import error:', error)
        toast.error("Failed to process the Excel file.")
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const processImportRow = async (rowIndex, shouldSkip = false) => {
    let currentSuccess = importReview.successCount
    let currentErrors = [...importReview.errors]

    if (shouldSkip) {
      if (importReview.currentIndex === importReview.rows.length - 1) {
        finishImport(currentSuccess, currentErrors)
      } else {
        setImportReview(prev => ({
          ...prev,
          currentIndex: prev.currentIndex + 1
        }))
      }
      return
    }

    setImportReview(prev => ({ ...prev, processing: true }))
    const row = importReview.rows[rowIndex]

    try {
      if (row.existing) {
        // Only apply confirmed changes for product
        const confirmedPayload = {}
        let confirmedStock = null
        let confirmedBranch = null

        row.changes.forEach(c => {
          if (c.confirmed) {
            if (c.key === 'quantity') confirmedStock = c.newVal
            else if (c.key === 'branch_id') confirmedBranch = c.newVal
            else confirmedPayload[c.key] = c.newVal
          }
        })

        if (Object.keys(confirmedPayload).length > 0) {
          await api.put(`/products/${row.existing.product_id}`, confirmedPayload)
        }

        // Handle stock updates if confirmed
        if (confirmedStock !== null || confirmedBranch !== null) {
          const subcat = subcategories.find(s => s.subcategory_id === (row.payload.subcategory_id || row.existing.subcategory_id))
          try {
            await api.post('/stocks', {
              product_id: row.existing.product_id,
              branch_id: confirmedBranch || row.stockData.branch_id,
              brand_id: row.payload.brand_id || row.existing.brand_id,
              category_id: subcat?.category_id,
              subcategory_id: row.payload.subcategory_id || row.existing.subcategory_id,
              quantity: confirmedStock !== null ? confirmedStock : row.stockData.quantity,
              product_name: row.productName
            })
          } catch (sErr) { console.error('Stock update failed', sErr) }
        }
      } else {
        const res = await api.post('/products', row.payload)

        // Handle initial stock for new products
        if (row.stockData.quantity > 0 && row.stockData.branch_id && res.data.data) {
          const subcat = subcategories.find(s => s.subcategory_id === row.payload.subcategory_id)
          try {
            await api.post('/stocks', {
              product_id: res.data.data.product_id,
              branch_id: row.stockData.branch_id,
              brand_id: row.payload.brand_id,
              category_id: subcat?.category_id,
              subcategory_id: row.payload.subcategory_id,
              quantity: row.stockData.quantity,
              product_name: row.productName
            })
          } catch (sErr) { console.error('Initial stock failed', sErr) }
        }
      }

      const isLast = importReview.currentIndex === importReview.rows.length - 1
      if (isLast) {
        finishImport(currentSuccess + 1, currentErrors)
      } else {
        setImportReview(prev => ({
          ...prev,
          processing: false,
          successCount: prev.successCount + 1,
          currentIndex: prev.currentIndex + 1
        }))
      }
    } catch (err) {
      const responseData = err.response?.data
      let msg = ''
      if (responseData?.errors) {
        msg = Object.entries(responseData.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join(' | ')
      } else {
        msg = responseData?.message || err.message || 'API error'
      }

      const newError = { row: row.rowNum, name: row.productName, message: msg }
      const isLast = importReview.currentIndex === importReview.rows.length - 1

      if (isLast) {
        finishImport(currentSuccess, [...currentErrors, newError])
      } else {
        setImportReview(prev => ({
          ...prev,
          processing: false,
          errors: [...prev.errors, newError],
          currentIndex: prev.currentIndex + 1
        }))
      }
    }
  }

  const finishImport = async (finalSuccess, finalErrors) => {
    setImportReview(null) // Clear immediately to prevent render crash
    await fetchProducts()
    setImportResult({
      successCount: finalSuccess,
      errors: finalErrors
    })
  }

  // Download template matching backend expected fields
  const downloadTemplate = () => {
    const exampleBrand = brands[0]?.brand_name || 'Sample Brand'
    const exampleSubcat = subcategories[0]?.subcategory_name || 'Sample Subcategory'
    const exampleSupplier = suppliers[0]?.supplier_name || 'Sample Supplier'

    const exampleBranch = branches[0]?.branch_name || 'Main Branch'

    const templateData = [
      {
        'Product Name': 'Sample Product 1',
        'Description': 'Product description here',
        'Unit Price': 100.00,
        'Cost Price': 60.00,
        'Barcode': '123456789012',
        'Weight': 0.5,
        'Dimensions': '10x10x10cm',
        'Subcategory': exampleSubcat,
        'Brand': exampleBrand,
        'Supplier': exampleSupplier,
        'Initial Stock': 10,
        'Branch': exampleBranch,
        'Status': 'active'
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const colWidths = Object.keys(templateData[0]).map(k => ({ wch: Math.max(k.length, 18) }))
    worksheet['!cols'] = colWidths
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products Import')
    XLSX.writeFile(workbook, 'product_import_template.xlsx')
    toast.success("Template downloaded!")
  }

  // Add new product
  const handleAddProduct = () => {
    navigate('/products/add')
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Import Progress Overlay */}
      {importProgress && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 max-w-sm w-full text-center space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <h3 className="text-lg font-semibold">Importing Products…</h3>
            <p className="text-muted-foreground text-sm">
              {importProgress.current} / {importProgress.total} processed
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.round((importProgress.current / importProgress.total) * 100)}%` }}
              />
            </div>
            {importProgress.errors.length > 0 && (
              <p className="text-xs text-destructive">{importProgress.errors.length} row(s) had errors</p>
            )}
          </div>
        </div>
      )}

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
        <DialogContent className="max-w-4xl tracking-tight">
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
                  className="font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-product-code">Product Code (Read Only)</Label>
                <Input
                  id="edit-product-code"
                  value={editForm.product_code || ''}
                  disabled
                  className="bg-muted opacity-80"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Detailed Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description || ''}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="min-h-[120px] resize-y"
                placeholder="Enter detailed product description..."
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-primary">Category</Label>
                <Select
                  value={editForm.category_id?.toString() || ''}
                  onValueChange={(val) => setEditForm({ ...editForm, category_id: val })}
                >
                  <SelectTrigger className="h-11">
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
                <Label className="font-bold text-primary">Subcategory</Label>
                <Select
                  value={editForm.subcategory_id?.toString() || ''}
                  onValueChange={(val) => setEditForm({ ...editForm, subcategory_id: val })}
                >
                  <SelectTrigger className="h-11">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select
                  value={editForm.brand_id?.toString() || ''}
                  onValueChange={(val) => setEditForm({ ...editForm, brand_id: val })}
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

            <div className="space-y-2">
              <Label className="font-medium">Primary Supplier</Label>
              <Select
                value={editForm.supplier_id?.toString() || ''}
                onValueChange={(val) => setEditForm({ ...editForm, supplier_id: val })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Supplier" />
                </SelectTrigger>
                <SelectContent className="max-w-[400px]">
                  {suppliers.map(s => (
                    <SelectItem key={s.supplier_id} value={s.supplier_id.toString()}>
                      <span className="whitespace-normal block text-left">{s.supplier_name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t mt-2">
              <div className="space-y-2">
                <Label htmlFor="edit-branch" className="text-muted-foreground italic">Update Stock Branch</Label>
                <Select
                  value={editForm.branch_id || ''}
                  onValueChange={(v) => setEditForm({ ...editForm, branch_id: v })}
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
                <Label htmlFor="edit-quantity" className="text-muted-foreground italic">Current Stock Quantity</Label>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Products from Excel</DialogTitle>
            <DialogDescription>
              Upload an <strong>.xlsx</strong> file. Use the exact names from the reference lists below for Brand, Subcategory, and Supplier columns.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Upload Zone */}
            <div
              className="border-2 border-dashed border-primary/40 rounded-xl p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-9 w-9 text-primary mb-2" />
              <p className="text-sm font-medium">Click to upload Excel file</p>
              <p className="text-xs text-muted-foreground mt-1">.xlsx, .xls supported</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Required columns hint */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
              <p className="font-semibold text-foreground">Required columns in your Excel file:</p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Product Name</span>, <span className="font-medium text-foreground">Unit Price</span>
              </p>
              <p className="text-muted-foreground">
                Optional: Description, Cost Price, Barcode, Weight, Dimensions, Brand, Subcategory, Supplier, Status (active/inactive)
              </p>
            </div>

            {/* Reference: Available names */}
            {(brands.length > 0 || subcategories.length > 0 || suppliers.length > 0) && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Available names to use in your file:</p>
                <div className="grid grid-cols-3 gap-2">
                  {brands.length > 0 && (
                    <div className="rounded-lg border p-2 space-y-1 bg-muted/20">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b pb-1 mb-1">Brands</p>
                      <div className="max-h-[120px] overflow-y-auto pr-1 space-y-1">
                        {brands.map(b => (
                          <p key={b.brand_id} className="text-[11px] truncate leading-tight hover:text-primary cursor-default">{b.brand_name}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {subcategories.length > 0 && (
                    <div className="rounded-lg border p-2 space-y-1 bg-muted/20">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b pb-1 mb-1">Subcategories</p>
                      <div className="max-h-[120px] overflow-y-auto pr-1 space-y-1">
                        {subcategories.map(s => (
                          <p key={s.subcategory_id} className="text-[11px] truncate leading-tight hover:text-primary cursor-default">{s.subcategory_name}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  {suppliers.length > 0 && (
                    <div className="rounded-lg border p-2 space-y-1 bg-muted/20">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b pb-1 mb-1">Suppliers</p>
                      <div className="max-h-[120px] overflow-y-auto pr-1 space-y-1">
                        {suppliers.map(s => (
                          <p key={s.supplier_id} className="text-[11px] truncate leading-tight hover:text-primary cursor-default">{s.supplier_name}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="link" onClick={downloadTemplate} className="p-0 h-auto text-sm mr-auto">
              Download template
            </Button>
            <Button variant="outline" onClick={() => setImportDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Results Dialog */}
      {importResult && (
        <Dialog open={!!importResult} onOpenChange={() => setImportResult(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Import Results</DialogTitle>
              <DialogDescription>
                {importResult.successCount} succeeded, {importResult.errors.length} failed
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
              {importResult.successCount > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    {importResult.successCount} product{importResult.successCount !== 1 ? 's' : ''} imported successfully
                  </span>
                </div>
              )}
              {importResult.errors.length > 0 && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    Failed rows ({importResult.errors.length}):
                  </p>
                  <div className="space-y-3">
                    {importResult.errors.map((err, i) => (
                      <div key={i} className="rounded-xl border border-destructive/20 bg-destructive/5 overflow-hidden shadow-sm">
                        <div className="bg-destructive/10 px-3 py-2 border-b border-destructive/10 flex justify-between items-center">
                          <p className="text-xs font-bold text-destructive">Row {err.row} — {err.name || 'Unknown Product'}</p>
                        </div>
                        <div className="p-3 space-y-2">
                          {err.columnErrors && err.columnErrors.length > 0 ? (
                            err.columnErrors.map((colErr, j) => (
                              <div key={j} className="text-xs flex flex-col gap-1 border-l-2 border-destructive/30 pl-3 py-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[9px] h-4 py-0 px-1.5 border-destructive/20 text-destructive bg-white uppercase font-black">
                                    {colErr.column}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground font-medium">{colErr.reason}</p>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs flex flex-col gap-1 border-l-2 border-destructive pl-3 py-1 bg-white/50 rounded">
                              <p className="font-bold text-destructive">Server Error:</p>
                              <p className="text-muted-foreground italic leading-relaxed">{err.message || 'An unknown error occurred'}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setImportResult(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Import Review Dialog */}
      {importReview && importReview.rows[importReview.currentIndex] && (
        <Dialog open={!!importReview} onOpenChange={() => {
          if (!importReview.processing) setImportReview(null);
        }}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <div className="flex justify-between items-center pr-6">
                <div>
                  <DialogTitle>Review Import ({importReview.currentIndex + 1} / {importReview.rows.length})</DialogTitle>
                  <DialogDescription>
                    Reviewing Row {importReview.rows[importReview.currentIndex].rowNum}: <strong>{importReview.rows[importReview.currentIndex].productName}</strong>
                  </DialogDescription>
                </div>
                <Badge variant={importReview.rows[importReview.currentIndex].existing ? "secondary" : "default"}>
                  {importReview.rows[importReview.currentIndex].existing ? "Existing Product" : "New Product"}
                </Badge>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Error Warning */}
              {importReview.rows[importReview.currentIndex].columnErrors.length > 0 && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-destructive font-bold text-sm">
                    <span> Validation Issues</span>
                  </div>
                  <div className="grid gap-2 text-xs">
                    {importReview.rows[importReview.currentIndex].columnErrors.map((err, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="font-bold underline">{err.column}:</span>
                        <span>{err.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duplicate Info & Changes */}
              {importReview.rows[importReview.currentIndex].existing && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground italic border-l-2 border-blue-500 pl-3">
                    A product with the same name or barcode already exists in your inventory.
                  </p>

                  {importReview.rows[importReview.currentIndex].changes.length > 0 ? (
                    <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                      <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Changes to Confirm</p>
                      <div className="space-y-3">
                        {importReview.rows[importReview.currentIndex].changes.map((change, i) => (
                          <div key={i} className="flex items-start gap-3 p-2 bg-white dark:bg-gray-800 rounded border hover:border-primary/50 transition-colors">
                            <div className="pt-1">
                              <Switch
                                checked={change.confirmed}
                                onCheckedChange={(val) => {
                                  const newRows = [...importReview.rows]
                                  newRows[importReview.currentIndex].changes[i].confirmed = val
                                  setImportReview({ ...importReview, rows: newRows })
                                }}
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-muted-foreground">{change.label}</span>
                                {change.confirmed && <Badge variant="default" className="h-4 text-[9px] px-1 bg-green-600">CONFIRMED</Badge>}
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground line-through opacity-50 truncate max-w-[100px]">{change.oldVal}</span>
                                <span className="text-primary">→</span>
                                <span className="font-bold text-blue-600 truncate max-w-[150px]">{change.newValLabel || change.newVal}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 text-xs text-green-700 dark:text-green-400">
                      No changes detected for this product. Importing will keep existing data.
                    </div>
                  )}
                </div>
              )}

              {/* Data Preview */}
              {!importReview.rows[importReview.currentIndex].existing && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm border rounded-xl p-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">Price</p>
                    <p className="font-mono">Rs.{importReview.rows[importReview.currentIndex].payload.price}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">Cost</p>
                    <p className="font-mono text-muted-foreground">Rs.{importReview.rows[importReview.currentIndex].payload.cost_price}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">Barcode</p>
                    <p className="font-mono truncate">{importReview.rows[importReview.currentIndex].payload.barcode || 'N/A'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-tighter">Status</p>
                    <Badge variant={importReview.rows[importReview.currentIndex].payload.status === 'active' ? "default" : "outline"} className="capitalize">
                      {importReview.rows[importReview.currentIndex].payload.status}
                    </Badge>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between items-center sm:justify-between w-full border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setImportReview(null)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Cancel Import
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => processImportRow(importReview.currentIndex, true)}
                  disabled={importReview.processing}
                >
                  Skip
                </Button>
                <Button
                  onClick={() => processImportRow(importReview.currentIndex)}
                  disabled={importReview.processing || importReview.rows[importReview.currentIndex].columnErrors.length > 0}
                  className="min-w-[120px]"
                >
                  {importReview.processing ? (
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                      Saving...
                    </div>
                  ) : (
                    importReview.rows[importReview.currentIndex].existing ? "Confirm Update" : "Confirm Import"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}