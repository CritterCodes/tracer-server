import ReportsV2Coor from '../coordinators/reportsV2.coordinator.js';
import processorTypeMap from '../lib/typeMap.lib.js';

export default class ReportsV2Con {
  // General report functions
    // Get a report by ID
  static getReport = async (req, res, next) => {
    try {
      const report = await ReportsV2Coor.getReport(req.params.reportID);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      return res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };
  
    // Get all reports of a certain type for an organization
  static getReports = async (req, res, next) => {
    try {
      const reports = await ReportsV2Coor.getReports(req.params.organizationID, req.params.type);
      if (!reports || reports.length === 0) {
        return res.status(404).json({ message: 'No reports found' });
      }
      return res.status(200).json(reports);
    } catch (error) {
      next(error);
    }
  };

    // Get all reports for an organization
  static getAllReports = async (req, res, next) => {
    try {
      const reports = await ReportsV2Coor.getAllReports(req.params.organizationID);
      if (!reports || reports.length === 0) {
        return res.status(404).json({ message: 'No reports found' });
      }
      return res.status(200).json(reports);
    } catch (error) {
      next(error);
    }
  };

    // bulk create reports
  static createReports = async (req, res, next) => {
    try {
      const files = req.files;
      const organizationID = req.params.organizationID;

      if (!files || Object.keys(files).length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      const reportPromises = [];
      const processors = Object.keys(files);

      for (const processor of processors) {
        const fileBuffer = files[processor][0].buffer;
        const mimetype = files[processor][0].mimetype;
        const monthYear = `${req.body.month} ${req.body.year}`;

        // Check if the file is in a valid format
        if (!['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(mimetype)) {
          return res.status(400).json({ message: 'Invalid file format' });
        }

        //const processorType = processorTypeMap[processor];

        let promise;
        if (processor === 'accept.blue' || processor === 'PAAY') {
          // Handle Type 1 processors (accept.blue, PAAY)
          promise = await ReportsV2Coor.createArReport(organizationID, processor, fileBuffer, mimetype, monthYear);
          reportPromises.push(promise);
        } else {
          promise = await ReportsV2Coor.createProcessorReport(organizationID, processor, fileBuffer, mimetype, monthYear);
          reportPromises.push(promise);
        }
      }
      const results = await Promise.all(reportPromises);
      const reports = [];
      for (const result of results) {
        reports.push(result[0]);
        if (result[1]) {
          reports.push(result[1]);
        }
      }
      if (reports.length === 0) {
        return res.status(400).json({ message: 'Reports not created' });
      } else {
        return res.status(200).json({ message: 'Reports created successfully', reports });
      }
    } catch (error) {
      next(error);
    }
  };

    // Delete a report by ID
  static deleteReport = async (req, res, next) => {
    try {
      const report = await ReportsV2Coor.deleteReport(req.params.reportID);
      if (!report) {
        return res.status(404).json({ message: 'Report not deleted' });
      }
      return res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };

    // Update a report by ID
  static updateReport = async (req, res, next) => {
    try {
      const report = await ReportsV2Coor.updateReport(req.params.reportID, req.body);
      if (!report) {
        return res.status(404).json({ message: 'Report not updated' });
      }
      return res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };

  // Agent Report functions
    // Build agent report
  static buildAgentReport = async (req, res, next) => {
    try {
      const agentReport = await ReportsV2Coor.buildAgentReport(req.params.organizationID, req.params.agentID, req.body.monthYear);
      if (!agentReport) {
        return res.status(404).json({ message: 'Agent report not found' });
      }
      return res.status(200).json(agentReport);
    } catch (error) {
      next(error);
    }
  };

    // Get agent report
  static getAgentReport = async (req, res, next) => {
    try {
      const monthYear = `${req.params.month} ${req.params.year}`;
      console.log('Month Year:', monthYear);
      const agentReport = await ReportsV2Coor.getAgentReport(req.params.organizationID, req.params.agentID, monthYear);
      console.log('Agent Report:', agentReport);
      if (!agentReport || agentReport.length === 0) {
        return res.status(404).json({ message: 'No agent reports found' });
      }
      return res.status(200).json(agentReport);
      
    } catch (error) {
      next(error);
      
    }
  };

    // Create agent report
  static createAgentReport = async (req, res, next) => {
    try {
      const agentReport = await ReportsV2Coor.createAgentReport(req.params.organizationID, req.params.agentID, req.body);
      if (!agentReport.acknowledged) {
        return res.status(404).json({ message: 'Agent report not created' });
      }
      return res.status(200).json(agentReport);
    } catch (error) {
      next(error);
    }
  };

  // Processor Summary Report functions
    // Build processor summary report
  static buildProcessorSummaryReport = async (req, res, next) => {
    try {
      console.log('Building Processor Report: ', req.params.organizationID, req.body.monthYear);
      const processorReport = await ReportsV2Coor.buildProcessorSummaryReport(req.params.organizationID,req.body.monthYear);
      if (!processorReport) {
        return res.status(404).json({ message: 'Processor report not found' });
      }
      return res.status(200).json(processorReport);
    } catch (error) {
      next(error);
    }
  };
  
      // Create processor summary report
  static createProcessorSummaryReport = async (req, res, next) => {
    try {
      console.log('Reports Controller: Creating Processor Summary Report');
      const processorReport = await ReportsV2Coor.createProcessorSummaryReport(req.params.organizationID, req.body);
      if (!processorReport.acknowledged) {
        return res.status(404).json({ message: 'Processor report not created' });
      }
      return res.status(200).json(processorReport);
    } catch (error) {
      next(error);
    }
  };

      // Get processor summary report
  static getProcessorSummaryReport = async (req, res, next) => {
    try {
      console.log('Reports Controller: Getting Processor Summary Report');
      const monthYear = `${req.params.month} ${req.params.year}`;
      console.log('Month Year:', monthYear);
      console.log('Organization ID:', req.params.organizationID);
      const processorReport = await ReportsV2Coor.getProcessorReport(req.params.organizationID, monthYear);
      console.log('Processor Report:', processorReport);
      if (!processorReport || processorReport.length === 0) {
        return res.status(404).json({ message: 'No processor reports found' });
      }
      return res.status(200).json(processorReport);
    } catch (error) {
      next(error);
    }
  };

  // Agent Summary Report functions
    // Build agent summary report
  static buildAgentSummaryReport = async (req, res, next) => {
    try {
      const agentSummaryReport = await ReportsV2Coor.buildAgentSummaryReport(req.params.organizationID, req.body.monthYear);
      if (!agentSummaryReport) {
        return res.status(404).json({ message: 'Agent summary report not found' });
      }
      return res.status(200).json(agentSummaryReport);
    } catch (error) {
      next(error);
    }
  };
  
      // Create agent summary report
  static createAgentSummaryReport = async (req, res, next) => {
    try {
      console.log('Reports Controller: Creating Agent Summary Report', req.params.organizationID, req.body);
      const agentSummaryReport = await ReportsV2Coor.createAgentSummaryReport(req.params.organizationID, req.body);
      if (!agentSummaryReport.acknowledged) {
        return res.status(404).json({ message: 'Agent summary report not created' });
      }
      return res.status(200).json(agentSummaryReport);
    } catch (error) {
      next(error);
    }
  };
  
        // Get agent summary report
  static getAgentSummaryReport = async (req, res, next) => {
    try {
      const monthYear = `${req.params.month} ${req.params.year}`;
      console.log('Month Year:', monthYear);
      const agentSummaryReport = await ReportsV2Coor.getAgentSummaryReport(req.params.organizationID, monthYear);
      console.log('Agent Summary Report:', agentSummaryReport);
      if (!agentSummaryReport || agentSummaryReport.length === 0) {
        return res.status(404).json({ message: 'No agent summary reports found' });
      }
      return res.status(200).json(agentSummaryReport);
    } catch (error) {
      next(error);
    }
  };
}
