export async function downloadCardPDF(elementId: string, fileName: string) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const jsPDF = (await import("jspdf")).default;

  const nama = element.querySelector(".card-name")?.textContent || "";
  const detail = element.querySelectorAll(".detail-value");

  const ekskul = detail[0]?.textContent || "";
  const kelas = detail[1]?.textContent || "";
  const memberId = detail[2]?.textContent || "";

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [210, 130],
  });

  pdf.setFontSize(16);
  pdf.text("Kartu Anggota Ekskul", 10, 20);

  pdf.setFontSize(12);
  pdf.text(`Nama: ${nama}`, 10, 40);
  pdf.text(`Ekskul: ${ekskul}`, 10, 55);
  pdf.text(`Kelas: ${kelas}`, 10, 70);
  pdf.text(`ID: ${memberId}`, 10, 85);

  pdf.save(`Kartu-${fileName}.pdf`);
}