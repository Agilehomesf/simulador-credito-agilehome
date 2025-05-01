// Bank data will be loaded from JSON file
let banks = {};

// Function to load bank data from JSON file
async function loadBankData() {
  try {
    const response = await fetch('/static/data/bank_rates.json');
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
  const propertyValue = parseCurrency(document.getElementById('propertyValue').value);
  const downPayment = parseCurrency(document.getElementById('downPayment').value);
  
  // Calculate loan amount
  let loanAmount = propertyValue - downPayment;
  if (loanAmount < 0) loanAmount = 0;
  
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
            <div class="text-center mt-2">
              <a href="#" class="amortization-toggle" data-bank="${result.bankName}">
                Ver tabla de amortización
              </a>
            </div>
            <div class="amortization-container d-none mt-3" id="amortization-${result.bankName.replace(/\s+/g, '-')}">
            </div>
          </div>
        </div>
      `;
      
      resultsContent.appendChild(resultCard);
    });
    
    // Show results
    resultsContainer.classList.remove('d-none');
    document.getElementById('comparisonChart').classList.remove('d-none');
    
    // Add event listeners to detail buttons
    document.querySelectorAll('.view-details-btn').forEach(button => {
      button.addEventListener('click', function() {
        const bankName = this.getAttribute('data-bank');
        const detailsElement = document.getElementById(`details-${bankName.replace(/\s+/g, '-')}`);
        
        // Toggle details visibility
        detailsElement.classList.toggle('d-none');
        this.textContent = detailsElement.classList.contains('d-none') ? 'Ver detalles' : 'Ocultar detalles';
      });
    });
    
    // Variable global para guardar los resultados de los bancos
    window.lastBankResults = bankResults;
    window.lastPropertyValue = propertyValue;
    window.lastLoanAmount = loanAmount;
    window.lastLoanTerm = loanTerm;
    
    // Add event listeners to amortization toggles
    document.querySelectorAll('.amortization-toggle').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const bankName = this.getAttribute('data-bank');
        
        // Obtener datos del banco desde las variables globales
        const storedResults = window.lastBankResults || [];
        const result = storedResults.find(res => res.bankName === bankName);
        const yearlyRate = result ? result.yearlyRate : banks[bankName].rate;
        const storedLoanAmount = window.lastLoanAmount || loanAmount;
        const storedLoanTerm = window.lastLoanTerm || loanTerm;
        
        const amortizationContainer = document.getElementById(`amortization-${bankName.replace(/\s+/g, '-')}`);
        
        // Toggle amortization table visibility
        amortizationContainer.classList.toggle('d-none');
        this.textContent = amortizationContainer.classList.contains('d-none') 
          ? 'Ver tabla de amortización' 
          : 'Ocultar tabla de amortización';
        
        // Only generate table if it's being shown
        if (!amortizationContainer.classList.contains('d-none')) {
          // Siempre regeneramos la tabla para asegurar que esté actualizada
          console.log(`Generando tabla para ${bankName} con tasa ${yearlyRate}, monto ${storedLoanAmount}, plazo ${storedLoanTerm}`);
          generateAmortizationTable(bankName, yearlyRate, storedLoanAmount, storedLoanTerm, amortizationContainer);
        }
      });
    });
    
    // Generate comparison chart
    generateComparisonChart(bankResults);
    
    // Generate heat map
    generateInterestRateHeatMap(bankResults);
    
    // Restore button state
    calculateBtn.innerHTML = originalBtnText;
    calculateBtn.disabled = false;
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
    
  }, 800); // Delay for loading effect
}

// Generate amortization table
function generateAmortizationTable(bankName, yearlyRate, loanAmount, loanTerm, container) {
  console.log(`Generando tabla de amortización - Banco: ${bankName}, Tasa: ${yearlyRate}, Monto: ${loanAmount}, Plazo: ${loanTerm}`);
  
  const monthlyRate = yearlyRate / 12;
  const paymentPeriods = loanTerm * 12;
  
  // Calculate monthly payment
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, paymentPeriods)) / (Math.pow(1 + monthlyRate, paymentPeriods) - 1);
  
  // Create table structure with bank name and summary
  const tableHTML = `
    <div class="amortization-table-container">
      <h5 class="mb-3">Tabla de Amortización - ${bankName}</h5>
      <div class="table-responsive">
        <table class="table table-sm table-striped table-hover">
          <thead class="table-light">
            <tr>
              <th>#</th>
              <th>Cuota</th>
              <th>Capital</th>
              <th>Interés</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            ${generateAmortizationRows(loanAmount, monthlyRate, monthlyPayment, paymentPeriods)}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  container.innerHTML = tableHTML;
}

// Generate rows for amortization table
function generateAmortizationRows(loanAmount, monthlyRate, monthlyPayment, periods) {
  let rows = '';
  let remainingBalance = loanAmount;
  
  // Generate first 12 months, then year 5, 10, 15, etc.
  for (let i = 1; i <= periods; i++) {
    // Calculate interest for this period
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    
    // Update remaining balance
    remainingBalance -= principalPayment;
    if (remainingBalance < 0) remainingBalance = 0;
    
    // Only show certain periods to keep the table manageable
    // First 12 months, then annual intervals
    if (i <= 12 || i % 12 === 0 || i === periods) {
      rows += `
        <tr>
          <td>${i}</td>
          <td>$${formatCurrency(Math.round(monthlyPayment))}</td>
          <td>$${formatCurrency(Math.round(principalPayment))}</td>
          <td>$${formatCurrency(Math.round(interestPayment))}</td>
          <td>$${formatCurrency(Math.round(remainingBalance))}</td>
        </tr>
      `;
    }
  }
  
  return rows;
}

// Generate bar chart comparing monthly payments
function generateComparisonChart(bankResults) {
  const chartElement = document.getElementById('comparisonChart');
  const ctx = chartElement.getContext('2d');
  
  // Check if chart already exists and destroy it
  if (window.paymentChart) {
    window.paymentChart.destroy();
  }
  
  // Prepare data for the chart
  const labels = bankResults.map(result => result.bankName);
  const monthlyPayments = bankResults.map(result => Math.round(result.monthlyPayment));
  const totalInterests = bankResults.map(result => Math.round(result.totalInterest));
  
  // Create new chart
  window.paymentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Cuota Mensual',
          data: monthlyPayments,
          backgroundColor: '#ff6b00',
          borderColor: '#e65a00',
          borderWidth: 1,
          maxBarThickness: 40,
          barPercentage: 0.65
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Comparación de Cuotas Mensuales',
          font: {
            size: 14
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Cuota Mensual: $' + formatCurrency(context.raw);
            }
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '$' + formatCurrency(value);
            },
            font: {
              size: 11
            }
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          ticks: {
            font: {
              size: 11
            }
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
  
  // Show the chart
  chartElement.classList.remove('d-none');
}

// Reset form to initial state
function resetForm() {
  document.getElementById('mortgageForm').reset();
  document.getElementById('loanAmount').textContent = '0';
  document.getElementById('downPaymentPercentage').textContent = '0';
  document.getElementById('downPaymentFeedback').classList.add('d-none');
  document.getElementById('loanTermFeedback').classList.add('d-none');
  document.getElementById('validationErrors').classList.add('d-none');
  document.getElementById('resultsContainer').classList.add('d-none');
  document.getElementById('comparisonChart').classList.add('d-none');
  document.getElementById('heatMapContainer').classList.add('d-none');
}

// La funcionalidad relacionada con PDF ha sido completamente eliminada
// Reemplazada por un enlace directo a WhatsApp en el HTML

// Generate heat map of interest rates
function generateInterestRateHeatMap(bankResults) {
  // Get the container element
  const container = document.getElementById('heatMapContainer');
  const table = document.getElementById('interestRateHeatMap').querySelector('tbody');
  
  // Clear previous content
  table.innerHTML = '';
  
  // Sort the banks by their rate from lowest to highest
  const sortedBanks = [...bankResults].sort((a, b) => a.yearlyRate - b.yearlyRate);
  
  // Find the lowest and highest rates to determine the color scale
  const lowestRate = sortedBanks[0].yearlyRate;
  const highestRate = sortedBanks[sortedBanks.length - 1].yearlyRate;
  const rateRange = highestRate - lowestRate;
  
  // Generate rows for each bank
  sortedBanks.forEach((bank, index) => {
    // Calculate normalized rate between 0 and 1 for color mapping
    const normalizedRate = rateRange === 0 ? 0.5 : (bank.yearlyRate - lowestRate) / rateRange;
    
    // Determine color class based on normalized rate
    let colorClass = '';
    if (normalizedRate < 0.2) {
      colorClass = 'lowest-rate';
    } else if (normalizedRate < 0.4) {
      colorClass = 'low-rate';
    } else if (normalizedRate < 0.6) {
      colorClass = 'mid-rate';
    } else if (normalizedRate < 0.8) {
      colorClass = 'high-rate';
    } else {
      colorClass = 'highest-rate';
    }
    
    // Calculate monthly rate
    const monthlyRate = Math.pow(1 + bank.yearlyRate, 1/12) - 1;
    const formattedMonthlyRate = (monthlyRate * 100).toFixed(2) + '%';
    
    // Create row element
    const row = document.createElement('tr');
    
    // Bank name cell
    const bankNameCell = document.createElement('td');
    bankNameCell.textContent = bank.bankName;
    
    // Identificar mejor tasa para añadir la etiqueta "Mejor tasa"
    if (index === 0) {
      const badge = document.createElement('span');
      badge.className = 'badge bg-success ms-2';
      badge.textContent = 'Mejor tasa';
      bankNameCell.appendChild(badge);
    }
    
    row.appendChild(bankNameCell);
    
    // Yearly rate cell
    const yearlyRateCell = document.createElement('td');
    yearlyRateCell.textContent = (bank.rateDescription ? bank.rateDescription + ' ' : '') + (bank.yearlyRate * 100).toFixed(2) + '%';
    
    if (index === 0) {
      yearlyRateCell.style.fontWeight = 'bold';
      yearlyRateCell.style.color = '#28a745'; // Color verde para resaltar
    }
    
    row.appendChild(yearlyRateCell);
    
    // Monthly rate cell
    const monthlyRateCell = document.createElement('td');
    monthlyRateCell.textContent = formattedMonthlyRate;
    
    if (index === 0) {
      monthlyRateCell.style.fontWeight = 'bold';
      monthlyRateCell.style.color = '#28a745'; // Color verde para resaltar
    }
    
    row.appendChild(monthlyRateCell);
    
    // Heat map cell
    const heatMapCell = document.createElement('td');
    heatMapCell.className = 'heat-map-cell';
    
    // Añadir indicador de color y etiqueta
    const heatIndicator = document.createElement('div');
    heatIndicator.className = `heat-map-indicator ${colorClass}`;
    
    // Añadir diferencia de porcentaje con la mejor tasa
    if (index > 0) {
      const difference = ((bank.yearlyRate - lowestRate) * 100).toFixed(2);
      const differenceEl = document.createElement('small');
      differenceEl.className = 'ms-2 text-muted';
      differenceEl.innerHTML = `<em>(+${difference}%)</em>`;
      monthlyRateCell.appendChild(differenceEl);
    }
    
    heatMapCell.appendChild(heatIndicator);
    row.appendChild(heatMapCell);
    
    // Add row to table
    table.appendChild(row);
  });
  
  // Show the container
  container.classList.remove('d-none');
}
