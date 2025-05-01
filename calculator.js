// Bank data will be loaded from JSON file
let banks = {};

// Function to load bank data from JSON file
async function loadBankData() {
  try {
    const response = await fetch('tasas_bancarias.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    banks = data.banks;
    
    // Mostrar fecha de última actualización si existe
    if (data.lastUpdated) {
      const lastUpdatedElement = document.createElement('div');
      lastUpdatedElement.className = 'text-muted small';
      lastUpdatedElement.innerHTML = `Tasas actualizadas: ${data.lastUpdated}`;
      document.querySelector('footer .container').appendChild(lastUpdatedElement);
    }
    
    console.log('Datos de bancos cargados correctamente:', banks);
  } catch (error) {
    console.error('Error al cargar los datos de los bancos:', error);
    // Carga de datos de respaldo en caso de error
    banks = {
      "Banco de Occidente": {
        rate: 0.15,
        logoClass: "bi-bank"
      },
      "Caja Social": {
        rate: 0.145,
        logoClass: "bi-house"
      },
      "Credifamilia": {
        rate: 0.16,
        logoClass: "bi-building"
      },
      "BBVA": {
        rate: 0.135,
        logoClass: "bi-bank2"
      },
      "Itaú": {
        rate: 0.14,
        logoClass: "bi-building-fill"
      },
      "Banco de Bogotá": {
        rate: 0.1385,
        logoClass: "bi-bank"
      }
    };
  }
}

// DOM Elements
document.addEventListener('DOMContentLoaded', async function() {
  // Cargar datos de los bancos
  await loadBankData();
  
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Initialize input masks for currency
  const propertyValueInput = document.getElementById('propertyValue');
  const downPaymentInput = document.getElementById('downPayment');
  const loanAmountDisplay = document.getElementById('loanAmount');

  // Format initial values if they exist
  if (propertyValueInput.value) {
    propertyValueInput.value = formatCurrency(propertyValueInput.value);
  }
  
  if (downPaymentInput.value) {
    downPaymentInput.value = formatCurrency(downPaymentInput.value);
  }

  // Add event listeners to input fields
  propertyValueInput.addEventListener('input', function(e) {
    formatInputCurrency(e.target);
    calculateLoanAmount();
  });

  downPaymentInput.addEventListener('input', function(e) {
    formatInputCurrency(e.target);
    calculateLoanAmount();
  });

  const loanTermInput = document.getElementById('loanTerm');
  loanTermInput.addEventListener('input', function() {
    validateLoanTerm();
  });

  // Calculate loan button
  const calculateBtn = document.getElementById('calculateBtn');
  calculateBtn.addEventListener('click', calculateMortgage);

  // Reset form button
  const resetBtn = document.getElementById('resetBtn');
  resetBtn.addEventListener('click', resetForm);
});

// Format a number as Colombian currency
function formatCurrency(value) {
  // Remove non-digit characters
  const num = value.toString().replace(/\D/g, '');
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
}

// Format currency as user types
function formatInputCurrency(input) {
  const cursorPosition = input.selectionStart;
  const oldLength = input.value.length;
  const cleanValue = input.value.replace(/\D/g, '');
  
  if (cleanValue) {
    input.value = formatCurrency(cleanValue);
  } else {
    input.value = '';
  }
  
  // Adjust cursor position
  const newLength = input.value.length;
  const newPosition = cursorPosition + (newLength - oldLength);
  input.setSelectionRange(newPosition, newPosition);
}

// Parse currency string to number
function parseCurrency(value) {
  return parseInt(value.replace(/\D/g, '')) || 0;
}

// Calculate and display loan amount
function calculateLoanAmount() {
  // Obtener valores y asegurarse de que son números
  const propertyValueStr = document.getElementById('propertyValue').value;
  const downPaymentStr = document.getElementById('downPayment').value;
  
  // Parsear estos valores a números, quitando cualquier formato
  const propertyValue = parseCurrency(propertyValueStr);
  const downPayment = parseCurrency(downPaymentStr);
  
  console.log('Valor de propiedad:', propertyValue);
  console.log('Cuota inicial:', downPayment);
  
  // Calculate loan amount
  let loanAmount = propertyValue - downPayment;
  if (loanAmount < 0) loanAmount = 0;
  
  console.log('Monto del préstamo calculado:', loanAmount);
  
  // Update loan amount display
  const loanAmountDisplay = document.getElementById('loanAmount');
  loanAmountDisplay.textContent = formatCurrency(loanAmount);
  
  // Calculate down payment percentage
  const downPaymentPercentage = propertyValue > 0 ? (downPayment / propertyValue * 100).toFixed(1) : 0;
  document.getElementById('downPaymentPercentage').textContent = downPaymentPercentage;
  
  // Validate down payment (should be at least 20% in Colombia)
  const downPaymentFeedback = document.getElementById('downPaymentFeedback');
  if (propertyValue > 0 && downPaymentPercentage < 20) {
    downPaymentFeedback.textContent = 'Se recomienda un mínimo de 20% de cuota inicial';
    downPaymentFeedback.classList.remove('d-none');
  } else {
    downPaymentFeedback.classList.add('d-none');
  }
}

// Validate loan term
function validateLoanTerm() {
  const loanTerm = parseInt(document.getElementById('loanTerm').value);
  const loanTermFeedback = document.getElementById('loanTermFeedback');
  
  if (isNaN(loanTerm) || loanTerm < 5 || loanTerm > 30) {
    loanTermFeedback.textContent = 'El plazo debe estar entre 5 y 30 años';
    loanTermFeedback.classList.remove('d-none');
    return false;
  } else {
    loanTermFeedback.classList.add('d-none');
    return true;
  }
}

// Main calculation function
function calculateMortgage() {
  // Get input values
  const propertyValue = parseCurrency(document.getElementById('propertyValue').value);
  const downPayment = parseCurrency(document.getElementById('downPayment').value);
  const loanTerm = parseInt(document.getElementById('loanTerm').value);
  
  // Validate inputs
  const validationMessages = [];
  
  if (propertyValue <= 0) {
    validationMessages.push('El valor de la vivienda debe ser mayor a cero');
  }
  
  if (downPayment <= 0) {
    validationMessages.push('La cuota inicial debe ser mayor a cero');
  }
  
  if (downPayment >= propertyValue) {
    validationMessages.push('La cuota inicial no puede ser mayor o igual al valor de la vivienda');
  }
  
  if (isNaN(loanTerm) || loanTerm < 5 || loanTerm > 30) {
    validationMessages.push('El plazo debe estar entre 5 y 30 años');
  }
  
  // Display validation errors if any
  const errorContainer = document.getElementById('validationErrors');
  if (validationMessages.length > 0) {
    errorContainer.innerHTML = validationMessages.map(msg => `<div class="alert alert-danger">${msg}</div>`).join('');
    errorContainer.classList.remove('d-none');
    document.getElementById('resultsContainer').classList.add('d-none');
    return;
  }
  
  // Clear previous errors and proceed with calculation
  errorContainer.classList.add('d-none');
  
  // Show loading state
  const calculateBtn = document.getElementById('calculateBtn');
  const originalBtnText = calculateBtn.innerHTML;
  calculateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Calculando...';
  calculateBtn.disabled = true;
  
  // Calculate loan amount
  const loanAmount = propertyValue - downPayment;
  
  // Process bank calculations with a slight delay to show loading state
  setTimeout(() => {
    // Calculate for each bank
    const resultsContainer = document.getElementById('resultsContainer');
    const resultsContent = document.getElementById('resultsContent');
    
    // Clear previous results
    resultsContent.innerHTML = '';
    
    // Sort banks by monthly payment (lowest first)
    const bankResults = [];
    
    // Restricción especial: Si el plazo es mayor a 20 años y el valor del inmueble no supera $213.525.000
    // solo mostramos el Banco de Bogotá
    const mostrarSoloBogota = loanTerm > 20 && propertyValue <= 213525000;
    
    for (const bankName in banks) {
      // Si aplica la restricción especial y no es Banco de Bogotá, saltamos este banco
      if (mostrarSoloBogota && bankName !== "Banco de Bogotá") {
        continue;
      }
      
      const bank = banks[bankName];
      const yearlyRate = bank.rate;
      const monthlyRate = yearlyRate / 12;
      const paymentPeriods = loanTerm * 12;
      
      // Calculate monthly payment using the formula: P = L[c(1+c)^n]/[(1+c)^n-1]
      // Where P = monthly payment, L = loan amount, c = monthly interest rate, n = number of payments
      const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, paymentPeriods)) / (Math.pow(1 + monthlyRate, paymentPeriods) - 1);
      
      // Calculate total interest
      const totalPayment = monthlyPayment * paymentPeriods;
      const totalInterest = totalPayment - loanAmount;
      
      bankResults.push({
        bankName: bankName,
        logoClass: bank.logoClass,
        yearlyRate: yearlyRate,
        rateDescription: bank.rateDescription || "",
        monthlyPayment: monthlyPayment,
        totalPayment: totalPayment,
        totalInterest: totalInterest
      });
    }
    
    // Si no hay resultados (caso raro), mostramos un mensaje de advertencia
    if (bankResults.length === 0) {
      const errorContainer = document.getElementById('validationErrors');
      errorContainer.innerHTML = '<div class="alert alert-warning">No hay bancos disponibles para los criterios seleccionados. Por favor ajusta el plazo o valor del inmueble.</div>';
      errorContainer.classList.remove('d-none');
      document.getElementById('resultsContainer').classList.add('d-none');
      
      // Restore button state
      calculateBtn.innerHTML = originalBtnText;
      calculateBtn.disabled = false;
      return;
    }
    
    // Sort by monthly payment
    bankResults.sort((a, b) => a.monthlyPayment - b.monthlyPayment);
    
    // Create result cards
    bankResults.forEach((result, index) => {
      const isBestRate = index === 0 ? '<span class="badge bg-success ms-2">Mejor opción</span>' : '';
      
      const resultCard = document.createElement('div');
      resultCard.className = 'card result-card mb-3';
      resultCard.innerHTML = `
        <div class="card-body">
          <div class="row align-items-center">
            <div class="col-md-3 text-center text-md-start mb-3 mb-md-0">
              <i class="bi ${result.logoClass} fs-1 text-primary"></i>
              <h5 class="mb-0">${result.bankName}${isBestRate}</h5>
            </div>
            <div class="col-md-3 text-center mb-3 mb-md-0">
              <div class="text-muted fs-6">Tasas</div>
              <div class="highlight">${result.rateDescription ? result.rateDescription + ' ' : ''}${(result.yearlyRate * 100).toFixed(2)}% EA</div>
              <div class="text-muted fs-6">${((Math.pow(1 + result.yearlyRate, 1/12) - 1) * 100).toFixed(2)}% MV</div>
            </div>
            <div class="col-md-3 text-center mb-3 mb-md-0">
              <div class="text-muted fs-6">Cuota Mensual</div>
              <div class="payment-value">$${formatCurrency(Math.round(result.monthlyPayment))}</div>
            </div>
            <div class="col-md-3 text-center mb-3 mb-md-0">
              <button class="btn btn-sm btn-outline-primary view-details-btn" data-bank="${result.bankName}">Ver detalles</button>
            </div>
          </div>
          <div class="mt-3 bank-details d-none" id="details-${result.bankName.replace(/\s+/g, '-')}">
            <p><strong>Valor de la propiedad:</strong> $${formatCurrency(propertyValue)}</p>
            <p><strong>Monto del crédito:</strong> $${formatCurrency(loanAmount)}</p>
            <p><strong>Plazo:</strong> ${loanTerm} años</p>
            <p><strong>Tasa EA:</strong> ${result.rateDescription ? result.rateDescription + ' ' : ''}${(result.yearlyRate * 100).toFixed(2)}%</p>
            <p><strong>Tasa MV:</strong> ${((Math.pow(1 + result.yearlyRate, 1/12) - 1) * 100).toFixed(2)}%</p>
            
            <table class="table table-sm comparison-table mt-3">
              <tr>
                <th>Total a pagar:</th>
                <td>$${formatCurrency(Math.round(result.totalPayment))}</td>
              </tr>
              <tr>
                <th>Intereses totales:</th>
                <td>$${formatCurrency(Math.round(result.totalInterest))}</td>
              </tr>
            </table>
            
            <div class="amortization-section mt-4">
              <h6 class="mb-3">Tabla de Amortización</h6>
              <div id="amortization-${result.bankName.replace(/\s+/g, '-')}" class="amortization-table-container"></div>
            </div>
          </div>
        </div>
      `;
      
      resultsContent.appendChild(resultCard);
      
      // Generate amortization table
      const detailsContainer = resultCard.querySelector(`#details-${result.bankName.replace(/\s+/g, '-')}`);
      const amortizationContainer = resultCard.querySelector(`#amortization-${result.bankName.replace(/\s+/g, '-')}`);
      generateAmortizationTable(result.bankName, result.yearlyRate, loanAmount, loanTerm, amortizationContainer);
      
      // Add event listener to "Ver detalles" button
      const viewDetailsBtn = resultCard.querySelector('.view-details-btn');
      viewDetailsBtn.addEventListener('click', function() {
        const bankName = this.getAttribute('data-bank');
        const detailsElement = document.getElementById(`details-${bankName.replace(/\s+/g, '-')}`);
        
        if (detailsElement.classList.contains('d-none')) {
          // Close any open details first
          document.querySelectorAll('.bank-details').forEach(el => {
            el.classList.add('d-none');
          });
          // Open this one
          detailsElement.classList.remove('d-none');
          this.textContent = 'Ocultar detalles';
          
          // Set all other buttons back to "Ver detalles"
          document.querySelectorAll('.view-details-btn').forEach(btn => {
            if (btn !== this) {
              btn.textContent = 'Ver detalles';
            }
          });
        } else {
          detailsElement.classList.add('d-none');
          this.textContent = 'Ver detalles';
        }
      });
    });
    
    // Show results container
    resultsContainer.classList.remove('d-none');
    
    // Generate comparison chart
    generateComparisonChart(bankResults);
    
    // Generate interest rate heat map
    generateInterestRateHeatMap(bankResults);
    
    // Restore button state
    calculateBtn.innerHTML = originalBtnText;
    calculateBtn.disabled = false;
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
  }, 500);
}

