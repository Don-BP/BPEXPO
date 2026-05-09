import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LessonPlan, MaterialItem } from './types';
import { JAPANESE_FONT_BASE64 } from './japaneseFont';

export const generateLessonPDF = (plan: LessonPlan) => {
    // 1. Create Document
    const doc = new jsPDF();

    // -- FONT REGISTRATION --
    // Add Japanese Unicode font
    doc.addFileToVFS('NotoSansJP-Regular.ttf', JAPANESE_FONT_BASE64);
    doc.addFont('NotoSansJP-Regular.ttf', 'NotoSansJP', 'normal');
    doc.setFont('NotoSansJP');

    // -- BRANDING COLORS --
    // FIX: Explicitly type these as tuples [r, g, b] for jspdf-autotable
    const PRIMARY_COLOR: [number, number, number] = [13, 148, 136]; // Teal-600 (#0d9488)
    const ACCENT_COLOR: [number, number, number] = [240, 253, 250]; // Teal-50 (#f0fdfa)
    const TEXT_COLOR: [number, number, number] = [51, 65, 85];      // Slate-700 (#334155)

    // -- HEADER --
    // Teal Background Bar
    doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.rect(0, 0, 210, 40, 'F');

    // Title (White Text)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("NotoSansJP", "bold");
    doc.text("SPARKS Lesson Plan", 14, 20);

    doc.setFontSize(12);
    doc.setFont("NotoSansJP", "normal");
    doc.text("Official Lesson Document", 14, 28);

    // -- META INFO GRID (Below Header) --
    let y = 50;
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
    doc.setFontSize(10);

    // Column 1
    doc.setFont("NotoSansJP", "bold");
    doc.text("School:", 14, y);
    doc.setFont("NotoSansJP", "normal");
    doc.text(plan.meta.school || "N/A", 35, y);

    doc.setFont("NotoSansJP", "bold");
    doc.text("Class:", 14, y + 6);
    doc.setFont("NotoSansJP", "normal");
    doc.text(`${plan.meta.grade} (${plan.meta.classSize || '?'} students)`, 35, y + 6);

    // Column 2
    doc.setFont("NotoSansJP", "bold");
    doc.text("ALT:", 90, y);
    doc.setFont("NotoSansJP", "normal");
    doc.text(plan.meta.alt || "N/A", 105, y);

    doc.setFont("NotoSansJP", "bold");
    doc.text("Teacher 2:", 90, y + 6);
    doc.setFont("NotoSansJP", "normal");
    doc.text(plan.meta.teacher2 || "N/A", 115, y + 6);

    // Column 3
    doc.setFont("NotoSansJP", "bold");
    doc.text("Date:", 150, y);
    doc.setFont("NotoSansJP", "normal");
    doc.text(plan.meta.date ? new Date(plan.meta.date).toLocaleDateString() : "N/A", 165, y);

    doc.setFont("NotoSansJP", "bold");
    doc.text("Duration:", 150, y + 6);
    doc.setFont("NotoSansJP", "normal");
    doc.text(`${plan.meta.duration || 45} min`, 165, y + 6);

    // -- MAIN LESSON CONTEXT --
    y += 18;

    // Draw Box for Context
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(14, y, 182, 35, 3, 3, 'FD');

    y += 8;
    doc.setFontSize(14);
    doc.setFont("NotoSansJP", "bold");
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.text(plan.title, 18, y);

    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);

    // Target
    doc.setFont("NotoSansJP", "bold");
    doc.text("Target Language:", 18, y);
    doc.setFont("NotoSansJP", "normal");

    // Handle long target text wrapping
    const targetLines = doc.splitTextToSize(plan.target, 140);
    doc.text(targetLines, 55, y);

    y += (targetLines.length * 5) + 2;

    // Goal
    doc.setFont("NotoSansJP", "bold");
    doc.text("Lesson Goal:", 18, y);
    doc.setFont("NotoSansJP", "normal");
    const goalLines = doc.splitTextToSize(plan.smart_goal, 140);
    doc.text(goalLines, 55, y);

    y += 15;

    // -- MATERIALS SECTION --
    y += 10;
    doc.setFontSize(12);
    doc.setFont("NotoSansJP", "bold");
    doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
    doc.text("Materials", 14, y);

    doc.setFontSize(10);
    doc.setFont("NotoSansJP", "normal");
    doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);

    const materialList = plan.materials.map((m: string | MaterialItem) =>
        typeof m === 'string' ? m : `${m.name} (${m.status})`
    ).join(", ");

    const splitMaterials = doc.splitTextToSize(materialList, 180);
    doc.text(splitMaterials, 14, y + 6);

    y += 15 + (splitMaterials.length * 5);

    // -- LESSON FLOW TABLE --
    const tableData = plan.sections.map(s => [
        `${s.time} min`,
        s.phase,
        s.activity + (s.instructions ? `\n\n${s.instructions}` : ''), // Combine activity + instructions
        `ALT: ${s.altRole}\nTeacher 2: ${s.teacher2Role}`
    ]);

    autoTable(doc, {
        startY: y,
        head: [['Time', 'Phase', 'Activity / Procedure', 'Roles']],
        body: tableData,
        theme: 'grid',
        headStyles: {
            fillColor: PRIMARY_COLOR,
            textColor: 255,
            fontStyle: 'bold',
            font: 'NotoSansJP'
        },
        styles: {
            font: 'NotoSansJP',
            fontSize: 9,
            cellPadding: 4,
            valign: 'top',
            overflow: 'linebreak'
        },
        columnStyles: {
            0: { cellWidth: 20, fontStyle: 'bold' }, // Time
            1: { cellWidth: 30, fontStyle: 'bold' }, // Phase
            2: { cellWidth: 'auto' },                // Activity
            3: { cellWidth: 40, fontSize: 8 }        // Roles
        },
        alternateRowStyles: {
            fillColor: ACCENT_COLOR
        }
    });

    // -- FOOTER NOTES --
    // Get Y position after table
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    if (plan.cultural_note) {
        doc.setFont("NotoSansJP", "bold");
        doc.setFontSize(10);
        doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
        doc.text("Cultural Note:", 14, finalY);

        doc.setFont("NotoSansJP", "normal");
        doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
        const noteLines = doc.splitTextToSize(plan.cultural_note, 180);
        doc.text(noteLines, 14, finalY + 6);
    }

    // Save the PDF
    const filename = `${plan.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_lesson_plan.pdf`;
    doc.save(filename);
};