const fg = /*html*/`
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
`