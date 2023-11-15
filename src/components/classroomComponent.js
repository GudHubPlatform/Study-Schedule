import { closeIconClass, removableClass } from "./lessonComponent.js";

export const classroomClass = '.classroom';
export const classroomIdAttribute = 'data-classroom-id';
export const classroomTitleClass = '.callroom-title';
export const classroomContentContainerClass = '.classroom-content-container';

export function classroom(classroom, isClone) {
    const { id, title } = classroom;
    return `
        <div
            class="${classroomClass.replace('.', '')} redips-drag ${isClone ? 'redips-clone' : ''}"
            ${classroomIdAttribute}="${id}"
        >
        <div
            class="${closeIconClass.replace('.', '')}"
            ${isClone ? "" : "onmousedown=handleClickCloseIcon()"}
        ></div>
            <div class="${classroomContentContainerClass.replace('.','')} ${isClone ? '' : removableClass.replace('.', '')}">
                <span class="${classroomTitleClass.replace('.', '')}">${title}</span>
            </div>
        </div>
    `
};