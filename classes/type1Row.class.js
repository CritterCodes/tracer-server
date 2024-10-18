export default class Type1Row {
    constructor(merchantId, merchantName, transaction, salesAmount, income, expenses, net, bps, bankSplit, branchID, needsAudit) {
        this.needsAudit = needsAudit;
        this['Merchant Id'] = merchantId; 
        this['Merchant Name'] = merchantName; 
        this['Transaction'] = transaction; 
        this['Sales Amount'] = salesAmount; 
        this['Income'] = income; 
        this['Expenses'] = expenses;
        this['Net'] = net;
        this['BPS'] = bps;
        this['%'] = typeof bankSplit === "string" ? bankSplit : this.convertToPercentage(bankSplit);  // Note: Use bracket notation for 'percentage'
        this['Agent Net'] = this.calculateBankPayout(net, bankSplit).toFixed(2);  // Note: Use bracket notation for 'Net'
        this['branch ID'] = branchID;
        this.approved = false;
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
            return typeof net=== 'number' ? net * (parseFloat(bankSplit)) : 0;
        } else {
            // Return 0 if 'Net' is not a number or is negative
            return 0;
        }
    }
    

    updateType1Row(data) {
        for (let key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
}
