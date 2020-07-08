import { LightningElement, wire, track } from 'lwc';
import { getRecord, getFieldValue, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import SITE_FIELD from '@salesforce/schema/Account.Site';
import WEBSITE_FIELD from '@salesforce/schema/Account.Website';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';
import EMPLOYESS_FIELD from '@salesforce/schema/Account.NumberOfEmployees';
import ID_FIELD from '@salesforce/schema/Account.Id';

export default class ldsDetailComponent extends LightningElement {
    @track accountDetails;
    @track setFieldsReadOnly = true;
    @track accountName;
    @track accountPhone;
    @track accountSite;
    @track accountWebsite;
    @track accountIndustry;
    @track accountEmployees;
    @track detailRecordId;
    @track errorMessage;
    @track checkValidFields;
    @track hideEditButton;

    //Get the account id for the details
    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        registerListener('cardComponentMessage', this.handleMessage, this);
        registerListener('searchAccountTypeMessage', this.handleMessage, this);
        console.log('connectedcallback');
    }
    // Get the record id
    handleMessage(data) {
        this.detailRecordId = data;
        console.log('handlemessage--> ' + data);
    }

    //Get the account details
    @wire(getRecord, { recordId: '$detailRecordId', fields: [NAME_FIELD, PHONE_FIELD, SITE_FIELD, WEBSITE_FIELD, INDUSTRY_FIELD, EMPLOYESS_FIELD] })
    account({ error, data }) {
        if (data) {
            console.log('Data ldsDetail--> ' + JSON.stringify(data));
            this.accountDetails = data;
            //Get the field values
            this.accountName = getFieldValue(data, NAME_FIELD);
            this.accountPhone = getFieldValue(data, PHONE_FIELD);
            this.accountSite = getFieldValue(data, SITE_FIELD);
            this.accountWebsite = getFieldValue(data, WEBSITE_FIELD);
            this.accountIndustry = getFieldValue(data, INDUSTRY_FIELD);
            this.accountEmployees = getFieldValue(data, EMPLOYESS_FIELD);
        }
        else if (error) {
            this.errorMessage = 'Unknown error';
            if (Array.isArray(error.body)) {
                this.errorMessage = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.errorMessage = error.body.message;
            }
        }
    }
    // Make the fields editable
    handleClickEdit(event) {
        this.setFieldsReadOnly = false;
        this.hideEditButton = true;
    }
    handleCancel(event) {
        this.template.querySelector("[data-field='Name']").value = this.accountName;
        this.template.querySelector("[data-field='Phone']").value = this.accountPhone;
        this.template.querySelector("[data-field='Site']").value = this.accountSite;
        this.template.querySelector("[data-field='Website']").value = this.accountWebsite;
        this.template.querySelector("[data-field='Industry']").value = this.accountIndustry;
        this.template.querySelector("[data-field='NumberOfEmployees']").value = this.accountEmployees;
        this.setFieldsReadOnly = true;
        this.hideEditButton = false;
        [...this.template.querySelectorAll('lightning-input')].forEach(input => {
            input.reportValidity();
        })
    }
    // Save the edited record
    handleSave(event) {
        // Check if the all field values are valid
        this.checkValidFields = [...this.template.querySelectorAll('lightning-input')]
            .reduce((validSoFar, inputFields) => {
                validSoFar = inputFields.reportValidity();
                return validSoFar && inputFields.checkValidity();
            }, true);

        console.log('Valid-- >' + this.checkValidFields);
        //Process the input values and update the record
        if (this.checkValidFields) {
            // Create the recordInput object for account updation
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.detailRecordId;
            fields[NAME_FIELD.fieldApiName] = this.template.querySelector("[data-field='Name']").value;
            fields[PHONE_FIELD.fieldApiName] = this.template.querySelector("[data-field='Phone']").value;
            fields[SITE_FIELD.fieldApiName] = this.template.querySelector("[data-field='Site']").value;
            fields[WEBSITE_FIELD.fieldApiName] = this.template.querySelector("[data-field='Website']").value;
            fields[INDUSTRY_FIELD.fieldApiName] = this.template.querySelector("[data-field='Industry']").value;
            fields[EMPLOYESS_FIELD.fieldApiName] = this.template.querySelector("[data-field='NumberOfEmployees']").value;

            const recordInput = { fields };

            updateRecord(recordInput)
                .then(() => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Success',
                            message: 'Account updated successfully',
                            variant: 'success'
                        })
                    );
                    fireEvent(this.pageRef, 'detailPageMessage', true);
                    this.hideEditButton = false;
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error creating record',
                            message: error.body.message,
                            variant: 'error'
                        })
                    );
                });
            //Set to view mode again
            this.setFieldsReadOnly = true;
        }
        else {
            // The form is not valid
            //Keep in edit mode untill the user feeds in valid inputs
            this.setFieldsReadOnly = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Something is wrong',
                    message: 'Check your input and try again.',
                    variant: 'error'
                })
            );
        }

    }

    disconnectCallback() {
        unregisterAllListeners(this);
    }
}