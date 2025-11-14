import jsPDF from 'jspdf';
import { Shipment } from '../types';

const COMPANY_NAME = 'MoveSwift Logistics';
const COMPANY_EMAIL = 'support@moveswift.com';
const COMPANY_PHONE = '+1-800-SWIFT-01';
const COMPANY_ADDRESS = '123 Logistics Plaza, Transport City, TC 12345';

export const generateReceiptPDF = async (shipment: Shipment, customer: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Set text color for dark text on white background
  doc.setTextColor(40, 40, 40);

  // Header background (light blue)
  doc.setFillColor(59, 130, 246); // blue-600
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Company name in header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(COMPANY_NAME, margin, 18);

  // Reset to dark text
  doc.setTextColor(40, 40, 40);
  yPosition = 40;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('SHIPMENT RECEIPT', margin, yPosition);
  yPosition += 10;

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Receipt number and date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Receipt ID: ${shipment.trackingNumber}`, margin, yPosition);
  doc.text(`Date: ${new Date(shipment.createdAt).toLocaleDateString()}`, pageWidth - margin - 50, yPosition);
  yPosition += 8;

  // Company info
  doc.setFontSize(9);
  doc.text(COMPANY_ADDRESS, margin, yPosition);
  yPosition += 4;
  doc.text(`Phone: ${COMPANY_PHONE} | Email: ${COMPANY_EMAIL}`, margin, yPosition);
  yPosition += 10;

  // Section: CUSTOMER INFORMATION
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(59, 130, 246);
  doc.text('CUSTOMER INFORMATION', margin, yPosition);
  doc.setTextColor(40, 40, 40);
  yPosition += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const customerName = typeof customer === 'object' ? customer?.fullName || 'N/A' : 'N/A';
  const customerEmail = typeof customer === 'object' ? customer?.email || '' : '';
  const customerPhone = typeof customer === 'object' ? customer?.phone || '' : '';

  doc.text(`Name: ${customerName}`, margin, yPosition);
  yPosition += 5;
  if (customerEmail) {
    doc.text(`Email: ${customerEmail}`, margin, yPosition);
    yPosition += 5;
  }
  if (customerPhone) {
    doc.text(`Phone: ${customerPhone}`, margin, yPosition);
    yPosition += 5;
  }
  yPosition += 5;

  // Section: SHIPMENT DETAILS
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(59, 130, 246);
  doc.text('SHIPMENT DETAILS', margin, yPosition);
  doc.setTextColor(40, 40, 40);
  yPosition += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const details = [
    { label: 'Tracking Number', value: shipment.trackingNumber },
    { label: 'Status', value: shipment.status.toUpperCase() },
    { label: 'Sender Name', value: shipment.sendersName },
    { label: 'Receiver Name', value: shipment.receiversName },
    { label: 'Origin', value: shipment.origin },
    { label: 'Destination', value: shipment.destination },
    { label: 'Weight', value: `${shipment.weight || 0} kg` },
    { label: 'Current Location', value: shipment.location || 'In Transit' }
  ];

  details.forEach(detail => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }
    doc.text(`${detail.label}:`, margin, yPosition);
    doc.text(detail.value, margin + 50, yPosition);
    yPosition += 5;
  });

  yPosition += 5;

  // Section: PRICING
  if (shipment.price !== undefined) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(59, 130, 246);
    doc.text('PRICING', margin, yPosition);
    doc.setTextColor(40, 40, 40);
    yPosition += 6;

    // Pricing table background
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition - 4, contentWidth, 15, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Shipment Charges:', margin + 5, yPosition);
    doc.text(`$${(shipment.price).toFixed(2)}`, pageWidth - margin - 30, yPosition);
    yPosition += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total Amount Due:', margin + 5, yPosition);
    doc.setTextColor(59, 130, 246);
    doc.text(`$${(shipment.price).toFixed(2)}`, pageWidth - margin - 30, yPosition);
    doc.setTextColor(40, 40, 40);
    yPosition += 10;
  }

  // Footer with terms
  yPosition = pageHeight - 25;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing MoveSwift Logistics!', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;
  doc.text('For inquiries, contact us at support@moveswift.com or call +1-800-SWIFT-01', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;
  doc.text('This is an official shipment receipt. Please keep it for your records.', pageWidth / 2, yPosition, { align: 'center' });

  // Save the PDF
  const fileName = `shipment-receipt-${shipment.trackingNumber}.pdf`;
  doc.save(fileName);
};
