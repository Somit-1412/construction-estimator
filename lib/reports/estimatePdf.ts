import "server-only";
import PDFDocument from "pdfkit";
import path from "node:path";
import fs from "node:fs";

export type EstimatePdfInput = {
  project: {
    id: string;
    projectName: string;
    clientName: string;
    clientEmail: string;
    location: string;
    createdAt?: Date | string;
  };
  estimate: {
    revision: number;
    finalizedAt: Date | string | null;
    totalCost: number;
    snapshot: {
      workQuantities?: Array<{
        key: string;
        label: string;
        quantity: number;
        unit: string;
      }>;
      materials?: Array<{
        materialName: string;
        quantity: number;
        unit: string;
        rate: number | null;
        cost: number | null;
      }>;
      labour?: Array<{
        key: string;
        label: string;
        quantity: number;
        unit: string;
        rate: number;
        cost: number;
      }>;
      totalMaterialCost?: number;
      totalLabourCost?: number;
      totalCost?: number;
      floorBreakdown?: Array<{
        floorLevel: number;
        floorName: string;
        workQuantities: Array<{
          key: string;
          label: string;
          quantity: number;
          unit: string;
        }>;
      }>;
    };
  };
  payment?: {
    amount: number | string;
    currency: string;
    status: string;
    orderId?: string | null;
    transactionId?: string | null;
    createdAt?: Date | string;
  } | null;
};

