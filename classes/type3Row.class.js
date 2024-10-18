export default class Type3Row {
    constructor(merchantId, merchantDBA, payoutAmount, volume, sales, bankSplit, branchID, needsAudit) {
        this.needsAudit = needsAudit;
        this['Merchant Id'] = merchantId;
        this['Merchant DBA'] = merchantDBA;
        this['Payout Amount'] = payoutAmount;
        this['Volume'] = volume;
        this['Sales'] = sales;
        this['Refunds'] = '';
        this['Reject Amount'] = '';
        this['Bank Split'] = typeof bankSplit === "string" ? bankSplit : this.convertToPercentage(bankSplit); // Convert to percentage string
        this['Bank Payout'] = this.calculateBankPayout(payoutAmount, bankSplit).toFixed(2); // Calculate bank payout
        this['Branch ID'] = branchID;
        this.approved = false;
    }

    convertToPercentage(value) {
        const percentage = value * 100;
        return `${percentage.toFixed(2)}%`;
    }

    extractNumericValueFromPercentage(percentageString) {
        // Remove the percentage symbol and convert the string back to a number
        const numericValue = parseFloat(percentageString.replace('%', ''));
        return numericValue / 100; // Convert back to decimal format for calculations
    }

    calculateBankPayout(payoutAmount, bankSplit) {
        // Ensure payoutAmount is a number and bankSplit is in decimal format
        if (typeof payoutAmount === 'string') {
            payoutAmount = parseFloat(payoutAmount);
        }
        if (typeof bankSplit === 'string') {
            bankSplit = this.extractNumericValueFromPercentage(bankSplit); // Convert percentage string to a decimal number
        }

        if (typeof payoutAmount === 'number' && payoutAmount >= 0) {
            // Perform the calculation based on the payoutAmount and bankSplit
            return payoutAmount * bankSplit;
        } else {
            // Return 0 if payoutAmount is not a valid number or is negative
            return 0;
        }
    }

    updateType3Row(data) {
        for (let key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
        // Recalculate Bank Payout if payoutAmount or bankSplit is updated
        this['Bank Payout'] = this.calculateBankPayout(this['Payout Amount'], this['Bank Split']).toFixed(2);
    }
}
