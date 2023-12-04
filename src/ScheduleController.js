import { getKeyFromCell } from './ScheduleModel.js';
import documentStorage from './utils/documentStorage.js';
import { lessonAllowedClass, roomAllowedClass } from './studyschedule.webcomponent.js';
import ScopeSingleton from './utils/ScopeSingleton.js';
import { roomIdAttribute, lessonUniqueIdAttribute } from './components/lessonDragList/lessonDragListLayout.js';

export default class ScheduleController {
    constructor(scope, model, lessons, rooms) {
        this.scope = scope;
        this.model = model;
        this.lessons = lessons;
        this.rooms = rooms;

        this.academicHoursCallbackObject = {};
    }

    async setLesson(uniqueId, cell, saveToStorage = true) {
        const { row, col } = getCoordsFromCell(cell);
        if (!this.checkRowCol(row, col)) return;
        if (!uniqueId) return;
;
        const foundLesson = this.findLessonById(uniqueId);
        if (!foundLesson) return;

        const cellToSave = this.model.setLesson(row, col, foundLesson);

        if (cellToSave) {
            this.addAcademicHour(uniqueId);
            if (saveToStorage) await this.addCellToDocumentStorage(cellToSave, foundLesson);
        }

        return cellToSave;
    }

    async removeLesson(cell, saveToStorage = true) {
        if (!cell) return;
        const { row, col } = getCoordsFromCell(cell);
        if (!this.checkRowCol(row, col)) return;
        const removedLessonId = this.model.removeLesson(row, col);

        const cellToRemove = this.model.getCell(row, col);

        this.subtractAcademicHour(removedLessonId);

        const lessonCellElement = this.model.getLessonCellHTMLElement(row, col);
        removeRdObject(lessonCellElement);
        if (saveToStorage) await this.removeLessonInDocumentStorageCell(cellToRemove, removedLessonId);

        return removedLessonId;
    }

    async setClassroom(roomId, cell, saveToStorage = true) {
        const { row, col } = getCoordsFromCell(cell);
        if (!this.checkRowCol(row, col)) return;
        if (!roomId) return;

        const foundClassroom = this.findClassroomById(roomId);
        if (!foundClassroom) return;

        const cellToSave = this.model.setClassroom(row, col, foundClassroom);

        if (cellToSave) {
            if (saveToStorage) await this.addCellToDocumentStorage(cellToSave, foundClassroom);
        }

        return cellToSave;
    }

    async removeClassroom(cell, saveToStorage = true) {
        if (!cell) return;
        const { row, col } = getCoordsFromCell(cell);
        if (!this.checkRowCol(row, col)) return;
        const removedClassroomId = this.model.removeClassroom(row, col);
        
        const cellToRemove = this.model.getCell(row, col);

        const roomCellElement = this.model.getClassroomCellHTMLElement(row, col);
        removeRdObject(roomCellElement);

        if (saveToStorage) await this.removeClassroomInDocumentStorage(cellToRemove, removedClassroomId);

        return removedClassroomId;
    }

    getLesson(uniqueId) {
        const foundLesson = this.lessons.find(lesson => lesson.id === uniqueId);

        return foundLesson;
    }

    setHTMLElements(htmlElements) {
        const arr = [...htmlElements];

        for (const row in this.model.scheduleStorage) {
            for (const col in this.model.scheduleStorage[row]) {
                this.model.setHTMLElement(row, col, arr.shift());
            }
        }
    }

    checkRowCol(row, col) {
        if (isNaN(row) || isNaN(col)) return false;
        if (!(0 <= row & row <= this.model.getRowCount() - 1)) return false;
        if (!(0 <= col & col <= this.model.getColCount() - 1)) return false;
        
        return true;
    }

    findLessonById(uniqueId) {
        return this.lessons.find((lesson) => lesson.uniqueId == uniqueId);
    }

    findClassroomById(roomId) {
        return this.rooms.find((room) => room.id == roomId);
    }

