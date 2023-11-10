export const cellRowAttribute = 'data-row';
export const cellColAttribute = 'data-col';
export const lessonIdAttribute = 'data-id';
export const lessonCellClass = '.lesson-cell';
export const lessonContentContainerClass = '.lesson-content-container';
export const lessonContentContainerRemovableClass = '.removable';
export const closeIconClass = '.close-icon';

export function lesson(lesson, isClone) {
    const { id, title, classNumber, teacher } = lesson;
    const { name, surname } = teacher ? teacher : {};

    const titleRender = [...title].map((el, i) => i === 0 ? el.toUpperCase() : el).join('');
    const teacherName = teacher && `${surname} ${[...name][0]}.`;

    return `
        <div
            class="redips-drag ${isClone ? 'redips-clone' : ''}"
            ${lessonIdAttribute}="${id}"
        >
            <div
                class="${removeDotFromClass(closeIconClass)}"
                ${isClone ? "" : "onmousedown=handleClickCloseIcon()"}
            ></div>
            <div class="${removeDotFromClass(lessonContentContainerClass)} ${isClone ? '' : removeDotFromClass(lessonContentContainerRemovableClass)}">
                <span class="lesson-title">${shortText(titleRender)}</span>
                ${teacher ? `<span class="lesson-teacher-name">${shortText(teacherName)}</span>` : ''}
                ${classNumber ? `<span class="lesson-class-number">${classNumber}</span>` : ''}
            </div>
        </div>
    `;
}

export const removeDotFromClass = (clas) => clas.replace('.', '');
const shortText = (text) => text.length > 11 && [...text][text.length - 1] !== '.' ? [...[...text].splice(0, 11), '...'].join('') : text;