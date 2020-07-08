import { LightningElement, wire, track, api } from 'lwc';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import TYPE_FIELD from '@salesforce/schema/Account.Type';

export default class PicklistSearch extends LightningElement {
    //Variable declaration
    @track objectInfoId;
    @track pickListValues;
    @track error;
    @track typeOptions;
    @track selectedValue;
    @track errorMessage;
    @track disabled;
    //Get the current page context(reference)

    @wire(CurrentPageReference) pageRef;

    //Get the defaultRecordTypeId for getting the picklist value
    @wire(getObjectInfo, { objectApiName: ACCOUNT_OBJECT }) objectInfo({ error, data }) {
        if (data) {
            this.objectInfoId = data.defaultRecordTypeId;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.objectInfoId = undefined;
        }
    };
    // Provision the picklist values
    @wire(getPicklistValues, { recordTypeId: '$objectInfoId', fieldApiName: TYPE_FIELD }) getPickListValues({ error, data }) {
        if (data && data.values) {
            this.typeOptions = data.values.map(values => { return { 'value': values.value, 'label': values.label }; });
            console.log('this.typeOptions-->  ' + JSON.stringify(this.typeOptions));
            this.disabled = true;
        }
        else if (error) {
            this.errorMessage = 'Unknown error';
            if (Array.isArray(error.body)) {
                this.errorMessage = error.body.map(e => e.message).join(', ');
            } else if (typeof error.body.message === 'string') {
                this.errorMessage = error.body.message;
            }
        }
    };
    //Fetch the piclist value
    handleChange(event) {
        console.log('Selected Value-- > ' + event.detail.value);
        this.selectedValue = event.detail.value;
        if (this.selectedValue != null || this.selectedValue != 'undefined') {
            event.target.reportValidity();
            this.disabled = false;
        }
    }
    handleSearch(event) {
        //Dispatch event to rootParent component
        this.dispatchEvent(new CustomEvent('picklistselect', { detail: this.selectedValue }));
        //Dispatch event to detail component(ldsDetailComponent) to reset the
        //account detail card on change of the search value
        fireEvent(this.pageRef, 'searchAccountTypeMessage', false);
    }
}