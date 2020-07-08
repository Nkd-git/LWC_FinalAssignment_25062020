import { LightningElement, wire, track, api } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import getAccountsByType from '@salesforce/apex/FetchAccounts.getAccountsByType';
import { refreshApex } from '@salesforce/apex';

export default class SearchResults extends LightningElement {
    @track accounts;
    @api accountType;
    @track errorMessage;
    @track numberOfAccounts = false;
    //Page reference for the pubsub listener
    @wire(CurrentPageReference) pageRef;

    //Register the listener
    connectedCallback() {
        registerListener('detailPageMessage', this.handleMessage, this);
    }
    // Refresh apex after the record is saved(from ldsDetailComponent)
    handleMessage(data) {
        refreshApex(this.accountsRetrieved);
    }
    // Fetch the accounts from server
    @wire(getAccountsByType, { searchAccByType: '$accountType' }) accountsList(value) {
        this.accountsRetrieved = value;
        const { data, error } = value;
        if (data) {
            this.accounts = data;
            // Fetch the number of data(objects) returned
            if (Object.keys(data).length > 0) {
                this.numberOfAccounts = true;
            } else {
                this.numberOfAccounts = false;
            }
            this.error = undefined;
        } else if (error) {
            this.errorMessage = 'Unknown error';
            if (Array.isArray(error.body)) {
                this.errorMessage = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.errorMessage = error.body.message;
            }
            this.accounts = undefined;
        }
    }
    disconnectCallback() {
        unregisterAllListeners(this);
    }
}