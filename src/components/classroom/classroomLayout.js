
export const classroomClass = '.classroom';
export const contentContainerClass = '.content-container';
export const titleClass = '.title';
export const closeIconClass = '.close-icon';
export const removableClass = '.removable';

export default function getHtml() {
    const { title } = this.classroom;
    const isClone = this.isClone;

    return /*html*/`
        <div
            class="${classroomClass.replace('.', '')} ${isClone ? 'redips-clone' : ''}"
        >
            <div
                class="${closeIconClass.replace('.', '')}"
            >
            </div>
            <div class="${contentContainerClass.replace('.','')} ${isClone ? '' : removableClass.replace('.', '')}">
                <span class="${titleClass.replace('.', '')}">${title}</span>
            </div>
        </div>
    `;
}