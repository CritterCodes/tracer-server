import { parseFile } from '../utils/fileParser.util.js';
import AgentReportUtil from '../utils/agentReport.util.js';
import ProcessorReportUtil from '../utils/processorReport.util.js';
import ArReportUtil from '../utils/arReport.util.js';
import getBranchIDMap from '../utils/branchIDMap.util.js';
import Type1 from '../utils/type1.util.js'; // Utility functions
import Type2 from '../utils/type2.util.js'; // Utility functions
import Type3 from '../utils/type3.util.js'; // Utility functions
import ReportsV2M from '../models/reportsV2.model.js';
import AgentsModel from '../models/agents.model.js';
import { report } from 'process';

export default class ReportsV2Coor {
  static getReport = async (reportID) => {
    try {
      return await ReportsV2M.getReport(reportID);
    } catch (error) {
      throw new Error('Error getting report: ' + error.message);
    }
  };

  static getReports = async (organizationID, type) => {
    try {
      return await ReportsV2M.getReports(organizationID, type);
    } catch (error) {
      throw new Error('Error getting reports: ' + error.message);
    }
  };

  static getAllReports = async (organizationID) => {
    try {
      return await ReportsV2M.getAllReports(organizationID);
    } catch (error) {
      throw new Error('Error getting all reports: ' + error.message);
    }
  };

  static createArReport = async (organizationID, processor, fileBuffer, mimetype, monthYear) => {
    try {
      const reports = [];
      let response = [];
      // Parse the file
      const csvData = await parseFile(fileBuffer, mimetype, processor);
      if (!csvData || csvData.length === 0) {
        throw new Error('Parsed data is empty. Please check the input file.');
      }
      if (processor === 'PAAY' && !csvData[0].MID) {
        throw new Error('PAAY report is missing required columns. Please check the input file.');
      } else if (processor === 'accept.blue' && !csvData[0].Month) {
        throw new Error('Accept.Blue report is missing required columns. Please check the input file.');
      };

      // Check if a report already exists for this organization, processor, type, and month/year
      const billingReportExists = await ReportsV2M.reportExists(organizationID, processor, 'billing', monthYear);
      if (billingReportExists) {
        throw new Error(`A ${processor} Billing Report for ${monthYear} already exists.`);
      }
      const billingReport = await ArReportUtil.buildBillingReport(organizationID, processor, monthYear, csvData);

      reports.push(billingReport);
      // Check if an AR report already exists for this month and organization
      const arReport = await ReportsV2M.getARReport(organizationID, monthYear);
      const invoiceCount = await ReportsV2M.invoiceNum(organizationID) + 1;

      if (arReport) {
        // Update the existing AR report with the new data
        const result = await ArReportUtil.updateARReport(processor, invoiceCount, arReport, csvData);
        await ReportsV2M.updateReport(result.reportID, result);
        response[result.type] = result;
      } else {
        // Create a new AR report (e.g., for accept.blue)
        const result = await ArReportUtil.buildARReport(organizationID, processor, monthYear, invoiceCount, csvData);
        reports.push(result);
      }
      for (const report of reports) {
        const result = await ReportsV2M.createReport(report);
        if (result.acknowledged) {
          response.push(report);
        }
      }
      return response;
    } catch (error) {
      throw new Error('Error creating billing report: ' + error.message);
    }
  };

