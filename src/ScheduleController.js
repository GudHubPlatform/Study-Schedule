import { getKeyFromCell } from './ScheduleModel.js';
import documentStorage from './utils/documentStorage.js';
import { lessonAllowedClass, classroomAllowedClass } from './studyschedule.webcomponent.js';
import ScopeSingleton from './utils/ScopeSingleton.js';
import { classroomIdAttribute, lessonUniqueIdAttribute } from './components/lessonDragList/lessonDragListLayout.js';

export default class ScheduleController {
    constructor(scope, model, lessons, classrooms) {
        this.scope = scope;
        this.model = model;
        this.lessons = lessons;
        this.classrooms = classrooms;

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

    async moveLesson(uniqueId, fromCell, targetCell, saveToStorage = true) {
        if (!fromCell || !targetCell) return;
        const { row: fromRow, col: fromCol } = getCoordsFromCell(fromCell);
        const { row: targetRow, col: targetCol } = getCoordsFromCell(targetCell);
        if (!this.checkRowCol(fromRow, fromCol) || !this.checkRowCol(targetRow, targetCol)) return;
        
        await this.removeLesson(fromCell);
        await this.setLesson(uniqueId, targetCell);

        if (saveToStorage) await this.moveLessonInDocumentStorageCell();

        return removedLessonId;
    }

    async setClassroom(classroomId, cell, saveToStorage = true) {
        const { row, col } = getCoordsFromCell(cell);
        if (!this.checkRowCol(row, col)) return;
        if (!classroomId) return;

        const foundClassroom = this.findClassroomById(classroomId);
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

        const classroomCellElement = this.model.getClassroomCellHTMLElement(row, col);
        removeRdObject(classroomCellElement);

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

    findClassroomById(classroomId) {
        return this.classrooms.find((classroom) => classroom.id == classroomId);
    }

    async addCellToDocumentStorage(cell, addedObject) {
        const { dayOfWeek, clas, lessonNumber, lesson, classroom } = cell;
        const cellToSave = {
            dayOfWeek,
            clas,
            lessonNumber,
            lesson,
            classroom
        };

        const { uniqueId, id} = addedObject;

        const idObject = uniqueId ? {lessonUniqueId: uniqueId} : {classroomId: id};
        await documentStorage.addCell(cellToSave, idObject);
    }

    async removeLessonInDocumentStorageCell(cell, lessonUniqueId) {
        const { dayOfWeek, clas, lessonNumber } = cell;
        const cellToRemove = {
            dayOfWeek,
            clas,
            lessonNumber,
        };
        await documentStorage.removeLessonFromCell(cellToRemove, lessonUniqueId);
    }

    async removeClassroomInDocumentStorage(cell, classroomId) {
        const { dayOfWeek, clas, lessonNumber } = cell;
        const cellToRemove = {
            dayOfWeek,
            clas,
            lessonNumber,
        };

        await documentStorage.removeClassroomFromCell(cellToRemove, classroomId);
    }

    getCellCoords(cell) {
        const { daysOfWeek, lessonsPerDay } = this.model;
        const row = daysOfWeek.findIndex((day) => day === cell.dayOfWeek) * lessonsPerDay + cell.lessonNumber - 1;
        const col = this.model.classes.findIndex(({id}) => id == cell.clas.id);
        const cellCoords = {
            row,
            col,
        };

        return cellCoords;
    }

    async addLessonByDocumentStorage(cell, lessonUniqueId) {
        console.log('add lesson');
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

    async addClassroomByDocumentStorage(cell, classroomId) {
        console.log('add classroom');
        const cellCoords = this.getCellCoords(cell);
        const resultCell = await this.setClassroom(classroomId, cellCoords, false);

        if (resultCell) {
            const lessonsDragListTable = document.getElementById('lesson-table-container');
            const classroomCellElement = lessonsDragListTable.querySelector(`[${classroomIdAttribute}="${classroomId}"]`);
            const classroomDragElement = classroomCellElement.getElementsByClassName('redips-drag')[0];
            const targetCell = this.model.getClassroomCellHTMLElement(cellCoords.row, cellCoords.col);
            const rd = ScopeSingleton.getInstance().getRD();
            rd.moveObject({
                obj: classroomDragElement,
                clone: true,
                target: targetCell,
            });
        }
    }

    async removeLessonByDocumentStorage(cell, lessonUniqueId) {
        console.log('remove lesson');
        const cellCoords = this.getCellCoords(cell);
        const cells = this.getStorage();
        const cellOfModel = cells[cellCoords.row][cellCoords.col];

        if (cellOfModel.lesson && cellOfModel.lesson.uniqueId === lessonUniqueId) {
            await this.removeLesson(cellCoords, false);
        }
    }
    
    async removeClassroomByDocumentStorage(cell, classroomId) {
        console.log('remove classroom');
        const cellCoords = this.getCellCoords(cell);
        const cells = this.getStorage();
        const cellOfModel = cells[cellCoords.row][cellCoords.col];
        
        if (cellOfModel.classroom && cellOfModel.classroom.id === classroomId) {
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
                    dayOfWeek: daysOfWeek[Math.floor(i / lessonsPerDay)],
                    clas: clas,
                    lessonNumber: i % lessonsPerDay + 1,
                    lesson: null,
                    htmlElement: null,
                    classroom: null,
                };

                this.model.scheduleStorage[i].push(cell);

                const key = `${cell.clas.id}:${cell.dayOfWeek}:${cell.lessonNumber}`;

                const foundStorageCell = storageCellsObj[key];

                if (foundStorageCell) {
                    const row = daysOfWeek.findIndex((day) => day === cell.dayOfWeek) * lessonsPerDay + cell.lessonNumber - 1;
                    const col = this.model.classes.findIndex(({id}) => id == foundStorageCell.clas.id);
                    const cellCoords = {
                        row,
                        col,
                    };

                    if (foundStorageCell.lesson) {
                        const {uniqueId} = foundStorageCell.lesson;
                        await this.setLesson(uniqueId, cellCoords, false);
                    }
                    if (foundStorageCell.classroom) {
                        const {id} = foundStorageCell.classroom;
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
            const { dayOfWeek, clas, htmlElement, classroom } = cells[row][col];

            const cellCopyWithoutLesson = {
                dayOfWeek,
                clas,
                htmlElement,
                lesson: null,
                classroom
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

    highlightClassroomsCells(classroomId, clickedCellCoords) {
        const cells = this.getStorage();

        const { row, col } = clickedCellCoords;

        if (row && col) {
            const { dayOfWeek, clas, htmlElement, lesson } = cells[row][col];

            const cellCopyWithoutClassroom = {
                dayOfWeek,
                clas,
                htmlElement,
                lesson,
                classroom: null
            };

            cells[row][col] = cellCopyWithoutClassroom;
        }

        const notAllowedCells = cells.filter(row => checkForOneClassroomInRow(classroomId, row));
        const notAllowedCellElements = notAllowedCells.reduce((acc, row) => [...acc, ...row.map(cell => cell.htmlElement)], []);

        for (const td of notAllowedCellElements) {
            td.classList.add('disabled');

            const nextTd = td.nextElementSibling;
            nextTd.classList.remove(classroomAllowedClass.replace('.', ''));
            nextTd.classList.add('disabled');
        }

        const highlightOff = () => {
            for (const td of notAllowedCellElements) {
                td.classList.remove('disabled');

                const nextTd = td.nextElementSibling;
                nextTd.classList.add(classroomAllowedClass.replace('.', ''));
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

const checkForOneClassroomInRow = (classroomId, cellRow) => cellRow
    .some(cell => cell.classroom && cell.classroom.id == classroomId);

const removeRdObject = (cell) => {
    const rd = ScopeSingleton.getInstance().getRD();
    const rdObj = cell.querySelector('.redips-drag');
    if (rdObj) rd.deleteObject(rdObj);
};