import { v4 as uuidv4 } from 'uuid';

export default class Agent {
    constructor(organizationID, fName, lName, clients) {
        this.organizationID = organizationID;
        this.agentID = uuidv4();
        this.company = 'Tracer';
        this.companySplit = '20%';
        this.partner = '';
        this.partnerSplit = '0%';
        this.manager = 'Alejandro';
        this.managerSplit = '60%';
        this.role = role;
        this.fName = fName;
        this.lName = lName;
        this.agentSplit = '20%';
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