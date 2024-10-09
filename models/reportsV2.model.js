import { db } from '../lib/database.lib.js';
import Constants from '../lib/constants.lib.js';

export default class ReportsV2M {
  static getReport = async (reportID) => {
    try {
      const report = await db.dbReports().findOne({ reportID }, { projection: Constants.DEFAULT_PROJECTION });
      return report;
    } catch (error) {
      throw new Error('Error getting report from DB: ' + error.message);
    }
  };

  static getReports = async (organizationID, type) => {
    try {
      const reports = await db.dbReports().find({ organizationID, type }, { projection: Constants.DEFAULT_PROJECTION }).toArray();
      return reports;
    } catch (error) {
      throw new Error('Error getting reports from DB: ' + error.message);
    }
  };

  static getProcessorReportsByMonth = async (organizationID, monthYear) => {
    try {
      const reports = await db.dbReports().find(
        {
          organizationID,
          type: 'processor',
          month: monthYear
        }, { projection: Constants.DEFAULT_PROJECTION }).toArray();
      return reports;
    } catch (error) {
      throw new Error('Error getting reports from DB: ' + error.message);
    }
  };

  static getAllReports = async (organizationID) => {
    try {
      const reports = await db.dbReports().find({ organizationID }, { projection: Constants.DEFAULT_PROJECTION }).toArray();
      return reports;
    } catch (error) {
      throw new Error('Error getting all reports from DB: ' + error.message);
    }
  };

  static agentReportExists = async (organizationID, agentID, monthYear) => {
    try {
      const existingReport = await db.dbReports().findOne({
        organizationID,
        agentID,
        type: 'agent',
        month: monthYear
      });
      return !!existingReport; // Return true if a report exists, false otherwise
    } catch (error) {
      throw new Error('Error checking if report exists: ' + error.message);
    }
  };

  static reportExists = async (organizationID, processor, type, monthYear) => {
    try {
      const existingReport = await db.dbReports().findOne({
        organizationID,
        processor,
        type,
        month: monthYear
      });
      return !!existingReport; // Return true if a report exists, false otherwise
    } catch (error) {
      throw new Error('Error checking if report exists: ' + error.message);
    }
  };

  static getARReport = async (organizationID, monthYear) => {
    try {
      // Find the AR report for the given organization and month/year
      const arReport = await db.dbReports().findOne({
        organizationID,
        type: 'ar',
        month: monthYear
      }, { projection: Constants.DEFAULT_PROJECTION });

      return arReport; // Return the AR report (if exists)
    } catch (error) {
      throw new Error('Error getting AR report from DB: ' + error.message);
    }
  };

  static getProcessorReport = async (organizationID, processor, monthYear) => {
    try {
      // Find the AR report for the given organization and month/year
      const arReport = await db.dbReports().findOne({
        organizationID,
        processor,
        type: 'processor',
        month: monthYear
      }, { projection: Constants.DEFAULT_PROJECTION });

      return arReport; // Return the AR report (if exists)
    } catch (error) {
      throw new Error('Error getting AR report from DB: ' + error.message);
    }
  };

  static createReport = async (reportData) => {
    try {
      return db.dbReports().insertOne(reportData);
    } catch (error) {
      throw new Error('Error creating report: ' + error.message);
    }
  };

  static invoiceNum = async (organizationID) => {
    try {
      const reports = await db.dbReports().find({ organizationID, type: 'ar' }).toArray();
      let invoiceNum = 0;
      reports.forEach(report => {
        invoiceNum += report.reportData.length;
      });
      return invoiceNum;
    } catch (error) {
      throw new Error('Error generating invoice number: ' + error.message);
    }
  };

  static updateReport = async (reportID, reportData) => {
    try {
      const updatedReport = await db.dbReports().replaceOne({ reportID }, reportData);
      if (!updatedReport.matchedCount) {
        throw new Error('Report not found for updating');
      }
      return await this.getReport(reportID);
    } catch (error) {
      throw new Error('Error updating report: ' + error.message);
    }
  };

  static deleteReport = async (reportID) => {
    try {
      const deletedReport = await db.dbReports().deleteOne({ reportID });
      if (!deletedReport.deletedCount) {
        throw new Error('Report not found for deletion');
      }
      return { message: 'Report successfully deleted' };
    } catch (error) {
      throw new Error('Error deleting report: ' + error.message);
    }
  };
}
