import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Printer, Save, FileText, Loader2, Info } from 'lucide-react';
import api from '@/api/api';

export default function PrintingSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        auto_print_grn: false,
        show_print_preview: true,
        print_footer_text: '',
        grn_print_size: 'A4'
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/settings');
            if (response.data.success && response.data.data) {
                const data = response.data.data;
                setFormData({
                    auto_print_grn: !!data.auto_print_grn,
                    show_print_preview: !!data.show_print_preview,
                    print_footer_text: data.print_footer_text || '',
                    grn_print_size: data.grn_print_size || 'A4'
                });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load printing settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await api.post('/settings', formData);
            if (response.data.success) {
                toast.success('Printing settings saved successfully!');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save changes');
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
                        <Printer className="h-8 w-8 text-slate-500" />
                        Printing Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">Configure your GRN and document printing preferences</p>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="gap-2 px-6 bg-slate-900 hover:bg-slate-800 transition-all shadow-lg"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Settings
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="space-y-6">
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-slate-50/50 border-b">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                GRN Print Configuration
                            </CardTitle>
                            <CardDescription>Choose your default paper size and printing behavior</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="print-size">Paper Format (Size)</Label>
                                    <Select 
                                        value={formData.grn_print_size} 
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, grn_print_size: val }))}
                                    >
                                        <SelectTrigger id="print-size" className="h-11 border-slate-200">
                                            <SelectValue placeholder="Select paper size" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="A4">A4 Standard (Desktop Printer)</SelectItem>
                                            <SelectItem value="A5">A5 Half-Sheet (Small Printer)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[11px] text-muted-foreground italic">
                                        * A4 is 210 x 297 mm, A5 is 148 x 210 mm.
                                    </p>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/30">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-semibold">Show Print Preview</Label>
                                            <p className="text-xs text-muted-foreground">Open preview in new tab before printing</p>
                                        </div>
                                        <Switch 
                                            checked={formData.show_print_preview} 
                                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, show_print_preview: checked }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