    async addCellToDocumentStorage(cell, addedObject) {
        const { dayOfWeekIndex, clas, lessonNumber, lesson, room } = cell;
        const cellToSave = {
            dayOfWeekIndex,
            clas,
            lessonNumber,
            lesson,
            room
        };

        const { uniqueId, id} = addedObject;

        const idObject = uniqueId ? {lessonUniqueId: uniqueId} : {roomId: id};
        await documentStorage.addCell(cellToSave, idObject);
    }

    async removeLessonInDocumentStorageCell(cell, lessonUniqueId) {
        const { dayOfWeekIndex, clas, lessonNumber } = cell;
        const cellToRemove = {
            dayOfWeekIndex,
            clas,
            lessonNumber,
        };
        await documentStorage.removeLessonFromCell(cellToRemove, lessonUniqueId);
    }

    async removeClassroomInDocumentStorage(cell, roomId) {
        const { dayOfWeekIndex, clas, lessonNumber } = cell;
        const cellToRemove = {
            dayOfWeekIndex,
            clas,
            lessonNumber,
        };

        await documentStorage.removeClassroomFromCell(cellToRemove, roomId);
    }

    getCellCoords(cell) {
        const { lessonsPerDay } = this.model;
        const row = cell.dayOfWeekIndex * lessonsPerDay + cell.lessonNumber - 1;
        const col = this.model.classes.findIndex(({id}) => id == cell.clas.id);
        const cellCoords = {
            row,
            col,
        };

        return cellCoords;
    }

    async addLessonByDocumentStorage(cell, lessonUniqueId) {
        const cellCoords = this.getCellCoords(cell);
        const resultCell = await this.setLesson(lessonUniqueId, cellCoords, false);

        if (resultCell) {
            const lessonsDragListTable = document.getElementById('lesson-table-container');
            const lessonRow = lessonsDragListTable.querySelector(`[${lessonUniqueIdAttribute}="${lessonUniqueId}"]`);
            const lessonDragElement = lessonRow.getElementsByClassName('redips-drag')[0];
            const targetCell = this.model.getLessonCellHTMLElement(cellCoords.row, cellCoords.col);
            const rd = ScopeSingleton.getInstance().getRD();
            const [ cloned, original ] = rd.moveObject({
                obj: lessonDragElement,
                clone: true,
                target: targetCell,
            });

            rd.enableDrag(true, cloned);
        }
    }

    async addClassroomByDocumentStorage(cell, roomId) {
        const cellCoords = this.getCellCoords(cell);
        const resultCell = await this.setClassroom(roomId, cellCoords, false);

        if (resultCell) {
            const lessonsDragListTable = document.getElementById('lesson-table-container');
            const roomCellElement = lessonsDragListTable.querySelector(`[${roomIdAttribute}="${roomId}"]`);
            const roomDragElement = roomCellElement.getElementsByClassName('redips-drag')[0];
            const targetCell = this.model.getClassroomCellHTMLElement(cellCoords.row, cellCoords.col);
            const rd = ScopeSingleton.getInstance().getRD();
            rd.moveObject({
                obj: roomDragElement,
                clone: true,
                target: targetCell,
            });
        }
    }

    async removeLessonByDocumentStorage(cell, lessonUniqueId) {
        const cellCoords = this.getCellCoords(cell);
        const cells = this.getStorage();
        const cellOfModel = cells[cellCoords.row][cellCoords.col];

        if (cellOfModel.lesson && cellOfModel.lesson.uniqueId === lessonUniqueId) {
            await this.removeLesson(cellCoords, false);
        }
    }
    
    async removeClassroomByDocumentStorage(cell, roomId) {
        const cellCoords = this.getCellCoords(cell);
        const cells = this.getStorage();
        const cellOfModel = cells[cellCoords.row][cellCoords.col];
        
        if (cellOfModel.room && cellOfModel.room.id === roomId) {
            await this.removeClassroom(cellCoords, false);
        }
    }

