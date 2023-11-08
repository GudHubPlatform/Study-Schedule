export const cellRowAttribute = 'data-row';
export const cellColAttribute = 'data-col';
export const lessonIdAttribute = 'data-id';
export const lessonCellClass = '.lesson-cell';

export function lesson(lesson, isClone) {
    const { title, classNumber, teacher } = lesson;
    const { name, surname } = teacher ? teacher : {};

    const lessonId = generateLessonId(lesson);
    const titleRender = [...title].map((el, i) => i === 0 ? el.toUpperCase() : el).join('');
    const teacherName = teacher && `${surname} ${[...name][0]}.`;

    return (`
        <div
            class="redips-drag ${isClone && 'redips-clone'}"
            ${lessonIdAttribute}="${lessonId}"
        >
            <span class="lesson-title">${shortText(titleRender)}</span>
            ${teacher ? `<span class="lesson-teacher-name">${shortText(teacherName)}</span>` : ''}
            ${classNumber ? `<span class="lesson-class-number">${classNumber}</span>` : ''}
        </div>
    `)
}

const shortText = (text) => text.length > 11 && [...text][text.length - 1] !== '.' ? [...[...text].splice(0, 11), '...'].join('') : text;
export const generateLessonId = (lesson) => {
    const { title, classNumber, teacher } = lesson;
    const { name, surname } = teacher ? teacher : {};
    return `${title}:${classNumber ? classNumber : ''}:${teacher ? `${name}${surname}` : ''}`;
};