// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProductManager {
	struct Product {
		uint256 id;
		string name;
		string category;
		uint256 quantity;
		string urgency;
		string section;
		uint256 budget;
		string requiredBy;
		string justification;
		string status;
		bool isApproved;
		address requestedBy;
		address deliveredBy;
		address approvedBy;
		uint256 requestTime;
		uint256 deliverTime;
		uint256 approveTime;
	}

	event ProductCreated(uint256 indexed id, address indexed requestedBy);
	event ProductUpdated(uint256 indexed id, string status, address indexed deliveredBy);
	event ProductApproved(uint256 indexed id, address indexed approvedBy);

	uint256 private nextId = 1;
	mapping(uint256 => uint256) private idToIndex; // id => index+1
	Product[] private products;

	function createProduct(
		string calldata name,
		string calldata category,
		uint256 quantity,
		string calldata urgency,
		string calldata section,
		uint256 budget,
		string calldata requiredBy,
		string calldata justification
	) external returns (uint256) {
		uint256 id = nextId++;
		Product memory p = Product({
			id: id,
			name: name,
			category: category,
			quantity: quantity,
			urgency: urgency,
			section: section,
			budget: budget,
			requiredBy: requiredBy,
			justification: justification,
			status: "Requested",
			isApproved: false,
			requestedBy: msg.sender,
			deliveredBy: address(0),
			approvedBy: address(0),
			requestTime: block.timestamp,
			deliverTime: 0,
			approveTime: 0
		});
		products.push(p);
		idToIndex[id] = products.length;
		emit ProductCreated(id, msg.sender);
		return id;
	}

	function updateProductStatus(uint256 id, string calldata newStatus) external {
		uint256 idx1 = idToIndex[id];
		require(idx1 != 0, "Product not found");
		uint256 i = idx1 - 1;

		products[i].status = newStatus;
		products[i].deliveredBy = msg.sender;
		products[i].deliverTime = block.timestamp;

		emit ProductUpdated(id, newStatus, msg.sender);
	}

	function approveProduct(uint256 id) external {
		uint256 idx1 = idToIndex[id];
		require(idx1 != 0, "Product not found");
		uint256 i = idx1 - 1;

		products[i].isApproved = true;
		products[i].approvedBy = msg.sender;
		products[i].approveTime = block.timestamp;
		products[i].status = "Approved";

		emit ProductApproved(id, msg.sender);
	}

	function getAllProducts() external view returns (Product[] memory) {
		return products;
	}
}
