import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import api from '@/api/api';

/**
 * Generates a Purchase PDF (GRN) based on system settings
 * @param {Object} purchase - The purchase record data
 */
export const generatePurchasePDF = async (purchase) => {
    try {
        console.log("Generating PDF for purchase:", purchase);
        if (!purchase) {
            toast.error("No purchase data available for PDF");
            return false;
        }

        // 1. Fetch system settings for printing preferences
        let settings = {
            grn_print_size: 'A4',
            print_footer_text: '',
            company_name: 'Inventory Management System',
            logo: null
        };

        try {
            const response = await api.get('/settings');
            if (response.data.success && response.data.data) {
                settings = { ...settings, ...response.data.data };
            }
        } catch (err) {
            console.warn("Could not fetch print settings, using defaults", err);
        }

        // 2. Initialize PDF with correct orientation and size
        // A4: [210, 297], A5: [148, 210]
        const isA5 = settings.grn_print_size === 'A5';
        const doc = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: isA5 ? 'a5' : 'a4'
        });

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        
        // Scale factors for A5
        const scale = isA5 ? 0.75 : 1.0;
        const margin = 14 * scale;

        // 3. Header Section
        doc.setFontSize(20 * scale);
        doc.setTextColor(35, 55, 95);
        doc.text('GOODS RECEIVED NOTE', margin, 20 * scale);
        
        doc.setFontSize(10 * scale);
        doc.setTextColor(100);
        doc.text(settings.company_name, margin, 28 * scale);
        
        // Add Address and Phone if they exist
        let headerY = 33 * scale;
        if (settings.company_address) {
            doc.setFontSize(8 * scale);
            doc.text(settings.company_address, margin, headerY);
            headerY += 4 * scale;
        }
        if (settings.phone_no_01) {
            doc.setFontSize(8 * scale);
            const phoneText = `Tel: ${settings.phone_no_01}${settings.phone_no_02 ? ' / ' + settings.phone_no_02 : ''}`;
            doc.text(phoneText, margin, headerY);
            headerY += 4 * scale;
        }
        if (settings.email) {
            doc.setFontSize(8 * scale);
            doc.text(`Email: ${settings.email}`, margin, headerY);
            headerY += 4 * scale;
        }

        // Metadata (ID & Date)
        doc.setFontSize(10 * scale);
        doc.setTextColor(0);
        doc.text(`GRN ID: ${purchase.purchase_id || 'N/A'}`, pageWidth - margin, 20 * scale, { align: 'right' });
        doc.text(`Date: ${purchase.purchase_date || ''}`, pageWidth - margin, 28 * scale, { align: 'right' });

        doc.setDrawColor(200);
        doc.line(margin, headerY + (2 * scale), pageWidth - margin, headerY + (2 * scale));

        // 4. Supplier & Branch Information
        doc.setFontSize(11 * scale);
        doc.setFont('helvetica', 'bold');
        doc.text('SUPPLIER:', margin, headerY + (10 * scale));
        doc.setFont('helvetica', 'normal');
        doc.text(String(purchase.supplier_name || 'N/A'), margin, headerY + (17 * scale));

        doc.setFont('helvetica', 'bold');
        doc.text('BRANCH:', pageWidth / 2, headerY + (10 * scale));
        doc.setFont('helvetica', 'normal');
        doc.text(String(purchase.branch_name || 'Main'), pageWidth / 2, headerY + (17 * scale));

        // 5. Items Table
        const tableColumn = ['#', 'Product', 'Code', 'Cost', 'Qty', 'Total'];
        const tableRows = (purchase.items || []).map((item, index) => [
            index + 1,
            item.product_name || 'N/A',
            item.product_code || '-',
            parseFloat(item.stock_price || 0).toLocaleString(),
            item.quantity || 0,
            parseFloat(item.subtotal || 0).toLocaleString()
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: headerY + (25 * scale),
            theme: 'grid',
            headStyles: { fillColor: [35, 55, 95], fontSize: 10 * scale },
            styles: { fontSize: 9 * scale, cellPadding: 2 * scale },
            margin: { left: margin, right: margin }
        });

        // 6. Totals Section
        let finalY = doc.lastAutoTable.finalY + (10 * scale);
        
        // Check if we need a new page for totals
        if (finalY > pageHeight - (40 * scale)) {
            doc.addPage();
            finalY = 20 * scale;
        }

        doc.setFontSize(10 * scale);
        doc.text(`Subtotal: Rs. ${parseFloat(purchase.subtotal || 0).toLocaleString()}`, pageWidth - margin, finalY, { align: 'right' });
        doc.text(`Discount: - Rs. ${parseFloat(purchase.discount || 0).toLocaleString()}`, pageWidth - margin, finalY + (7 * scale), { align: 'right' });
        
        doc.setFontSize(12 * scale);
        doc.setFont('helvetica', 'bold');
        doc.text(`Grand Total: Rs. ${parseFloat(purchase.grand_total || 0).toLocaleString()}`, pageWidth - margin, finalY + (17 * scale), { align: 'right' });

        doc.setFontSize(9 * scale);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Amount Paid: Rs. ${parseFloat(purchase.amount_paid || 0).toLocaleString()}`, pageWidth - margin, finalY + (25 * scale), { align: 'right' });
        doc.text(`Balance Due: Rs. ${parseFloat(purchase.balance_due || 0).toLocaleString()}`, pageWidth - margin, finalY + (32 * scale), { align: 'right' });

        // 7. Footer
        if (settings.print_footer_text) {
            doc.setFontSize(8 * scale);
            doc.setTextColor(150);
            doc.text(settings.print_footer_text, pageWidth / 2, pageHeight - (10 * scale), { align: 'center' });
        }

        const fileName = `GRN_${purchase.purchase_id || 'Export'}.pdf`;
        
        // 8. Output handling (Preview vs Download)
        if (settings.show_print_preview) {
            // Open in new tab for preview
            const blobURL = doc.output('bloburl');
            window.open(blobURL, '_blank');
        } else {
            // Force direct download
            doc.save(fileName);
        }
        
        return true;
    } catch (error) {
        console.error('PDF Generation Error:', error);
        toast.error("PDF Error: " + (error.message || "Unknown error"));
        return false;
    }
};
