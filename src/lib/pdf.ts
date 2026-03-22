import jsPDF from 'jspdf';
import { Bill, PAYMENT_CONFIG } from './types';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function generateInvoicePDF(bill: Bill) {
  const doc = new jsPDF();
  const gold = [212, 175, 55] as const;
  const dark = [40, 40, 40] as const;

  // Header
  doc.setFillColor(...gold);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AS Apt. — INVOICE', 15, 22);

  // Tenant info
  let y = 50;
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tenant:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(bill.tenantName, 55, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Unit:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(bill.unitLabel, 55, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Period:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${MONTHS[bill.month - 1]} ${bill.year}`, 55, y);

  // Bill details
  y += 15;
  doc.setFillColor(245, 245, 240);
  doc.rect(15, y, 180, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Type', 20, y + 7);
  doc.text('Amount (Birr)', 140, y + 7);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.text(bill.type.charAt(0).toUpperCase() + bill.type.slice(1), 20, y + 5);
  doc.text(bill.amount.toLocaleString(), 140, y + 5);

  if (bill.type === 'electricity' && bill.kwh && bill.rate) {
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`kWh: ${bill.kwh} × Rate: ${bill.rate} + fees & taxes`, 20, y + 5);
    doc.setTextColor(...dark);
  }

  // Total
  y += 15;
  doc.setDrawColor(...gold);
  doc.line(15, y, 195, y);
  y += 8;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 20, y + 5);
  doc.text(`${bill.amount.toLocaleString()} Birr`, 140, y + 5);

  // Status
  y += 20;
  doc.setTextColor(220, 50, 50);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS: PENDING PAYMENT', 15, y);

  // Payment instructions
  y += 15;
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Instructions:', 15, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const payConfig = bill.type === 'rent' ? PAYMENT_CONFIG.rent : PAYMENT_CONFIG.utilities;
  doc.text(`Method: ${payConfig.method}`, 20, y);
  y += 6;
  doc.text(`Account Name: ${payConfig.accountName}`, 20, y);
  y += 6;
  doc.text(`Account Number: ${payConfig.accountNumber}`, 20, y);

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('Powered by NUN Tech', 105, 285, { align: 'center' });

  doc.save(`Invoice_${bill.tenantName}_${MONTHS[bill.month - 1]}_${bill.year}.pdf`);
}

export function generateReceiptPDF(bill: Bill) {
  const doc = new jsPDF();
  const gold = [212, 175, 55] as const;
  const dark = [40, 40, 40] as const;
  const green = [34, 139, 34] as const;

  // Header
  doc.setFillColor(...gold);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AS Apt. — RECEIPT', 15, 22);

  // Tenant info
  let y = 50;
  doc.setTextColor(...dark);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Tenant:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(bill.tenantName, 55, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Unit:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(bill.unitLabel, 55, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.text('Period:', 15, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${MONTHS[bill.month - 1]} ${bill.year}`, 55, y);

  // Bill details
  y += 15;
  doc.setFillColor(245, 245, 240);
  doc.rect(15, y, 180, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Type', 20, y + 7);
  doc.text('Amount (Birr)', 140, y + 7);
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.text(bill.type.charAt(0).toUpperCase() + bill.type.slice(1), 20, y + 5);
  doc.text(bill.amount.toLocaleString(), 140, y + 5);

  // Total
  y += 15;
  doc.setDrawColor(...gold);
  doc.line(15, y, 195, y);
  y += 8;
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 20, y + 5);
  doc.text(`${bill.amount.toLocaleString()} Birr`, 140, y + 5);

  // PAID status
  y += 20;
  doc.setTextColor(...green);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS: PAID', 15, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment successfully received. Thank you!', 15, y);

  // Diagonal PAID stamp
  doc.setTextColor(34, 139, 34);
  doc.setFontSize(60);
  doc.setFont('helvetica', 'bold');
  doc.saveGraphicsState();
  const gState = (doc as any).GState({ opacity: 0.15 });
  doc.setGState(gState);
  doc.text('PAID', 50, 180, { angle: 45 });
  doc.restoreGraphicsState();

  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('Powered by NUN Tech', 105, 285, { align: 'center' });

  doc.save(`Receipt_${bill.tenantName}_${MONTHS[bill.month - 1]}_${bill.year}.pdf`);
}

export function generateRevenueReportPDF(
  rentTotal: number,
  electricityTotal: number,
  waterTotal: number,
  period?: string
) {
  const doc = new jsPDF();
  const gold = [212, 175, 55] as const;
  const dark = [40, 40, 40] as const;

  doc.setFillColor(...gold);
  doc.rect(0, 0, 210, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('AS Apt. — Revenue Report', 15, 22);

  let y = 50;
  if (period) {
    doc.setTextColor(...dark);
    doc.setFontSize(11);
    doc.text(`Period: ${period}`, 15, y);
    y += 12;
  }

  doc.setTextColor(...dark);
  doc.setFontSize(12);

  // Table
  doc.setFillColor(245, 245, 240);
  doc.rect(15, y, 180, 10, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Category', 20, y + 7);
  doc.text('Amount (Birr)', 140, y + 7);

  y += 14;
  doc.setFont('helvetica', 'normal');
  doc.text('Rent', 20, y); doc.text(rentTotal.toLocaleString(), 140, y); y += 8;
  doc.text('Electricity', 20, y); doc.text(electricityTotal.toLocaleString(), 140, y); y += 8;
  doc.text('Water', 20, y); doc.text(waterTotal.toLocaleString(), 140, y);

  y += 12;
  doc.setDrawColor(...gold);
  doc.line(15, y, 195, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const total = rentTotal + electricityTotal + waterTotal;
  doc.text('Total Revenue:', 20, y);
  doc.text(`${total.toLocaleString()} Birr`, 140, y);

  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('Powered by NUN Tech', 105, 285, { align: 'center' });

  doc.save('Revenue_Report.pdf');
}
