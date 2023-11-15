export const classroomClass = '.classroom';
export const classroomIdAttribute = 'data-classroom-id';
export const classroomTitleClass = '.callroom-title';

export function classroom(classroom, isClone) {
    const { id, title } = classroom;
    return `
        <div
            class="${classroomClass.replace('.', '')} redips-drag ${isClone ? 'redips-clone' : ''}"
            ${classroomIdAttribute}="${id}"
        >
            <span class="${classroomTitleClass.replace('.', '')}">${title}</span>
        </div>
    `
};