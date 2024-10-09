import Agent from "../classes/agent.class.js";
import map from "../lib/branchIDMap.lib.js";
export default class AgentsUtil {
    static buildAgentsArray = async (organizationID, agents, csvData) => {
        try {
            csvData.forEach(row => {
                // Check if the 'Assigned Users' field exists and is valid
                if (row['Assigned Users']) {
                    const assignedUsers = row['Assigned Users'].split(',');
                    console.log('Assigned Users:', assignedUsers);
                    assignedUsers.forEach(user => {
                        console.log('User:', user);
                        const newAgent = new Agent();
                        if (user.toLowerCase().includes('tracer' || 'partner')) {
                            const name = user.split(' ');
                            newAgent.role = 'Company';
                            newAgent.company = name[0];
                        } else {
                            const name = user.split(' ');
                            newAgent.role = 'Agent';
                            newAgent.fName = name[0];
                            if (name[1].length === 1)
                            newAgent.lName = name[2];
                        }
                        const agentExists = agents.some(agent => agent.fName === newAgent.fName && agent.lName === newAgent.lName);
                        if (agentExists) {
                            const midExists = agents.some(agent => agent.clients.some(client => client.merchantID === row['Existing MID']));
                            if (midExists) {
                                return;
                            }
                            const agent = agents.find(agent => agent.fName === fName && agent.lName === lName);
                            const merchant = {
                                merchantID: row['Existing MID'],
                                merchantName: row['DBA']
                            };
                            if (row['Partner Branch Number']) {
                                client.branchID = row['Partner Branch Number'];
                            }
                            agent.clients.push(merchant);
                            return;
                        }
                        agentsArray.push(newAgent);
                    });
                    // Check if there are at least 3 users (to avoid out-of-bounds error)
                    if (assignedUsers.length >= 3) {
                        const fullName = assignedUsers[2].split(' ');
                        const fName = fullName[0];
                        const lName = fullName[1] || ''; // Handle cases where there might not be a last name

                        const agentExists = agents.some(agent => agent.fName === fName && agent.lName === lName);
                        if (agentExists) {
                            const midExists = agents.some(agent => agent.clients.some(client => client.merchantID === row['Existing MID']));
                            if (!midExists) {
                                const agent = agents.find(agent => agent.fName === fName && agent.lName === lName);
                                agent.clients.push({
                                    merchantName: row['DBA'],
                                    merchantID: row['Existing MID'],
                                    branchID: row['Partner Branch'],
                                    bankSplit: '0.35%'
                                });
                                return;
                            }
                            return;
                        }

                        const newAgent = new Agent(
                            organizationID,
                            fName,
                            lName,
                            [{
                                merchantName: row['DBA'],
                                merchantID: row['Existing MID'],
                                branchID: row['Partner Branch'],
                                bankSplit: '0.35%'
                            }]
                        );
                        agentsArray.push(newAgent);
                    } else {
                        //console.error('Assigned Users field has fewer than 3 users:', assignedUsers);
                    }
                } else {
                    console.error('Assigned Users field is missing in row:', row);
                }
            });

        } catch (error) {
            throw new Error('Error building agents: ' + error.message);

        };
    };
};

const 

// Helper function to merge agents with the same name
const mergeAgents = (agentsArray) => {
    try {
        console.log('Merging agents:', agentsArray);
        const mergedAgents = [];
        agentsArray.forEach(agent => {
            const agentIndex = mergedAgents.findIndex(mergedAgent => mergedAgent.fName === agent.fName && mergedAgent.lName === agent.lName);
            if (agentIndex === -1) {
                mergedAgents.push(agent);
            } else {
                mergedAgents[agentIndex].clients = [...mergedAgents[agentIndex].clients, ...agent.clients];
            }
        });
        return mergedAgents;
    } catch (error) {
        throw new Error('Error merging agents: ' + error.message);
    }
};






/*
try {
const agentsArray = [];
// Iterate over csvData using for...of to handle async properly
for (const row of csvData) {
    // Check if 'Rep Name' exists in the row
    if (row['Rep Name']) {
        const fullName = row['Rep Name'].split(' ');
        const fName = fullName[0];
        const lName = fullName[1] || ''; // Handle missing last name

        // Search the midMap for the Existing MID and get the corresponding Partner Branch Number
        const midMapping = map.find(entry => entry['Existing MID'] === row['Merchant ID']);
        let branchID = midMapping ? midMapping['Partner Branch Number'] : row.branchID || 'N/A'; // Default to 'N/A' if not found

        let agentExists = false;
        let midExists = false;

        // Ensure agents array is not invalid
        if (!agents.message) {
            agentExists = agents.some(agent => agent.fName === fName && agent.lName === lName);
            midExists = agents.some(agent => agent.clients.some(client => client.merchantID === row['Merchant ID']));
        } else {
            agents = [];
        }

        // If agent exists but MID doesn't, add the merchant to the agent's clients
        if (agentExists && !midExists) {
            const agent = agents.find(agent => agent.fName === fName && agent.lName === lName);
            const client = {
                merchantID: row['Merchant ID'],
                merchantName: row['Merchant Name'],
                branchID, // Use the updated branchID from midMap
                bankSplit: '0.35%'
            };
            // Add client to the existing agent's clients list
            agent.clients.push(client);
            agentsArray.push(agent); // Add to agentsArray for further processing
            continue;
        }

        // Create a new agent if they don't already exist
        if (!agentExists) {
            const newAgent = new Agent(
                organizationID,
                fName,
                lName,
                [{
                    merchantID: row['Merchant ID'],
                    merchantName: row['Merchant Name'],
                    branchID, // Use the updated branchID from midMap
                    bankSplit: '0.35%'
                }]
            );
            agentsArray.push(newAgent); // Add to agentsArray for further processing
        }
    } else {
        console.warn('Row is missing Rep Name:', row);
    }
}

// Merge agents with the same name
const mergedAgents = mergeAgents(agentsArray);

return mergedAgents; // Return the new or modified agents array
} catch (error) {
throw new Error('Error building agents: ' + error.message);
}
};*/