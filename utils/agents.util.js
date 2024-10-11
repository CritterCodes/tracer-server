import Agent from "../classes/agent.class.js";
import map from "../lib/branchIDMap.lib.js";

export default class AgentsUtil {
    static buildAgentsArray = (organizationID, agents, csvData) => {
        try {
            const agentsArray = [...agents]; // Start with a copy of existing agents
            csvData.forEach(row => {
                if (row['Assigned Users'] && row['Status'] === 'Merchant Is Live') {
                    const assignedUsers = row['Assigned Users'].split(', ');
                    assignedUsers.forEach(user => {
                        const { role, fName, lName, company } = parseUser(user);
                        const agentIndex = findAgentIndex(agentsArray, fName, lName, company);

                        if (agentIndex !== -1) {
                            updateExistingAgent(agentsArray, agentIndex, row);
                        } else {
                            createNewAgent(agentsArray, organizationID, role, fName, lName, company, row);
                        }
                    });
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

const parseUser = (user) => {
    const name = user.split(' ');
const cleanName = name.filter(n => !/^[0-9-]+$/.test(n) && n.trim() !== '');
    console.log('Name:', cleanName);
    let role, fName, lName, company;
    if (user.toLowerCase().includes('tracer') || user.toLowerCase().includes('partner')) {
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

const findAgentIndex = (agents, fName, lName, company) => {
    // Find the agent or company based on the correct criteria
    return agents.findIndex(agent =>
        (agent.role === 'agent' && agent.fName === fName && agent.lName === lName) ||
        (agent.role === 'company' && agent.company === company)
    );
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
