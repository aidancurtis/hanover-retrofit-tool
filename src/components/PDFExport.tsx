import { jsPDF } from "jspdf";
import { UserDetails, RetrofitCategory } from "../types";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const COLORS = {
    primary: [22, 101, 52] as [number, number, number], // deep green
    accent: [134, 239, 172] as [number, number, number], // light green
    dark: [15, 23, 42] as [number, number, number], // near-black
    mid: [71, 85, 105] as [number, number, number], // slate-600
    light: [148, 163, 184] as [number, number, number], // slate-400
    muted: [241, 245, 249] as [number, number, number], // slate-100
    white: [255, 255, 255] as [number, number, number],
    divider: [226, 232, 240] as [number, number, number], // slate-200
    tagBg: [220, 252, 231] as [number, number, number], // green-100
    tagText: [21, 128, 61] as [number, number, number], // green-700
};

const FONT = {
    title: { size: 26, style: "bold" },
    h1: { size: 15, style: "bold" },
    h2: { size: 12, style: "bold" },
    h3: { size: 10, style: "bold" },
    body: { size: 9, style: "normal" },
    small: { size: 8, style: "normal" },
    caption: { size: 7, style: "normal" },
};

const M = { left: 20, right: 20, top: 20, bottom: 18 };

export function generateRetrofitPDF(
    details: UserDetails,
    retrofitOptions: RetrofitCategory[],
) {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const PW = doc.internal.pageSize.getWidth(); // 210
    const PH = doc.internal.pageSize.getHeight(); // 297
    const CONTENT = PW - M.left - M.right; // usable width
    let y = 0;

    // ─── Helpers ─────────────────────────────────────────────────────────────

    const rgb = (c: [number, number, number]) => ({ r: c[0], g: c[1], b: c[2] });

    const setFont = (
        size: number,
        style: "bold" | "normal" | "italic" = "normal",
    ) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
    };

    const setColor = (c: [number, number, number]) =>
        doc.setTextColor(c[0], c[1], c[2]);

    const setFill = (c: [number, number, number]) =>
        doc.setFillColor(c[0], c[1], c[2]);

    const setDraw = (c: [number, number, number]) =>
        doc.setDrawColor(c[0], c[1], c[2]);

    const wrap = (text: string, maxW: number) =>
        doc.splitTextToSize(text, maxW) as string[];

    /** Advance y and add a new page if needed. Returns true if page was added. */
    const need = (space: number): boolean => {
        if (y + space > PH - M.bottom) {
            doc.addPage();
            drawPageHeader();
            drawPageFooter();
            y = M.top + 6;
            return true;
        }
        return false;
    };

    const hLine = (yy: number, x1 = M.left, x2 = PW - M.right, lw = 0.2) => {
        doc.setLineWidth(lw);
        setDraw(COLORS.divider);
        doc.line(x1, yy, x2, yy);
    };

    // ─── Repeating page chrome ────────────────────────────────────────────────

    const drawPageFooter = () => {
        setFont(FONT.caption.size);
        setColor(COLORS.light);
        doc.text(
            "This report is for informational purposes only. Consult qualified contractors for accurate quotes.",
            M.left,
            PH - 8,
        );
        const pageNum = `Page ${(doc as any).internal.getNumberOfPages()}`;
        doc.text(pageNum, PW - M.right, PH - 8, { align: "right" });
    };

    const drawPageHeader = () => {
        // Thin green top-bar
        setFill(COLORS.primary);
        doc.rect(0, 0, PW, 4, "F");
    };

    // ─── Cover / Title block ──────────────────────────────────────────────────

    const drawCover = () => {
        drawPageHeader();
        drawPageFooter();

        // Hero background swatch
        setFill(COLORS.muted);
        doc.rect(0, 4, PW, 52, "F");

        // Accent stripe
        setFill(COLORS.primary);
        doc.rect(0, 4, 5, 52, "F");

        // Title
        y = 22;
        setFont(FONT.title.size, "bold");
        setColor(COLORS.dark);
        doc.text("Energy Retrofit", M.left + 8, y);
        y += 10;
        doc.text("Recommendations", M.left + 8, y);

        // Subtitle / date
        y += 8;
        setFont(FONT.small.size);
        setColor(COLORS.mid);
        const date = new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
        doc.text(`Generated ${date}`, M.left + 8, y);

        y = 68; // below hero
    };

    // ─── Section heading ──────────────────────────────────────────────────────

    const sectionHeading = (label: string) => {
        need(16);
        y += 4;
        // small left rule
        setFill(COLORS.primary);
        doc.rect(M.left, y - 4, 3, 10, "F");

        setFont(FONT.h1.size, "bold");
        setColor(COLORS.primary);
        doc.text(label, M.left + 7, y + 3);
        y += 10;
        hLine(y);
        y += 5;
    };

    // ─── Key-value row ────────────────────────────────────────────────────────

    const kvRow = (label: string, value: string, indent = 0) => {
        need(7);
        const x = M.left + indent;
        setFont(FONT.body.size, "bold");
        setColor(COLORS.mid);
        doc.text(label, x, y);

        setFont(FONT.body.size, "normal");
        setColor(COLORS.dark);
        doc.text(value, x + 58, y);
        y += 6;
    };

    // ─── Pill / tag ───────────────────────────────────────────────────────────

    const priorityPill = (
        label: string,
        value: string | number,
        px: number,
        py: number,
        pillW: number,
    ) => {
        const tagH = 14,
            r = 2;
        setFill(COLORS.tagBg);
        doc.roundedRect(px, py, pillW, tagH, r, r, "F");

        setFont(FONT.small.size, "bold");
        setColor(COLORS.tagText);
        doc.text(label.toUpperCase(), px + 4, py + 5);

        setFont(FONT.body.size, "normal");
        setColor(COLORS.dark);
        doc.text(String(value ?? "N/A"), px + 4, py + 11);
    };

    // ─── Retrofit category card ───────────────────────────────────────────────

    const categoryCard = (option: RetrofitCategory) => {
        need(32);

        // Description
        const descLines = wrap(option.description, CONTENT);
        need(descLines.length * 5 + 6);
        setFont(FONT.body.size);
        setColor(COLORS.mid);
        descLines.forEach((line) => {
            doc.text(line, M.left, y);
            y += 5;
        });
        y += 4;

        // Individual retrofits
        option.includedRetrofits.forEach((retrofit, idx) => {
            need(28);

            // Numbered row header
            // Number badge
            setFill(COLORS.accent);
            doc.circle(M.left + 4, y + 1, 4, "F");
            setFont(FONT.h3.size, "bold");
            setColor(COLORS.primary);
            doc.text(String(idx + 1), M.left + 4, y + 2.5, { align: "center" });

            setFont(FONT.h2.size, "bold");
            setColor(COLORS.dark);
            doc.text(retrofit.title, M.left + 11, y + 3);
            y += 9;

            // Description
            const rDescLines = wrap(retrofit.shortDescription, CONTENT - 14);
            need(rDescLines.length * 5 + 4);
            setFont(FONT.body.size);
            setColor(COLORS.mid);
            rDescLines.forEach((line) => {
                doc.text(line, M.left + 11, y);
                y += 5;
            });
            y += 2;

            hLine(y, M.left + 11, PW - M.right);
            y += 6;
        });

        y += 6;
    };

    // ─── Preferences grid ────────────────────────────────────────────────────

    const drawPreferences = (prefs: NonNullable<UserDetails["preferences"]>) => {
        sectionHeading("Your Priorities");

        const items: [string, string | number][] = [
            ["Energy Consumption", prefs.energyConsumption ?? "N/A"],
            ["Emissions", prefs.emissions ?? "N/A"],
            ["Operating Cost", prefs.operatingCost ?? "N/A"],
            ["Upfront Cost", prefs.upfrontCost ?? "N/A"],
            ["Payback Period", prefs.paybackPeriod ?? "N/A"],
            ["Comfort", prefs.comfort ?? "N/A"],
            ["Timeline", prefs.timeline ?? "N/A"],
            ["Invasiveness", prefs.invasiveness ?? "N/A"],
        ];

        const cols = 2;
        const gap = 4;
        const pillW = (CONTENT - gap) / cols;

        items.forEach((item, i) => {
            const col = i % cols;
            const px = M.left + col * (pillW + gap);
            if (col === 0) need(18);
            priorityPill(item[0], item[1], px, y, pillW);
            if (col === cols - 1) y += 18;
        });

        // flush last partial row
        if (items.length % cols !== 0) y += 18;
        y += 4;
    };

    // ─── House details ────────────────────────────────────────────────────────

    const drawHouseDetails = (
        house: NonNullable<UserDetails["houseDetails"]>,
    ) => {
        sectionHeading("Your Home Details");

        kvRow("Square Footage", `${house.squareFootage ?? "N/A"} sq ft`);
        kvRow("Year Built", `${house.yearBuilt ?? "N/A"}`);
        kvRow(
            "Annual Energy Consumption",
            `${house.annualEnergyConsumption ?? "N/A"} kWh`,
        );
        kvRow(
            "Annual Electricity",
            `${house.annualElectricityConsumption ?? "N/A"} kWh`,
        );
        kvRow("Annual Utility Bill", `$${house.annualUtilityBill ?? "N/A"}`);

        if (house.fuelConsumption) {
            const fuel = house.fuelConsumption;
            y += 2;
            setFont(FONT.small.size, "bold");
            setColor(COLORS.mid);
            doc.text("FUEL BREAKDOWN", M.left, y);
            y += 5;

            if (fuel.electricity != null)
                kvRow("Electricity", `${fuel.electricity} kWh`, 4);
            if (fuel.naturalGas != null)
                kvRow("Natural Gas", `${fuel.naturalGas} therms`, 4);
            if (fuel.heatingOil != null)
                kvRow("Heating Oil", `${fuel.heatingOil} gallons`, 4);
            if (fuel.propane != null) kvRow("Propane", `${fuel.propane} gallons`, 4);
            if (fuel.wood != null) kvRow("Wood", `${fuel.wood} cords`, 4);
        }

        y += 6;
    };

    // ─── Build the document ───────────────────────────────────────────────────

    drawCover();

    if (details.houseDetails) drawHouseDetails(details.houseDetails);
    if (details.preferences) drawPreferences(details.preferences);

    if (retrofitOptions.length > 0) {
        doc.addPage();
        drawPageHeader();
        drawPageFooter();
        y = M.top + 6;
        sectionHeading("Retrofit Recommendations");
        retrofitOptions.forEach(categoryCard);
    }

    // ─── Save ─────────────────────────────────────────────────────────────────
    doc.save(`energy-retrofit-recommendations-${Date.now()}.pdf`);
}