// Generate amortization table for a bank
function generateAmortizationTable(bankName, yearlyRate, loanAmount, loanTerm, container) {
  const monthlyRate = yearlyRate / 12;
  const paymentPeriods = loanTerm * 12;
  
  // Calculate monthly payment
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, paymentPeriods)) / (Math.pow(1 + monthlyRate, paymentPeriods) - 1);
  
  // Create table
  const table = document.createElement('table');
  table.className = 'table table-sm table-hover amortization-table';
  
  // Create header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Año</th>
      <th>Capital</th>
      <th>Intereses</th>
      <th>Saldo</th>
    </tr>
  `;
  table.appendChild(thead);
  
  // Create body
  const tbody = document.createElement('tbody');
  
  // Generate rows for each year of the loan
  const yearlyRows = generateAmortizationRows(loanAmount, monthlyRate, monthlyPayment, paymentPeriods);
  
  yearlyRows.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.year}</td>
      <td>$${formatCurrency(Math.round(row.principal))}</td>
      <td>$${formatCurrency(Math.round(row.interest))}</td>
      <td>$${formatCurrency(Math.round(row.balance))}</td>
    `;
    tbody.appendChild(tr);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
}

// Generate amortization table data
function generateAmortizationRows(loanAmount, monthlyRate, monthlyPayment, periods) {
  const yearlyData = [];
  let remainingBalance = loanAmount;
  let yearlyPrincipal = 0;
  let yearlyInterest = 0;
  
  // For each payment period (month)
  for (let i = 1; i <= periods; i++) {
    // Calculate interest for this period
    const interestForPeriod = remainingBalance * monthlyRate;
    
    // Calculate principal for this period
    const principalForPeriod = monthlyPayment - interestForPeriod;
    
    // Update yearlyPrincipal and yearlyInterest
    yearlyPrincipal += principalForPeriod;
    yearlyInterest += interestForPeriod;
    
    // Update remaining balance
    remainingBalance -= principalForPeriod;
    
    // If this is the last month of a year (or the last payment), add to yearlyData
    if (i % 12 === 0 || i === periods) {
      yearlyData.push({
        year: Math.ceil(i / 12),
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        balance: Math.max(0, remainingBalance)
      });
      
      // Reset yearly counters
      yearlyPrincipal = 0;
      yearlyInterest = 0;
    }
  }
  
  return yearlyData;
}

