// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonorManagement {
    struct Donor {
        string name;
        uint8 age;
        string gender;
        string bloodGroup;
        uint256 weight;
        uint256 donationCount;
        bool exists;
        bool incentiveClaimed;
        bytes32 passwordHash;
    }

    mapping(string => Donor) public donors;
    mapping(string => address) public donorOwners;
    string[] private donorIds;
    address public admin;

    event DonorRegistered(string medicalId);
    event IncentiveClaimed(string medicalId, uint256 amount);
    event Funded(address indexed sender, uint256 amount);
    event Withdrawn(address indexed receiver, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerDonor(
        string memory name,
        uint8 age,
        string memory gender,
        string memory medicalId,
        string memory bloodGroup,
        uint256 weight,
        string memory password
    ) public {
        require(!donors[medicalId].exists, "Donor already registered");
        require(age >= 18 && age <= 65, "Age must be between 18 and 65");
        require(weight >= 50, "Weight must be 50kg or more");

        donors[medicalId] = Donor(
            name,
            age,
            gender,
            bloodGroup,
            weight,
            0,
            true,
            false,
            keccak256(abi.encodePacked(password))
        );

        donorOwners[medicalId] = msg.sender;
        donorIds.push(medicalId);

        emit DonorRegistered(medicalId);
    }

    function verifyPassword(string memory medicalId, string memory password) public view returns (bool) {
        require(donors[medicalId].exists, "Donor does not exist");
        return donors[medicalId].passwordHash == keccak256(abi.encodePacked(password));
    }

    function getDonor(string memory medicalId) public view returns (
        string memory name,
        uint8 age,
        string memory gender,
        string memory bloodGroup,
        uint256 weight,
        uint256 donationCount
    ) {
        require(donors[medicalId].exists, "Donor not found");
        Donor memory d = donors[medicalId];
        return (d.name, d.age, d.gender, d.bloodGroup, d.weight, d.donationCount);
    }

    function donorExists(string memory medicalId) public view returns (bool) {
        return donors[medicalId].exists;
    }

    function getAllDonors() public view onlyAdmin returns (string[] memory) {
        return donorIds;
    }

    function incrementDonationCount(string memory medicalId) public onlyAdmin {
        require(donors[medicalId].exists, "Donor does not exist");
        donors[medicalId].donationCount += 1;
    }

    receive() external payable {}

    function fundContract() public payable onlyAdmin {
        require(msg.value > 0, "Must send some Ether to fund the contract");
        emit Funded(msg.sender, msg.value);
    }

    function claimIncentive(string memory medicalId) public {
        require(donors[medicalId].exists, "Donor does not exist");
        require(donorOwners[medicalId] == msg.sender, "Unauthorized: Not your account");

        Donor storage donor = donors[medicalId];
        require(!donor.incentiveClaimed, "Incentive already claimed");

        uint256 points = donor.donationCount * 10;
        uint256 amount = points * 1 wei;
        require(address(this).balance >= amount, "Insufficient contract balance");

        donor.incentiveClaimed = true;
        payable(msg.sender).transfer(amount);

        emit IncentiveClaimed(medicalId, amount);
    }

    function withdrawFunds(uint256 amount) public onlyAdmin {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(admin).transfer(amount);
        emit Withdrawn(admin, amount);
    }
}
