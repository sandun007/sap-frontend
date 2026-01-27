import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ScanBarcode, Upload, Camera, Package, Save, X, QrCode } from 'lucide-react'

export default function AddProduct() {
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    unit_price: '',
    cost_price: '',
    barcode: '',
    weight: '',
    dimensions: '',
    is_active: true,
    category_id: '',
    subcategory_id: '',
    brand_id: '',
    supplier_id: ''
  })

  const [productId, setProductId] = useState(generateProductId())
  const [qrCode, setQrCode] = useState('')
  const [productImage, setProductImage] = useState(null)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Generate product ID
  function generateProductId() {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `PROD-${timestamp}-${random}`
  }

  // Mock data for dropdowns
  const categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Food & Beverages' },
    { id: 4, name: 'Home & Garden' }
  ]

  const subcategories = [
    { id: 1, name: 'Mobile Phones', category_id: 1 },
    { id: 2, name: 'Laptops', category_id: 1 },
    { id: 3, name: 'Men Clothing', category_id: 2 },
    { id: 4, name: 'Women Clothing', category_id: 2 }
  ]

  const brands = [
    { id: 1, name: 'Samsung' },
    { id: 2, name: 'Apple' },
    { id: 3, name: 'Nike' },
    { id: 4, name: 'Adidas' }
  ]

  const suppliers = [
    { id: 1, name: 'Supplier A' },
    { id: 2, name: 'Supplier B' },
    { id: 3, name: 'Supplier C' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const generateBarcode = () => {
    const randomBarcode = Math.random().toString().substr(2, 12)
    handleInputChange('barcode', randomBarcode)
    toast.success("Barcode generated successfully")
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setProductImage(URL.createObjectURL(file))
      toast.success("Image uploaded successfully")
    }
  }

  // Barcode Scanner Functionality
  const startBarcodeScanner = async () => {
    setShowBarcodeScanner(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error("Cannot access camera. Please check permissions.")
    }
  }

  const stopBarcodeScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    }
    setShowBarcodeScanner(false)
  }

  const captureBarcode = () => {
    // Simulate barcode capture
    const simulatedBarcode = Math.random().toString().substr(2, 12)
    handleInputChange('barcode', simulatedBarcode)
    stopBarcodeScanner()
    toast.success(`Barcode captured: ${simulatedBarcode}`)
  }

  // Camera Functionality
  const startCamera = async () => {
    setShowCamera(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error("Cannot access camera. Please check permissions.")
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
    }
    setShowCamera(false)
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d')
      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
      context.drawImage(videoRef.current, 0, 0)
      
      const imageDataUrl = canvasRef.current.toDataURL('image/png')
      setProductImage(imageDataUrl)
      stopCamera()
      toast.success("Image captured successfully")
    }
  }

  const generateQRCode = () => {
    const qrData = `PRODUCT_ID:${productId}|NAME:${formData.product_name}|PRICE:${formData.unit_price}`
    setQrCode(qrData)
    toast.success("QR Code generated successfully")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.product_name || !formData.unit_price || !formData.cost_price) {
      toast.error("Please fill in all required fields")
      return
    }

    const productData = {
      product_id: productId,
      ...formData
    }

    console.log('Product Data:', productData)
    toast.success("Product added successfully!")
    
    // Reset form
    setFormData({
      product_name: '',
      description: '',
      unit_price: '',
      cost_price: '',
      barcode: '',
      weight: '',
      dimensions: '',
      is_active: true,
      category_id: '',
      subcategory_id: '',
      brand_id: '',
      supplier_id: ''
    })
    setProductId(generateProductId())
    setProductImage(null)
    setQrCode('')
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product in your inventory</p>
        </div>
        <Badge variant="secondary" className="text-xs sm:text-sm px-2.5 py-0.5 sm:px-3 sm:py-1 self-start sm:self-auto">
          Product ID: {productId}
        </Badge>
      </div>

      {/* Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Scan Barcode</h3>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-64 bg-black rounded"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={captureBarcode} className="flex-1">
                Capture Barcode
              </Button>
              <Button onClick={stopBarcodeScanner} variant="outline">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Take Product Photo</h3>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-64 bg-black rounded"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2 mt-4">
              <Button onClick={captureImage} className="flex-1">
                Capture Image
              </Button>
              <Button onClick={stopCamera} variant="outline">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter product basic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="product_name">Product Name *</Label>
                  <Input
                    id="product_name"
                    value={formData.product_name}
                    onChange={(e) => handleInputChange('product_name', e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Product description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit_price">Unit Price (Rs.) *</Label>
                    <Input
                      id="unit_price"
                      type="number"
                      value={formData.unit_price}
                      onChange={(e) => handleInputChange('unit_price', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost_price">Cost Price (Rs.) *</Label>
                    <Input
                      id="cost_price"
                      type="number"
                      value={formData.cost_price}
                      onChange={(e) => handleInputChange('cost_price', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Identification</CardTitle>
                <CardDescription>Barcode and identification codes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <div className="flex gap-2">
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => handleInputChange('barcode', e.target.value)}
                        placeholder="Barcode number"
                      />
                      <Button type="button" onClick={startBarcodeScanner} variant="outline">
                        <ScanBarcode className="h-4 w-4" />
                      </Button>
                      <Button type="button" onClick={generateBarcode} variant="outline">
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>QR Code</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder={qrCode || "QR Code will be generated"} 
                        disabled 
                      />
                      <Button type="button" variant="outline" onClick={generateQRCode}>
                        <QrCode className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={formData.dimensions}
                      onChange={(e) => handleInputChange('dimensions', e.target.value)}
                      placeholder="L x W x H"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Categories & Image */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Categories & Status</CardTitle>
                <CardDescription>Product classification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category *</Label>
                  <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory_id">Subcategory</Label>
                  <Select value={formData.subcategory_id} onValueChange={(value) => handleInputChange('subcategory_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories
                        .filter(sub => sub.category_id === parseInt(formData.category_id))
                        .map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand_id">Brand</Label>
                  <Select value={formData.brand_id} onValueChange={(value) => handleInputChange('brand_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier_id">Supplier *</Label>
                  <Select value={formData.supplier_id} onValueChange={(value) => handleInputChange('supplier_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Product Status
                  </Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {formData.is_active ? 'Product will be active' : 'Product will be inactive'}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Image</CardTitle>
                <CardDescription>Upload product photo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {productImage ? (
                    <div className="space-y-2">
                      <img src={productImage} alt="Product" className="mx-auto h-32 object-cover rounded" />
                      <Button type="button" variant="outline" onClick={() => setProductImage(null)}>
                        <X className="h-4 w-4 mr-2" />
                        Remove Image
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Package className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Upload product image</p>
                        <div className="flex gap-2 justify-center">
                          <Button type="button" variant="outline" onClick={() => document.getElementById('image-upload').click()}>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                          <Button type="button" variant="outline" onClick={startCamera}>
                            <Camera className="h-4 w-4 mr-2" />
                            Camera
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>

            {qrCode && (
              <Card>
                <CardHeader>
                  <CardTitle>QR Code</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="bg-gray-100 p-4 rounded-lg inline-block">
                    <div className="w-32 h-32 bg-white flex items-center justify-center border">
                      <span className="text-xs break-all">{qrCode}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Scan this QR code for product details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 mt-6 pt-6 border-t">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => {
            setFormData({
              product_name: '',
              description: '',
              unit_price: '',
              cost_price: '',
              barcode: '',
              weight: '',
              dimensions: '',
              is_active: true,
              category_id: '',
              subcategory_id: '',
              brand_id: '',
              supplier_id: ''
            })
            setProductId(generateProductId())
            setProductImage(null)
            setQrCode('')
            toast.info("Form cleared")
          }}>
            Clear
          </Button>
          <Button type="submit" className="w-full sm:w-auto gap-2">
            <Save className="h-4 w-4" />
            Save Product
          </Button>
        </div>
      </form>
    </div>
  )
}