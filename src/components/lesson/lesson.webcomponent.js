import getHtml, { closeIconClass } from "./lessonLayout.js";
import styles from './lesson.styles.scss';

import { 
    classFieldIdAttributes,
    classItemRefIdAttribute,
    itemRefIdAttribute,
    lessonFieldIdAttributes,
    isCloneAttribute
 } from '../../utils/componentsRenderer.js';

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
        this.isSubscribedOnItemUpdate = false;

        this.onInit();
    }

    async onInit() {
        await this.determineProperties();
        this.render();

        if (!this.isClone) {
            const closeIconElement = this.shadowRoot.querySelector(closeIconClass);
            closeIconElement.onmousedown = () => this.handleClickCloseIcon();
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
        this.itemUpdateSubscribe();
    }

    disconnectedCallback() {
        this.destroySubscribe();
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

    handleClickCloseIcon() {
        console.log('close icon clicked');
    }
}