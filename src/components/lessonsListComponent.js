export const selectedTabClass = '.selected';
export const lessonsListTitleClass = 'lessons-list-title';
export const hoursRemainsClass = 'hours-remains';
const hoursTotalAmountClass = 'hours-total-amount';
const lessonsListTitleId = 'lessons-list-title';
export const lessonsListId = 'lessons-list';
export const lessonCloneDisabledClass = 'disabled';
export const classIdAttribute = 'data-class-id'
export const classroomTabId = 'classroom-tab-id';
export const lessonsListTitle = 'Уроки';
export const lessonsListTitleCabinets = 'Кабінети';
const lessonsHeaderColspan = 2;
const classroomsInRow = 3;
export const classroomRowClass = '.classroom-row';

export function lessonsList() {
    return `
    <div class="table-lessons-and-tabs-container">
        <div class="table-scroll">
            <ul class="tabs-lesson-list">
                <li class=${selectedTabClass.replace('.', '')} onclick="handleSelectTab()"><label class="tab-lesson">All</label></li>
                <li class=${selectedTabClass.replace('.', '')} ${this.classIdAttribute}="${classroomTabId}" onclick="handleSelectTab()"><label class="tab-lesson">Cabinets</label></li>
                ${this.classes.reduce((acc, { id, title }) => acc + `
                    <li ${this.classIdAttribute}="${id}" onclick="handleSelectTab()"><label class="tab-lesson">${title}</label></li>
                `, '')}
            </ul>
            <table class="table-lessons">
                <thead>
                    <tr>
                        <th class="header-hours-counter redips-mark freeze-header"></th>
                        <th 
                            id="${lessonsListTitleId}"
                            class="${lessonsListTitleClass} redips-mark freeze-header haeder-lesson-clone-cell"
                            colspan=${lessonsHeaderColspan}
                            >${lessonsListTitle}</th>
                    </tr>
                </thead>
                <tbody id="${lessonsListId}">
                    ${renderLessonsList.call(this, this.lessons)}
                    ${renderClassroomsList.call(this, this.classrooms)}
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
            ${this.lessonIdAttribute}="${lesson.uniqueId}"
            ${this.classIdAttribute}="${lesson.clas.id}"
        >
            <td class="redips-trash">
                <div class=hours-counter-container redips-trash>
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
function renderClassroomsList(classrooms) {
    const rowCount = Math.ceil(classrooms.length / classroomsInRow);
    const classroomsRows = [];

    for (let i = 0; i < rowCount; i++) {
        const startSliceIndex = i * classroomsInRow;
        const row = classrooms.slice(startSliceIndex, startSliceIndex + classroomsInRow);
        classroomsRows.push(row);
    }

    return classroomsRows.reduce((acc, row) => acc + 
    `
        <tr 
            class="${classroomRowClass.replace('.','')}"
            colspan=${this.columnWidth}
            style="display: none"
        >
            ${row.reduce((rowAcc, classroom) => rowAcc +`
            <td 
                ${this.classroomIdAttribute}="${classroom.id}"
                class="redips-trash"
            >
                ${this.renderClassroom(classroom, true)}
            </td>
            `, '')}
        </tr>
    `
    , '');
}

export function rerenderTitle() {
    const titleElement = document.getElementById(lessonsListTitleId);

    titleElement.textContent = titleElement.textContent.split(' ')[0];

    switch (this.selectedClassTabId) {
        case null: {
            titleElement.textContent = lessonsListTitle;
            break;
        }
        case classroomTabId: {
            titleElement.textContent = lessonsListTitleCabinets;
            break;
        }
        default: {
            const foundClass = this.classes.find(({id}) => id == this.selectedClassTabId);

            if (!foundClass) return;

            if (titleElement.textContent === lessonsListTitleCabinets) {
                titleElement.textContent = lessonsListTitle;
            }

            const addText = `${foundClass.classNumber}-${foundClass.classLetter}`;
            const titleText = titleElement.textContent + ' ' + addText;

            titleElement.textContent = titleText;
            break;
        }
    }
}

export function rerenderLessonsList() {
    const listElement = document.getElementById(lessonsListId);
    const classroomRows = listElement.querySelectorAll(`${classroomRowClass}`);
    const allElementsDisplay = (elements, isDisplayed) => {
        for (const el of elements) {
            el.style.display = isDisplayed ? '' : 'none';
        }
    };
    const lessonsElements = listElement.querySelectorAll(`[${this.lessonIdAttribute}]`);

    const selectedClassId = this.selectedClassTabId;

    switch (selectedClassId) {
        case classroomTabId: {
            allElementsDisplay(classroomRows, true);
            allElementsDisplay(lessonsElements, false);

            break;
        }
        default: {
            allElementsDisplay(classroomRows, false);

            for (const el of lessonsElements) {
                const classId = el.getAttribute(this.classIdAttribute);
        
                const isDisplayed = classId == selectedClassId;
        
                if (isDisplayed || !selectedClassId) {
                    el.style.display = '';
                } else {
                    el.style.display = 'none';
                }
            }

            break;
        }
    }
}

export function rerenderLessonsCounters() {
    const hours = this.controller.getAcademicHours();

    const listElement = document.getElementById(lessonsListId);
    const lessonsRows = [];

    for (const row of listElement.children) {
        if (row.getAttribute(this.lessonIdAttribute)) lessonsRows.push(row);
    }
    
    for (const row of lessonsRows) {
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