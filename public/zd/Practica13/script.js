let display = document.getElementById('display');
let historyDiv = document.getElementById('history');
let currentInput = '';
let operator = '';
let previousInput = '';
let history = [];

function appendToDisplay(value) {
    if (['+', '-', '*', '/', '^'].includes(value)) {
        if (currentInput !== '') {
            if (previousInput !== '' && operator !== '') {
                calculate();
            }
            operator = value;
            previousInput = currentInput;
            currentInput = '';
        }
    } else {
        currentInput += value;
        display.textContent = currentInput;
    }
}

function calculate() {
    if (previousInput !== '' && currentInput !== '' && operator !== '') {
        let result;
        const prev = parseFloat(previousInput);
        const curr = parseFloat(currentInput);
        if (isNaN(prev) || isNaN(curr)) {
            display.textContent = 'Error';
            addToHistory(`${previousInput} ${operator} ${currentInput} = Error`);
            reset();
            return;
        }
        switch (operator) {
            case '+':
                result = prev + curr;
                break;
            case '-':
                result = prev - curr;
                break;
            case '*':
                result = prev * curr;
                break;
            case '/':
                if (curr === 0) {
                    display.textContent = 'Error';
                    addToHistory(`${prev} / ${curr} = Error`);
                    reset();
                    return;
                }
                result = prev / curr;
                break;
            case '^':
                result = Math.pow(prev, curr);
                break;
        }
        if (isNaN(result)) {
            display.textContent = 'Error';
            addToHistory(`${prev} ${operator} ${curr} = Error`);
            reset();
            return;
        }
        display.textContent = result;
        addToHistory(`${prev} ${operator} ${curr} = ${result}`);
        currentInput = result.toString();
        previousInput = '';
        operator = '';
    }
}

function sqrt() {
    if (currentInput !== '') {
        const num = parseFloat(currentInput);
        if (isNaN(num)) {
            display.textContent = 'Error';
            addToHistory(`√${currentInput} = Error`);
            reset();
            return;
        }
        if (num < 0) {
            display.textContent = 'Error';
            addToHistory(`√${num} = Error`);
            reset();
            return;
        }
        const result = Math.sqrt(num);
        display.textContent = result;
        addToHistory(`√${num} = ${result}`);
        currentInput = result.toString();
    }
}

function clearDisplay() {
    display.textContent = '0';
    currentInput = '';
    operator = '';
    previousInput = '';
}

function clearHistory() {
    history = [];
    historyDiv.innerHTML = '';
}

function addToHistory(operation) {
    history.push(operation);
    historyDiv.innerHTML = history.join('<br>');
}

function reset() {
    currentInput = '';
    operator = '';
    previousInput = '';
}