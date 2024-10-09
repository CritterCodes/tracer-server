export default class Type4Row {
    constructor(merchantId, merchantName, net, bankSplit, BranchID) {
        this['Merchant Id'] = merchantId;
        this['merchant Name'] = merchantName;
        this['Income'] = '';
        this['Expense'] = '';
        this['Net'] = net;
        this['%'] = this.convertToPercentage(bankSplit);
        this['Bank Payout'] = this.calculateBankPayout(net, bankSplit).toFixed(2);
        this['Branch ID'] = BranchID;
    }

    convertToPercentage(value) {
        const percentage = value * 100;
        return `${percentage.toFixed(2)}%`;
    }

    calculateBankPayout(net, bankSplit) {
        if (typeof net === 'string') {
            net = parseFloat(net);
        }
        // Check if 'net' is a number and not negative, then perform calculation
        if (typeof net === 'number' && net >= 0 && typeof bankSplit === 'number') {
            // Perform the payout calculation using net and bankSplit
            return net * bankSplit;
        } else {
            // Return 0 if 'net' is not a number or is negative
            console.log('calculateBankPayout: Invalid net or bankSplit');
            return 0;
        }
    }

    updateType4Row(data) {
        for (let key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }

        // Strip the percentage sign and convert back to decimal
        const bankSplit = parseFloat(this['%']) / 100;

        // Recalculate bankPayout if 'Net' or 'bankSplit' is updated
        this['Bank Payout'] = this.calculateBankPayout(this['Net'], bankSplit).toFixed(2);
    }
}
