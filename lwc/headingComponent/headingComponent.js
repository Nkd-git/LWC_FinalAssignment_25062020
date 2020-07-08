import { LightningElement } from 'lwc';
import headingName from '@salesforce/label/c.Heading_Label'; // Import the custom heading label

export default class HeadingComponent extends LightningElement {
    // Set the title
    title=headingName;
}