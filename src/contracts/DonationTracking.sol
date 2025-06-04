// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DonationTracking {
    struct Donation {
        string medicalId;
        string bankId;
        uint256 timestamp;
    }

    Donation[] public donations;

    mapping(string => uint256[]) private donationsByBank;

    event DonationRecorded(string medicalId, string bankId, uint256 timestamp);

    function recordDonation(string memory medicalId, string memory bankId) public {
        Donation memory newDonation = Donation({
            medicalId: medicalId,
            bankId: bankId,
            timestamp: block.timestamp
        });
        donations.push(newDonation);
        donationsByBank[bankId].push(donations.length - 1);
        emit DonationRecorded(medicalId, bankId, block.timestamp);
    }

    function getAllDonations() public view returns (Donation[] memory) {
        return donations;
    }

    function getDonationsByBank(string memory bankId) public view returns (Donation[] memory) {
        uint256[] storage indices = donationsByBank[bankId];
        Donation[] memory result = new Donation[](indices.length);
        for (uint256 i = 0; i < indices.length; i++) {
            result[i] = donations[indices[i]];
        }
        return result;
    }

    function getDonationsByDonor(string memory medicalId) public view returns (Donation[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < donations.length; i++) {
            if (keccak256(bytes(donations[i].medicalId)) == keccak256(bytes(medicalId))) {
                count++;
            }
        }
        Donation[] memory result = new Donation[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < donations.length; i++) {
            if (keccak256(bytes(donations[i].medicalId)) == keccak256(bytes(medicalId))) {
                result[index] = donations[i];
                index++;
            }
        }
        return result;
    }
}