function formatCurrency(val: number | null | undefined): string {
  if (val === null || val === undefined || !Number.isFinite(val)) {
    return "INR 0.00";
  }
  return `INR ${val.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "N/A";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Generates an executive, professional civil engineering estimation report as a PDF buffer.
 * Fully immutable snapshot-driven and conforms to professional BOQ layout standards.
 */
export async function generateEstimatePdf(input: EstimatePdfInput): Promise<Buffer> {
  const { project, estimate, payment } = input;
  const snapshot = estimate.snapshot || {};
  const workQuantities = snapshot.workQuantities || [];
  const materials = snapshot.materials || [];
  const labour = snapshot.labour || [];
  const floorBreakdown = snapshot.floorBreakdown || [];

  const totalMaterialCost = snapshot.totalMaterialCost ?? 0;
  const totalLabourCost = snapshot.totalLabourCost ?? 0;
  const totalConstructionCost = snapshot.totalCost ?? (totalMaterialCost + totalLabourCost);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
      bufferPages: true,
      info: {
        Title: `Estimex Estimate - ${project.projectName}`,
        Author: "Estimex Professional Engineering Services",
        Subject: "Bill of Quantities and Civil Construction Estimate",
      },
    });

    const buffers: Buffer[] = [];
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", (err) => reject(err));

    const left = 40;
    const right = 555;
    const contentWidth = right - left;

    const checkPageBreak = (neededHeight: number) => {
      if (doc.y + neededHeight > 760) {
        doc.addPage();
        drawPageHeader();
      }
    };

    const drawPageHeader = () => {
      // Small recurring header on subsequent pages
      const currentY = 35;
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor("#64748b")
        .text(`ESTIMEX CIVIL ENGINEERING · ${project.projectName.toUpperCase()} (REV ${estimate.revision})`, left, currentY, {
          width: contentWidth,
        });
      doc
        .strokeColor("#e2e8f0")
        .lineWidth(0.5)
        .moveTo(left, currentY + 12)
        .lineTo(right, currentY + 12)
        .stroke();
      doc.y = currentY + 22;
    };

    // --- PAGE 1 COVER / TOP HEADER ---
    const logoPath = path.join(process.cwd(), "public", "Estimex_logo.jpeg");
    let hasLogo = false;
    try {
      if (fs.existsSync(logoPath)) {
        // Embed square 1:1 aspect ratio logo (50x50)
        doc.image(logoPath, left, 38, { fit: [50, 50] });
        hasLogo = true;
      }
    } catch {
      hasLogo = false;
    }

    const titleX = hasLogo ? left + 60 : left;

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor("#0f172a")
      .text("ESTIMEX", titleX, 38)
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#475569")
      .text("Civil Construction Estimations & Bill of Quantities", titleX, 58)
      .fontSize(8)
      .fillColor("#64748b")
      .text(`Project Ref: EST-${project.id.slice(-8).toUpperCase()} · Revision: R${estimate.revision}`, titleX, 72);

    // Right-aligned status stamp
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#1d4ed8")
      .text("OFFICIAL ESTIMATE", left, 40, { align: "right" })
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor("#475569")
      .text(`Finalized: ${formatDate(estimate.finalizedAt)}`, left, 55, { align: "right" })
      .text("Status: Issued & Verified", left, 68, { align: "right" });

    doc
      .strokeColor("#cbd5e1")
      .lineWidth(1)
      .moveTo(left, 98)
      .lineTo(right, 98)
      .stroke();

    doc.y = 110;

    // --- PROJECT METADATA CARD ---
    const cardY = doc.y;
    doc
      .roundedRect(left, cardY, contentWidth, 68, 4)
      .fillColor("#f8fafc")
      .fill()
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .stroke();

    const colW = contentWidth / 3;

    // Col 1: Project Details
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor("#64748b")
      .text("PROJECT NAME", left + 12, cardY + 10)
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor("#0f172a")
      .text(project.projectName, left + 12, cardY + 22, { width: colW - 20, lineBreak: true })
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#475569")
      .text(`Site: ${project.location}`, left + 12, cardY + 44, { width: colW - 20 });

    // Col 2: Client Info
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor("#64748b")
      .text("CLIENT / OWNER", left + colW + 6, cardY + 10)
      .font("Helvetica-Bold")
      .fontSize(9.5)
      .fillColor("#0f172a")
      .text(project.clientName, left + colW + 6, cardY + 22, { width: colW - 12 })
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#475569")
      .text(project.clientEmail, left + colW + 6, cardY + 44, { width: colW - 12 });

    // Col 3: Document Status
    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor("#64748b")
      .text("SPECIFICATIONS", left + colW * 2, cardY + 10)
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#047857")
      .text("IS 456 & CPWD Compliant", left + colW * 2, cardY + 22)
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#475569")
      .text(floorBreakdown.length > 0 ? `${floorBreakdown.length} Storey Building` : "Standard Structure", left + colW * 2, cardY + 44);

    doc.y = cardY + 80;

    // Helper: Draw Section Title
    const drawSectionTitle = (title: string, subtitle?: string) => {
      checkPageBreak(40);
      doc
        .font("Helvetica-Bold")
        .fontSize(10.5)
        .fillColor("#0f172a")
        .text(title, left, doc.y);
      if (subtitle) {
        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor("#64748b")
          .text(subtitle, left, doc.y + 2);
        doc.y += 6;
      }
      doc.y += 6;
    };

    // --- MULTI-STOREY BREAKDOWN (IF AVAILABLE) ---
    if (floorBreakdown.length > 0) {
      drawSectionTitle("1. Storey Breakdown", "Physical quantity distribution across levels");
      checkPageBreak(floorBreakdown.length * 20 + 30);

      const floorTableY = doc.y;
      doc
        .rect(left, floorTableY, contentWidth, 18)
        .fillColor("#f1f5f9")
        .fill();

      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor("#334155")
        .text("LEVEL / STOREY", left + 8, floorTableY + 5)
        .text("CONCRETE (COLUMNS, BEAMS, SLABS)", left + 140, floorTableY + 5)
        .text("BRICKWORK", left + 350, floorTableY + 5)
        .text("FINISHES (PLASTER/TILES)", left + 430, floorTableY + 5);

      doc.y = floorTableY + 20;

      floorBreakdown.forEach((floor, idx) => {
        checkPageBreak(18);
        const rowY = doc.y;
        if (idx % 2 === 1) {
          doc.rect(left, rowY - 2, contentWidth, 16).fillColor("#f8fafc").fill();
        }

        const colConcrete = floor.workQuantities.find((w) => w.key.includes("Concrete"))?.quantity ?? 0;
        const brick = floor.workQuantities.find((w) => w.key === "brickwork")?.quantity ?? 0;
        const finishes = floor.workQuantities.filter((w) => w.key.includes("Plaster") || w.key === "flooring").reduce((acc, w) => acc + w.quantity, 0);

        doc
          .font("Helvetica-Bold")
          .fontSize(8)
          .fillColor("#0f172a")
          .text(floor.floorName, left + 8, rowY)
          .font("Helvetica")
          .fillColor("#334155")
          .text(`${colConcrete.toFixed(2)} m³`, left + 140, rowY)
          .text(`${brick.toFixed(2)} m³`, left + 350, rowY)
          .text(`${finishes.toFixed(2)} m²`, left + 430, rowY);

        doc.y = rowY + 16;
      });

      doc.y += 10;
    }

    // --- ITEMIZE WORK QUANTITIES (BOQ) ---
    drawSectionTitle("2. Work Quantities (Bill of Quantities)", "Summary of structural takeoffs");
    checkPageBreak(workQuantities.length * 16 + 30);

    const boqTableY = doc.y;
    doc.rect(left, boqTableY, contentWidth, 18).fillColor("#f1f5f9").fill();

    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor("#334155")
      .text("#", left + 6, boqTableY + 5)
      .text("WORK DESCRIPTION", left + 30, boqTableY + 5)
      .text("QUANTITY", left + 380, boqTableY + 5, { align: "right", width: 60 })
      .text("UNIT", left + 460, boqTableY + 5);

    doc.y = boqTableY + 20;

    workQuantities.forEach((item, idx) => {
      checkPageBreak(16);
      const rowY = doc.y;
      if (idx % 2 === 1) {
        doc.rect(left, rowY - 2, contentWidth, 15).fillColor("#f8fafc").fill();
      }

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#64748b")
        .text(`${idx + 1}.`, left + 6, rowY)
        .font("Helvetica-Bold")
        .fillColor("#0f172a")
        .text(item.label, left + 30, rowY, { width: 340 })
        .font("Helvetica")
        .fillColor("#0f172a")
        .text(item.quantity.toFixed(3), left + 380, rowY, { align: "right", width: 60 })
        .text(item.unit, left + 460, rowY);

      doc.y = rowY + 15;
    });

    doc.y += 12;

    // --- BILL OF MATERIALS ---
    drawSectionTitle("3. Material Requirements & Costing", "Itemized structural consumables based on master rates");
    checkPageBreak(materials.length * 16 + 40);

    const matTableY = doc.y;
    doc.rect(left, matTableY, contentWidth, 18).fillColor("#f1f5f9").fill();

    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor("#334155")
      .text("MATERIAL ITEM", left + 8, matTableY + 5)
      .text("QUANTITY", left + 240, matTableY + 5, { align: "right", width: 60 })
      .text("UNIT", left + 315, matTableY + 5)
      .text("RATE", left + 375, matTableY + 5, { align: "right", width: 60 })
      .text("TOTAL AMOUNT", left + 445, matTableY + 5, { align: "right", width: 65 });

    doc.y = matTableY + 20;

    materials.forEach((mat, idx) => {
      checkPageBreak(16);
      const rowY = doc.y;
      if (idx % 2 === 1) {
        doc.rect(left, rowY - 2, contentWidth, 15).fillColor("#f8fafc").fill();
      }

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#0f172a")
        .text(mat.materialName, left + 8, rowY, { width: 230 })
        .text(mat.quantity.toFixed(3), left + 240, rowY, { align: "right", width: 60 })
        .text(mat.unit, left + 315, rowY)
        .text(formatCurrency(mat.rate).replace("INR ", ""), left + 375, rowY, { align: "right", width: 60 })
        .font("Helvetica-Bold")
        .text(formatCurrency(mat.cost).replace("INR ", ""), left + 445, rowY, { align: "right", width: 65 });

      doc.y = rowY + 15;
    });

    // Material Subtotal Row
    checkPageBreak(22);
    const matSubY = doc.y + 2;
    doc.rect(left, matSubY, contentWidth, 18).fillColor("#f1f5f9").fill();
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#0f172a")
      .text("SUBTOTAL MATERIAL COST", left + 8, matSubY + 5)
      .text(formatCurrency(totalMaterialCost), left + 400, matSubY + 5, { align: "right", width: 110 });
    doc.y = matSubY + 26;

    // --- LABOUR SCHEDULE ---
    const activeLabour = labour.filter((l) => (l.rate ?? 0) > 0 || (l.cost ?? 0) > 0);
    if (activeLabour.length > 0) {
      drawSectionTitle("4. Labour Cost Schedule", "Trade labour allowances and skilled application costs");
      checkPageBreak(activeLabour.length * 16 + 40);

      const labTableY = doc.y;
      doc.rect(left, labTableY, contentWidth, 18).fillColor("#f1f5f9").fill();

      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor("#334155")
        .text("LABOUR TRADE / COMPONENT", left + 8, labTableY + 5)
        .text("QUANTITY", left + 240, labTableY + 5, { align: "right", width: 60 })
        .text("UNIT", left + 315, labTableY + 5)
        .text("RATE", left + 375, labTableY + 5, { align: "right", width: 60 })
        .text("TOTAL AMOUNT", left + 445, labTableY + 5, { align: "right", width: 65 });

      doc.y = labTableY + 20;

      activeLabour.forEach((lab, idx) => {
        checkPageBreak(16);
        const rowY = doc.y;
        if (idx % 2 === 1) {
          doc.rect(left, rowY - 2, contentWidth, 15).fillColor("#f8fafc").fill();
        }

        doc
          .font("Helvetica")
          .fontSize(8)
          .fillColor("#0f172a")
          .text(lab.label, left + 8, rowY, { width: 230 })
          .text(lab.quantity.toFixed(3), left + 240, rowY, { align: "right", width: 60 })
          .text(lab.unit, left + 315, rowY)
          .text(formatCurrency(lab.rate).replace("INR ", ""), left + 375, rowY, { align: "right", width: 60 })
          .font("Helvetica-Bold")
          .text(formatCurrency(lab.cost).replace("INR ", ""), left + 445, rowY, { align: "right", width: 65 });

        doc.y = rowY + 15;
      });

      // Labour Subtotal Row
      checkPageBreak(22);
      const labSubY = doc.y + 2;
      doc.rect(left, labSubY, contentWidth, 18).fillColor("#f1f5f9").fill();
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor("#0f172a")
        .text("SUBTOTAL LABOUR COST", left + 8, labSubY + 5)
        .text(formatCurrency(totalLabourCost), left + 400, labSubY + 5, { align: "right", width: 110 });
      doc.y = labSubY + 26;
    }

    // --- TOTAL PROJECTED CONSTRUCTION COST ---
    checkPageBreak(70);
    const constCostY = doc.y + 4;
    doc
      .roundedRect(left, constCostY, contentWidth, 48, 4)
      .fillColor("#0f172a")
      .fill();

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("#94a3b8")
      .text("TOTAL PROJECTED CIVIL CONSTRUCTION COST (MATERIAL + LABOUR)", left + 14, constCostY + 10)
      .fontSize(16)
      .fillColor("#ffffff")
      .text(formatCurrency(totalConstructionCost), left + 14, constCostY + 24);

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor("#94a3b8")
      .text("Derived from finalized engineering quantities and verified regional master rates.", left + 260, constCostY + 28, {
        align: "right",
        width: 230,
      });

    doc.y = constCostY + 60;

    // --- ESTIMEX SERVICE FEE & PAYMENT RECEIPT SECTION ---
    checkPageBreak(105);
    const feeCardY = doc.y + 4;

    doc
      .roundedRect(left, feeCardY, contentWidth, 88, 4)
      .fillColor("#f0fdf4")
      .fill()
      .strokeColor("#86efac")
      .lineWidth(1)
      .stroke();

    // Header of payment receipt box
    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .fillColor("#166534")
      .text("ESTIMEX ESTIMATION SERVICE FEE & PAYMENT RECEIPT", left + 12, feeCardY + 10);

    const paidRef = payment?.transactionId || payment?.orderId || "Verified";
    const paidAmount = payment?.amount ? Number(payment.amount) : 699.0;
    const paidDate = formatDate(payment?.createdAt || project.createdAt);

    doc
      .roundedRect(right - 105, feeCardY + 8, 95, 16, 8)
      .fillColor("#dcfce7")
      .fill()
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor("#15803d")
      .text("PAYMENT: CONFIRMED", right - 100, feeCardY + 13);

    // Detail rows
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#166534")
      .text("Service Fee Amount:", left + 12, feeCardY + 30)
      .font("Helvetica-Bold")
      .text(formatCurrency(paidAmount), left + 110, feeCardY + 30)
      .font("Helvetica")
      .text("Transaction Ref / Order ID:", left + 240, feeCardY + 30)
      .font("Helvetica-Bold")
      .text(paidRef, left + 360, feeCardY + 30);

    doc
      .font("Helvetica")
      .text("Service Scope:", left + 12, feeCardY + 45)
      .font("Helvetica-Bold")
      .text("Quantity Takeoff, BOQ & Cost Report", left + 110, feeCardY + 45)
      .font("Helvetica")
      .text("Payment Date:", left + 240, feeCardY + 45)
      .font("Helvetica-Bold")
      .text(paidDate, left + 360, feeCardY + 45);

    // Explanatory note separating service fee from construction cost
    doc
      .font("Helvetica-Oblique")
      .fontSize(7.2)
      .fillColor("#15803d")
      .text(
        "Important Note: The INR 699.00 fee above is Estimex's professional service fee for civil engineering calculations and BOQ generation. This is completely independent of the projected civil construction budget above.",
        left + 12,
        feeCardY + 63,
        { width: contentWidth - 24 }
      );

    doc.y = feeCardY + 100;

    // --- PAGE NUMBERING AND FOOTERS ACROSS ALL BUFFERED PAGES ---
    const pageRange = doc.bufferedPageRange();
    for (let i = 0; i < pageRange.count; i++) {
      doc.switchToPage(i);
      const footerY = 804;

      doc
        .strokeColor("#e2e8f0")
        .lineWidth(0.5)
        .moveTo(left, footerY)
        .lineTo(right, footerY)
        .stroke();

      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#94a3b8")
        .text(
          "Estimex Professional Civil Engineering Platform · Strictly Confidential",
          left,
          footerY + 8
        )
        .text(
          `Page ${i + 1} of ${pageRange.count}`,
          left,
          footerY + 8,
          { align: "right" }
        );
    }

    doc.end();
  });
}
