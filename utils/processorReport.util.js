import Type1Row from "../classes/type1Row.class.js";
import Type2Row from "../classes/type2Row.class.js";
import Type3Row from "../classes/type3Row.class.js";
import Type4Row from "../classes/type4Row.class.js";
import Report from "../classes/report.class.js";
import processorTypeMap from "../lib/typeMap.lib.js";

export default class ProcessorReportUtil {
    static buildProcessorReport = async (organizationID, processor, monthYear, agents, csvData) => {
        try {
            // build processor report
            console.log('Building processor report:', processor);
            // build branchIDMap
            const branchIDMap = await buildBranchIDMap(agents);
            console.log('Branch ID Map:', branchIDMap);
            // build processor rows
            const procRowsArray = await buildProcRows(processor, csvData, branchIDMap);
            const type = 'processor';
            // check if processor is Rectangle Health or Hyfin
            if (processor === 'Rectangle Health' || processor === 'Hyfin') {
                // build Line Item Deductions report
                const report = new Report(
                    organizationID,
                    'Line Item Deductions',
                    type,
                    monthYear,
                    procRowsArray
                );
                report.processors.push(processor);
                return report;
            };
            // build standard processor report
            const report = new Report(
                organizationID,
                processor,
                type,
                monthYear,
                procRowsArray
            );
            // add processor to report
            report.processors.push(processor)
            // return report
            return report;
        } catch (error) {
            throw new Error('Error building processor report: ' + error.message);
        };
    };

    static updateProcessorReport = async (processor, processorReport, agents, csvData) => {
        try {
            // build branchIDMap
            const branchIDMap = await buildBranchIDMap(agents);
            // build processor rows
            const result = await buildProcRows(processor, csvData, branchIDMap);
            // add rows to report
            result.forEach(row => {
                processorReport.reportData.push(row);
            });
            // add processor to report
            processorReport.processors.push(processor);
            // return updated report
            return processorReport;
        } catch (error) {
            throw new Error('Error updating AR Report: ' + error.message);
        }
    };
};

