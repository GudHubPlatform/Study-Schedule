export const selectedTabClass = '.selected';
export const lessonsListTitleClass = 'lessons-list-title';
export const hoursRemainsClass = 'hours-remains';
const hoursTotalAmountClass = 'hours-total-amount';
const lessonsListTitleId = 'lessons-list-title';
export const lessonsListId = 'lessons-list';
export const lessonCloneDisabledClass = 'disabled';
export const classIdAttribute = 'data-class-id'

export function lessonsList() {
    return `
    <div class="table-lessons-and-tabs-container">
        <div class="table-scroll">
            <ul class="tabs-lesson-list">
                <li class=${selectedTabClass.replace('.', '')} onclick="handleSelectTab()"><label class="tab-lesson">All</label></li>
                ${this.classes.reduce((acc, { id, classNumber, classLetter }) => acc + `
                    <li ${this.classIdAttribute}="${id}" onclick="handleSelectTab()"><label class="tab-lesson">${classNumber}-${classLetter}</label></li>
                `, '')}
            </ul>
            <table class="table-lessons">
                <thead>
                    <tr>
                        <th class="redips-mark freeze-header"></th>
                        <th 
                        id="${lessonsListTitleId}"
                        class="${lessonsListTitleClass} redips-mark freeze-header"
                        >Уроки</th>
                    </tr>
                </thead>
                <tbody id="${lessonsListId}">
                    ${renderLessonsList.call(this, this.lessons)}
                </tbody>
            </table>
        </div>
    </div>
    `;
}

function renderLessonsList(lessons) {
    return lessons.reduce((acc, lesson) => acc + 
    `
        <tr 
            ${this.lessonIdAttribute}="${lesson.id}"
            ${this.classIdAttribute}="${lesson.clas.id}"
        >
            <td class="redips-trash">
                <div class=hours-counter redips-trash>
                    <span class=${hoursTotalAmountClass}>${lesson.academicHours}</span>
                    <span class="${hoursRemainsClass}">${lesson.academicHours}</span>
                </div>
            </td>
            <td class="redips-trash">
                ${this.renderLesson(lesson, true)}
            </td>
        </tr>
    `
    , '');
}

export function rerenderTitle() {
    const titleElement = document.getElementById(lessonsListTitleId);

    titleElement.textContent = titleElement.textContent.split(' ')[0];

    if (this.selectedClassTabId !== this.lessonsTabAll) {
        const foundClass = this.classes.find(({id}) => id == this.selectedClassTabId);

        if (!foundClass) return;

        const addText = `${foundClass.classNumber}-${foundClass.classLetter}`;

        titleElement.textContent = titleElement.textContent + ' ' + addText;
    }
}

export function rerenderLessonsList() {
    const listElement = document.getElementById(lessonsListId);

    const selectedClassId = this.selectedClassTabId;

    for (const el of listElement.children) {
        const classId = el.getAttribute(this.classIdAttribute);

        const isDisplayed = classId == selectedClassId;

        if (isDisplayed || !selectedClassId) {
            el.style.display = '';
        } else {
            el.style.display = 'none';
        }
    }
}

export function rerenderLessonsCounters() {
    const hours = this.controller.getAcademicHours();

    const listElement = document.getElementById(lessonsListId);
    
    for (const row of listElement.children) {
        const lessonId = row.getAttribute(this.lessonIdAttribute);

        const totalAmountCounter = row.querySelector(`.${hoursTotalAmountClass}`);
        const remainsCounter = row.querySelector(`.${hoursRemainsClass}`);
        
        if (Object.hasOwnProperty.call(hours, [lessonId])) {
            remainsCounter.textContent = totalAmountCounter.textContent - hours[lessonId];
        } else {
            remainsCounter.textContent = totalAmountCounter.textContent;
        }
    }
}