import getHtml, { closeIconClass, contentContainerClass, removableClass } from "./lessonLayout.js";
import styles from './lesson.styles.scss';
import ScopeSingleton from "../../utils/ScopeSingleton.js";

import { 
    classFieldIdAttributes,
    classItemRefIdAttribute,
    itemRefIdAttribute,
    lessonFieldIdAttributes,
 } from '../../utils/componentsRenderer.js';

 import { lessonAllowedClass } from '../../studyschedule.webcomponent.js';

export const dragDisabledClass = '.drag-disabled'; 

export const checkForNodeNameTd = (element) => {
    if (!element) return;
    return element.nodeName.toLocaleLowerCase() == 'td';
}

export default class Lesson extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this.appId;
        this.itemId;
        this.uniqueId;
        this.lesson;
        this.teacherRefId;
        this.classRefId;
        this.classTitle;
        this.isSubscribedOnItemUpdate = null;

        this.controller;

        this.oldParentCell;
        this.parentCell;
        this.isDragEnabled = true;
        this.isAttachedCloseIcon = false;

        this.onInit();
    }

    async onInit() {
        await this.determineProperties();
        this.render();

        if (this.parentCell && this.parentCell.classList.contains(lessonAllowedClass.replace('.', ''))) {
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
            gudhub.on('gh_item_update', { app_id: this.appId, item_id: this.itemId }, this.onItemUpdate);
            if (this.teacherRefId) {
                gudhub.on('gh_item_update', { app_id: this.teacherRefId.split('.')[0], item_id: this.teacherRefId.split('.')[1] }, this.onItemUpdate);
            }

            this.isSubscribedOnItemUpdate = true;
        }
    }
    destroySubscribe() {
        if (this.isSubscribedOnItemUpdate) {
            gudhub.destroy('gh_item_update', { app_id: this.appId, item_id: this.itemId }, this.onItemUpdate);
            if (this.teacherRefId) {
                gudhub.destroy('gh_item_update', { app_id: this.teacherRefId.split('.')[0], item_id: this.teacherRefId.split('.')[1] }, this.onItemUpdate);
            }
            this.isSubscribedOnItemUpdate = false;
        }
    }

    connectedCallback() {
        if (this.isSubscribedOnItemUpdate !== null) {
            this.itemUpdateSubscribe();
        }

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
        this.appId = app_id;
        this.itemId = item_id;
        this.lesson = await this.getInterpretatedLesson();

        const newTeacherRefId = await this.getTeacherRefId();
        if (this.teacherRefId && this.teacherRefId !== newTeacherRefId) {
            this.destroySubscribe();
            this.itemUpdateSubscribe();
        }
        this.teacherRefId = newTeacherRefId;

        this.classRefId = this.getAttribute(classItemRefIdAttribute);
        this.classTitle = await this.getClassTitle();

        this.uniqueId = `${this.appId}.${this.itemId}/${this.classRefId}`;
    };

    async getInterpretatedLesson() {
        const {
            title,
            teacher,
            course,
            academicHours
        } = lessonFieldIdAttributes;
        const titleField = this.getAttribute(title);
        const courseField = this.getAttribute(course);
        const teacherField = this.getAttribute(lessonFieldIdAttributes.teacher);
        const academicHoursField = this.getAttribute(academicHours);
        const resultLesson = {
            title,
            teacher,
            course,
            academicHours
        };

        const promises = [
            gudhub.getInterpretationById(this.appId, this.itemId, titleField, 'value').then((value) => {resultLesson.title = value}),
            gudhub.getInterpretationById(this.appId, this.itemId, courseField, 'value').then((value) => {resultLesson.course = value}),
            gudhub.getInterpretationById(this.appId, this.itemId, teacherField, 'value').then((value) => {resultLesson.teacher = value}),
            gudhub.getInterpretationById(this.appId, this.itemId, academicHoursField, 'value').then((value) => {resultLesson.academicHours = value}),
        ];

        await Promise.all(promises);

        return resultLesson;
    }

    async getTeacherRefId() {
        const lessonItem = await gudhub.getItem(this.appId, this.itemId);
        const teacherField = this.getAttribute(lessonFieldIdAttributes.teacher);
        return lessonItem.fields.find(({field_id}) => field_id == teacherField).field_value;
    }

    async getClassTitle() {
        const classTitleField = this.getAttribute(classFieldIdAttributes.title);
        const classTitle = await gudhub.getInterpretationById(...this.classRefId.split('.'), classTitleField, 'value');
        return classTitle;
    }

    setParentCell(cell) {
        if (this.parentCell !== cell) {
            this.oldParentCell = this.parentCell;
            this.parentCell = cell;

            if (!this.isAttachedCloseIcon) {
                if (this.parentCell.classList.contains(lessonAllowedClass.replace('.', ''))) {
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

    handleRemove() {
        this.setParentCell(null);
        if (!this.controller) {
            this.controller = ScopeSingleton.getInstance().getController();
        }
        this.controller.removeLesson(this.oldParentCell);
    }

    handleBeforeClickCloseIcon() {
        this.isCloseIconClicked = true;
    }

    handleClickCloseIcon() {
        this.handleRemove();

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

    handleDropToTrash() {
        this.handleRemove();
    }

    handleDropToCell(cell) {
        if (!this.controller) {
            this.controller = ScopeSingleton.getInstance().getController();
        }

        if (this.oldParentCell) this.controller.removeLesson(this.oldParentCell);
        this.controller.setLesson(this.uniqueId, cell);
    }

    toggleDrag(bool) {
        if (bool === undefined) return;
        this.isDragEnabled = bool;

        const dndWrap = this.parentElement;
        // const contentContainer = this.shadowRoot.querySelector(contentContainerClass);
        const rd = ScopeSingleton.getInstance().getRD();
        if (rd) rd.enableDrag(this.isDragEnabled, this.parentElement);

        if (this.isDragEnabled) {
            dndWrap.classList.remove(dragDisabledClass.replace('.', ''));
        } else {
            dndWrap.classList.add(dragDisabledClass.replace('.', ''));
        }
    }
}