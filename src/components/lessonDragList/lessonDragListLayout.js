import { defaultTitle, roomsTab } from "./lessonDragList.webcomponent.js";
import { columnWidth, lessonCellClass, classRoomCellClass } from '../../studyschedule.webcomponent.js';

export const selectedTabClass = '.selected';

export const lessonsListTitleClass = '.lessons-list-title';

export const roomRowClass = '.room-row';

export const tabIdAttribute = 'tab-id';
export const lessonUniqueIdAttribute = 'lesson-unique-id';
export const roomIdAttribute = 'room-id';
const lessonsHeaderColspan = 2;

export default function getHtml() {
    const lessons = this.lessons;
    const rooms = this.rooms;

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
                            ${this.renderer.lesson(lesson.subjectRefId, lesson.clasId, 1)}
                        </td>
                    </tr>
                `, '')}
                ${(() => {
                    const rowCount = Math.ceil(rooms.length / this.roomsInRow);
                    const roomsRows = [];

                    for (let i = 0; i < rowCount; i++) {
                        const startSliceIndex = i * this.roomsInRow;
                        const row = rooms.slice(startSliceIndex, startSliceIndex + this.roomsInRow);
                        roomsRows.push(row);
                    }

                    return roomsRows.reduce((acc, row) => acc + 
                    /*html*/`
                        <tr 
                            ${tabIdAttribute}=${roomsTab.id}
                            class="${roomRowClass.replace('.','')}"
                            colspan=${this.roomsInRow}
                            style="display: none"
                        >
                            ${row.reduce((rowAcc, room) => rowAcc +`
                            <td
                                class="redips-trash ${classRoomCellClass.replace('.', '')}"
                                ${roomIdAttribute}=${room.id}
                            >
                                ${this.renderer.room(room.id, 1)}
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