  static createProcessorReport = async (organizationID, processor, fileBuffer, mimetype, monthYear) => {
    try {
      // Parse the file
      const csvData = await parseFile(fileBuffer, mimetype, processor);
      const agents = await AgentsModel.getAgents(organizationID);
      if (!csvData || csvData.length === 0) {
        throw new Error('Parsed data is empty. Please check the input file.');
      }
      // Check if a report already exists for this organization, processor, type, and month/year
      console.log('checking if report exists');
      let reportExists;
      console.log('processor:', processor);
      // Check if building Line Item Deductions report
      if (processor === 'Rectangle Health' || processor === 'Hyfin') {
        console.log('checking for Line Item Deductions');
        reportExists = await ReportsV2M.reportExists(organizationID, 'Line Item Deductions', 'processor', monthYear);
        console.log('reportExists:', reportExists);
        if (reportExists) {
          const report = await ReportsV2M.getProcessorReport(organizationID, 'Line Item Deductions', monthYear);
          console.log('line items deduction report:', report.reportID);
          // Check if the processor is already in the report
          if (report.processors.includes(processor)) {
            throw new Error(`A ${processor} Report for ${monthYear} already was already added to the Line Item Deductions Processor Report.`);
          };
          // Update the existing report with the new processor data
          console.log('sending to updateProcessorReport');
          const updatedReport = await ProcessorReportUtil.updateProcessorReport(processor, report, agents, csvData);
          // Update the report in the database
          const result = await ReportsV2M.updateReport(report.reportID, updatedReport);
          // Check if the report was updated successfully
          if (result.reportID) {
            console.log('Report updated');
            return updatedReport;
          };
        } else {
          // Create a new Line Item Deductions report
          console.log('Building Line Item Deductions report');
          const report = await ProcessorReportUtil.buildProcessorReport(organizationID, processor, monthYear, agents, csvData);
          // Create the report in the database
          const result = await ReportsV2M.createReport(report);
          // Check if the report was created successfully
          if (result.acknowledged) {
            return report;
          } else {
            throw new Error('Error creating report: ' + result.message);
          }
        };
      };
      // Check if stanaard processor report exists
      reportExists = await ReportsV2M.reportExists(organizationID, processor, 'processor', monthYear);
      // if report exists,throw error
      if (reportExists) {
        throw new Error(`A ${processor} Processor Report for ${monthYear} already exists.`);
      };
      // Build the processor report
      const report = await ProcessorReportUtil.buildProcessorReport(organizationID, processor, monthYear, agents, csvData);
      // Create the report in the database
      const result = await ReportsV2M.createReport(report);
      // Check if the report was created successfully
      if (result.acknowledged) {
        return report;
      } else {
        throw new Error('Error creating report: ' + result.message);
      }
    } catch (error) {
      throw new Error('Error creating processor report: ' + error)
    }
  };

  static buildAgentReport = async (organizationID, agentID, monthYear) => {
    try {
      console.log('Building agent report');
      console.log('getting agent clients');
      const agent = await AgentsModel.getAgent(organizationID, agentID);
      if (!agent) {
        throw new Error('Agent not found');
      };
      const agentClients = agent.clients;
      // get processor reports
      console.log('Getting processor reports for organization:', organizationID, 'and month/year:', monthYear);
      const processorReports = await ReportsV2M.getProcessorReportsByMonth(organizationID, monthYear);
      if (!processorReports || processorReports.length === 0) {
        console.log('No processor reports found for this month/year.');
        throw new Error('No processor reports found for this month/year.');
      };
      // build report 
      console.log('Building agent report');
      const agentReport = AgentReportUtil.buildAgentReport(organizationID, monthYear, agentClients, processorReports);
      console.log('Agent Report:', agentReport);
      return agentReport;
    } catch (error) {
      throw new Error('Error creating agent report: ' + error.message);
    }
  };

  static createAgentReport = async (organizationID, agentID, monthYear) => {
    try {
      console.log('Checking if agent exists');
      const reportExists = await ReportsV2M.agentReportExists(organizationID, agentID, monthYear);
      if (reportExists) {
        console.log('Agent Report already exists');
        throw new Error(`An Agent Report for ${monthYear} already exists.`);
      };
      const agentReport = new Report(organizationID, 'agent', monthYear, []);
      agentReport.agentID = agentID; // Add the agent ID to the report
      const result = await ReportsV2M.createReport(agentReport);
      if (result.acknowledged) {
        return agentReport;
      } else {
        throw new Error('Error  report: ' + result.message);
      }
    } catch (error) {
      throw new Error('Error creating agent report: ' + error.message);
    }
  };

  static deleteReport = async (reportID) => {
    try {
      return await ReportsV2M.deleteReport(reportID);
    } catch (error) {
      throw new Error('Error deleting report: ' + error.message);
    }
  };
}
