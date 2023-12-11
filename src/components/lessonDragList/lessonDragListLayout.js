import { defaultTitle, roomsTab } from './lessonDragList.webcomponent.js';
import { lessonCellClass, classRoomCellClass } from '../../studyschedule.webcomponent.js';

export const dragListScrollId = 'drag-list-scroll';

export const selectedTabClass = '.selected';

export const lessonsListTitleClass = '.lessons-list-title';

export const roomRowClass = '.room-row';
export const headerHoursCounterClass = '.header-hours-counter';

export const tabIdAttribute = 'tab-id';
export const lessonUniqueIdAttribute = 'lesson-unique-id';
export const roomIdAttribute = 'room-id';

export default function getHtml() {
    const lessons = this.lessons;
    const rooms = this.rooms;

    const roomsInRow = this.columnsCount.all;
    const lessonColspan = this.columnsCount.lesson;

    return /*html*/ `
    <div class="table-lessons-and-tabs-container">
        <div id=${dragListScrollId} class="table-scroll">
            <ul class="tabs-lesson-list">
                ${this.classes.reduce(
                    (acc, clas, index) =>
                        acc +
                        `
                    <li tab-id="${clas.id}" class="${index === 0 ? 'selected' : ''}"><span>${clas.title}</span></li>
                `,
                    ''
                )}
            </ul>
            <table id="lessons-table" class="table-lessons">
                <thead>
                    <tr>
                        <th class="${headerHoursCounterClass.replace('.', '')} redips-mark freeze-header"></th>
                        <th class="${lessonsListTitleClass.replace(
                            '.',
                            ''
                        )} redips-mark freeze-header header-lesson-clone-cell"
                            colspan=${roomsInRow}
                        >${defaultTitle}</th>
                    </tr>
                </thead>
                <tbody>
                ${lessons.reduce(
                    (acc, lesson) =>
                        acc +
                        /*html*/ `
                    <tr
                        ${tabIdAttribute}=${lesson.clasId}
                        ${lessonUniqueIdAttribute}=${lesson.uniqueId}
                    >
                        <td class="redips-trash hours-counter-cell">
                        </td>
                        <td class="redips-trash ${lessonCellClass.replace('.', '')}">
                            ${this.renderer.lesson(lesson.subjectRefId, lesson.clasId, 1)}
                        </td>
                    </tr>
                `,
                    ''
                )}
                ${(() => {
                    const rowCount = Math.ceil(rooms.length / roomsInRow);
                    const roomsRows = [];

                    for (let i = 0; i < rowCount; i++) {
                        const startSliceIndex = i * roomsInRow;
                        const row = rooms.slice(startSliceIndex, startSliceIndex + roomsInRow);
                        roomsRows.push(row);
                    }

                    return roomsRows.reduce(
                        (acc, row) =>
                            acc +
                            /*html*/ `
                        <tr 
                            ${tabIdAttribute}=${roomsTab.id}
                            class="${roomRowClass.replace('.', '')}"
                            style="display: none"
                        >
                            ${row.reduce(
                                (rowAcc, room) =>
                                    rowAcc +
                                    `
                            <td
                                class="redips-trash ${classRoomCellClass.replace('.', '')}"
                                ${roomIdAttribute}=${room.id}
                            >
                                ${this.renderer.room(room.id, 1)}
                            </td>
                            `,
                                ''
                            )}
                        </tr>
                    `,
                        ''
                    );
                })()}
                </tbody>
            </table>
        </div>
    </div>
    `;
}
