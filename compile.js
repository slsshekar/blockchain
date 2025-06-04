const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'src', 'contracts', 'TestContract.sol');
const source = fs.readFileSync(contractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'TestContract.sol': {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode'],
      },
    },
  },
};

function compileContract() {
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors) {
    output.errors.forEach((err) => {
      console.error(err.formattedMessage);
    });
    if (output.errors.some((err) => err.severity === 'error')) {
      throw new Error('Compilation failed');
    }
  }
  const contract = output.contracts['TestContract.sol']['TestContract'];
  const abi = contract.abi;
  const bytecode = contract.evm.bytecode.object;

  const buildPath = path.resolve(__dirname, 'src', 'contracts', 'build');
  if (!fs.existsSync(buildPath)) {
    fs.mkdirSync(buildPath);
  }

  fs.writeFileSync(
    path.resolve(buildPath, 'TestContractABI.json'),
    JSON.stringify({ abi, bytecode }, null, 2),
    'utf8'
  );

  console.log('Contract compiled successfully. ABI and bytecode saved to src/contracts/build/TestContractABI.json');
}

compileContract();
