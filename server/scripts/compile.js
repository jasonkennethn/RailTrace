const path = require('path');
const fs = require('fs');
const solc = require('solc');

function compile() {
	const contractsDir = path.join(__dirname, '..', '..', 'blockchain', 'contracts');
	const filePath = path.join(contractsDir, 'ProductManager.sol');
	if (!fs.existsSync(filePath)) {
		throw new Error('Contract file not found at ' + filePath);
	}
	const source = fs.readFileSync(filePath, 'utf8');
	const input = {
		language: 'Solidity',
		sources: {
			'ProductManager.sol': { content: source }
		},
		settings: {
			optimizer: { enabled: true, runs: 200 },
			outputSelection: { '*': { '*': ['abi'] } }
		}
	};
	const output = JSON.parse(solc.compile(JSON.stringify(input)));
	if (output.errors && output.errors.length) {
		const errs = output.errors.filter(e => e.severity === 'error');
		if (errs.length) {
			throw new Error('Solidity compile errors:\n' + errs.map(e => e.formattedMessage).join('\n'));
		}
	}
	const contract = output.contracts['ProductManager.sol']['ProductManager'];
	const abi = contract.abi;
	const abiDir = path.join(__dirname, '..', 'abi');
	if (!fs.existsSync(abiDir)) fs.mkdirSync(abiDir, { recursive: true });
	fs.writeFileSync(path.join(abiDir, 'ProductManager.json'), JSON.stringify({ abi }, null, 2));
	console.log('ABI written to server/abi/ProductManager.json');
}

compile();


