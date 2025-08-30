// Matrix operations library
class Matrix {
    constructor(rows, cols, data = null) {
        this.rows = rows;
        this.cols = cols;
        this.data = data || this.createEmptyMatrix();
    }

    createEmptyMatrix() {
        return Array.from({ length: this.rows }, () => 
            Array.from({ length: this.cols }, () => 0)
        );
    }

    static fromArray(array) {
        const rows = array.length;
        const cols = array[0].length;
        const matrix = new Matrix(rows, cols);
        matrix.data = array;
        return matrix;
    }

    static add(a, b) {
        if (a.rows !== b.rows || a.cols !== b.cols) {
            throw new Error("Matrices must have the same dimensions for addition");
        }

        const result = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.rows; i++) {
            for (let j = 0; j < a.cols; j++) {
                result.data[i][j] = a.data[i][j] + b.data[i][j];
            }
        }
        return result;
    }

    static subtract(a, b) {
        if (a.rows !== b.rows || a.cols !== b.cols) {
            throw new Error("Matrices must have the same dimensions for subtraction");
        }

        const result = new Matrix(a.rows, a.cols);
        for (let i = 0; i < a.rows; i++) {
            for (let j = 0; j < a.cols; j++) {
                result.data[i][j] = a.data[i][j] - b.data[i][j];
            }
        }
        return result;
    }

    static multiply(a, b) {
        if (a.cols !== b.rows) {
            throw new Error("Number of columns in A must equal number of rows in B for multiplication");
        }

        const result = new Matrix(a.rows, b.cols);
        for (let i = 0; i < a.rows; i++) {
            for (let j = 0; j < b.cols; j++) {
                let sum = 0;
                for (let k = 0; k < a.cols; k++) {
                    sum += a.data[i][k] * b.data[k][j];
                }
                result.data[i][j] = sum;
            }
        }
        return result;
    }

    static determinant(matrix) {
        if (matrix.rows !== matrix.cols) {
            throw new Error("Matrix must be square to calculate determinant");
        }

        if (matrix.rows === 1) {
            return matrix.data[0][0];
        }

        if (matrix.rows === 2) {
            return matrix.data[0][0] * matrix.data[1][1] - matrix.data[0][1] * matrix.data[1][0];
        }

        let det = 0;
        for (let j = 0; j < matrix.cols; j++) {
            const minor = this.getMinor(matrix, 0, j);
            const sign = j % 2 === 0 ? 1 : -1;
            det += sign * matrix.data[0][j] * this.determinant(minor);
        }
        return det;
    }

    static getMinor(matrix, row, col) {
        const minorData = [];
        for (let i = 0; i < matrix.rows; i++) {
            if (i === row) continue;
            const rowData = [];
            for (let j = 0; j < matrix.cols; j++) {
                if (j === col) continue;
                rowData.push(matrix.data[i][j]);
            }
            minorData.push(rowData);
        }
        return Matrix.fromArray(minorData);
    }

    static inverse(matrix) {
        const det = this.determinant(matrix);
        if (det === 0) {
            throw new Error("Matrix is singular (determinant = 0), cannot compute inverse");
        }

        if (matrix.rows === 1) {
            return Matrix.fromArray([[1 / matrix.data[0][0]]]);
        }

        const adjugate = this.adjugate(matrix);
        return this.scalarMultiply(adjugate, 1 / det);
    }

    static adjugate(matrix) {
        const cofactorMatrix = new Matrix(matrix.rows, matrix.cols);
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                const minor = this.getMinor(matrix, i, j);
                const sign = (i + j) % 2 === 0 ? 1 : -1;
                cofactorMatrix.data[i][j] = sign * this.determinant(minor);
            }
        }
        return this.transpose(cofactorMatrix);
    }

    static transpose(matrix) {
        const result = new Matrix(matrix.cols, matrix.rows);
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                result.data[j][i] = matrix.data[i][j];
            }
        }
        return result;
    }

    static scalarMultiply(matrix, scalar) {
        const result = new Matrix(matrix.rows, matrix.cols);
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                result.data[i][j] = matrix.data[i][j] * scalar;
            }
        }
        return result;
    }

    toString() {
        return this.data.map(row => 
            row.map(val => typeof val === 'number' ? val.toFixed(2) : val).join('\t')
        ).join('\n');
    }
}

