const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const TAX_BRACKETS = [
  {
    min: 0,
    max: 800000,
    rate: 0,
    label: "₦0 - ₦800,000",
    description: "0% (exempt)",
  },
  {
    min: 800001,
    max: 3000000,
    rate: 15,
    label: "₦800,001 - ₦3,000,000",
    description: "15%",
  },
  {
    min: 3000001,
    max: 12000000,
    rate: 18,
    label: "₦3,000,001 - ₦12,000,000",
    description: "18%",
  },
  {
    min: 12000001,
    max: 25000000,
    rate: 21,
    label: "₦12,000,001 - ₦25,000,000",
    description: "21%",
  },
  {
    min: 25000001,
    max: 50000000,
    rate: 24,
    label: "₦25,000,001 - ₦50,000,000",
    description: "24%",
  },
  {
    min: 50000001,
    max: Infinity,
    rate: 25,
    label: "Above ₦50,000,000",
    description: "25%",
  },
];

let monthlyIncomes = {};
let currentMonthIndex = 0;

function getTaxBracket(income) {
  console.log(
    `[Tax Calculator] Calculating tax for income: ₦${income.toLocaleString()}`,
  );
  return TAX_BRACKETS.find((b) => income >= b.min && income <= b.max);
}

function formatCurrency(amount) {
  return "₦" + amount.toLocaleString();
}

function updateMonthDisplay() {
  const month = MONTHS[currentMonthIndex];
  document.getElementById("monthHeading").textContent = month;
  document.getElementById("currentMonth").textContent = month;
  console.log(`[Tax Calculator] Current month: ${month}`);
}

function addIncomeToList(month, amount) {
  const list = document.getElementById("monthList");
  const li = document.createElement("li");
  li.innerHTML = `<strong>${month}:</strong> ${formatCurrency(amount)}`;
  list.appendChild(li);
  console.log(`[Tax Calculator] Added ${month}: ₦${amount.toLocaleString()}`);
}

function handleNext() {
  const incomeInput = document.getElementById("income");
  const amount = Number(incomeInput.value.trim());

  if (isNaN(amount) || amount < 0) {
    console.error(`[Tax Calculator] Invalid income: ${incomeInput.value}`);
    alert("Please enter a valid positive number");
    return;
  }

  const month = MONTHS[currentMonthIndex];
  monthlyIncomes[month] = amount;
  addIncomeToList(month, amount);
  incomeInput.value = "";
  currentMonthIndex++;

  if (currentMonthIndex >= MONTHS.length) {
    showCalculateButton();
  } else {
    updateMonthDisplay();
  }
}

function showCalculateButton() {
  const monthlyInput = document.querySelector(".monthly-input");
  monthlyInput.innerHTML =
    '<button id="calculateBtn">Calculate Annual Tax</button>';
  document
    .getElementById("calculateBtn")
    .addEventListener("click", calculateAnnualTax);
  console.log(
    "[Tax Calculator] All months completed, showing calculate button",
  );
}

function calculateAnnualTax() {
  const totalIncome = Object.values(monthlyIncomes).reduce(
    (sum, val) => sum + val,
    0,
  );
  console.log(
    `[Tax Calculator] Total annual income: ₦${totalIncome.toLocaleString()}`,
  );

  document.getElementById("enteredMonths").style.display = "none";
  const results = document.getElementById("results");
  results.style.display = "block";

  document.getElementById("annualIncome").textContent =
    `Annual Income: ${formatCurrency(totalIncome)}`;

  const bracket = getTaxBracket(totalIncome);
  if (bracket) {
    document.getElementById("taxBracket").textContent =
      `Your Selected Tax Bracket: ${bracket.label} (${bracket.description})`;
  }

  const taxResult = computeTax(totalIncome);
  document.getElementById("taxAmount").textContent =
    `Tax Amount: ${formatCurrency(taxResult.totalTax)}`;
  console.log(
    `[Tax Calculator] Total tax: ₦${taxResult.totalTax.toLocaleString()}`,
  );
}

function computeTax(income) {
  let remainingIncome = income;
  let totalTax = 0;
  const breakdown = [];

  for (const bracket of TAX_BRACKETS) {
    if (remainingIncome <= 0) break;
    const bracketSize = bracket.max - bracket.min + 1;
    const taxableInBracket = Math.min(remainingIncome, bracketSize);
    const taxInBracket = (taxableInBracket * bracket.rate) / 100;

    if (taxableInBracket > 0) {
      breakdown.push({
        label: bracket.label,
        rate: bracket.rate,
        taxableAmount: taxableInBracket,
        tax: taxInBracket,
      });
    }
    totalTax += taxInBracket;
    remainingIncome -= taxableInBracket;
  }

  console.log("[Tax Calculator] Tax breakdown:", breakdown);
  return { totalTax, breakdown };
}

document.getElementById("nextBtn").addEventListener("click", handleNext);
document.getElementById("income").addEventListener("keypress", function (e) {
  if (e.key === "Enter") handleNext();
});

console.log("[Tax Calculator] Application initialized");
console.log("[Tax Calculator] Tax brackets loaded:", TAX_BRACKETS.length);
