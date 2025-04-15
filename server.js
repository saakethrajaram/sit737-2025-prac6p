const express = require('express');
const winston = require('winston');
const path = require('path');

const app = express();
const PORT = 3000;

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs.log' })
  ]
});

// Middleware for logging requests
app.use((req, res, next) => {
  logger.info(`Request from ${req.ip}: ${req.method} ${req.url}`);
  next();
});

// Serve static files from current directory
app.use(express.static(path.join(__dirname)));

// Calculation logic
function calculate(operation, num1, num2) {
  switch (operation) {
    case 'add': return num1 + num2;
    case 'subtract': return num1 - num2;
    case 'multiply': return num1 * num2;
    case 'divide':
      if (num2 === 0) return { error: 'Division by zero is not allowed' };
      return num1 / num2;
    case 'power': return Math.pow(num1, num2);
    case 'sqrt':
      if (num1 < 0) return { error: 'Square root of a negative number is not allowed' };
      return Math.sqrt(num1);
    case 'modulo': return num1 % num2;
    default: return { error: 'Invalid operation' };
  }
}

// Supported routes
const operations = ['add', 'subtract', 'multiply', 'divide', 'power', 'sqrt', 'modulo'];

operations.forEach(op => {
  app.get(`/${op}`, (req, res) => {
    const num1 = parseFloat(req.query.num1);
    const num2 = parseFloat(req.query.num2);
    if (isNaN(num1) || (op !== 'sqrt' && isNaN(num2))) {
      logger.error(`Invalid input - Num1: ${req.query.num1}, Num2: ${req.query.num2}`);
      return res.status(400).json({ error: 'Invalid input. Provide valid numbers.' });
    }
    const result = calculate(op, num1, num2);
    if (result.error) {
      logger.error(result.error);
      return res.status(400).json({ error: result.error });
    }
    logger.info(`Calculation performed: ${op}(${num1}, ${num2}) = ${result}`);
    res.json({ operation: op, result });
  });
});

// Serve the main HTML file on root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
  console.log(`Calculator microservice running on port ${PORT}`);
});
