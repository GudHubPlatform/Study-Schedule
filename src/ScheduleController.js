import { getKeyFromCell } from './ScheduleModel.js';
import documentStorage from './utils/documentStorage.js';
import { lessonAllowedClass, classroomAllowedClass } from './studyschedule.webcomponent.js';

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
        if (!this.checkRowCol(row, col)) return undefined;
        if (!uniqueId) return undefined;
;
        const foundLesson = this.findLessonById(uniqueId);
        if (!foundLesson) return undefined;

        const resultCell = this.model.setLesson(row, col, foundLesson);

        this.addAcademicHour(uniqueId);
        if (saveToStorage) await this.addCellToLocalStorage(resultCell);

        return resultCell;
    }

    async removeLesson(cell) {
        if (!cell) return undefined;
        const { row, col } = getCoordsFromCell(cell);
        if (!this.checkRowCol(row, col)) return undefined;
        const removedLessonId = this.model.removeLesson(row, col);

        const cellToRemove = this.model.getCell(row, col);

        this.subtractAcademicHour(removedLessonId);
        await this.removeLessonFromLocalStorageCell(cellToRemove);

        return removedLessonId;
    }

    async setClassroom(classroomId, cell, saveToStorage = true) {
        const { row, col } = getCoordsFromCell(cell);
        if (!this.checkRowCol(row, col)) return undefined;
        if (!classroomId) return undefined;

        const foundClassroom = this.findClassroomById(classroomId);
        if (!foundClassroom) return undefined;

        const cellToSave = this.model.setClassroom(row, col, foundClassroom);

        if (saveToStorage) await this.addCellToLocalStorage(cellToSave);

        return cellToSave;
    }

    async removeClassroom(cell) {
        if (!cell) return undefined;
        const { row, col } = getCoordsFromCell(cell);
        if (!this.checkRowCol(row, col)) return undefined;
        const removedClassroomId = this.model.removeClassroom(row, col);
        
        const cellToRemove = this.model.getCell(row, col);
        await this.removeClassroomFromLocalStorageCell(cellToRemove);

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

    getHTMLElement() {}

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

    async addCellToLocalStorage(cell) {
        const { dayOfWeek, clas, lessonNumber, lesson, classroom } = cell;
        const cellToSave = {
            dayOfWeek,
            clas,
            lessonNumber,
            lesson,
            classroom
        };

        await documentStorage.addCell(cellToSave);
    }

    async removeLessonFromLocalStorageCell(cell) {
        const { dayOfWeek, clas, lessonNumber } = cell;
        const cellToRemove = {
            dayOfWeek,
            clas,
            lessonNumber,
        };

        await documentStorage.removeLessonFromCell(cellToRemove);
    }

    async removeClassroomFromLocalStorageCell(cell) {
        const { dayOfWeek, clas, lessonNumber } = cell;
        const cellToRemove = {
            dayOfWeek,
            clas,
            lessonNumber,
        };

        await documentStorage.removeClassroomFromCell(cellToRemove);
    }

    addAcademicHour(uniqueId) {
        this.model.addAcademicHour(uniqueId);
        this.executeAcademicHoursCallbacks(uniqueId);
    }

    subtractAcademicHour(uniqueId) {
        this.model.subtractAcademicHour(uniqueId);
        this.executeAcademicHoursCallbacks(uniqueId);
    }

    addHoursCallback(uniqueId, callback) {
        if (!Object.hasOwnProperty(this.academicHoursCallbackObject, [uniqueId])) {
            this.academicHoursCallbackObject[uniqueId] = [];
        }
        const callbackArray = this.academicHoursCallbackObject[uniqueId];

        callbackArray.push(callback);
    }

    executeAcademicHoursCallbacks(uniqueId) {
        if (this.academicHoursCallbackObject.hasOwnProperty([uniqueId])) {
            const callbacksArray = this.academicHoursCallbackObject[uniqueId];
            const remainHours = this.getAcademicHours(uniqueId);
            const settedHours = remainHours ? remainHours : 0
            callbacksArray.forEach((method) => {
                method(settedHours);
            });
        }
    }

    async loadLocalStorageCellsToStorage() {
        documentStorage.initDocumentAddress(this.scope);
        const localStorageCells = await documentStorage.getCells();

        const localStorageCellsObj = {};

        for (const cell of localStorageCells) {
            const key = getKeyFromCell(cell);
            localStorageCellsObj[key] = cell;
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

                const foundLocalCell = localStorageCellsObj[key];

                if (foundLocalCell) {
                    const row = daysOfWeek.findIndex((day) => day === cell.dayOfWeek) * lessonsPerDay + cell.lessonNumber - 1;
                    const col = this.model.classes.findIndex(({id}) => id == foundLocalCell.clas.id);
                    const cellCoords = {
                        row,
                        col,
                    };

                    if (foundLocalCell.lesson) {
                        const {uniqueId} = foundLocalCell.lesson;
                        await this.setLesson(uniqueId, cellCoords, false);
                    }
                    if (foundLocalCell.classroom) {
                        const {id} = foundLocalCell.classroom;
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

            const nextTd = td.nextSibling.nextElementSibling;
            nextTd.classList.add('disabled');
        }

        const highlightOff = () => {
            for (const td of notAllowedCellElements) {
                td.classList.remove('disabled');
                td.classList.add(lessonAllowedClass.replace('.', ''));
    
                const nextTd = td.nextSibling.nextElementSibling;
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

            const nextTd = td.nextSibling.nextElementSibling;
            nextTd.classList.remove(classroomAllowedClass.replace('.', ''));
            nextTd.classList.add('disabled');
        }

        const highlightOff = () => {
            for (const td of notAllowedCellElements) {
                td.classList.remove('disabled');

                const nextTd = td.nextSibling.nextElementSibling;
                nextTd.classList.add(classroomAllowedClass.replace('.', ''));
                nextTd.classList.remove('disabled');
            }
        };

        return highlightOff;
    }

    getStorage() {
        return this.model.getStorage();
    }

    getAcademicHours(uniqueId) {
        if (uniqueId) {
            const academicHoursObject = this.model.getAcademicHours();
            return academicHoursObject[uniqueId] ? academicHoursObject[uniqueId] : 0;
        }
        return this.model.getAcademicHours();
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