const buildProcRows = async (processor, csvData, branchIDMap) => {
    try {
        const procRowsArray = [];
        // get processor type
        const processorType = processorTypeMap[processor];
        const isObject = (value) => {
            return typeof value === 'object' && value !== null;
        }
        csvData.forEach(row => {
            console.log('Row:', row);
            let procRow, bankSplit, branchID, needsAudit;
            
            switch (processorType) {
                case 'type1':
                    needsAudit = branchIDMap.hasOwnProperty(row['Merchant ID']) ? false : true;
                    console.log('checking merchant ID:', row['Merchant ID'], 'needs audit:', needsAudit, 'branchID', branchIDMap[row['Merchant ID']]);
                    if (!branchIDMap[row['Merchant ID']]) {
                        bankSplit = 0;
                        branchID = 'N/A';
                    } else {
                        branchID = branchIDMap[row['Merchant ID']];
                        bankSplit = 0.35;
                    };
                    procRow = new Type1Row(
                        row['Merchant ID'],  // trim to handle spaces
                        row['Merchant'],
                        row['Transactions'],
                        row['Sales Amount'],
                        row['Income'],
                        row['Expenses'],
                        row['Net'],
                        row['BPS'],
                        bankSplit,
                        branchID , // Ensure branchIDMap is correctly mapped
                        needsAudit
                    );
                    break;
                case 'type2':
                    needsAudit = branchIDMap.hasOwnProperty(row['Merchant ID']) ? false : true;
                    console.log('checking merchant ID:', row['Merchant ID'], 'needs audit:', needsAudit, 'branchID', branchIDMap[row['Merchant ID']]);
                    if (!branchIDMap[row['Merchant ID']]) {
                        bankSplit = 0;
                        branchID = 'N/A';
                    } else {
                        branchID = branchIDMap[row['Merchant ID']];
                        bankSplit = 0.35;
                    };
                    if (!row['Merchant ID']) {
                        console.log('Row is empty');
                        return;
                    }
                    procRow = new Type2Row(
                        row['Merchant ID'],        // Correctly named
                        row['Merchant Name'],      // Correctly named
                        row['Payout Amount'],      // Updated to match parsed data
                        row['Volume'],             // Correctly named
                        row['Sales'],              // Correctly named
                        row['Refunds'],            // Correctly named
                        row['Reject Amount'],      // Correctly named
                        bankSplit,
                        branchID,  // Mapping the correct Merchant ID to branchID
                        needsAudit
                    );
                    break;
                case 'type3':
                    needsAudit = branchIDMap.hasOwnProperty(row['Client']) ? false : true;
                    console.log('checking merchant ID:', row['Client'], 'needs audit:', needsAudit, 'branchID', branchIDMap[row['Client']]);
                    if (!branchIDMap[row['Client']]) {
                        bankSplit = 0;
                        branchID = 'N/A';
                    } else {
                        branchID = branchIDMap[row['Client']];
                        bankSplit = 0.35;
                    };
                    if (!row['Client']) {
                        console.log('Row is empty');
                        return;
                    }
                    procRow = new Type3Row(
                        row['Client'],
                        row['Dba'],
                        row['Gross Agent Residual'],
                        row['Sale Count'],
                        row['Sale Amount'],
                        bankSplit,
                        branchID,
                        needsAudit
                    );
                    break;
                case 'type4':
                    if (processor === 'Rectangle Health') {
                        needsAudit = branchIDMap.hasOwnProperty(row['MID']) ? false : true;
                        console.log('checking merchant ID:', row['MID'], 'needs audit:', needsAudit, 'branchID', branchIDMap[row['MID']]);
                        if (!branchIDMap[row['Merchant ID']]) {
                            bankSplit = 0;
                            branchID = 'N/A';
                        } else {
                            branchID = branchIDMap[row['MID']];
                            bankSplit = 0.35;
                        };
                        if (!row['MID']) {
                            console.log('Row is empty');
                            return;
                        }
                        procRow = new Type4Row(
                            row['MID'],  // trim to handle spaces
                            row['Merchant Name'],
                            row['Billing Amount'].result.toFixed(2),
                            bankSplit,
                            branchID,
                            needsAudit
                        );
                    } else {
                        needsAudit = branchIDMap.hasOwnProperty(row['Merchant Id']) ? false : true;
                        console.log('checking merchant Id:', row['Merchant Id'], 'needs audit:', needsAudit, 'branchID', branchIDMap[row['Merchant Id']]);
                        if (!branchIDMap[row['Merchant Id']]) {
                            bankSplit = 0;
                            branchID = 'N/A';
                        } else {
                            branchID = branchIDMap[row['Merchant Id']];
                            bankSplit = 0.35;
                        };
                        if (row['Merchant Id'] === 'Totals') {
                            console.log('Row is empty');
                            return;
                        }
                        procRow = new Type4Row(
                            row['Merchant Id'],
                            row['Name'],
                            row['TOTAL FEES'].result,
                            bankSplit,
                            branchID,
                            needsAudit
                        );
                    }
                    break;
                default:
                    throw new Error('Processor type not found');
            }
            procRowsArray.push(procRow);
        });
        return procRowsArray;
    } catch (error) {
        throw new Error('Error building ProcRows: ' + error.message);
    }
};

const buildBranchIDMap = async (agents) => {
    try {
        const branchIDMap = {};
        // map branchID to merchantID
        agents.forEach(agent => {
            // check if agent has clients
            if (agent.clients) {
                agent.clients.forEach(client => {
                        branchIDMap[client.merchantID] = client.branchID
                        return;
                });
            };
        });
        // return branchIDMap
        return branchIDMap;
    } catch (error) {
        throw new Error('Error building branchIDMap: ' + error.message);
    }
};


