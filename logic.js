const TAX_BRACKETS = [
  { min: 0, max: 800000, rate: 0, label: "₦0 - ₦800,000" },
  { min: 800001, max: 3000000, rate: 15, label: "₦800,001 - ₦3,000,000" },
  { min: 3000001, max: 12000000, rate: 18, label: "₦3,000,001 - ₦12,000,000" },
  {
    min: 12000001,
    max: 25000000,
    rate: 21,
    label: "₦12,000,001 - ₦25,000,000",
  },
  {
    min: 25000001,
    max: 50000000,
    rate: 24,
    label: "₦25,000,001 - ₦50,000,000",
  },
  { min: 50000001, max: Infinity, rate: 25, label: "Above ₦50,000,000" },
];

const RENT_RELIEF_CAP = 500000;
const RENT_RELIEF_RATE = 0.25;
const BONUS_TAX_RATE = 0.1;

let chart = null;
let currentPeriod = "monthly";

function formatCurrency(amount) {
  return "₦" + Math.round(amount).toLocaleString();
}

function parseCurrency(str) {
  if (!str) return 0;
  return parseFloat(str.replace(/[^0-9.-]+/g, "")) || 0;
}

function formatInputNumber(value) {
  if (!value) return "";
  const num = parseCurrency(value);
  if (isNaN(num) || num === 0) return "";
  return num.toLocaleString("en-US");
}

function computeTax(income) {
  let remaining = income;
  let totalTax = 0;
  const breakdown = [];

  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) {
      breakdown.push({ ...bracket, amountInBracket: 0, taxOwed: 0 });
      continue;
    }

    const bracketSize =
      bracket.max === Infinity ? remaining : bracket.max - bracket.min + 1;
    const amountInBracket = Math.min(remaining, bracketSize);
    const taxOwed = (amountInBracket * bracket.rate) / 100;

    breakdown.push({
      ...bracket,
      amountInBracket,
      taxOwed,
    });

    totalTax += taxOwed;
    remaining -= amountInBracket;
  }

  return { totalTax, breakdown };
}

function calculatePensionContribution(income, rate) {
  return (income * rate) / 100;
}

function calculateRentRelief(annualRent) {
  return Math.min(annualRent * RENT_RELIEF_RATE, RENT_RELIEF_CAP);
}

function calculateAll(income, pensionRate, annualRent) {
  const pension = calculatePensionContribution(income, pensionRate);
  const rentRelief = calculateRentRelief(annualRent);
  const totalDeductions = pension + rentRelief;
  const taxableIncome = Math.max(0, income - totalDeductions);
  const { totalTax, breakdown } = computeTax(taxableIncome);
  const netIncome = income - totalTax;
  const effectiveRate = income > 0 ? (totalTax / income) * 100 : 0;

  return {
    grossIncome: income,
    pension,
    rentRelief,
    totalDeductions,
    taxableIncome,
    totalTax,
    netIncome,
    effectiveRate,
    breakdown,
  };
}

function updateResults(results) {
  document.getElementById("grossIncome").textContent = formatCurrency(
    results.grossIncome,
  );
  document.getElementById("totalDeductions").textContent = formatCurrency(
    results.totalDeductions,
  );
  document.getElementById("taxableIncome").textContent = formatCurrency(
    results.taxableIncome,
  );
  document.getElementById("annualTax").textContent = formatCurrency(
    results.totalTax,
  );
  document.getElementById("monthlyTax").textContent = formatCurrency(
    results.totalTax / 12,
  );
  document.getElementById("effectiveRate").textContent =
    results.effectiveRate.toFixed(2) + "%";
  document.getElementById("netIncome").textContent = formatCurrency(
    results.netIncome,
  );
  document.getElementById("monthlyNet").textContent =
    formatCurrency(results.netIncome / 12) + "/month";

  updateBreakdownTable(results.breakdown, results.taxableIncome);
  updateChart(results);
}

function updateBreakdownTable(breakdown, taxableIncome) {
  const tbody = document.getElementById("breakdownBody");
  tbody.innerHTML = "";

  for (const bracket of breakdown) {
    if (bracket.amountInBracket > 0) {
      const row = document.createElement("tr");
      const isActive = bracket.amountInBracket > 0;
      if (isActive) row.classList.add("highlight");

      row.innerHTML = `
        <td>${bracket.label}</td>
        <td>${bracket.rate}%</td>
        <td>${formatCurrency(bracket.amountInBracket)}</td>
        <td>${formatCurrency(bracket.taxOwed)}</td>
      `;
      tbody.appendChild(row);
    }
  }
}