// Generate comparison chart
function generateComparisonChart(bankResults) {
  const chartContainer = document.getElementById('comparisonChart');
  chartContainer.classList.remove('d-none');
  
  // Destroy existing chart if it exists
  if (window.comparisonChart) {
    window.comparisonChart.destroy();
  }
  
  const ctx = chartContainer.getContext('2d');
  
  // Prepare data
  const labels = bankResults.map(result => result.bankName);
  const monthlyPayments = bankResults.map(result => Math.round(result.monthlyPayment));
  const totalInterests = bankResults.map(result => Math.round(result.totalInterest));
  
  // Create chart
  window.comparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Cuota Mensual',
          data: monthlyPayments,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Cuota Mensual: $${formatCurrency(context.raw)}`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return `$${formatCurrency(value)}`;
            }
          }
        }
      }
    }
  });
}

// Reset the form
function resetForm() {
  document.getElementById('propertyValue').value = '';
  document.getElementById('downPayment').value = '';
  document.getElementById('loanTerm').value = '';
  document.getElementById('loanAmount').textContent = '0';
  document.getElementById('downPaymentPercentage').textContent = '0';
  document.getElementById('downPaymentFeedback').classList.add('d-none');
  document.getElementById('loanTermFeedback').classList.add('d-none');
  document.getElementById('validationErrors').classList.add('d-none');
  document.getElementById('resultsContainer').classList.add('d-none');
}

// Generate interest rate heat map
function generateInterestRateHeatMap(bankResults) {
  const heatMapContainer = document.getElementById('heatMapContainer');
  const heatMapTable = document.getElementById('interestRateHeatMap').querySelector('tbody');
  
  // Clear previous content
  heatMapTable.innerHTML = '';
  
  // If there are bank results, show the container
  if (bankResults.length > 0) {
    heatMapContainer.classList.remove('d-none');
    
    // Sort banks by yearly rate (lowest first)
    const sortedResults = [...bankResults].sort((a, b) => a.yearlyRate - b.yearlyRate);
    
    // Get the lowest rate as base for comparison
    const lowestRate = sortedResults[0].yearlyRate;
    
    // Generate rows for each bank
    sortedResults.forEach(result => {
      const row = document.createElement('tr');
      
      // Calculate percentage difference from lowest rate
      const percentageDiff = result.yearlyRate === lowestRate 
        ? 0 
        : ((result.yearlyRate - lowestRate) / lowestRate) * 100;
      
      // Generate color based on percentage difference
      let bgColor;
      if (percentageDiff === 0) {
        bgColor = 'rgba(40, 167, 69, 0.8)'; // Best rate (green)
      } else if (percentageDiff <= 5) {
        bgColor = 'rgba(40, 167, 69, 0.5)'; // Up to 5% higher (light green)
      } else if (percentageDiff <= 10) {
        bgColor = 'rgba(255, 193, 7, 0.5)'; // 5-10% higher (yellow)
      } else if (percentageDiff <= 15) {
        bgColor = 'rgba(255, 145, 0, 0.5)'; // 10-15% higher (orange)
      } else {
        bgColor = 'rgba(220, 53, 69, 0.5)'; // >15% higher (red)
      }
      
      // Generate text for comparison cell
      let comparisonText = '';
      if (percentageDiff === 0) {
        comparisonText = 'Mejor tasa de interés';
      } else {
        comparisonText = `+${percentageDiff.toFixed(1)}% respecto a la mejor tasa`;
      }
      
      // Generate row HTML
      row.innerHTML = `
        <td>${result.bankName}</td>
        <td>${result.rateDescription ? result.rateDescription + ' ' : ''}${(result.yearlyRate * 100).toFixed(2)}%</td>
        <td>${((Math.pow(1 + result.yearlyRate, 1/12) - 1) * 100).toFixed(2)}%</td>
        <td class="text-center">
          <div class="heat-map-cell" style="background-color: ${bgColor}; padding: 8px; border-radius: 4px; color: #333;">
            ${comparisonText}
          </div>
        </td>
      `;
      
      heatMapTable.appendChild(row);
    });
  } else {
    heatMapContainer.classList.add('d-none');
  }
}

// Add event delegation for the details buttons
document.addEventListener('click', function(e) {
  if (e.target && e.target.closest('.view-details-btn')) {
    const btn = e.target.closest('.view-details-btn');
    const bankName = btn.getAttribute('data-bank');
    const detailsElement = document.getElementById(`details-${bankName.replace(/\s+/g, '-')}`);
    
    if (detailsElement) {
      if (detailsElement.classList.contains('d-none')) {
        // Close any open details first
        document.querySelectorAll('.bank-details').forEach(el => {
          el.classList.add('d-none');
        });
        // Open this one
        detailsElement.classList.remove('d-none');
        btn.textContent = 'Ocultar detalles';
        
        // Set all other buttons back to "Ver detalles"
        document.querySelectorAll('.view-details-btn').forEach(otherBtn => {
          if (otherBtn !== btn) {
            otherBtn.textContent = 'Ver detalles';
          }
        });
      } else {
        detailsElement.classList.add('d-none');
        btn.textContent = 'Ver detalles';
      }
    }
  }
});
