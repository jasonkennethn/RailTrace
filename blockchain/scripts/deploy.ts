import { ethers } from "hardhat";

async function main() {
	const Factory = await ethers.getContractFactory("ProductManager");
	const contract = await Factory.deploy();
	await contract.waitForDeployment();
	const address = await contract.getAddress();
	console.log("ProductManager deployed to:", address);
}

main().catch((e) => {
	console.error(e);
	process.exitCode = 1;
});


