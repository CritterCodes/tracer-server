import Report from "../classes/report.class.js";
import processorTypeMap from "../lib/typeMap.lib.js";
import Type1Row from "../classes/type1Row.class.js";
import Type2Row from "../classes/type2Row.class.js";
import Type3Row from "../classes/type3Row.class.js";
import Type4Row from "../classes/type4Row.class.js";
export default class AgentReportUtil {

  static buildAgentReport = (organizationID, monthYear, agent, processorReports) => {
    try {

      // Build report data
      const reportData = buildAgentReportData(agent, processorReports);

      // Build report
      const agentReport = new Report(organizationID, '', 'agent', monthYear, reportData);

      return agentReport;
    } catch (error) {
      console.error('Error creating agent report:', error);
      throw new Error('Error creating agent report: ' + error.message);
    }
  };
}

const buildAgentReportData = (agent, processorReports) => {
  try {

    // Ensure the inputs are valid
    if (!Array.isArray(agent.clients) || !Array.isArray(processorReports)) {
      throw new Error('Invalid input: agentClients or processorReports is not an array');
    }

    // Build the agent report data by filtering each processor's report data
    const agentReportData = processorReports.map(report => ({
      processor: report.processor,
      reportData: buildProcessorReportData(report, agent)
    }));


    return agentReportData;
  } catch (error) {
    console.error('Error building agent report data:', error);
    throw new Error('Error building agent report data: ' + error.message);
  }
};

const buildProcessorReportData = (report, agent) => {
  try {

    const agentClients = agent.clients;

    // Ensure the report data and agent clients are valid
    if (!report || !Array.isArray(report.reportData)) {
      throw new Error('Invalid report data: report or reportData is missing or not an array');
    }
    if (!Array.isArray(agentClients)) {
      throw new Error('Invalid agent clients: agentClients is not an array');
    }

    // Create a map of clients by their Merchant ID for fast lookup
    const clientMap = new Map(
      agentClients.map(client => [client.merchantID, client])
    );

    // Filter report data to include only rows where the Merchant ID exists in the agent's clients
    const filteredReportData = report.reportData.filter(row =>
      clientMap.has(row['Merchant Id'])
    );

    const type = processorTypeMap[report.processor];
    // Build the final report data with the necessary fields and calculations
    const finalReportData = filteredReportData.map(row => {
      const client = clientMap.get(row['Merchant Id']);
      let finalReportRow, agentSplit;
      switch (client.partner) {
        case 'SIB':
          agentSplit = .6;
          break;
        case 'HBS':
          agentSplit = .4;
          break;
        case 'PharmaTrush':
        case 'Jonathan Mosley':
          agentSplit = .7;
          break;
        case 'CasTech':
          agentSplit = .5;
          break;
        default:
          agentSplit = client.agentSplit;
          break;
      };
      const branchID = client.partner ? client.branchID : 'N/A';
      switch (type) {
        case 'type1':
          finalReportRow = new Type1Row(
            row['Merchant Id'],
            row['Merchant Name'],
            row['Transaction'],
            row['Sales Amount'],
            row['Income'],
            row['Expenses'],
            row['Net'],
            row['BPS'],
            agentSplit,
            branchID
          );
          break;

        case 'type2':
          finalReportRow = new Type2Row(
            row['Merchant Id'],
            row['Merchant Name'],
            row['Payout Amount'],
            row['Volume'],
            row['Sales'],
            row['Refunds'],
            row['Reject Amount'],
            agentSplit,
            branchID
          );
          break;

        case 'type3':
          finalReportRow = new Type3Row(
            row['Merchant Id'],
            row['Merchant DBA'],
            row['Payout Amount'],
            row['Volume'],
            row['Sales'],
            agentSplit,
            branchID
          );
          break;

        case 'type4':
          finalReportRow = new Type4Row(
            row['Merchant Id'],
            row['Merchant Name'],
            row['Income'],
            row['Expense'],
            row['Net'],
            agentSplit,
            branchID
          );
          break;
      }

      return finalReportRow;
    });


    return finalReportData;
  } catch (error) {
    console.error('Error building processor report data:', error);
    throw new Error('Error building processor report data: ' + error.message);
  }
};

