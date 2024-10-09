import Report from "../classes/report.class.js";
export default class AgentReportUtil {

static buildAgentReport = (organizationID, monthYear, agentClients, processorReports) => {
    try {
        console.log(`Building agent report for organization: ${organizationID}, monthYear: ${monthYear}`);
        console.log(`Agent Clients: ${JSON.stringify(agentClients, null, 2)}`);
        console.log(`Processor Reports: ${JSON.stringify(processorReports, null, 2)}`);
        
        // Build report data
        const reportData = buildAgentReportData(agentClients, processorReports);
        
        // Build report
        const agentReport = new Report(organizationID, '', 'agent', monthYear, reportData); // Ensure reportData is passed
        
        console.log(`Agent report successfully built: ${JSON.stringify(agentReport, null, 2)}`);
        
        return agentReport;
    } catch (error) {
        console.error('Error creating agent report:', error);
        throw new Error('Error creating agent report: ' + error.message);
    }
};


};

const buildAgentReportData = (agentClients, processorReports) => {
    try {
        console.log('Building agent report data...');
        
        // Ensure the inputs are valid
        if (!Array.isArray(agentClients) || !Array.isArray(processorReports)) {
            throw new Error('Invalid input: agentClients or processorReports is not an array');
        }
        
        // Build the agent report data by filtering each processor's report data
        const agentReportData = processorReports.map(report => ({
            processor: report.processor,
            reportData: buildProcessorReportData(report, agentClients)  // Optimized filtering
        }));

        console.log('Agent report data successfully built:', agentReportData);

        return agentReportData;
    } catch (error) {
        console.error('Error building agent report data:', error);
        throw new Error('Error building agent report data: ' + error.message);
    }
};

const buildProcessorReportData = (report, agentClients) => {
    try {
        console.log('Building processor report data for report:', report.processor);
        
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
        const filteredReportData = report.reportData.filter(row => clientMerchantIDs.has(row['Merchant Id']));

        if (filteredReportData.length === 0) {
            console.warn('No matching report data found for agent clients in this processor report');
        }

        console.log('Filtered processor report data:', filteredReportData);

        return filteredReportData;
    } catch (error) {
        console.error('Error building processor report data:', error);
        throw new Error('Error building processor report data: ' + error.message);
    }
};
