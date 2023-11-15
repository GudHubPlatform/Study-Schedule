export const cellRowAttribute = 'data-row';
export const cellColAttribute = 'data-col';
export const lessonIdAttribute = 'data-lesson-id';
export const lessonCellClass = '.lesson-cell';
export const classRoomCellClass = '.classroom-cell';
export const lessonContentContainerClass = '.lesson-content-container';
export const lessonContentContainerRemovableClass = '.removable';
export const closeIconClass = '.close-icon';
export const lessonClass = '.lesson';

export function lesson(lesson, isClone) {
    const { uniqueId, title, clas, teacherFullName } = lesson;

    const titleRender = [...title].map((el, i) => i === 0 ? el.toUpperCase() : el).join('');

    return `
        <div
            class="${lessonClass.replace('.', '')} redips-drag ${isClone ? 'redips-clone' : ''}"
            ${lessonIdAttribute}="${uniqueId}"
            ${this.classIdAttribute}="${clas.id}"
        >
            <div
                class="${closeIconClass.replace('.', '')}"
                ${isClone ? "" : "onmousedown=handleClickCloseIcon()"}
            ></div>
            <div class="${lessonContentContainerClass.replace('.', '')} ${isClone ? '' : lessonContentContainerRemovableClass.replace('.', '')}">
                <span class="lesson-title">${shortText(titleRender)}</span>
                ${teacherFullName ? `<span class="lesson-teacher-name">${shortText(teacherFullName)}</span>` : ''}
                ${clas ? `<span class="lesson-class">${clas.title}</span>` : ''}
            </div>
        </div>
    `;
}

const shortText = (text) => text.length > 11 && [...text][text.length - 1] !== '.' ? [...[...text].splice(0, 11), '...'].join('') : text;