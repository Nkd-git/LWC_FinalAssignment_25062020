import { LightningElement, api, track, wire } from 'lwc';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class CardComponent extends LightningElement {
    @api account;
    @wire(CurrentPageReference) pageRef;
    // Fire an event to the detail component(ldsDetailComponent)
    handleClickDetail(event) {
        console.log('Detail clicked!!! ' + this.account.Id);
        fireEvent(this.pageRef, 'cardComponentMessage', this.account.Id);
    }
}