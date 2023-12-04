
export const roomClass = '.room';
export const contentContainerClass = '.content-container';
export const titleClass = '.title';
export const closeIconClass = '.close-icon';
export const removableClass = '.removable';

export default function getHtml() {
    const { title } = this.room;

    return /*html*/`
        <div
            class="${roomClass.replace('.', '')}"
        >
            <div
                class="${closeIconClass.replace('.', '')}"
            >
            </div>
            <div class="${contentContainerClass.replace('.','')}">
                <span class="${titleClass.replace('.', '')}">${title}</span>
            </div>
        </div>
    `;
}