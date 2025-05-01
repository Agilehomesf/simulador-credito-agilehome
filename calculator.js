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
