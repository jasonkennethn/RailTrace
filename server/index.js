require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 4000;
const rpcUrl = process.env.BSC_RPC_URL;
const privateKey = (process.env.PRIVATE_KEY || '').replace(/^0x/, '');
const contractAddress = process.env.CONTRACT_ADDRESS;

if (!rpcUrl || !privateKey || !contractAddress) {
	console.error('Missing env: BSC_RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS');
	process.exit(1);
}

const abiPath = path.join(__dirname, 'abi', 'ProductManager.json');
const abiJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
const abi = abiJson.abi || abiJson;

const provider = new ethers.JsonRpcProvider(rpcUrl);
const wallet = new ethers.Wallet('0x' + privateKey, provider);
const contract = new ethers.Contract(contractAddress, abi, wallet);

contract.on('ProductCreated', (id, requestedBy, event) => {
	console.log('[ProductCreated]', { id: id.toString(), requestedBy, tx: event.log.transactionHash });
});
contract.on('ProductUpdated', (id, status, deliveredBy, event) => {
	console.log('[ProductUpdated]', { id: id.toString(), status, deliveredBy, tx: event.log.transactionHash });
});
contract.on('ProductApproved', (id, approvedBy, event) => {
	console.log('[ProductApproved]', { id: id.toString(), approvedBy, tx: event.log.transactionHash });
});

app.post('/createProduct', async (req, res) => {
	try {
		const { name, category, quantity, urgency, section, budget, requiredBy, justification } = req.body;
		if (!name || !category || quantity == null || !urgency || !section || budget == null || !requiredBy || !justification) {
			return res.status(400).json({ ok: false, error: 'Missing fields' });
		}
		const tx = await contract.createProduct(
			name,
			category,
			ethers.toBigInt(quantity),
			urgency,
			section,
			ethers.toBigInt(budget),
			requiredBy,
			justification
		);
		const receipt = await tx.wait();
		return res.json({ ok: true, txHash: receipt.hash });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ ok: false, error: err.message });
	}
});

app.post('/updateProduct', async (req, res) => {
	try {
		const { id, status } = req.body;
		if (id == null || !status) return res.status(400).json({ ok: false, error: 'Missing id or status' });
		const tx = await contract.updateProductStatus(ethers.toBigInt(id), status);
		const receipt = await tx.wait();
		return res.json({ ok: true, txHash: receipt.hash });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ ok: false, error: err.message });
	}
});

app.post('/approveProduct', async (req, res) => {
	try {
		const { id } = req.body;
		if (id == null) return res.status(400).json({ ok: false, error: 'Missing id' });
		const tx = await contract.approveProduct(ethers.toBigInt(id));
		const receipt = await tx.wait();
		return res.json({ ok: true, txHash: receipt.hash });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ ok: false, error: err.message });
	}
});

app.get('/getProducts', async (_req, res) => {
	try {
		const products = await contract.getAllProducts();
		const normalized = products.map((p) => ({
			id: p.id.toString(),
			name: p.name,
			category: p.category,
			quantity: p.quantity.toString(),
			urgency: p.urgency,
			section: p.section,
			budget: p.budget.toString(),
			requiredBy: p.requiredBy,
			justification: p.justification,
			status: p.status,
			isApproved: p.isApproved,
			requestedBy: p.requestedBy,
			deliveredBy: p.deliveredBy,
			approvedBy: p.approvedBy,
			requestTime: p.requestTime.toString(),
			deliverTime: p.deliverTime.toString(),
			approveTime: p.approveTime.toString()
		}));
		return res.json({ ok: true, products: normalized });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ ok: false, error: err.message });
	}
});

app.listen(port, () => console.log(`API listening on :${port}`));


