import getHtml, { closeIconClass, contentContainerClass, removableClass } from "./lessonLayout.js";
import styles from './lesson.styles.scss';
import ScopeSingleton from "../../utils/ScopeSingleton.js";

import { 
    classFieldIdAttributes,
    classItemRefIdAttribute,
    itemRefIdAttribute,
    lessonFieldIdAttributes,
    isCloneAttribute
 } from '../../utils/componentsRenderer.js';

export const checkForNodeNameTd = (element) => {
    if (!element) return;
    return element.nodeName.toLocaleLowerCase() == 'td';
}

export default class Lesson extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        this.app_id;
        this.item_id;
        this.isClone;
        this.lesson;
        this.teacherRefId;
        this.classRefId;
        this.classTitle;
        this.isSubscribedOnItemUpdate = null;

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
            if (this.teacherRefId) {
                gudhub.on('gh_item_update', { app_id: this.teacherRefId.split('.')[0], item_id: this.teacherRefId.split('.')[1] }, this.onItemUpdate);
            }

            this.isSubscribedOnItemUpdate = true;
        }
    }
    destroySubscribe() {
        if (this.isSubscribedOnItemUpdate) {
            gudhub.destroy('gh_item_update', { app_id: this.app_id, item_id: this.item_id }, this.onItemUpdate);
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
        this.app_id = app_id
        this.item_id = item_id;
        this.isClone = Boolean(Number(this.getAttribute(isCloneAttribute)));
        this.lesson = await this.getInterpretatedLesson();

        const newTeacherRefId = await this.getTeacherRefId();
        if (this.teacherRefId && this.teacherRefId !== newTeacherRefId) {
            this.destroySubscribe();
            this.itemUpdateSubscribe();
        }
        this.teacherRefId = newTeacherRefId;

        this.classRefId = this.getAttribute(classItemRefIdAttribute);
        this.classTitle = await this.getClassTitle();

        this.isRemovable = Boolean(this.shadowRoot.querySelector(removableClass));
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
            gudhub.getInterpretationById(this.app_id, this.item_id, titleField, 'value').then((value) => {resultLesson.title = value}),
            gudhub.getInterpretationById(this.app_id, this.item_id, courseField, 'value').then((value) => {resultLesson.course = value}),
            gudhub.getInterpretationById(this.app_id, this.item_id, teacherField, 'value').then((value) => {resultLesson.teacher = value}),
            gudhub.getInterpretationById(this.app_id, this.item_id, academicHoursField, 'value').then((value) => {resultLesson.academicHours = value}),
        ];

        await Promise.all(promises);

        return resultLesson;
    }

    async getTeacherRefId() {
        const lessonItem = await gudhub.getItem(this.app_id, this.item_id);
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
            if (this.isRemovable === false && checkForNodeNameTd(cell) && !cell.classList.contains('redips-trash')) {
                this.addRemovable();
            }
            this.oldParentCell = this.parentCell;
            this.parentCell = cell;
        }
    }

    handleRemove() {
        this.setParentCell(null);
        if (!this.controller) {
            this.controller = ScopeSingleton.getInstance().getController();
        }
        this.controller.removeLesson(this.oldParentCell);
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

    handleDropToTrash() {
        this.handleRemove();
    }

    handleDropToCell(cell) {
        if (!this.controller) {
            this.controller = ScopeSingleton.getInstance().getController();
        }

        const uniqueId = `${this.app_id}.${this.item_id}/${this.classRefId}`;
        if (this.oldParentCell) this.controller.removeLesson(this.oldParentCell);
        this.controller.setLesson(uniqueId, cell);
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