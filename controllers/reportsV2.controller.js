import ReportsV2Coor from '../coordinators/reportsV2.coordinator.js';
import processorTypeMap from '../lib/typeMap.lib.js';

export default class ReportsV2Con {
  static getReport = async (req, res, next) => {
    try {
      console.log('Reports Controller: Getting report');
      const report = await ReportsV2Coor.getReport(req.params.reportID);
      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }
      return res.status(200).json(report);
    } catch (error) {
      next(error);
    }
  };

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

  static createReports = async (req, res, next) => {
    try {
      console.log('Reports Controller: Creating reports');
      const files = req.files;
      const organizationID = req.params.organizationID;

      if (!files || Object.keys(files).length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }
      const reportPromises = [];
      const processors = Object.keys(files);
      console.log('Processors:', processors);

      for (const processor of processors) {
        console.log('processing report for:', processor);
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
      console.log('Reporting completed');
      if (reports.length === 0) {
        return res.status(400).json({ message: 'Reports not created' });
      } else {
        return res.status(200).json({ message: 'Reports created successfully', reports });
      }
    } catch (error) {
      next(error);
    }
  };

  static buildAgentReport = async (req, res, next) => {
    try {
      console.log('Building agent report with:', req.body); 
      const agentReport = await ReportsV2Coor.buildAgentReport(req.params.organizationID, req.params.agentID, req.body.monthYear);
      if (!agentReport) {
        return res.status(404).json({ message: 'Agent report not found' });
      }
      return res.status(200).json(agentReport);
    } catch (error) {
      next(error);
    }
  };

  static createAgentReport = async (req, res, next) => {
    try {
      const agentReport = await ReportsV2Coor.createAgentReport(req.params.organizationID, req.params.agentID, req.body.monthYear);
      if (!agentReport.acknowledged) {
        return res.status(404).json({ message: 'Agent report not created' });
      }
      return res.status(200).json(agentReport);
    } catch (error) {
      next(error);
    }
  };

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
}
