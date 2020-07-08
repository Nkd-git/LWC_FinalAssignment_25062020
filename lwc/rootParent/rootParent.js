import { LightningElement, track } from 'lwc';

export default class RootParent extends LightningElement {
    @track pickListValueSelected;
    // Get the selected value from the child component(picklistSearch)
    handleSelectedValue(event) {
        console.log('selected Value from child--> ' + event.detail);
        this.pickListValueSelected = event.detail;
    }
}