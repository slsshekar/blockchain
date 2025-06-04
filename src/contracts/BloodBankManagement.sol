// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BloodBankManagement {
    struct BloodBank {
        string name;
        string location;
        string bankId;
        bytes32 passwordHash;
        bool exists;
        mapping(string => uint) bloodUnits; // bloodGroup => units
    }

    mapping(string => BloodBank) private bloodBanks;
    mapping(address => string[]) private ownerToBanks;

    // New mapping to store infection comments by donor medicalId
    // Changed to store comments per donation using donationId (string)
    mapping(string => string[]) private infectionCommentsByDonation;

    address public admin;

    event BloodBankRegistered(string bankId, string name);
    event BloodUnitsUpdated(string bankId, string bloodGroup, uint units);
    event InfectionCommentAdded(string donationId, string comment);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyBloodBankOwner(string memory bankId) {
        bool isOwner = false;
        string[] memory banks = ownerToBanks[msg.sender];
        for (uint i = 0; i < banks.length; i++) {
            if (keccak256(abi.encodePacked(banks[i])) == keccak256(abi.encodePacked(bankId))) {
                isOwner = true;
                break;
            }
        }
        require(isOwner || msg.sender == admin, "Not authorized");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerBloodBank(string memory name, string memory bankId, string memory location, string memory password) public {
        require(!bloodBanks[bankId].exists, "Bank already exists");
        BloodBank storage b = bloodBanks[bankId];
        b.name = name;
        b.location = location;
        b.bankId = bankId;
        b.passwordHash = keccak256(abi.encodePacked(password));
        b.exists = true;
        ownerToBanks[msg.sender].push(bankId);
        emit BloodBankRegistered(bankId, name);
    }

    function loginBloodBank(string memory bankId, string memory password) public view returns (bool) {
        require(bloodBanks[bankId].exists, "Bank not found");
        return bloodBanks[bankId].passwordHash == keccak256(abi.encodePacked(password));
    }

    function addBloodUnits(string memory bankId, string memory bloodGroup, uint units) public onlyBloodBankOwner(bankId) {
        require(bloodBanks[bankId].exists, "Bank not found");
        bloodBanks[bankId].bloodUnits[bloodGroup] += units;
        emit BloodUnitsUpdated(bankId, bloodGroup, bloodBanks[bankId].bloodUnits[bloodGroup]);
    }

    function getBloodUnits(string memory bankId, string memory bloodGroup) public view returns (uint) {
        require(bloodBanks[bankId].exists, "Bank not found");
        return bloodBanks[bankId].bloodUnits[bloodGroup];
    }

    function getBloodBankOwners(address owner) public view returns (string[] memory) {
        return ownerToBanks[owner];
    }

    function bankExists(string memory bankId) public view returns (bool) {
        return bloodBanks[bankId].exists;
    }

    // New function to add infection comment for a donation
    function addInfectionComment(string memory donationId, string memory comment) public {
        infectionCommentsByDonation[donationId].push(comment);
        emit InfectionCommentAdded(donationId, comment);
    }

    // New function to get infection comments for a donation
    function getInfectionComments(string memory donationId) public view returns (string[] memory) {
        return infectionCommentsByDonation[donationId];
    }
}
