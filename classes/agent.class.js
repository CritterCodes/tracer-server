import { v4 as uuidv4 } from 'uuid';

export default class Agent {
    constructor(organizationID, role, fName, lName, split, clients) {
        this.organizationID = organizationID;
        this.agentID = uuidv4();
        this.role = role;
        this.fName = fName;
        this.lName = lName;
        this.split = this.split
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