function updateChart(results) {
  const ctx = document.getElementById("breakdownChart").getContext("2d");
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const textColor = isDark ? "#f5f5f5" : "#1a1a1a";
  const gridColor = isDark ? "#475569" : "#e2e8f0";

  if (chart) {
    chart.destroy();
  }

  const data = {
    labels: ["Gross Income", "Tax", "Pension", "Net Take-home"],
    datasets: [
      {
        data: [
          results.grossIncome,
          results.totalTax,
          results.pension,
          results.netIncome,
        ],
        backgroundColor: ["#006233", "#dc2626", "#FFD700", "#22c55e"],
        borderColor: ["#004d29", "#b91c1c", "#cca300", "#16a34a"],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  chart = new Chart(ctx, {
    type: "bar",
    data: data,
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return formatCurrency(context.raw);
            },
          },
        },
      },
      scales: {
        x: {
          ticks: {
            callback: function (value) {
              return formatCurrency(value);
            },
            color: textColor,
            font: { size: 11 },
          },
          grid: {
            color: gridColor,
          },
        },
        y: {
          ticks: {
            color: textColor,
            font: { size: 12, weight: "600" },
          },
          grid: {
            display: false,
          },
        },
      },
    },
  });
}

function showResults() {
  document.getElementById("resultsSection").style.display = "block";
  document.getElementById("comparisonSection").style.display = "block";
  document.getElementById("bonusCard").style.display = "block";
}

function calculate() {
  const incomeInput = document.getElementById("income");
  const pensionInput = document.getElementById("pension");
  const rentInput = document.getElementById("rent");

  const rawIncome = parseCurrency(incomeInput.value);
  const income = currentPeriod === "monthly" ? rawIncome * 12 : rawIncome;
  const pensionRate = parseFloat(pensionInput.value) || 8;
  const annualRent = parseCurrency(rentInput.value);

  if (income <= 0) {
    document.getElementById("resultsSection").style.display = "none";
    document.getElementById("comparisonSection").style.display = "none";
    return;
  }

  const results = calculateAll(income, pensionRate, annualRent);
  showResults();
  updateResults(results);
}

function setupCurrencyInput(input) {
  input.addEventListener("input", function (e) {
    const cursorPos = this.selectionStart;
    const oldLength = this.value.length;

    const cleaned = this.value.replace(/[^0-9]/g, "");
    const formatted = formatInputNumber(cleaned);
    this.value = formatted;

    const newLength = this.value.length;
    const newPos = cursorPos + (newLength - oldLength);
    this.setSelectionRange(newPos, newPos);

    calculate();
  });

  input.addEventListener("focus", function () {
    if (this.value) {
      const cleaned = this.value.replace(/[^0-9]/g, "");
      this.value = cleaned;
      this.setSelectionRange(0, this.value.length);
    }
  });

  input.addEventListener("blur", function () {
    if (this.value) {
      const cleaned = this.value.replace(/[^0-9]/g, "");
      this.value = formatInputNumber(cleaned);
    }
  });
}

function setupPeriodToggle() {
  const toggleBtns = document.querySelectorAll(".toggle-btn");

  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      toggleBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      currentPeriod = this.dataset.value;
      calculate();
    });
  });
}

function setupThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);

  toggle.addEventListener("click", function () {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);

    setTimeout(calculate, 100);
  });
}

function setupCopyButton() {
  document.getElementById("copyBtn").addEventListener("click", function () {
    const income = document.getElementById("grossIncome").textContent;
    const deductions = document.getElementById("totalDeductions").textContent;
    const taxable = document.getElementById("taxableIncome").textContent;
    const tax = document.getElementById("annualTax").textContent;
    const net = document.getElementById("netIncome").textContent;
    const rate = document.getElementById("effectiveRate").textContent;

    const text = `Tax Naija - Tax Summary
====================
Gross Income: ${income}
Total Deductions: ${deductions}
Taxable Income: ${taxable}
Annual Tax: ${tax}
Net Take-home: ${net}
Effective Rate: ${rate}`;

    navigator.clipboard.writeText(text).then(() => {
      showToast("Copied to clipboard!");
    });
  });
}

function showToast(message) {
  const existing = document.querySelector(".copied-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "copied-toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 2500);
}

function setupPdfButton() {
  document.getElementById("pdfBtn").addEventListener("click", function () {
    const element = document.getElementById("resultsSection");
    const opt = {
      margin: 10,
      filename: "tax-naija-summary.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        showToast("PDF downloaded!");
      });
  });
}

