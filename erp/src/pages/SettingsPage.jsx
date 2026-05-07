import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Save, Settings, Building2, Info, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { settingsAPI, BASE_URL } from '@/api/api';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  const [logoFile, setLogoFile] = useState(null);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BASE_URL}/${cleanPath}`;
  };

  // Crop states
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropShape, setCropShape] = useState('rect');
  const [cropAspect, setCropAspect] = useState(1);

  const [formData, setFormData] = useState({
    company_name: '',
    logo: '',
    email: '',
    phone_no_01: '',
    phone_no_02: '',
    company_address: '',
    dashboard_logo_size: 80
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsAPI.get();
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setFormData(prev => ({
          ...prev,
          ...data
        }));
        if (data.logo) {
          setLogoPreview(getImageUrl(data.logo));
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load application settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result);
        setCropDialogOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels,
        0,
        { horizontal: false, vertical: false },
        cropShape
      );
      
      // Since it's a blob, we need to create a File object for the FormData
      const file = new File([croppedImageBlob], "logo.png", { type: "image/png" });
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setCropDialogOpen(false);
      
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop image");
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(formData.logo ? getImageUrl(formData.logo) : null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Use FormData for file upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'logo') {
          // Fix: Ensure we don't turn 0 or false into an empty string
          const value = (formData[key] === null || formData[key] === undefined) ? '' : formData[key];
          submitData.append(key, value);
        }
      });
      
      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      const response = await settingsAPI.update(submitData);
      if (response.data.success) {
        toast.success('Settings updated successfully!');
        window.dispatchEvent(new Event('settingsUpdated'));
        const updatedData = response.data.data;
        setFormData(prev => ({ ...prev, ...updatedData }));
        localStorage.setItem('appSettings', JSON.stringify(updatedData));
        setLogoFile(null);
        if (updatedData.logo) {
          setLogoPreview(getImageUrl(updatedData.logo));
        }
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to save settings changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Settings className="h-8 w-8 text-slate-500" />
            System Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your application branding and general preferences</p>
        </div>
        <Button 
          onClick={handleSubmit} 
          disabled={saving} 
          className="gap-2 px-6 bg-slate-900 hover:bg-slate-800 transition-all shadow-lg"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branding & Contact Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Organization Identity
              </CardTitle>
              <CardDescription>Configure how your business appears across the application</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company_name">Website / Company Name</Label>
                  <Input 
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="font-semibold text-lg border-slate-200"
                  />
                  <p className="text-xs text-muted-foreground">This name will be displayed in the navigation bar and reports.</p>
                </div>
                
                {/* Logo Section */}
                <div className="space-y-2 md:col-span-2 py-2">
                  <Label>Business Logo</Label>
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 border-2 border-dashed rounded-xl bg-slate-50/50">
                    <div className="relative group h-24 w-24 flex-shrink-0 bg-white rounded-lg border overflow-hidden shadow-sm">
                      {logoPreview ? (
                        <>
                          <img src={logoPreview} alt="Logo preview" className="h-full w-full object-contain" />
                          <button 
                            type="button"
                            onClick={removeLogo}
                            className="absolute top-1 right-1 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-destructive shadow-sm"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-300">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-center sm:items-start gap-2 w-full flex-1">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white w-auto"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleLogoChange}
                      />
                      <p className="text-[10px] text-muted-foreground mt-1 text-center sm:text-left">Max 2MB. Square image recommended.</p>
                    </div>
                  </div>
                  
                  {/* Logo Size Control */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="dashboard_logo_size" className="text-sm">Dashboard Logo Size</Label>
                      <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {formData.dashboard_logo_size || 100}px
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400">Small</span>
                      <Input
                        type="range"
                        id="dashboard_logo_size"
                        name="dashboard_logo_size"
                        min="40"
                        max="200"
                        step="5"
                        value={formData.dashboard_logo_size || 100}
                        onChange={handleInputChange}
                        className="flex-1"
                      />
                      <span className="text-xs text-slate-400">Large</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="border-none shadow-md">
            <CardHeader className="bg-slate-50/50 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
              <CardDescription>Update how customers can reach your business</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Company Email / Gmail</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    className="border-slate-200"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone_no_01">Primary Phone Number</Label>
                  <Input 
                    id="phone_no_01"
                    name="phone_no_01"
                    value={formData.phone_no_01 || ''}
                    onChange={handleInputChange}
                    className="border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_no_02">Secondary Phone Number</Label>
                  <Input 
                    id="phone_no_02"
                    name="phone_no_02"
                    value={formData.phone_no_02 || ''}
                    onChange={handleInputChange}
                    className="border-slate-200"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="company_address">Business Address</Label>
                  <textarea 
                    id="company_address"
                    name="company_address"
                    value={formData.company_address || ''}
                    onChange={handleInputChange}
                    className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar / Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-slate-900 text-slate-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5" />
                Branding Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-white/10 border border-white/20">
                <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Navbar Appearance</p>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-xl tracking-tight truncate uppercase">
                    {formData.company_name || 'SYSTEM NAME'}
                  </span>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-white/10 border border-white/20">
                <p className="text-xs text-slate-400 mb-4 uppercase tracking-wider">Dashboard Appearance</p>
                <div className="flex items-center gap-3 bg-white p-4 rounded-md shadow-inner justify-center min-h-[150px]">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Dashboard Preview" 
                      style={{ height: `${formData.dashboard_logo_size}px` }}
                      className="w-auto object-contain transition-all duration-200"
                    />
                  ) : (
                    <div 
                      className="bg-slate-100 flex items-center justify-center rounded text-slate-400 transition-all duration-200"
                      style={{ height: `${formData.dashboard_logo_size}px`, width: `${formData.dashboard_logo_size}px` }}
                    >
                      <ImageIcon className="w-1/3 h-1/3 opacity-50" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Crop Dialog */}
      <Dialog open={cropDialogOpen} onOpenChange={setCropDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Crop Logo</DialogTitle>
          </DialogHeader>
          <div className="relative h-[300px] w-full rounded-md overflow-hidden bg-slate-100">
            {imageToCrop && (
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={cropAspect}
                cropShape={cropShape}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
          <div className="flex flex-col gap-3 py-2">
            <div className="flex justify-center gap-2">
              <Button 
                size="sm" 
                variant={cropShape === 'rect' && cropAspect === 1 ? 'default' : 'outline'} 
                onClick={() => { setCropShape('rect'); setCropAspect(1); }}
              >
                Square
              </Button>
              <Button 
                size="sm" 
                variant={cropShape === 'rect' && cropAspect === 16/9 ? 'default' : 'outline'} 
                onClick={() => { setCropShape('rect'); setCropAspect(16/9); }}
              >
                16:9
              </Button>
              <Button 
                size="sm" 
                variant={cropShape === 'rect' && cropAspect === 4/3 ? 'default' : 'outline'} 
                onClick={() => { setCropShape('rect'); setCropAspect(4/3); }}
              >
                4:3
              </Button>
              <Button 
                size="sm" 
                variant={cropShape === 'round' ? 'default' : 'outline'} 
                onClick={() => { setCropShape('round'); setCropAspect(1); }}
              >
                Round
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Label className="w-12">Zoom:</Label>
              <Input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCropDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCropConfirm}>Confirm Crop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}