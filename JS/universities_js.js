"use strict";

const API_URL = "http://universities.hipolabs.com/search?country=Romania";
const FALLBACK_URL = "https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json";
const statusElement = document.getElementById("status");
const tbody = document.getElementById("tbody");
const queryInput = document.getElementById("q");
const exportButton = document.getElementById("export-csv");
let allUniversities = [];

function setStatus(message) {
    statusElement.textContent = message;
}

function render(universities) {
    tbody.replaceChildren();

    if (universities.length === 0) {
        const row = document.createElement("tr");
        row.className = "empty-row";
        const cell = document.createElement("td");
        cell.colSpan = 3;
        cell.textContent = allUniversities.length ? "Nu există universități care să corespundă filtrului." : "Nu există rezultate de afișat.";
        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    const rows = document.createDocumentFragment();
    universities.forEach((university) => {
        const row = document.createElement("tr");
        const nameCell = document.createElement("td");
        const countryCell = document.createElement("td");
        const websiteCell = document.createElement("td");
        nameCell.textContent = university.name || "—";
        countryCell.textContent = university.country || "—";

        const website = university.web_pages?.[0];
        if (website) {
            try {
                const url = new URL(website);
                if (url.protocol === "http:" || url.protocol === "https:") {
                    const link = document.createElement("a");
                    link.href = url.href;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.textContent = website;
                    websiteCell.appendChild(link);
                }
            } catch {
                // Ignore malformed URLs and leave the site cell empty.
            }
        }

        row.append(nameCell, countryCell, websiteCell);
        rows.appendChild(row);
    });
    tbody.appendChild(rows);
}

async function loadUniversities() {
    setStatus("Se \u00eencarc\u0103 universitățile…");
    let usingFallback = false;
    try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 7000);
        let response;
        try {
            response = await fetch(API_URL, { headers: { Accept: "application/json" }, signal: controller.signal });
        } finally {
            window.clearTimeout(timeout);
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error("API-ul nu a returnat rezultate");
        allUniversities = data;
    } catch (error) {
        console.warn("API-ul universităților nu a răspuns; se \u00eencearc\u0103 lista publică de rezervă:", error);
        setStatus("API-ul nu răspunde. Se \u00eencearc\u0103 sursa de rezervă…");
        try {
            const response = await fetch(FALLBACK_URL, { headers: { Accept: "application/json" } });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Răspuns de rezervă invalid");
            allUniversities = data.filter((university) =>
                (university.country || "").toLocaleLowerCase("ro") === "romania" || university.alpha_two_code === "RO"
            );
            usingFallback = true;
        } catch (fallbackError) {
            console.error("Nu s-a putut încărca nici sursa de rezervă:", fallbackError);
            render([]);
            setStatus(`Încărcarea a eșuat. API: ${error.message}. Sursă de rezervă: ${fallbackError.message}.`);
            return;
        }
    }

    const filtered = getFilteredUniversities();
    render(filtered);
    const sourceNote = usingFallback ? " (sursă de rezervă)" : "";
    setStatus(queryInput.value.trim()
        ? `Filtrate: ${filtered.length} din ${allUniversities.length} universități${sourceNote}.`
        : `Încărcat: ${allUniversities.length} universități${sourceNote}.`);
}

function getFilteredUniversities() {
    const query = queryInput.value.trim().toLocaleLowerCase("ro");
    return query
        ? allUniversities.filter((university) => (university.name || "").toLocaleLowerCase("ro").includes(query))
        : allUniversities;
}

queryInput.addEventListener("input", () => {
    const filtered = getFilteredUniversities();
    render(filtered);
    setStatus(`Filtrate: ${filtered.length} din ${allUniversities.length} universități.`);
});

function exportCSV(universities) {
    if (!universities.length) {
        window.alert("Nu există date de exportat.");
        return;
    }

    const header = ["Nume", "Țara", "Site"];
    const rows = universities.map((university) => [
        university.name || "",
        university.country || "",
        university.web_pages?.[0] || ""
    ]);
    const csvContent = [header, ...rows]
        .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
        .join("\r\n");
    const blob = new Blob(["\uFEFF", csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "universitati-romania.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

exportButton.addEventListener("click", () => exportCSV(getFilteredUniversities()));
loadUniversities();

