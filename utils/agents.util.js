import Agent from "../classes/agent.class.js";
import map from "../lib/branchIDMap.lib.js";

export default class AgentsUtil {
    static buildAgentsArray = (organizationID, agents, csvData) => {
        try {
            const agentsArray = [...agents]; // Start with a copy of existing agents

            csvData.forEach((row) => {
                if (row['Assigned Users'] && row['Status'] === 'Merchant Is Live') {
                    const assignedUsers = row['Assigned Users'].split(', ');

                    let fName, lName, company = null, manager = null;

                    // Filter out non-agent users (companies or partners)
                    const filteredUsers = assignedUsers.filter((user) => {
                        const lowerCaseUser = user.toLowerCase();
                        return !(
                            lowerCaseUser.includes('c2fs') ||
                            lowerCaseUser.includes('tracer') ||
                            lowerCaseUser.includes('hbs') ||
                            lowerCaseUser.includes('sib')
                        );
                    });

                    // Determine agent and manager
                    if (filteredUsers.length === 1 &&
                        (filteredUsers[0].toLowerCase().includes('cody burnell') ||
                         filteredUsers[0].toLowerCase().includes('christy g milton'))) {
                        const parsedUser = parseUser2(filteredUsers[0]);
                        fName = parsedUser.fName;
                        lName = parsedUser.lName;
                    } else if (filteredUsers.length > 1) {
                        const agentUser = parseUser2(filteredUsers[0]);
                        fName = agentUser.fName;
                        lName = agentUser.lName;

                        const managerUser = filteredUsers.find(user =>
                            user.toLowerCase().includes('cody burnell') ||
                            user.toLowerCase().includes('christy g milton')
                        );
                        if (managerUser) {
                            const parsedManager = parseUser2(managerUser);
                            manager = `${parsedManager.fName} ${parsedManager.lName}`;
                        }
                    }

                    // Extract company from assigned users
                    assignedUsers.forEach((user) => {
                        const parsedUser = parseUser2(user);
                        if (parsedUser.company) company = parsedUser.company;
                    });

                    // Ensure agent is valid before adding
                    if (fName && lName) {
                        const agentIndex = findAgentIndex(agentsArray, fName, lName);

                        if (agentIndex !== -1) {
                            updateExistingAgent(agentsArray, agentIndex, row);
                        } else {
                            createNewAgent(
                                agentsArray, organizationID, fName, lName, 
                                company, manager, row
                            );
                        }
                    } else {
                        console.error('No valid agent found for row:', row);
                    }
                } else {
                    console.error('Assigned Users field missing or status is not "Merchant Is Live". Row:', row);
                }
            });

            return agentsArray;
        } catch (error) {
            throw new Error('Error building agents: ' + error.message);
        }
    };
}

const parseUser2 = (user) => {
    try {
        console.log('Parsing User:', user);
        const nameParts = user.split(' ').filter(n => !/^[0-9-]+$/.test(n) && n.trim() !== '');
        const lowerCaseUser = user.toLowerCase();
        let result = {};

        if (lowerCaseUser.includes('c2fs') || lowerCaseUser.includes('tracer')) {
            result.company = nameParts[0];
        } else if (lowerCaseUser.includes('hbs')) {
            result.partner = 'HBS';
        } else if (lowerCaseUser.includes('sib')) {
            result.partner = 'SIB';
        } else if (nameParts.length >= 2) {
            result.fName = nameParts[0];
            result.lName = nameParts.slice(1).join(' ');
        } else {
            result.fName = nameParts[0];
        }

        return result;
    } catch (error) {
        console.error('Error parsing user:', user, error.message);
        return {};
    }
};

const findAgentIndex = (agents, fName, lName) => {
    return agents.findIndex(agent =>
        agent.fName === fName && agent.lName === lName
    );
};

const updateExistingAgent = (agents, agentIndex, row) => {
    const agent = agents[agentIndex];
    const merchant = buildMerchant(row);

    const midExists = agent.clients.some(client => client.merchantID === merchant.merchantID);
    if (!midExists) {
        agent.clients.push(merchant);
    }
};

const createNewAgent = (agentsArray, organizationID, fName, lName, company, manager, row) => {
    const newAgent = new Agent(organizationID, fName, lName, company, manager);
    newAgent.clients = [buildMerchant(row)];
    agentsArray.push(newAgent);
};

const buildMerchant = (row) => {
    const partnerUser = row['Assigned Users']
        .split(', ')
        .find(user => user.toLowerCase().includes('hbs') || user.toLowerCase().includes('sib'));

    let partner = null;
    let partnerSplit = null;

    if (partnerUser) {
        const parsedPartner = parseUser2(partnerUser);
        partner = parsedPartner.partner;

        // Assign split based on partner type
        if (partner === 'HBS') {
            partnerSplit = '35%';
        } else if (partner === 'SIB') {
            partnerSplit = '30%';
        }
    }

    return {
        merchantID: Number(row['Existing MID']),
        merchantName: row['DBA'] || row['Legal Name'],
        branchID: row['Partner Branch Number'] || null,
        partner, // Store the partner within the merchant object
        partnerSplit // Store the split value within the merchant object
    };
};
