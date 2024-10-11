import AgentsModel from '../models/agents.model.js';
import Agent from '../classes/agent.class.js';
import AgentsUtil from '../utils/agents.util.js';
import { parseFile } from '../utils/fileParser.util.js';

export default class AgentsCoordinator {

    static createAgent = async (organizationID, agent) => {
        try {
            const newAgent = new Agent(organizationID, agent.fName, agent.lName, agent.clients);
            return await AgentsModel.createAgent(newAgent);
        } catch (error) {
            throw error;
        }
    };

    static uploadAgents = async (organizationID, fileBuffer, mimetype) => {
        try {
            const csvData = await parseFile(fileBuffer, mimetype);
            if (!csvData || csvData.length === 0) {
                throw new Error('Parsed data is empty. Please check the input file.');
            }
    
            // Get a list of all agents for an organization
            console.log('asking for agents');
            let agents = await AgentsModel.getAgents(organizationID);
            console.log('got agents:', agents);
    
            // Ensure agents is an array
            if (!Array.isArray(agents)) {
                agents = [];
            }
    
            // Build an array of agents from the CSV data
            const agentsArray = AgentsUtil.buildAgentsArray(organizationID, agents, csvData);
    
            // Add or update the agents in the database
            const allResults = [];
            for (const agent of agentsArray) {
                let result;
                if (Array.isArray(agents) && agents.some(a => a.fName === agent.fName && a.lName === agent.lName)) {
                    // Update existing agent
                    result = await AgentsModel.updateAgent(organizationID, agent);
                    if (!result.acknowledged) {
                        throw new Error('Error updating agent: ' + result.message);
                    }
                } else {
                    // Add new agent
                    result = await AgentsModel.createAgent(agent);
                    if (!result.acknowledged) {
                        throw new Error('Error adding agent: ' + result.message);
                    }
                }
                allResults.push(result);
            }
    
            return allResults;
        } catch (error) {
            throw new Error('Error adding agents in coordinator: ' + error);
        }
    };

    static getAgent = async (organizationID, agentID) => {
        try {
            const agent = await AgentsModel.getAgent(organizationID, agentID);
            if (!agent) {
                return { success: false, message: "Agent not found" };
            }
            return { success: true, agent };
        } catch (error) {
            throw error;
        }
    };

    static getAgents = async (organizationID,) => {
        try {
            const agents = await AgentsModel.getAgents(organizationID);
            return { success: true, agents };
        } catch (error) {
            throw error;
        }
    };

    static updateAgent = async (organizationID, agentID, update) => {
        try {
            const agent = await AgentsModel.getAgent(organizationID, agentID);
            if (!agent) {
                return { success: false, message: "Agent not found" };
            }
            // Apply the updates to the agent object
            const updatedAgent = new Agent(organizationID, agent.fName, agent.lName, agent.clients);
            updatedAgent.updateAgent(update); // This assumes updateAgent is defined in the Agent class

            const result = await AgentsModel.updateAgent(organizationID, updatedAgent);
            if (result.acknowledged) {
                return { success: true, agent: updatedAgent };
            } else {
                return { success: false, message: "Failed to update agent" };
            }
        } catch (error) {
            throw error;
        }
    };

    static deleteAgent = async (organizationID, agentID) => {
        try {
            const result = await AgentsModel.deleteAgent(organizationID, agentID);
            if (result.deletedCount > 0) {
                return result;
            }
            return { success: false, message: "Failed to delete agent" };
        } catch (error) {
            throw error;
        }
    };
}
