export const tabClassIdAttribute = 'data-classId';
export const selectedTabClass = '.selected';
export const lessonsListTitleClass = 'lessons-list-title';
export const onSelectClassTabEvent = 'onSelectClassTab';
const lessonsListTitleId = 'lessons-list-title';
const lessonsListId = 'lessons-list';
const lessonRowNoDisplayClass = 'noDisplay';

export function lessonsList() {
    return `
    <div class="table-lessons-and-tabs-container">
        <div class="table-scroll">
            <ul class="tabs-lesson-list">
                <li class=${selectedTabClass.replace('.', '')} onclick="handleSelectTab()"><label class="tab-lesson">All</label></li>
                ${this.classes.reduce((acc, { id, classNumber, classLetter }) => acc + `
                    <li ${tabClassIdAttribute}="${id}" onclick="handleSelectTab()"><label class="tab-lesson">${classNumber}-${classLetter}</label></li>
                `, '')}
            </ul>
            <table class="table-lessons">
                <thead>
                    <tr>
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

function renderLessonsList(lessons) {
    return lessons.reduce((acc, lesson) => acc + 
    `
        <tr ${this.lessonIdAttribute}="${lesson.id}">
            <td class="redips-trash">
                ${this.renderLesson(lesson, true)}
            </td>
        </tr>
    `
    , '');
}

export function rerenderLessonsList() {
    const listElement = document.getElementById(lessonsListId);

    let filteredLessons;

    const foundClass = this.classes.find(({id}) => id == this.selectedClassTabId);

    if (!foundClass || this.selectedClassTabId === this.lessonsTabAll) {
        filteredLessons = this.lessons;
    } else {
        filteredLessons = this.lessons.filter((clas) => {
            const { classNumber } = clas;
    
            if (!classNumber || classNumber == foundClass.classNumber) {
                return true;
            }
            return false;
        });
    }

    for (const el of listElement.children) {
        const lessonId = el.getAttribute(this.lessonIdAttribute);

        const isDisplayed = filteredLessons.some(({id}) => lessonId == id);

        if (isDisplayed) {
            el.classList.remove(lessonRowNoDisplayClass);
        } else {
            el.classList.add(lessonRowNoDisplayClass);
        }
    }
}