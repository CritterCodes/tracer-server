export default class Type2Row {
    constructor(merchanId, merchantName, payoutAmount, volume, sales, refunds, rejectAmount, bankSplit, branchID, needsAudit) {
        this.needsAudit = needsAudit;
        this['Merchant Id'] = merchanId;
        this['Merchant Name'] = merchantName;
        this['Payout Amount'] = payoutAmount;
        this['Volume'] = volume;
        this['Sales'] = sales;
        this['Refunds'] = refunds;
        this['Reject Amount'] = rejectAmount;
        this['Bank Split'] = typeof bankSplit === "string" ? bankSplit : this.convertToPercentage(bankSplit);
        this['Bank Payout'] = this.calculateBankPayout().toFixed(2);
        this['Branch ID'] = branchID;
        this.approved = false;
    }
    convertToPercentage(value) {
        const percentage = value * 100;
        return `${percentage.toFixed(2)}%`;
    };

    calculateBankPayout() {
        // Check if 'Net' is a number and not negative, then perform calculation
        if (typeof this['Payout Amount'] === 'number' && this['Payout Amount'] >= 0) {
            // If payoutAmount is not a number or is undefined, return 0 to avoid NaN
            return typeof this['Payout Amount']=== 'number' ? this['Payout Amount'] * (parseFloat(this['Bank Split']) / 100) : 0;
        } else {
            // Return 0 if 'Net' is not a number or is negative
            return 0;
        }
    }


    Type2RowRow(data) {
        for (let key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
        // Recalculate bankPayout if payoutAmount is updated
        this['Bank Payout'] = this.calculateBankPayout();
    }
}
