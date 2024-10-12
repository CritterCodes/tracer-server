import { v4 as uuidv4 } from 'uuid';

export default class Agent {
    constructor(organizationID, role, fName, lName, clients, company) {
        this.organizationID = organizationID;
        this.agentID = uuidv4();
        this.company = '';
        this.companySplit = '%';
        this.partner = '';
        this.partnerSplit = '';
        this.manager = '';
        this.managerSplit = '';
        this.role = role;
        this.fName = fName;
        this.lName = lName;
        this.agentSplit = '';
        this.clients = clients;

    }

    updateAgent(data) {
        for (let key in data) {
            if (this.hasOwnProperty(key)) {
                this[key] = data[key];
            }
        }
    }
}