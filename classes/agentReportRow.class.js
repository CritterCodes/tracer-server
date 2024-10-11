import { v4 as uuidv4 } from 'uuid';

export default class AgentReportRow {
    constructor(merchantID, merchantName, transactions, salesAmount, income, expenses, net, bps, agentSplit, agentNet, row) {
        this['Merchant Id'] = merchantID;
        this['Merchant Name'] = merchantName;
        this['Transactions'] = transactions;
        this['Sales Amount'] = salesAmount.toFixed(2);
        this['Income'] = income.toFixed(2);
        this['Expenses'] = expenses.toFixed(2);
        this['Net'] = net.toFixed(2);
        this['Bps'] = bps;
        this['%'] = `${agentSplit}%`;
        this['Agent Net'] = agentNet.toFixed(2);
        this['Branch Id'] = row['Branch ID'] || 'N/A';

    }

    convertToPercentage(value) {
        const percentage = value * 100;
        return `${percentage.toFixed(2)}%`;
    };

    calculateBankPayout(net, bankSplit) {
        // Check if 'Net' is a number and not negative, then perform calculation
        console.log ('net is a:', typeof net);
        if (typeof net === 'string') {
            net = parseFloat(net);

        }
        if (typeof net === 'number' && net >= 0) {
            // If payoutAmount is not a number or is undefined, return 0 to avoid NaN
            return typeof net=== 'number' ? net * (parseFloat(agentSplit)) : 0;
        } else {
            // Return 0 if 'Net' is not a number or is negative
            return 0;
        }
    }

    updateAgentReportRow(data) {
        for (let key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
        this.updatedAt = new Date();
    }
}