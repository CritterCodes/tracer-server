import Agent from "../classes/agent.class.js";
import map from "../lib/branchIDMap.lib.js";

export default class AgentsUtil {
    static buildAgentsArray = (organizationID, agents, csvData) => {
        try {
            const agentsArray = [...agents]; // Start with a copy of existing agents
            csvData.forEach(row => {
                if (row['Assigned Users'] && row['Status'] === 'Merchant Is Live') {
                    const assignedUsers = row['Assigned Users'].split(', ');
                    const newAgent = {};
                    assignedUsers.forEach(user => {
                        const parsedUser = parseUser2(user);

                        if (parseUser.company) {
                            newAgent.company = parsedUser.company;
                        } else if (parsedUser.partner) {
                            newAgent.partner = parsedUser.partner;
                        } else if (parsedUser.manager) {
                            newAgent.manager = parsedUser.manager;
                        } else {
                            newAgent.fName = parsedUser.fName;
                            newAgent.lName = parsedUser.lName;
                        };
                    });
                    
                    const agentIndex = findAgentIndex(agentsArray, fName, lName);

                    if (agentIndex !== -1) {
                        updateExistingAgent(agentsArray, agentIndex, row);
                    } else {
                        createNewAgent(agentsArray, organizationID, role, fName, lName, company, row);
                    }
                } else {
                    console.error('Assigned Users field is missing in row:', row);
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
        const name = user.split(' ');
        const cleanName = name.filter(n => !/^[0-9-]+$/.test(n) && n.trim() !== '');
        if (user.includes('h2sf' || 'tracer')) {
            const company = cleanName[0];
            return { company };
        } else if (user.toLowerCase().includes('hbs')) {
            const partner = cleanName[0];
            return { partner };
        } else if (user.toLowerCase().includes('cody burnell' || 'christy G milton')) {
            const manager = cleanName[0];
            return { manager };
        } else {
            const fName = name[0];
            const lName = cleanName[1];
            return { fName, lName };
        };
    } catch (error) {
        console.error('Error parsing user:', user, error.message);

    }
};

const parseUser = (user) => {
    const name = user.split(' ');
    const cleanName = name.filter(n => !/^[0-9-]+$/.test(n) && n.trim() !== '');
    console.log('Name:', cleanName);
    let role, fName, lName, company;
    if (user.toLowerCase().includes('h2sf')) {
        role = 'company';
        company = cleanName[0];
    } else {
        role = 'agent';
        fName = name[0];
        if (cleanName.length === 3) {
            lName = cleanName[2];
        } else {
            lName = cleanName[1];
        }
    }
    console.log('Role:', role, 'First Name:', fName, 'Last Name:', lName, 'Company:', company);
    return { role, fName, lName, company };
};

const findAgentIndex = (agents, fName, lName) => {
    // Find the agent or company based on the correct criteria
    return agents.findIndex(agent =>
        (agent.role === 'agent' && agent.fName === fName && agent.lName === lName));
};

const updateExistingAgent = (agents, agentIndex, row) => {
    const agent = agents[agentIndex];
    const merchant = buildMerchant(row);

    // Check if the merchant already exists in the agent's client list
    const midExists = agent.clients.some(client => client.merchantID === merchant.merchantID);
    if (!midExists) {
        agent.clients.push(merchant);
    }
};

const createNewAgent = (agentsArray, organizationID, role, fName, lName, company, row) => {
    const newAgent = new Agent(organizationID, role, fName, lName, company);
    newAgent.clients = [buildMerchant(row)]; // Create a client list with the first merchant
    agentsArray.push(newAgent);
};

// Utility function to build the merchant object
const buildMerchant = (row) => {
    return {
        merchantID: Number(row['Existing MID']),
        merchantName: row['DBA'] || row['Legal Name'], // Fallback to Legal Name if DBA is missing
        branchID: row['Partner Branch Number'] || null
    };
};