function setupResetButton() {
  document.getElementById("resetBtn").addEventListener("click", function () {
    document.getElementById("income").value = "";
    document.getElementById("pension").value = "8";
    document.getElementById("rent").value = "";
    document.getElementById("bonus").value = "";
    document.getElementById("bonusResult").style.display = "none";
    document.getElementById("resultsSection").style.display = "none";
    document.getElementById("comparisonSection").style.display = "none";

    document.getElementById("compareIncome1").value = "";
    document.getElementById("comparePension1").value = "8";
    document.getElementById("compareIncome2").value = "";
    document.getElementById("comparePension2").value = "8";

    if (chart) {
      chart.destroy();
      chart = null;
    }
  });
}

function setupBonusCalculator() {
  const bonusInput = document.getElementById("bonus");

  setupCurrencyInput(bonusInput);

  bonusInput.addEventListener("input", function () {
    const bonusAmount = parseCurrency(this.value);

    if (bonusAmount > 0) {
      const bonusTax = bonusAmount * BONUS_TAX_RATE;
      const netBonus = bonusAmount - bonusTax;

      document.getElementById("grossBonus").textContent =
        formatCurrency(bonusAmount);
      document.getElementById("bonusTax").textContent =
        formatCurrency(bonusTax);
      document.getElementById("netBonus").textContent =
        formatCurrency(netBonus);
      document.getElementById("bonusResult").style.display = "block";
    } else {
      document.getElementById("bonusResult").style.display = "none";
    }
  });
}

function setupComparison() {
  const inputs = [
    "compareIncome1",
    "comparePension1",
    "compareIncome2",
    "comparePension2",
  ];

  inputs.forEach((id) => {
    const el = document.getElementById(id);
    if (id.includes("Income")) {
      setupCurrencyInput(el);
    }

    el.addEventListener("input", updateComparison);
  });
}

function updateComparison() {
  const income1 = parseCurrency(
    document.getElementById("compareIncome1").value,
  );
  const pension1 =
    parseFloat(document.getElementById("comparePension1").value) || 8;
  const income2 = parseCurrency(
    document.getElementById("compareIncome2").value,
  );
  const pension2 =
    parseFloat(document.getElementById("comparePension2").value) || 8;

  if (income1 > 0) {
    const r1 = calculateAll(income1, pension1, 0);
    document.getElementById("compTax1").textContent = formatCurrency(
      r1.totalTax,
    );
    document.getElementById("compNet1").textContent = formatCurrency(
      r1.netIncome,
    );
    document.getElementById("compRate1").textContent =
      r1.effectiveRate.toFixed(2) + "%";
  } else {
    document.getElementById("compTax1").textContent = "₦0";
    document.getElementById("compNet1").textContent = "₦0";
    document.getElementById("compRate1").textContent = "0%";
  }

  if (income2 > 0) {
    const r2 = calculateAll(income2, pension2, 0);
    document.getElementById("compTax2").textContent = formatCurrency(
      r2.totalTax,
    );
    document.getElementById("compNet2").textContent = formatCurrency(
      r2.netIncome,
    );
    document.getElementById("compRate2").textContent =
      r2.effectiveRate.toFixed(2) + "%";
  } else {
    document.getElementById("compTax2").textContent = "₦0";
    document.getElementById("compNet2").textContent = "₦0";
    document.getElementById("compRate2").textContent = "0%";
  }

  const taxDiff =
    income2 > 0 && income1 > 0
      ? Math.abs(
          calculateAll(income2, pension2, 0).totalTax -
            calculateAll(income1, pension1, 0).totalTax,
        )
      : 0;
  const netDiff =
    income2 > 0 && income1 > 0
      ? Math.abs(
          calculateAll(income2, pension2, 0).netIncome -
            calculateAll(income1, pension1, 0).netIncome,
        )
      : 0;

  document.getElementById("diffTax").textContent = formatCurrency(taxDiff);
  document.getElementById("diffNet").textContent = formatCurrency(netDiff);
}

function init() {
  setupCurrencyInput(document.getElementById("income"));
  setupCurrencyInput(document.getElementById("rent"));
  setupPeriodToggle();
  setupThemeToggle();
  setupCopyButton();
  setupPdfButton();
  setupResetButton();
  setupBonusCalculator();
  setupComparison();

  document.getElementById("pension").addEventListener("input", calculate);
  document.getElementById("rent").addEventListener("input", calculate);
}

document.addEventListener("DOMContentLoaded", init);
