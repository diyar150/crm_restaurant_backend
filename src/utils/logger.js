class Logger {
    static info(message) {
      console.log(`INFO: ${message}`);
    }
  
    static warn(message) {
      console.warn(`WARNING: ${message}`);
    }
  
    static error(message) {
      console.error(`ERROR: ${message}`);
    }
  
    static logToFile(message) {
      // This would require a backend or Node.js to write to a file
      // For example: fs.appendFileSync('logfile.txt', message + '\n');
    }
  }
  
  module.exports = Logger;
  