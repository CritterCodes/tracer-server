import Report from "../classes/report.class.js";
import processorTypeMap from "../lib/typeMap.lib.js";
import Type1Row from "../classes/type1Row.class.js";
import Type2Row from "../classes/type2Row.class.js";
import Type3Row from "../classes/type3Row.class.js";
import Type4Row from "../classes/type4Row.class.js";
export default class AgentReportUtil {

  static buildAgentReport = (organizationID, monthYear, agent, processorReports) => {
    try {
      console.log(`Building agent report for organization: ${organizationID}, monthYear: ${monthYear}`);
      console.log(`Processor Reports: ${JSON.stringify(processorReports, null, 2)}`);
      
      // Build report data
      const reportData = buildAgentReportData(agent, processorReports);
      
      // Build report
      const agentReport = new Report(organizationID, '', 'agent', monthYear, reportData);
      
      console.log(`Agent report successfully built: ${JSON.stringify(agentReport, null, 2)}`);
      
      return agentReport;
    } catch (error) {
      console.error('Error creating agent report:', error);
      throw new Error('Error creating agent report: ' + error.message);
    }
  };
}

const buildAgentReportData = (agent, processorReports) => {
  try {
    console.log('Building agent report data...');
    
    // Ensure the inputs are valid
    if (!Array.isArray(agent.clients) || !Array.isArray(processorReports)) {
      throw new Error('Invalid input: agentClients or processorReports is not an array');
    }
    
    // Build the agent report data by filtering each processor's report data
    const agentReportData = processorReports.map(report => ({
      processor: report.processor,
      reportData: buildProcessorReportData(report, agent)  
    }));

    console.log('Agent report data successfully built:', agentReportData);

    return agentReportData;
  } catch (error) {
    console.error('Error building agent report data:', error);
    throw new Error('Error building agent report data: ' + error.message);
  }
};

const buildProcessorReportData = (report, agent) => {
  try {
    console.log('Building processor report data for report:', report.processor);
    
    const agentClients = agent.clients;
    // Ensure the report data and agent clients are valid
    if (!report || !Array.isArray(report.reportData)) {
      throw new Error('Invalid report data: report or reportData is missing or not an array');
    }
    if (!Array.isArray(agentClients)) {
      throw new Error('Invalid agent clients: agentClients is not an array');
    }

    // Create a Set for fast lookup of client Merchant IDs
    const clientMerchantIDs = new Set(agentClients.map(client => client['merchantID']));
    
    console.log('Client Merchant IDs:', [...clientMerchantIDs]);

    // Filter report data to include only rows where the Merchant ID exists in the agent's clients
    const filteredReportData = report.reportData.filter(row => clientMerchantIDs.has(row['Merchant Id'] ));
    const type = processorTypeMap[report.processor];
    const agentSplit = agent?.split || 0;
    let reponse;
    // Build the final report data with the necessary fields and calculations
    const finalReportData = filteredReportData.map(row => {
        let finalReportRow;
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
                    row['Branch ID'] || 'N/A'
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
                    row['Branch ID'] || 'N/A'
                 );
                break;
            case 'type3':
                finalReportRow = new Type3Row(
                    row['Merchant Id'],
                    row['Merchant DBA'],
                    row['Payout Amount'],
                    row['Volume'],
                    row['Sales'],
                    row['Refunds'],
                    row['Reject Amount'],
                    agentSplit,
                    row['Branch ID'] || 'N/A'
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
                    row['Branch ID'] || 'N/A'
                 );
                    
                break;
        }
      // Find the client's spli

      return finalReportRow;
    });

    console.log('Final processor report data:', finalReportData);

    return finalReportData;
  } catch (error) {
    console.error('Error building processor report data:', error);
    throw new Error('Error building processor report data: ' + error.message);
  }
};
