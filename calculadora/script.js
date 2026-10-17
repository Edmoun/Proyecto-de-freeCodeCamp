// Referencias al DOM
const display = document.getElementById('display');
const formulaDisplay = document.getElementById('formula');
const buttonsGrid = document.querySelector('.buttons-grid');

// Estado de la calculadora
let currentVal = '0';
let formula = '';
let evaluated = false;

// Funciones auxiliares
function updateDisplays() {
    display.textContent = currentVal;
    formulaDisplay.textContent = formula;

    // Ajuste dinámico de tamaño de fuente según la longitud del texto
    if (currentVal.length > 12) {
        display.style.fontSize = '1.6rem';
    } else if (currentVal.length > 8) {
        display.style.fontSize = '2rem';
    } else {
        display.style.fontSize = '2.5rem';
    }
}

function isOperator(char) {
    return ['+', '-', '*', '/'].includes(char);
}

// Resetear calculadora
function handleClear() {
    currentVal = '0';
    formula = '';
    evaluated = false;
    updateDisplays();
}

// Borrar último dígito (Backspace)
function handleDelete() {
    if (evaluated) {
        formula = '';
        currentVal = '0';
        evaluated = false;
        updateDisplays();
        return;
    }

    if (currentVal.length > 1) {
        currentVal = currentVal.slice(0, -1);
        if (formula.length > 0) {
            formula = formula.slice(0, -1);
        }
    } else {
        currentVal = '0';
        if (formula.length > 0) {
            formula = formula.slice(0, -1);
        }
    }
    updateDisplays();
}

// Manejo de números
function handleNumber(num) {
    if (evaluated) {
        currentVal = num;
        formula = num === '0' ? '' : num;
        evaluated = false;
        updateDisplays();
        return;
    }

    // Si el valor actual es un operador o "0"
    if (currentVal === '0') {
        if (num === '0') {
            return; // Prevenir múltiples ceros iniciales
        }
        currentVal = num;
        if (formula === '0' || formula === '') {
            formula = num;
        } else {
            formula += num;
        }
    } else if (isOperator(currentVal)) {
        currentVal = num;
        formula += num;
    } else {
        currentVal += num;
        formula += num;
    }

    updateDisplays();
}

// Manejo de punto decimal
function handleDecimal() {
    if (evaluated) {
        currentVal = '0.';
        formula = '0.';
        evaluated = false;
        updateDisplays();
        return;
    }

    if (isOperator(currentVal) || currentVal === '') {
        currentVal = '0.';
        formula += '0.';
    } else if (!currentVal.includes('.')) {
        currentVal += '.';
        formula += '.';
    }

    updateDisplays();
}

// Manejo de operadores (+, -, *, /)
function handleOperator(op) {
    if (evaluated) {
        formula = currentVal + op;
        currentVal = op;
        evaluated = false;
        updateDisplays();
        return;
    }

    if (formula === '' || formula === '0') {
        if (op === '-') {
            currentVal = '-';
            formula = '-';
            updateDisplays();
        }
        return;
    }

    // Regla de operadores consecutivos (compatible con freeCodeCamp User Story #13)
    // Si se ingresan 2 o más operadores consecutivos, se realiza la última operación,
    // excepto si el último es '-' (signo negativo).
    const consecutiveOpRegex = /([+\-*/]+)$/;
    const match = formula.match(consecutiveOpRegex);

    if (match) {
        const trailingOps = match[0];
        if (op === '-') {
            if (trailingOps.slice(-1) !== '-') {
                formula += op;
            }
        } else {
            formula = formula.slice(0, -trailingOps.length) + op;
        }
    } else {
        formula += op;
    }

    currentVal = op;
    updateDisplays();
}

// Calcular resultado
function handleEquals() {
    if (evaluated || formula === '') return;

    // Limpiar operadores residuales al final
    let sanitizedFormula = formula.replace(/[+\-*/]+$/, '');

    if (!sanitizedFormula) return;

    try {
        // Validación de seguridad para que solo contenga números y operadores válidos
        if (!/^[0-9+\-*/. ]+$/.test(sanitizedFormula)) {
            throw new Error('Expresión no válida');
        }

        // Evaluación matemática
        const rawResult = Function(`'use strict'; return (${sanitizedFormula})`)();

        if (!isFinite(rawResult)) {
            currentVal = 'Indefinido';
            formula = sanitizedFormula + '=';
        } else {
            // Corrección de precisión flotante (ej: 0.1 + 0.2)
            const precisionResult = Math.round((rawResult + Number.EPSILON) * 1e12) / 1e12;
            currentVal = precisionResult.toString();
            formula = sanitizedFormula + '=' + currentVal;
        }

        evaluated = true;
    } catch (error) {
        currentVal = 'Error';
        formula = '';
        evaluated = true;
    }

    updateDisplays();
}

// Cambio de signo (+/-)
function handleToggleSign() {
    if (currentVal === '0' || isOperator(currentVal)) return;

    if (currentVal.startsWith('-')) {
        currentVal = currentVal.slice(1);
    } else {
        currentVal = '-' + currentVal;
    }

    // Actualizar la última sección numérica en formula
    const lastNumMatch = formula.match(/(-?\d+\.?\d*)$/);
    if (lastNumMatch) {
        formula = formula.slice(0, -lastNumMatch[0].length) + currentVal;
    } else {
        formula = currentVal;
    }

    updateDisplays();
}

// Porcentaje (%)
function handlePercent() {
    if (isOperator(currentVal) || currentVal === '0') return;

    const num = parseFloat(currentVal);
    const result = (num / 100).toString();
    
    const lastNumMatch = formula.match(/(\d+\.?\d*)$/);
    if (lastNumMatch) {
        formula = formula.slice(0, -lastNumMatch[0].length) + result;
    }
    currentVal = result;
    updateDisplays();
}

// Escuchador de clics en la botonera
buttonsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const value = btn.dataset.value;

    if (!action && value) {
        if (value === '.') {
            handleDecimal();
        } else {
            handleNumber(value);
        }
    } else if (action === 'operator') {
        handleOperator(value);
    } else if (action === 'equals') {
        handleEquals();
    } else if (action === 'clear') {
        handleClear();
    } else if (action === 'delete') {
        handleDelete();
    } else if (action === 'toggle-sign') {
        handleToggleSign();
    } else if (action === 'percent') {
        handlePercent();
    }
});

// Soporte completo para teclado físico
window.addEventListener('keydown', (e) => {
    let key = e.key;

    // Normalizar teclas
    if (key === 'Enter') key = '=';
    if (key === ',') key = '.';

    // Efecto visual de tecla presionada
    let targetButton = null;
    if (key >= '0' && key <= '9') {
        targetButton = document.querySelector(`button[data-value="${key}"]`);
        handleNumber(key);
    } else if (key === '.') {
        targetButton = document.getElementById('decimal');
        handleDecimal();
    } else if (['+', '-', '*', '/'].includes(key)) {
        targetButton = document.querySelector(`button[data-value="${key}"]`);
        handleOperator(key);
    } else if (key === '=') {
        e.preventDefault();
        targetButton = document.getElementById('equals');
        handleEquals();
    } else if (key === 'Backspace') {
        targetButton = document.getElementById('delete');
        handleDelete();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        targetButton = document.getElementById('clear');
        handleClear();
    } else if (key === '%') {
        targetButton = document.getElementById('percent');
        handlePercent();
    }

    if (targetButton) {
        targetButton.classList.add('active');
        setTimeout(() => targetButton.classList.remove('active'), 150);
    }
});

// Inicialización
updateDisplays();
