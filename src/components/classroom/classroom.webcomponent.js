import getHtml, { closeIconClass, removableClass, contentContainerClass } from "./classroomLayout.js";
import styles from './classroom.styles.scss';
import { checkForNodeNameTd } from "../lesson/lesson.webcomponent.js";
import ScopeSingleton from "../../utils/ScopeSingleton.js";

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
        this.isSubscribedOnItemUpdate = false;

        this.controller;
        
        this.oldParentCell;
        this.parentCell;
        this.isRemovable = null;

        this.onInit();
    }

    async onInit() {
        await this.determineProperties();
        this.render();

        if (!this.isClone) {
            const closeIconElement = this.shadowRoot.querySelector(closeIconClass);
            closeIconElement.onclick = () => this.handleClickCloseIcon();
        }

        this.itemUpdateSubscribe();
    }

    onItemUpdate = async () => {
        await this.determineProperties();
        this.render();
    };

    itemUpdateSubscribe() {
        if (!this.isSubscribedOnItemUpdate) {
            gudhub.on('gh_item_update', { app_id: this.app_id, item_id: this.item_id }, this.onItemUpdate);
            this.isSubscribedOnItemUpdate = true;
        }
    }
    destroySubscribe() {
        if (this.isSubscribedOnItemUpdate) {
            gudhub.destroy('gh_item_update', { app_id: this.app_id, item_id: this.item_id }, this.onItemUpdate);
            this.isSubscribedOnItemUpdate = false;
        }
    }

    connectedCallback() {
        this.itemUpdateSubscribe();
        const parentCell = this.parentElement.parentElement;
        if (parentCell && checkForNodeNameTd(parentCell)) {
            this.setParentCell(parentCell);
        }
    }

    disconnectedCallback() {
        this.destroySubscribe();
        this.handleDrop();
    };

    render() {
        const style = document.createElement('style');
        this.shadowRoot.innerHTML = getHtml.call(this);
        style.textContent = styles;
        this.shadowRoot.appendChild(style);
    }

    async determineProperties() {
        const [app_id, item_id] = this.getAttribute(itemRefIdAttribute).split('.');
        this.app_id = app_id
        this.item_id = item_id;
        this.isClone = Boolean(Number(this.getAttribute(isCloneAttribute)));
        this.classroom = await this.getInterpretatedClassroom();
        this.isRemovable = Boolean(this.shadowRoot.querySelector(removableClass));
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

    handleRemove() {
        this.setParentCell(null);
        if (!this.controller) {
            this.controller = ScopeSingleton.getInstance().getController();
        }
        this.controller.removeClassroom(this.oldParentCell);
    }

    handleClickCloseIcon() {
        this.handleRemove();
        this.isCloseIconClicked = true;

        const rd = ScopeSingleton.getInstance().getRD();
        rd.deleteObject(rd.obj);
    }

    handleDrop() {
        const cell = this.parentElement.parentElement;

        if (cell === this.parentCell) return;
        this.setParentCell(cell);

        if (checkForNodeNameTd(cell) && !cell.classList.contains('redips-trash')) {
                this.handleDropToCell(cell);
        } else if (cell === null) {
            this.handleDropToTrash();
        }
    }

    setParentCell(cell) {
        if (this.parentCell !== cell) {
            if (this.isRemovable === false && checkForNodeNameTd(cell) && !cell.classList.contains('redips-trash')) {
                this.addRemovable();
            }
            this.oldParentCell = this.parentCell;
            this.parentCell = cell;
        }
    }

    handleDropToTrash() {
        this.handleRemove();
    }

    handleDropToCell(cell) {
        if (!this.controller) {
            this.controller = ScopeSingleton.getInstance().getController();
        }

        if (this.oldParentCell) this.controller.removeClassroom(this.oldParentCell);
        this.controller.setClassroom(`${this.app_id}.${this.item_id}`, cell);
    }

    addRemovable() {
        const contentContainer = this.shadowRoot.querySelector(contentContainerClass);
        const closeIcon = this.shadowRoot.querySelector(closeIconClass);
        if (contentContainer) {
            contentContainer.classList.add(removableClass.replace('.', ''));
            this.isRemovable = true;
        }

        if (closeIcon) {
            closeIcon.onclick = () => this.handleClickCloseIcon();
        }
    }
}