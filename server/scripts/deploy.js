const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { ethers } = require('ethers');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function setEnvValue(filePath, key, value) {
	let content = '';
	if (fs.existsSync(filePath)) {
		content = fs.readFileSync(filePath, 'utf8');
	}
	const lines = content.split(/\r?\n/).filter(Boolean);
	let found = false;
	for (let i = 0; i < lines.length; i++) {
		if (lines[i].startsWith(key + '=')) {
			lines[i] = `${key}=${value}`;
			found = true;
			break;
		}
	}
	if (!found) {
		lines.push(`${key}=${value}`);
	}
	fs.writeFileSync(filePath, lines.join('\n'));
}

async function compileContract() {
	// Use the root blockchain path
	const contractsDir = path.join('D:', 'Game Changer', 'blockchain', 'contracts');
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
        viaIR: true,
        outputSelection: {
				'*': {
					'*': ['abi', 'evm.bytecode.object']
				}
			}
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
	return { abi: contract.abi, bytecode: '0x' + contract.evm.bytecode.object };
}

async function main() {
	const rpcUrl = process.env.BSC_RPC_URL;
	const pk = (process.env.PRIVATE_KEY || '').replace(/^0x/, '');
	if (!rpcUrl || !pk) throw new Error('Missing BSC_RPC_URL or PRIVATE_KEY');
	const provider = new ethers.JsonRpcProvider(rpcUrl);
	const wallet = new ethers.Wallet('0x' + pk, provider);

	const { abi, bytecode } = await compileContract();
	const factory = new ethers.ContractFactory(abi, bytecode, wallet);
	const contract = await factory.deploy();
	await contract.deploymentTransaction().wait();
	const address = await contract.getAddress();
	console.log('Deployed ProductManager at:', address);

	// Write ABI for server usage
	const abiDir = path.join(__dirname, '..', 'abi');
	if (!fs.existsSync(abiDir)) fs.mkdirSync(abiDir, { recursive: true });
	fs.writeFileSync(path.join(abiDir, 'ProductManager.json'), JSON.stringify({ abi }, null, 2));
	console.log('ABI written to server/abi/ProductManager.json');

	// Persist CONTRACT_ADDRESS into server/.env
	const envPath = path.join(__dirname, '..', '.env');
	setEnvValue(envPath, 'CONTRACT_ADDRESS', address);
	console.log('Updated CONTRACT_ADDRESS in server/.env');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
