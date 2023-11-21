import { allTab, classroomsTab } from "./lessonDragList.webcomponent.js";
import { columnWidth } from '../../studyschedule.webcomponent.js';

export const selectedTabClass = '.selected';

export const lessonsListTitleClass = '.lessons-list-title';
export const hoursRemainsClass = 'hours-remains';
const hoursTotalAmountClass = 'hours-total-amount';

export const classroomRowClass = '.classroom-row';

export const tabIdAttribute = 'tab-id';
const lessonsHeaderColspan = 2;

export default function getHtml() {
    const defaultTab = allTab;
    const lessons = this.lessons;
    const classrooms = this.classrooms;

    return /*html*/`
    <div class="table-lessons-and-tabs-container">
        <div class="table-scroll">
            <ul class="tabs-lesson-list">
                ${this.classes.reduce((acc, clas, index) => acc + `
                    <li tab-id="${clas.id}" class="${index === 0 ? 'selected' : ''}"><label class="tab-lesson">${clas.title}</label></li>
                `, '')}
            </ul>
            <table id="lessons-table" class="table-lessons">
                <thead>
                    <tr>
                        <th class="header-hours-counter redips-mark freeze-header"></th>
                        <th class="${lessonsListTitleClass.replace('.', '')} redips-mark freeze-header haeder-lesson-clone-cell"
                        colspan=${lessonsHeaderColspan}
                        >${defaultTab.title}</th>
                    </tr>
                </thead>
                <tbody>
                ${lessons.reduce((acc, lesson) => acc + /*html*/`
                    <tr
                        ${tabIdAttribute}=${lesson.clas.id}
                    >
                        <td class="redips-trash">
                            <div class=hours-counter-container redips-trash>
                                <span class=${hoursTotalAmountClass}>${lesson.academicHours}</span>
                                <span class="${hoursRemainsClass}">${lesson.academicHours}</span>
                            </div>
                        </td>
                        <td class="redips-trash" colspan=${columnWidth}>
                            ${this.renderer.lesson(lesson.id, lesson.clas.id, true)}
                        </td>
                    </tr>
                `, '')}
                ${(() => {
                    const rowCount = Math.ceil(classrooms.length / this.classroomsInRow);
                    const classroomsRows = [];

                    for (let i = 0; i < rowCount; i++) {
                        const startSliceIndex = i * this.classroomsInRow;
                        const row = classrooms.slice(startSliceIndex, startSliceIndex + this.classroomsInRow);
                        classroomsRows.push(row);
                    }

                    return classroomsRows.reduce((acc, row) => acc + 
                    /*html*/`
                        <tr 
                            ${tabIdAttribute}=${classroomsTab.id}
                            class="${classroomRowClass.replace('.','')}"
                            colspan=${this.classroomsInRow}
                            style="display: none"
                        >
                            ${row.reduce((rowAcc, classroom) => rowAcc +`
                            <td
                                class="redips-trash"
                            >
                                ${this.renderer.classroom(classroom.id, true)}
                            </td>
                            `, '')}
                        </tr>
                    `
                    , '');
                })()}
                </tbody>
            </table>
        </div>
    </div>
    `;
};