// UI Functions
function createMatrixInputs() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('cols').value);
    const operation = document.getElementById('operation').value;

    createMatrix('A', rows, cols);
    
    if (operation !== 'determinant' && operation !== 'inverse' && operation !== 'transpose') {
        createMatrix('B', rows, cols);
        document.getElementById('matrixB').style.display = 'block';
    } else {
        document.getElementById('matrixB').style.display = 'none';
    }
}

function createMatrix(name, rows, cols) {
    const container = document.getElementById(`matrix${name}-inputs`);
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'matrix-grid';

    for (let i = 0; i < rows; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'matrix-row';

        for (let j = 0; j < cols; j++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'matrix-cell';

            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.value = '0';
            input.id = `matrix${name}-${i}-${j}`;
            input.placeholder = '0';

            cellDiv.appendChild(input);
            rowDiv.appendChild(cellDiv);
        }

        grid.appendChild(rowDiv);
    }

    container.appendChild(grid);
}

function toggleSecondMatrix() {
    const operation = document.getElementById('operation').value;
    const matrixB = document.getElementById('matrixB');

    if (operation === 'determinant' || operation === 'inverse' || operation === 'transpose') {
        matrixB.style.display = 'none';
    } else {
        matrixB.style.display = 'block';
        // Recreate matrix B with current dimensions if needed
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('cols').value);
        createMatrix('B', rows, cols);
    }
}

function getMatrixFromInputs(name, rows, cols) {
    const data = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            const input = document.getElementById(`matrix${name}-${i}-${j}`);
            const value = parseFloat(input.value) || 0;
            row.push(value);
        }
        data.push(row);
    }
    return Matrix.fromArray(data);
}

function calculate() {
    try {
        const rows = parseInt(document.getElementById('rows').value);
        const cols = parseInt(document.getElementById('cols').value);
        const operation = document.getElementById('operation').value;

        const matrixA = getMatrixFromInputs('A', rows, cols);
        let result;

        switch (operation) {
            case 'add':
                const matrixBAdd = getMatrixFromInputs('B', rows, cols);
                result = Matrix.add(matrixA, matrixBAdd);
                break;

            case 'subtract':
                const matrixBSub = getMatrixFromInputs('B', rows, cols);
                result = Matrix.subtract(matrixA, matrixBSub);
                break;

            case 'multiply':
                const matrixBMult = getMatrixFromInputs('B', rows, cols);
                result = Matrix.multiply(matrixA, matrixBMult);
                break;

            case 'determinant':
                const det = Matrix.determinant(matrixA);
                result = new Matrix(1, 1, [[det]]);
                break;

            case 'inverse':
                result = Matrix.inverse(matrixA);
                break;

            case 'transpose':
                result = Matrix.transpose(matrixA);
                break;

            default:
                throw new Error("Operasi tidak dikenali");
        }

        displayResult(result);
    } catch (error) {
        showError(error.message);
    }
}

function displayResult(matrix) {
    const resultContainer = document.getElementById('result-matrix');
    resultContainer.innerHTML = '';

    const resultGrid = document.createElement('div');
    resultGrid.className = 'result-matrix';

    for (let i = 0; i < matrix.rows; i++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'matrix-row';

        for (let j = 0; j < matrix.cols; j++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'result-cell';
            
            // Format the number to avoid very long decimals
            let value = matrix.data[i][j];
            if (typeof value === 'number') {
                value = Math.abs(value) < 1e-10 ? 0 : value; // Handle very small numbers
                value = parseFloat(value.toFixed(6)); // Round to 6 decimal places
            }
            
            cellDiv.textContent = value;
            rowDiv.appendChild(cellDiv);
        }

        resultGrid.appendChild(rowDiv);
    }

    resultContainer.appendChild(resultGrid);
}

function showError(message) {
    const resultContainer = document.getElementById('result-matrix');
    resultContainer.innerHTML = `<div class="error">${message}</div>`;
}

function clearAll() {
    // Clear all input fields
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => input.value = '0');
    
    // Clear result
    document.getElementById('result-matrix').innerHTML = '';
    
    // Reset to default 2x2
    document.getElementById('rows').value = '2';
    document.getElementById('cols').value = '2';
    createMatrixInputs();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    createMatrixInputs();
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'Enter':
                e.preventDefault();
                calculate();
                break;
            case 'Delete':
                e.preventDefault();
                clearAll();
                break;
        }
    }
});
