import xlsx from "xlsx";
import fs from "fs";

const workbook = xlsx.readFile("almohsen-sheet.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet);

const normalized = rows.map((row, index) => ({
  uid: `${row["اسم الجد"] || ""}|${row["اسم الأب"] || ""}|${row["الاسم"] || ""}|${index + 1}`,
  generation: row["Id"] ?? null,
  name: row["الاسم"] ?? "",
  fatherName: row["اسم الأب"] ?? null,
  grandfatherName: row["اسم الجد"] ?? null,
}));

fs.writeFileSync("./almohsen-seed.json", JSON.stringify(normalized, null, 2), "utf8");
console.log("almohsen-seed.json created");