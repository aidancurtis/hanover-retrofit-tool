import { jsPDF } from "jspdf";
import { UserDetails, RetrofitCategory } from "../types";

export function generateRetrofitPDF(
    details: UserDetails,
    retrofitOptions: RetrofitCategory[],
) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    const checkPageBreak = (spaceNeeded: number) => {
        if (yPosition + spaceNeeded > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    };

    const wrapText = (text: string, maxWidth: number) => {
        return doc.splitTextToSize(text, maxWidth);
    };

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Energy Retrofit Recommendations", margin, yPosition);
    yPosition += 10;

    // Date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    doc.text(`Generated: ${date}`, margin, yPosition);
    yPosition += 15;
    doc.setTextColor(0);

    // House Details Section
    const house = details.houseDetails;
    if (house) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Your Home Details", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const homeDetails = [
            `Square Footage: ${house.squareFootage ?? "N/A"} sq ft`,
            `Year Built: ${house.yearBuilt ?? "N/A"}`,
            `Annual Energy Consumption: ${house.annualEnergyConsumption ?? "N/A"} kWh`,
            `Annual Electricity Consumption: ${house.annualElectricityConsumption ?? "N/A"} kWh`,
            `Annual Utility Bill: $${house.annualUtilityBill ?? "N/A"}`,
        ];

        if (house.fuelConsumption) {
            const fuel = house.fuelConsumption;
            if (fuel.electricity != null)
                homeDetails.push(`Electricity: ${fuel.electricity} kWh`);
            if (fuel.naturalGas != null)
                homeDetails.push(`Natural Gas: ${fuel.naturalGas} therms`);
            if (fuel.heatingOil != null)
                homeDetails.push(`Heating Oil: ${fuel.heatingOil} gallons`);
            if (fuel.propane != null)
                homeDetails.push(`Propane: ${fuel.propane} gallons`);
            if (fuel.wood != null) homeDetails.push(`Wood: ${fuel.wood} cords`);
        }

        homeDetails.forEach((detail) => {
            doc.text(detail, margin, yPosition);
            yPosition += 6;
        });

        yPosition += 10;
    }

    // User Preferences Section
    const prefs = details.preferences;
    if (prefs) {
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Your Preferences", margin, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const preferenceDetails = [
            `Energy Consumption Priority: ${prefs.energyConsumption ?? "N/A"}`,
            `Emissions Priority: ${prefs.emissions ?? "N/A"}`,
            `Operating Cost Priority: ${prefs.operatingCost ?? "N/A"}`,
            `Upfront Cost Priority: ${prefs.upfrontCost ?? "N/A"}`,
            `Payback Period Priority: ${prefs.paybackPeriod ?? "N/A"}`,
            `Comfort Priority: ${prefs.comfort ?? "N/A"}`,
            `Timeline Priority: ${prefs.timeline ?? "N/A"}`,
            `Invasiveness Priority: ${prefs.invasiveness ?? "N/A"}`,
        ];

        preferenceDetails.forEach((detail) => {
            doc.text(detail, margin, yPosition);
            yPosition += 6;
        });

        yPosition += 15;
    }

    // Retrofit Categories
    retrofitOptions.forEach((option) => {
        checkPageBreak(50);

        // Category Header
        doc.setFillColor(220, 252, 231);
        doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 20, "F");

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text(option.title, margin + 5, yPosition);
        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const descLines = wrapText(option.description, pageWidth - 2 * margin - 10);
        descLines.forEach((line: string) => {
            doc.text(line, margin + 5, yPosition);
            yPosition += 5;
        });

        yPosition += 10;

        // Individual Retrofits
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Recommended Retrofits:", margin, yPosition);
        yPosition += 8;

        option.includedRetrofits.forEach((retrofit, retrofitIndex) => {
            checkPageBreak(40);

            // Retrofit title
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text(
                `${retrofitIndex + 1}. ${retrofit.title}`,
                margin + 5,
                yPosition,
            );
            yPosition += 6;

            // Retrofit description
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            const retrofitDescLines = wrapText(
                retrofit.description,
                pageWidth - 2 * margin - 10,
            );
            retrofitDescLines.forEach((line: string) => {
                doc.text(line, margin + 5, yPosition);
                yPosition += 5;
            });
            yPosition += 3;

            // Contractors
            if (retrofit.contractors.length > 0) {
                doc.setFontSize(10);
                doc.setFont("helvetica", "bold");
                doc.text("Local Contractors:", margin + 5, yPosition);
                yPosition += 6;

                retrofit.contractors.forEach((contractor) => {
                    checkPageBreak(20);

                    doc.setFontSize(9);
                    doc.setFont("helvetica", "bold");
                    doc.text(contractor.name, margin + 10, yPosition);
                    yPosition += 5;

                    doc.setFont("helvetica", "normal");
                    doc.text(`Phone: ${contractor.number}`, margin + 10, yPosition);
                    yPosition += 4;
                    doc.text(`Address: ${contractor.address}`, margin + 10, yPosition);
                    yPosition += 4;
                    doc.text(`Website: ${contractor.website}`, margin + 10, yPosition);
                    yPosition += 6;
                });
            }

            yPosition += 5;
        });

        yPosition += 10;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
        "This report is for informational purposes only. Please consult with qualified contractors for accurate quotes.",
        margin,
        pageHeight - 10,
    );

    doc.save(`energy-retrofit-recommendations-${new Date().getTime()}.pdf`);
}