    addAcademicHour(uniqueId) {
        this.model.addAcademicHour(uniqueId);
        this.handleHourUpdate(uniqueId);
    }
    
    subtractAcademicHour(uniqueId) {
        this.model.subtractAcademicHour(uniqueId);
        this.handleHourUpdate(uniqueId);
    }
    
    addHoursUpdateCallback(uniqueId, callback) {
        if (!Object.hasOwnProperty(this.academicHoursCallbackObject, [uniqueId])) {
            this.academicHoursCallbackObject[uniqueId] = [];
        }
        const callbackArray = this.academicHoursCallbackObject[uniqueId];
        
        callbackArray.push(callback);
    }
    
    handleHourUpdate(uniqueId) {
        if (this.academicHoursCallbackObject.hasOwnProperty([uniqueId])) {
            const callbacksArray = this.academicHoursCallbackObject[uniqueId];
            const remainHours = this.getAcademicHours(uniqueId);
            const settedHours = remainHours ? remainHours : 0
            callbacksArray.forEach((method) => {
                method(settedHours);
            });
        }
    }
    
    getAcademicHours(uniqueId) {
        if (uniqueId) {
            const academicHoursObject = this.model.getAcademicHours();
            return academicHoursObject[uniqueId] ? academicHoursObject[uniqueId] : 0;
        }
        return this.model.getAcademicHours();
    }

    async loadCellsFromDocumentStorage() {
        documentStorage.initDocumentAddress(this.scope);
        const storageCells = await documentStorage.getCells();

        const storageCellsObj = {};

        for (const cell of storageCells) {
            const key = getKeyFromCell(cell);
            storageCellsObj[key] = cell;
        }

        for (let i = 0; i < this.model.rowCount; i++) {

            this.model.scheduleStorage.push([]);

            const { daysOfWeek, lessonsPerDay } = this.model;
            for (const clas of this.model.classes) {
                let cell = {
                    dayOfWeekIndex: Math.floor(i / lessonsPerDay),
                    clas: clas,
                    lessonNumber: i % lessonsPerDay + 1,
                    lesson: null,
                    htmlElement: null,
                    room: null,
                };

                this.model.scheduleStorage[i].push(cell);

                const key = `${cell.clas.id}:${cell.dayOfWeekIndex}:${cell.lessonNumber}`;

                const foundStorageCell = storageCellsObj[key];

                if (foundStorageCell) {
                    const row = cell.dayOfWeekIndex * lessonsPerDay + cell.lessonNumber - 1;
                    const col = this.model.classes.findIndex(({id}) => id == foundStorageCell.clas.id);
                    const cellCoords = {
                        row,
                        col,
                    };

                    if (foundStorageCell.lesson) {
                        const {uniqueId} = foundStorageCell.lesson;
                        await this.setLesson(uniqueId, cellCoords, false);
                    }
                    if (foundStorageCell.room) {
                        const {id} = foundStorageCell.room;
                        await this.setClassroom(id, cellCoords, false);
                    }
                }
            }
        }
    }

