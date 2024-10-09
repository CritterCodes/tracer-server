
export default class Type3Row {
    constructor(merchantId,	merchantDBA, payoutAmount, volume, sales, bankSplit, branchID) {
        this['Merchant Id'] = merchantId;
        this['Merchant DBA'] = merchantDBA;
        this['Payout Amount'] = payoutAmount;
        this['Volume'] = volume;
        this['Sales'] = sales;
        this['Refunds'] = '';
        this['Reject Amount'] = '';
        this['Bank Split'] =  this.convertToPercentage(bankSplit); ;
        this['Bank Payout'] = this.calculateBankPayout().toFixed(2);
        this['Branch ID'] = branchID;
    }
    convertToPercentage(value) {
        const percentage = value * 100;
        return `${percentage.toFixed(2)}%`;
    };

    calculateBankPayout() {
        // Check if 'Net' is a number and not negative, then perform calculation
        if (typeof this['Payout Amount'] === 'number' && this['Payout Amount'] >= 0) {
            // If payoutAmount is not a number or is undefined, return 0 to avoid NaN
            return typeof this['Payout Amount']=== 'number' ? this['Payout Amount'] * this['Bank Split'] : 0;
        } else {
            // Return 0 if 'Net' is not a number or is negative
            return 0;
        }
    }

    updateType3Row(data) {
        for (let key in data) {
            if (thishasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
        // Recalculate bankPayout if payoutAmount is updated
        this['Bank Payout'] = this.calculateBankPayout();
    }
}