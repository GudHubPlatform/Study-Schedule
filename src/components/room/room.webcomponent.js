import getHtml, { closeIconClass, removableClass, contentContainerClass } from './roomLayout.js';
import styles from './room.styles.scss';
import { checkForNodeNameTd } from '../lesson/lesson.webcomponent.js';
import ScopeSingleton from '../../utils/ScopeSingleton.js';

import { itemRefIdAttribute, classRoomFieldIdAttributes } from '../../utils/componentsRenderer.js';

import { roomAllowedClass } from '../../studyschedule.webcomponent.js';

export default class Classroom extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this.app_id;
        this.item_id;
        this.room;
        this.isSubscribedOnItemUpdate = false;

        this.controller;

        this.oldParentCell;
        this.parentCell;
        this.isAttachedCloseIcon = false;

        this.isCloseIconClicked;
        this.isRemoved;

        this.onInit();
    }

    async onInit() {
        await this.determineProperties();
        this.render();

        if (this.parentCell && this.parentCell.classList.contains(roomAllowedClass.replace('.', ''))) {
            this.attachCloseIconListeners();
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
    }

    render() {
        const style = document.createElement('style');
        this.shadowRoot.innerHTML = getHtml.call(this);
        style.textContent = styles;
        this.shadowRoot.appendChild(style);
    }

    async determineProperties() {
        const [app_id, item_id] = this.getAttribute(itemRefIdAttribute).split('.');
        this.app_id = app_id;
        this.item_id = item_id;
        this.room = await this.getInterpretatedClassroom();
    }

    async getInterpretatedClassroom() {
        const { title } = classRoomFieldIdAttributes;
        const titleField = this.getAttribute(title);
        const resultClassroom = {
            title,
        };

        const promises = [
            gudhub.getInterpretationById(this.app_id, this.item_id, titleField, 'value').then(value => {
                resultClassroom.title = value;
            }),
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
        this.isRemoved = true;
    }

    handleBeforeClickCloseIcon() {
        this.isCloseIconClicked = true;
    }

    handleClickCloseIcon() {
        this.handleRemove();
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
            this.oldParentCell = this.parentCell;
            this.parentCell = cell;

            if (!this.isAttachedCloseIcon && this.parentCell) {
                if (this.parentCell.classList.contains(roomAllowedClass.replace('.', ''))) {
                    this.attachCloseIconListeners();
                }
            }
        }
    }

    attachCloseIconListeners() {
        const contentContainer = this.shadowRoot.querySelector(contentContainerClass);
        if (!contentContainer) return;

        contentContainer.classList.add(removableClass.replace('.', ''));

        const closeIconElement = this.shadowRoot.querySelector(closeIconClass);
        closeIconElement.onmousedown = () => this.handleBeforeClickCloseIcon();
        closeIconElement.onclick = () => this.handleClickCloseIcon();

        this.isAttachedCloseIcon = true;
    }

    handleDropToTrash() {
        this.handleRemove();
    }

    handleDropToCell(cell) {
        if (!this.controller) {
            this.controller = ScopeSingleton.getInstance().getController();
        }

        if (this.oldParentCell && this.parentCell) {
            this.controller.moveClassroom(this.oldParentCell, this.parentCell);
        } else if (this.parentCell) {
            this.controller.setClassroom(`${this.app_id}.${this.item_id}`, cell);
        }
    }
}