    highlightLessonsCells(uniqueId, clickedCellCoords) {
        const rules = [];

        for (const rule of Object.values(ruleCallbacks)) {
            rules.push(rule);
        }

        const foundLesson = this.findLessonById(uniqueId);

        if (!foundLesson) {
            return () => {};
        }

        const cells = this.getStorage();

        //change real cell on copied cell without lesson to not to highlight clicked cell
        const {row, col} = clickedCellCoords;
        if (row && col) {
            const { dayOfWeekIndex, clas, htmlElement, room } = cells[row][col];

            const cellCopyWithoutLesson = {
                dayOfWeekIndex,
                clas,
                htmlElement,
                lesson: null,
                room
            };

            cells[row][col] = cellCopyWithoutLesson;
        }

        const notAllowedByRules = cells.map((row) => 
            row.filter((cell) => !rules.some(rule => rule(foundLesson, cell)))
        );

        const filteredCellsByOneLessonRule = checkForOneTeacherPerLessonRule(foundLesson, cells);

        const notAllowedCells  = [
            ...notAllowedByRules.reduce((acc, row) => [...acc, ...row], []),
            ...filteredCellsByOneLessonRule
        ];
        
        const notAllowedCellElements = notAllowedCells.map(({htmlElement}) => htmlElement);

        for (const td of notAllowedCellElements) {
            td.classList.add('disabled');
            td.classList.remove(lessonAllowedClass.replace('.', ''));

            const nextTd = td.nextElementSibling;
            nextTd.classList.add('disabled');
        }

        const highlightOff = () => {
            for (const td of notAllowedCellElements) {
                td.classList.remove('disabled');
                td.classList.add(lessonAllowedClass.replace('.', ''));
    
                const nextTd = td.nextElementSibling;
                nextTd.classList.remove('disabled');
            }
        };

        return highlightOff;
    }

    highlightClassroomsCells(roomId, clickedCellCoords) {
        const cells = this.getStorage();

        const { row, col } = clickedCellCoords;

        if (row && col) {
            const { dayOfWeekIndex, clas, htmlElement, lesson } = cells[row][col];

            const cellCopyWithoutClassroom = {
                dayOfWeekIndex,
                clas,
                htmlElement,
                lesson,
                room: null
            };

            cells[row][col] = cellCopyWithoutClassroom;
        }

        const notAllowedCells = cells.filter(row => checkForOneClassroomInRow(roomId, row));
        const notAllowedCellElements = notAllowedCells.reduce((acc, row) => [...acc, ...row.map(cell => cell.htmlElement)], []);

        for (const td of notAllowedCellElements) {
            td.classList.add('disabled');

            const nextTd = td.nextElementSibling;
            nextTd.classList.remove(roomAllowedClass.replace('.', ''));
            nextTd.classList.add('disabled');
        }

        const highlightOff = () => {
            for (const td of notAllowedCellElements) {
                td.classList.remove('disabled');

                const nextTd = td.nextElementSibling;
                nextTd.classList.add(roomAllowedClass.replace('.', ''));
                nextTd.classList.remove('disabled');
            }
        };

        return highlightOff;
    }

    getStorage() {
        return this.model.getStorage();
    }
}

const getCoordsFromCell = (cell) => {
    const coords = {};
    if (cell instanceof HTMLElement) {
        coords.row = cell.getAttribute('row');
        coords.col = cell.getAttribute('col');
    } else if (cell instanceof Object) {
        coords.row = cell.row;
        coords.col = cell.col;
    }

    return coords;
};

// return true if not suitable to rule
const ruleCallbacks = {
    classToClass: (draggedLesson, targetCell) => draggedLesson.clasId == targetCell.clas.id,
};

const checkForOneTeacherPerLessonRule = (draggedLesson, cellRows) => {
    const rowsToFilter = [...cellRows];
    if (!draggedLesson.teacherRefId) return [];

    const { teacherRefId } = draggedLesson;

    const notAllowedRows = rowsToFilter.filter((row) => 
        row.some((cell) => {
            if (cell.lesson && cell.lesson.teacherRefId) {

                return  cell.lesson.teacherRefId === teacherRefId;
            }

            return false;
        })
    );

    const notAllowedCells = notAllowedRows.reduce((acc, row) => [...acc, ...row], []);

    return notAllowedCells;
}

const checkForOneClassroomInRow = (roomId, cellRow) => cellRow
    .some(cell => cell.room && cell.room.id == roomId);

const removeRdObject = (cell) => {
    const rd = ScopeSingleton.getInstance().getRD();
    const rdObj = cell.querySelector('.redips-drag');
    if (rdObj) rd.deleteObject(rdObj);
};