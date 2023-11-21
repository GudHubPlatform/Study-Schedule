import getHtml, { closeIconClass } from "./classroom.js";
import styles from './classroom.styles.scss';

import { 
    itemRefIdAttribute,
    classRoomFieldIdAttributes,
    isCloneAttribute
 } from "../../utils/componentsRenderer.js";

export default class Classroom extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this.app_id;
        this.item_id;
        this.isClone;
        this.classroom;

        this.onInit();
    }

    async onInit() {
        await this.determineProperties();
        this.render();

        if (!this.isClone) {
            const closeIconElement = this.shadowRoot.querySelector(closeIconClass);
            closeIconElement.onmousedown = () => this.handleClickCloseIcon();
        }
    }

    disconnectedCallback() {
        console.log('disconnectedCallback');
    };

    render() {
        const style = document.createElement('style');
        style.textContent = styles;
        this.shadowRoot.appendChild(style);
        this.shadowRoot.innerHTML += getHtml.call(this);
    }

    async determineProperties() {
        const [app_id, item_id] = this.getAttribute(itemRefIdAttribute).split('.');
        this.app_id = app_id
        this.item_id = item_id;
        this.isClone = Boolean(Number(this.getAttribute(isCloneAttribute)));
        this.classroom = await this.getInterpretatedClassroom();
    };

    async getInterpretatedClassroom() {
        const {
            title,
        } = classRoomFieldIdAttributes;
        const titleField = this.getAttribute(title);
        const resultClassroom = {
            title,
        };

        const promises = [
            gudhub.getInterpretationById(this.app_id, this.item_id, titleField, 'value').then((value) => {resultClassroom.title = value}),
        ];

        await Promise.all(promises);

        return resultClassroom;
    }

    handleClickCloseIcon() {
        console.log('close icon clicked');
    }
}