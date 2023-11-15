import { getKeyFromCell } from './ScheduleModel.js';
import localStorage from './utils/localStorage.js';

export default class ScheduleController {
    constructor(model, lessons, classrooms) {
        this.model = model;
        this.lessons = lessons;
        this.classrooms = classrooms;
    }

    setLesson(row, col, lessonId) {
        if (!this.checkRowCol(row, col)) return undefined;
        if (!lessonId) return undefined;
;
        const foundLesson = this.findLessonById(lessonId);
        if (!foundLesson) return undefined;

        const resultCell = this.model.setLesson(row, col, foundLesson);

        this.model.addAcademicHour(lessonId);
        this.addCellToLocalStorage(resultCell);

        return resultCell;
    }

    removeLesson(row, col) {
        if (!this.checkRowCol(row, col)) return undefined;
        const removedLessonId = this.model.removeLesson(row, col);

        const cell = this.model.getCell(row, col);

        this.model.subtractAcademicHour(removedLessonId);
        this.removeLessonFromLocalStorageCell(cell);

        return removedLessonId;
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
        if (!row || !col) return false;
        if (isNaN(row) || isNaN(col)) return false;
        if (!(0 <= row & row <= this.model.getRowCount() - 1)) return false;
        if (!(0 <= col & col <= this.model.getColCount() - 1)) return false;
        
        return true;
    }

    findLessonById(lessonId) {
        return this.lessons.find((lesson) => lesson.uniqueId == lessonId);
    }

    findClassroomById(classroomId) {
        return this.classrooms.find((classroom) => classroom.id == classroomId);
    }

    addCellToLocalStorage(cell) {
        const { dayOfWeek, clas, lessonNumber, lesson, classroom } = cell;
        const cellToSave = {
            dayOfWeek,
            clas,
            lessonNumber,
            lesson,
            classroom
        };

        localStorage.addCell(cellToSave);
    }

    removeLessonFromLocalStorageCell(cell) {
        const { dayOfWeek, clas, lessonNumber } = cell;
        const cellToRemove = {
            dayOfWeek,
            clas,
            lessonNumber,
        };

        localStorage.removeLessonFromCell(cellToRemove);
    }

    removeClassroomFromLocalStorageCell(cell) {
        const { dayOfWeek, clas, lessonNumber } = cell;
        const cellToRemove = {
            dayOfWeek,
            clas,
            lessonNumber,
        };

        localStorage.removeClassroomFromCell(cellToRemove);
    }

    loadLocalStorageCellsToStorage() {
        const cells = localStorage.getCells();

        const cellsObj = {};

        for (const cell of cells) {
            const key = getKeyFromCell(cell);
            cellsObj[key] = cell;
        }

        this.model.storageInitialization(cellsObj);
    }

    highlightLessonsCells(lessonId, clickedCellCoords) {
        const rules = [];

        for (const rule of Object.values(ruleCallbacks)) {
            rules.push(rule);
        }

        const foundLesson = this.findLessonById(lessonId);

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

        const filteredRows = cells.map((row) => 
            row.filter((cell) => !rules.every(rule => rule(foundLesson, cell)))
        );

        const filteredCellsByOneLessonRule = checkForOneTeacherPerLessonRule(foundLesson, cells);

        const notAllowedCells  = [
            ...filteredRows.reduce((acc, row) => [...acc, ...row], []),
            ...filteredCellsByOneLessonRule
        ];

        const notAllowedCellElements = notAllowedCells.map(({htmlElement}) => htmlElement);

        for (const td of notAllowedCellElements) {
            td.classList.add('disabled');
            td.classList.remove('lesson-allowed');

            const nextTd = td.nextSibling.nextElementSibling;
            nextTd.classList.add('disabled');
        }

        const highlightOff = () => {
            for (const td of notAllowedCellElements) {
                td.classList.remove('disabled');
                td.classList.add('lesson-allowed');
    
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
            nextTd.classList.remove('classroom-allowed');
            nextTd.classList.add('disabled');
        }

        const highlightOff = () => {
            for (const td of notAllowedCellElements) {
                td.classList.remove('disabled');

                const nextTd = td.nextSibling.nextElementSibling;
                nextTd.classList.add('classroom-allowed');
                nextTd.classList.remove('disabled');
            }
        };

        return highlightOff;
    }

    getStorage() {
        return this.model.getStorage();
    }

    getAcademicHours() {
        return this.model.getAcademicHours();
    }

    setClassroom(row, col, classroomId) {
        if (!this.checkRowCol(row, col)) return undefined;
        if (!classroomId) return undefined;

        const foundClassroom = this.findClassroomById(classroomId);

        if (!foundClassroom) return undefined;

        const cellToSave = this.model.setClassroom(row, col, foundClassroom);

        this.addCellToLocalStorage(cellToSave);

        return cellToSave;
    }

    removeClassroom(row, col) {
        if (!this.checkRowCol(row, col)) return undefined;
        const removedClassroomId = this.model.removeClassroom(row, col);
        
        const cell = this.model.getCell(row, col);
        this.removeClassroomFromLocalStorageCell(cell);

        return removedClassroomId;
    }
}

const ruleCallbacks = {
    classToClass: (draggedLesson, targetCell) => {
        if (draggedLesson.clas.id != targetCell.clas.id) return false;

        return true;
    }
};

const checkForOneTeacherPerLessonRule = (draggedLesson, cellRows) => {
    const rowsToFilter = [...cellRows];

    if (!draggedLesson.teacherId) return [];

    const { teacherId } = draggedLesson;

    if (!teacherId) return [];


    const notAllowedRows = rowsToFilter.filter((row) => 
        row.some((cell) => {
            if (cell.lesson && cell.lesson.teacherId) {
                const cellTeacherId = cell.lesson.teacherId;

                return  cellTeacherId === teacherId;
            }

            return false;
        })
    );

    const notAllowedCells = notAllowedRows.reduce((acc, row) => [...acc, ...row], []);

    return notAllowedCells;
}

const checkForOneClassroomInRow = (classroomId, cellRow) => cellRow.some(cell => cell.classroom && cell.classroom.id == classroomId);