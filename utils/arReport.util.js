import Report from '../classes/report.class.js';
import ARRow from '../classes/arRow.class.js';

export default class ArReportUtil {
  static buildBillingReport = async (organizationID, processor, monthYear, csvData) => {
    try {
      const type = 'billing';
      let report;
      if (processor === 'PAAY') {
        // Filter out rows without a MID
        const filteredData = csvData.filter(row => row['MID']);
        let rowIndex = 0;
        filteredData.forEach(row => {
          const total = row.Total.result;
          filteredData[rowIndex].Total = total.toFixed(2);
          rowIndex++;
        });
        report = new Report(
          organizationID,
          processor,
          type,
          monthYear,
          csvData
        );
      } else {
        report = new Report(
          organizationID,
          processor,
          type,
          csvData[0].Month,
          csvData
        );
      }
      return report;
    } catch (error) {
      throw new Error('Error building billing report: ' + error.message);
  
    }
  };

  static buildARReport = async (organizationID, processor, monthYear, invoiceCount, csvData) => {
    try {
      console.log('Building AR Report:', organizationID, processor, monthYear, invoiceCount);
      let arData;
      const type = 'ar';
      if (processor === 'accept.blue') {
          arData = await abBuildARData(invoiceCount, csvData);
          monthYear = csvData[0]['Month']; // Assuming month is consistent across all rows
          console.log('AB AR Data successfully built');
      } else {
          arData = await paayBuildARData(invoiceCount, monthYear, csvData);
          console.log('PAAY AR Data successfully built');
      };
  
      const arReport = new Report(organizationID, '', type, monthYear, arData);
      return arReport;
    } catch (error) {
      throw new Error('Error building AR Report: ' + error.message);
    }
  };

  static updateARReport = async (processor, invoiceCount, arReport, csvData) => {
    try {
      console.log('Updating AR Report:', processor, invoiceCount);
      if (processor === 'accept.blue') {
        console.log('Updating Accept.Blue AR Data');
        const result = await abBuildARData(invoiceCount, csvData);
        result.forEach(row => {
          arReport.reportData.push(row);
        });
      } else {
        console.log('Updating PAAY AR Data'); 
        const result = await paayBuildARData(invoiceCount, arReport.month, csvData);
        console.log('paay ar data built')
        result.forEach(row => {
          arReport.reportData.push(row);
        });
      };
      return arReport;
    } catch (error) {
      throw new Error('Error updating AR Report: ' + error.message);
    }
  };
};

const abBuildARData = async (invoiceCount, csvData) => {
  try {
    console.log('Building Accept.Blue AR Data');
    const arData = [];
    const keyMappings = {
      'Setup Fee ISO': { lineItemName: 'Merchant Setup', lineItemQuantity: 1 },
      'Monthly Gateway Fee ISO': { lineItemName: 'Merchant Monthly', lineItemQuantity: 1 },
    };

    csvData.forEach(row => {
      if (!row.Month) {
        return;
      }
      Object.keys(row).forEach(key => {
        if (keyMappings[key]) {
          const { lineItemName, lineItemQuantity } = keyMappings[key];
          const lineItemAmount = parseFloat(row[key].replace('$', ''));
          const newARRow = new ARRow(
            row['Name'],
            row['Agent Id'],
            invoiceCount, // Pass necessary parameters
            row['Month'],
            lineItemName,
            lineItemQuantity,
            lineItemAmount.toFixed(2), // Ensure two decimal places
            lineItemAmount.toFixed(2)  // Ensure two decimal places
          );
          arData.push(newARRow);
          invoiceCount++;
        };
      });
      const transactionCount = parseFloat(row['Transaction Count']);
      const transactionFeeAmount = (transactionCount * 0.2).toFixed(2); // Ensure two decimal places
      const transactionFeeRow = new ARRow(
        row['Name'],
        row['Agent Id'],
        invoiceCount, // Pass necessary parameters
        row['Month'],
        'TracerPay Transaction Fee',
        transactionCount,
        0.2,
        transactionFeeAmount
      );
      arData.push(transactionFeeRow);
    });
    console.log('Accept.Blue AR Data successfully built');
    return arData;
  } catch (error) {
    throw new Error('Error handling Accept.Blue data: ' + error.message);
  }
};

const paayBuildARData = async (invoiceCount, monthYear, csvData) => {
  try {
    console.log('Building PAAY AR Data');
    const arData = [];
    csvData.forEach(row => {
      if (!row.MID) {
        console.log('Skipping row:', row);
        return;
      }
      const newARRow = new ARRow(
        row.Merchant,
        row.MID,
        invoiceCount, // Pass necessary parameters
        monthYear,
        'Paay Transaction Fee',
        row.Transactions,
        0.2, // Ensure two decimal places
        row.Transactions * 2  // Ensure two decimal places
      );
      arData.push(newARRow);
      invoiceCount++;
    });
    console.log('PAAY AR Data successfully built');
    return arData;
  } catch (error) {
    throw new Error('Error handling PAAY data: ' + error.message);
  }
}