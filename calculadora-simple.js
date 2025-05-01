// Esperar a que el documento esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  console.log('Documento cargado, inicializando calculadora...');
  
  // Referencias a elementos del DOM
  const propertyValueInput = document.getElementById('propertyValue');
  const downPaymentInput = document.getElementById('downPayment');
  const loanAmountDisplay = document.getElementById('loanAmount');
  const downPaymentPercentageDisplay = document.getElementById('downPaymentPercentage');
  const calculateButton = document.getElementById('calculateBtn');
  const resetButton = document.getElementById('resetBtn');
  
  console.log('Elementos encontrados:', {
    propertyValueInput,
    downPaymentInput,
    loanAmountDisplay,
    downPaymentPercentageDisplay
  });
  
  // Función para formatear como moneda colombiana
  function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  
  // Función para convertir string de moneda a número
  function parseCurrency(value) {
    return parseInt(value.toString().replace(/\D/g, '')) || 0;
  }
  
  // Función para calcular el monto del préstamo
  function calculateLoanAmount() {
    console.log('Calculando monto del préstamo...');
    console.log('Valor propiedad (texto):', propertyValueInput.value);
    console.log('Cuota inicial (texto):', downPaymentInput.value);
    
    const propertyValue = parseCurrency(propertyValueInput.value);
    const downPayment = parseCurrency(downPaymentInput.value);
    
    console.log('Valor propiedad (número):', propertyValue);
    console.log('Cuota inicial (número):', downPayment);
    
    const loanAmount = propertyValue > downPayment ? propertyValue - downPayment : 0;
    
    console.log('Monto préstamo calculado:', loanAmount);
    
    loanAmountDisplay.textContent = formatCurrency(loanAmount);
    
    // Calcular y mostrar el porcentaje
    const percentage = propertyValue > 0 ? (downPayment / propertyValue * 100).toFixed(1) : 0;
    downPaymentPercentageDisplay.textContent = percentage;
  }
  
  // Event listeners
  if (propertyValueInput) {
    propertyValueInput.addEventListener('input', function() {
      console.log('Valor de propiedad cambiado:', this.value);
      calculateLoanAmount();
    });
  }
  
  if (downPaymentInput) {
    downPaymentInput.addEventListener('input', function() {
      console.log('Cuota inicial cambiada:', this.value);
      calculateLoanAmount();
    });
  }
  
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      propertyValueInput.value = '';
      downPaymentInput.value = '';
      loanAmountDisplay.textContent = '0';
      downPaymentPercentageDisplay.textContent = '0';
    });
  }
  
  if (calculateButton) {
    calculateButton.addEventListener('click', function() {
      console.log('Botón calcular presionado');
      alert('Cálculo de cuotas implementado en la versión completa. Esta es una versión simplificada para verificar que la calculadora básica funcione.');
    });
  }
});
