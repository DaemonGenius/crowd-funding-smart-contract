pragma solidity ^0.4.17;

contract CrowdFundFactory {
    address[] public deployedProjects;

    function createProject(uint256 mininumContribution) public {
        address newProject = new CrowdFund(mininumContribution, msg.sender);
        deployedProjects.push(newProject);
    }

    function getDeployedProjects() public view returns (address[]) {
        return deployedProjects;
    }
}

contract CrowdFund {
    struct Request {
        string description;
        uint256 value;
        address recipient;
        bool complete;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }

    address public manager;
    uint256 public mininumContribution;
    mapping(address => bool) public approvers;
    Request[] public requests;
    uint256 public approversCount;

    modifier restricted() {
        require(msg.sender == manager);
        _;
    }

    constructor(uint256 mininum, address creator) public {
        manager = creator;
        mininumContribution = mininum;
    }

    function contribute() public payable {
        require(msg.value > mininumContribution);
        approvers[msg.sender] = true;
        approversCount++;
    }

    function createRequest(
        string description,
        uint256 value,
        address recipient
    ) public restricted {
        Request memory newRequest = Request({
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint256 index) public {
        Request storage request = requests[index];

        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);

        request.approvals[msg.sender] = true;
        request.approvalCount++;
    }

    function finalizeRequest(uint256 index) public restricted {
        Request storage request = requests[index];
        require(request.approvalCount > (approversCount / 2));
        require(!request.complete);

        request.recipient.transfer(request.value);
        request.complete = true;
    }
}
