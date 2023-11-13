export const tabClassIdAttribute = 'data-classId';
export const selectedTabClass = '.selected';
export const lessonsListTitleClass = 'lessons-list-title';
export const onSelectClassTabEvent = 'onSelectClassTab';

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
                        class="${lessonsListTitleClass} redips-mark freeze-header"
                        ${onSelectClassTabEvent} = "this.rerenderLessonsListTitle()"
                        >Уроки</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.lessons.reduce((acc, lesson) => acc + 
                        `
                            <tr>
                                <td class="redips-trash">
                                    ${this.renderLesson(lesson, true)}
                                </td>
                            </tr>
                        `
                        , '')}
                </tbody>
            </table>
        </div>
    </div>
    `
}

export function rerenderTitle(element) {
    console.log(element);
}