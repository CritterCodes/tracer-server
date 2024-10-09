import AgentsCoordinator from '../coordinators/agents.coordinator.js';

export const createAgent = async (req, res, next) => {
    try {
        console.log('Controller: createAgent');
        const result = await AgentsCoordinator.createAgent(req.params.organizationID, req.body);
        if (!result.acknowledged) {
            return res.status(400).send(result);
        } else {
            return res.status(201).send(result);
        }
    } catch (error) {
        next(error); // Pass error to centralized error handler
    }
};

export const uploadAgents = async (req, res, next) => {
    try {
      const file = req.file; // Since you are uploading a single file
      const organizationID = req.params.organizationID;
  
      // Check if file is present
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      const fileBuffer = file.buffer;
      const mimetype = file.mimetype;
  
      // Validate file format (CSV or XLSX)
      if (!['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(mimetype)) {
        return res.status(400).json({ message: 'Invalid file format' });
      }
  
      // Call the coordinator to create agents from the file
      const result = await AgentsCoordinator.uploadAgents(organizationID, fileBuffer, mimetype);
  
      console.log('Agents upload completed');
  
      if (!result || result.length === 0) {
        return res.status(400).json({ message: 'Agents not created' });
      } else {
        return res.status(200).json({ message: 'Agents created successfully', result });
      }
    } catch (error) {
      next(error);
    }
  };
  

export const getAgent = async (req, res, next) => {
    try {
        const result = await AgentsCoordinator.getAgent(req.params.organizationID, req.params.agentID);
        if (result.message) {
            return res.status(404).send(result);
        } else {
            return res.status(200).send(result);
        }
    } catch (error) {
        next(error);
    }
};

export const getAgents = async (req, res, next) => {
    try {
        console.log(req.params.organizationID);
        const result = await AgentsCoordinator.getAgents(req.params.organizationID);
        if (result.message) {
            return res.status(404).send(result);
        } else {
            return res.status(200).send(result);
        }
    } catch (error) {
        next(error);
    }
};

export const updateAgent = async (req, res, next) => {
    try {
        console.log(req.params.agentID);
        const result = await AgentsCoordinator.updateAgent(req.params.organizationID, req.params.agentID, req.body);
        if (result.success === false) {
            console.log('Controller: updateAgent - Error');
            return res.status(400).send(result);
        } else {
            return res.status(200).send(result);
        }
    } catch (error) {
        next(error);
    }
};

export const deleteAgent = async (req, res, next) => {
    try {
        console.log('Controller: deleteAgent');
        console.log('req.params.agentID:', req.params.agentID);
        const result = await AgentsCoordinator.deleteAgent(req.params.organizationID, req.params.agentID);
        if (!result.acknowledged) {
            return res.status(400).send(result);
        } else {
            console.log('Agent deleted successfully');
            return res.status(204).send(); // Send 204 No Content for successful deletion
        }
    } catch (error) {
        next(error);
    }
};
