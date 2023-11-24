export const contentContainerClass = '.content-container';
export const removableClass = '.removable';
export const closeIconClass = '.close-icon';
const noTeacherClass = '.no-teacher';
const titleClass = '.title';
const lessonTeacherNameClass = '.teacher-name';
const classTitle = '.class-title';

export default function getHtml() {
    const {
        title,
        teacher
    } = this.lesson;

    return /*html*/`
        <div class="container">
            <div
                class="${closeIconClass.replace('.', '')}"
            ></div>
            <div class="${contentContainerClass.replace('.', '')}">
                <span class="${titleClass.replace('.', '')}">${shortText(title)}</span>
                <span
                    class="${lessonTeacherNameClass.replace('.', '')} ${teacher ? '' : noTeacherClass.replace('.','')}"
                >
                    ${shortText(teacher)}
                </span>
                <span class="${classTitle.replace('.', '')}">${this.classTitle}</span>
            </div>
        </div>
    `;
};

const shortText = (text) => text.length > 11 && [...text][text.length - 1] !== '.' ? [...[...text].splice(0, 11), '...'].join('') : text;