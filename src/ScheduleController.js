import localStorage from './utils/localStorage.js';

export default class ScheduleController {
    constructor(model, lessons) {
        this.model = model;
        this.lessons = lessons;
    }

    setLesson(row, col, lessonId) {
        if (!this.checkRowCol(row, col)) return undefined;
        if (!lessonId) return undefined;


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
        this.removeCellFromLocalStorage(cell);

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
        return this.lessons.find((lesson) => lesson.id == lessonId);
    }

    addCellToLocalStorage(cell) {
        const { dayOfWeek, clas, lessonNumber, lesson } = cell;
        const cellToSave = {
            dayOfWeek,
            clas,
            lessonNumber,
            lesson, 
        };

        localStorage.addCell(cellToSave);
    }

    removeCellFromLocalStorage(cell) {
        const { dayOfWeek, clas, lessonNumber } = cell;
        const cellToRemove = {
            dayOfWeek,
            clas,
            lessonNumber,
        };

        localStorage.removeCell(cellToRemove);
    }

    loadLocalStorageCellsToStorage() {
        const cells = localStorage.getCells();

        const cellsObj = {};

        for (const cell of cells) {
            const key = `${cell.clas.classNumber}:${cell.clas.classLetter}:${cell.dayOfWeek}:${cell.lessonNumber}`;
            cellsObj[key] = cell;
        }

        this.model.storageInitialization(cellsObj);
    }

    highlightCells(lessonId, clickedCellCoords) {
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
            const { dayOfWeek, clas, htmlElement } = cells[row][col];

            const cellCopyWithoutLesson = {
                dayOfWeek,
                clas,
                htmlElement,
                lesson: null
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
            td.classList.add('redips-mark');
        }

        const disableHighlight = () => {
            for (const td of notAllowedCellElements) {
                td.classList.remove('redips-mark');
            }
        };

        return disableHighlight;
    }

    getStorage() {
        return this.model.getStorage();
    }

    getAcademicHours() {
        return this.model.getAcademicHours();
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

    if (!draggedLesson.teacher) return [];

    const { id: teacherId } = draggedLesson.teacher;

    if (!teacherId) return [];


    const notAllowedRows = rowsToFilter.filter((row) => 
        row.some((cell) => {
            if (cell.lesson && cell.lesson.teacher && cell.lesson.teacher.id) {
                const cellTeacherId = cell.lesson.teacher.id;

                return  cellTeacherId === teacherId;
            }

            return false;
        })
    );

    const notAllowedCells = notAllowedRows.reduce((acc, row) => [...acc, ...row], []);

    return notAllowedCells;
}