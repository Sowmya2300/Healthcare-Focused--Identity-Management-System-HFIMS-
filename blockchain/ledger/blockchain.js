const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ledgerPath = path.join(__dirname, 'ledger.json');

// Initialize ledger if doesn't exist
if (!fs.existsSync(ledgerPath)) {
  fs.writeFileSync(ledgerPath, JSON.stringify([]));
}

// Helper: generate hash
const calculateHash = (index, timestamp, data, prevHash) => {
  return crypto.createHash('sha256')
    .update(index + timestamp + JSON.stringify(data) + prevHash)
    .digest('hex');
};

// Load blockchain from file
const loadChain = () => {
  return JSON.parse(fs.readFileSync(ledgerPath));
};

// Save blockchain to file
const saveChain = (chain) => {
  fs.writeFileSync(ledgerPath, JSON.stringify(chain, null, 2));
};

// Create new block
const createBlock = (data) => {
  const chain = loadChain();
  const index = chain.length;
  const timestamp = new Date().toISOString();
  const prevHash = index > 0 ? chain[index - 1].hash : '0';
  const hash = calculateHash(index, timestamp, data, prevHash);

  const newBlock = { index, timestamp, data, prevHash, hash };
  chain.push(newBlock);
  saveChain(chain);
  return newBlock;
};

// Expose functions
module.exports = {
  createBlock,
  getChain: loadChain,
};
