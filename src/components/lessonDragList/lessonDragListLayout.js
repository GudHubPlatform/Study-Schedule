import { defaultTitle, classroomsTab } from "./lessonDragList.webcomponent.js";
import { columnWidth, lessonCellClass, classRoomCellClass } from '../../studyschedule.webcomponent.js';

export const selectedTabClass = '.selected';

export const lessonsListTitleClass = '.lessons-list-title';

export const classroomRowClass = '.classroom-row';

export const tabIdAttribute = 'tab-id';
export const lessonUniqueIdAttribute = 'lesson-unique-id'
const lessonsHeaderColspan = 2;

export default function getHtml() {
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
                        >${defaultTitle}</th>
                    </tr>
                </thead>
                <tbody>
                ${lessons.reduce((acc, lesson) => acc + 
                /*html*/`
                    <tr
                        ${tabIdAttribute}=${lesson.clasId}
                        ${lessonUniqueIdAttribute}=${lesson.uniqueId}
                    >
                        <td class="redips-trash hours-counter-cell">
                        </td>
                        <td class="redips-trash ${lessonCellClass.replace('.', '')}" colspan=${columnWidth}>
                            ${this.renderer.lesson(lesson.itemRefId, lesson.clasId, 1)}
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
                                class="redips-trash ${classRoomCellClass.replace('.', '')}"
                            >
                                ${this.renderer.classroom(classroom.id, 1)}
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