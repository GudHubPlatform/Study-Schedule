import { getKeyFromCell } from './ScheduleModel.js';
import documentStorage from './utils/documentStorage.js';
import { lessonAllowedClass, roomAllowedClass } from './studyschedule.webcomponent.js';
import ScopeSingleton from './utils/ScopeSingleton.js';
import { lessonUniqueIdAttribute, roomIdAttribute } from './components/lessonDragList/lessonDragListLayout.js';

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

        const foundLesson = this.findLessonById(uniqueId);
        if (!foundLesson) return;

        const cellToSave = this.model.setLesson(row, col, foundLesson);
        if (!cellToSave) return;

        if (cellToSave) {
            this.addAcademicHour(uniqueId);
            if (saveToStorage) await this.addCellToDocumentStorage(cellToSave, foundLesson);
        }

        const cellLessonTdElement = this.model.getLessonCellHTMLElement(row, col);

        if (cellLessonTdElement && cellLessonTdElement.children.length === 0) {
            const lessonsDragListTable = document.getElementById('lessons-table');
            const lessonsRowElement = lessonsDragListTable.querySelector(`[${lessonUniqueIdAttribute}="${uniqueId}"]`);
            const lessonDndElement = lessonsRowElement.querySelector('.redips-clone');
            cloneDndObjectToCell(lessonDndElement, cellLessonTdElement);
        }

        return cellToSave;
    }

    async removeLesson(cell, saveToStorage = true) {
        if (!cell) return;
        const { row, col } = getCoordsFromCell(cell);
        if (!this.checkRowCol(row, col)) return;
        const removedLessonId = this.model.removeLesson(row, col);

        if (!removedLessonId) return;

        const cellToRemove = this.model.getCell(row, col);

        this.subtractAcademicHour(removedLessonId);

        const lessonCellElement = this.model.getLessonCellHTMLElement(row, col);
        removeRdObject(lessonCellElement);

        if (saveToStorage) {
            const { dayOfWeekIndex, clas, lessonNumber } = cellToRemove;
            const cellToRemoveFromStorage = {
                dayOfWeekIndex,
                clas,
                lessonNumber,
            };
            await documentStorage.removeLesson(cellToRemoveFromStorage);
        }

        return removedLessonId;
    }

    async moveLesson(fromCell, targetCell) {
        if (!fromCell || !targetCell) return;
        const { row: fromRow, col: fromCol } = getCoordsFromCell(fromCell);
        const { row: targetRow, col: targetCol } = getCoordsFromCell(targetCell);
        if (!this.checkRowCol(fromRow, fromCol) || !this.checkRowCol(targetRow, targetCol)) return;

        const removedLessonId = await this.removeLesson(fromCell, false);
        const cellToSave = await this.setLesson(removedLessonId, targetCell, false);

        const { dayOfWeekIndex, clas, lessonNumber, lesson } = cellToSave;
        const cellToSaveInStorage = {
            dayOfWeekIndex,
            clas,
            lessonNumber,
            lesson,
        };

        const fromStorageCell = this.getStorage()[fromRow][fromCol];

        await documentStorage.moveLesson(fromStorageCell, cellToSaveInStorage);

        return cellToSave;
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

        const cellClassroomTdElement = this.model.getClassroomCellHTMLElement(row, col);

        if (cellClassroomTdElement && cellClassroomTdElement.children.length === 0) {
            const lessonsDragListTable = document.getElementById('lessons-table');
            const classroomCloneTdElement = lessonsDragListTable.querySelector(
                `.room-cell[${roomIdAttribute}="${roomId}"]`
            );
            const classroomDndElement = classroomCloneTdElement.querySelector('.redips-clone');
            cloneDndObjectToCell(classroomDndElement, cellClassroomTdElement);
        }

        return cellToSave;
    }

    async removeClassroom(cell, saveToStorage = true) {
        if (!cell) return;
        const { row, col } = getCoordsFromCell(cell);
        if (!this.checkRowCol(row, col)) return;
        const removedClassroomId = this.model.removeClassroom(row, col);

        if (!removedClassroomId) return;

        const cellToRemove = this.model.getCell(row, col);

        const roomCellElement = this.model.getClassroomCellHTMLElement(row, col);
        removeRdObject(roomCellElement);

        if (saveToStorage) {
            const { dayOfWeekIndex, clas, lessonNumber } = cellToRemove;
            const cellToRemoveFromStorage = {
                dayOfWeekIndex,
                clas,
                lessonNumber,
            };

            await documentStorage.removeClassroom(cellToRemoveFromStorage);
        }

        return removedClassroomId;
    }

    async moveClassroom(fromCell, targetCell) {
        if (!fromCell || !targetCell) return;
        const { row: fromRow, col: fromCol } = getCoordsFromCell(fromCell);
        const { row: targetRow, col: targetCol } = getCoordsFromCell(targetCell);
        if (!this.checkRowCol(fromRow, fromCol) || !this.checkRowCol(targetRow, targetCol)) return;

        const removedClassroomId = await this.removeClassroom(fromCell, false);
        const cellToSave = await this.setClassroom(removedClassroomId, targetCell, false);

        const { dayOfWeekIndex, clas, lessonNumber, room } = cellToSave;
        const cellToSaveInStorage = {
            dayOfWeekIndex,
            clas,
            lessonNumber,
            room,
        };

        const fromStorageCell = this.getStorage()[fromRow][fromCol];

        await documentStorage.moveClassroom(fromStorageCell, cellToSaveInStorage);

        return cellToSave;
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
        if (!((0 <= row) & (row <= this.model.getRowCount() - 1))) return false;
        if (!((0 <= col) & (col <= this.model.getColCount() - 1))) return false;

        return true;
    }

    findLessonById(uniqueId) {
        return this.lessons.find(lesson => lesson.uniqueId == uniqueId);
    }

    findClassroomById(roomId) {
        return this.rooms.find(room => room.id == roomId);
    }

    async addCellToDocumentStorage(cell) {
        const { dayOfWeekIndex, clas, lessonNumber, lesson, room } = cell;
        const cellToSave = {
            dayOfWeekIndex,
            clas,
            lessonNumber,
            lesson,
            room,
        };
        await documentStorage.addCell(cellToSave);
    }

    getCellCoordsByCellData(cell) {
        const { lessonsPerDay } = this.model;
        // Find the display row for this original day index
        const displayRowsInfo = this.model.getDisplayRowsForOriginalDay(cell.dayOfWeekIndex);
        
        if (!displayRowsInfo) {
            console.log(`Day is not selected for display: ${cell.dayOfWeekIndex}`, cell);
            // Day is not selected for display
            return null;
        }
        
        const row = displayRowsInfo.startRow + cell.lessonNumber - 1;
        const col = this.model.classes.findIndex(({ id }) => id == cell.clas.id);
        const cellCoords = {
            row,
            col,
        };

        return cellCoords;
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
            const settedHours = remainHours ? remainHours : 0;
            callbacksArray.forEach(method => {
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

    async loadInitialDataFromStorage() {
        await documentStorage.initStorage(this.scope);
        const storageCells = await documentStorage.getCells();

        // Filter storage cells to only include selected days
        const filteredStorageCells = storageCells.filter(cell => 
            this.model.selectedDayIndexes.includes(cell.dayOfWeekIndex)
        );

        const storageCellsObj = {};

        for (const cell of filteredStorageCells) {
            const key = getKeyFromCell(cell);
            storageCellsObj[key] = cell;
        }

        for (let i = 0; i < this.model.rowCount; i++) {
            this.model.scheduleStorage.push([]);

            const { lessonsPerDay } = this.model;
            for (const clas of this.model.classes) {
                // Use original day index for storage compatibility
                const originalDayIndex = this.model.getOriginalDayIndex(i);
                
                let cell = {
                    dayOfWeekIndex: originalDayIndex,
                    clas: clas,
                    lessonNumber: (i % lessonsPerDay) + 1,
                    lesson: null,
                    htmlElement: null,
                    room: null,
                };

                this.model.scheduleStorage[i].push(cell);

                const key = getKeyFromCell(cell);

                const foundStorageCell = storageCellsObj[key];

                if (foundStorageCell) {
                    const cellCoords = {
                        row: i,
                        col: this.model.classes.findIndex(({ id }) => id == foundStorageCell.clas.id),
                    };

                    if (foundStorageCell.lesson) {
                        const { uniqueId } = foundStorageCell.lesson;
                        await this.setLesson(uniqueId, cellCoords, false);
                    }
                    if (foundStorageCell.room) {
                        const { id } = foundStorageCell.room;
                        await this.setClassroom(id, cellCoords, false);
                    }
                }
            }
        }
    }

    updateModelFromStorageChanges(storageCells) {
        // Filter storage cells to only include selected days
        const filteredStorageCells = storageCells.filter(cell => 
            this.model.selectedDayIndexes.includes(cell.dayOfWeekIndex)
        );
        
        const modelStorage = this.getStorage();
        const storageCellsObj = {};
        filteredStorageCells.forEach(cell => {
            const key = getKeyFromCell(cell);
            storageCellsObj[key] = cell;
        });

        const updateProperty = async function (
            modelCell,
            storageCell,
            propertyName,
            propertyIdName,
            setFunction,
            removeFunction
        ) {
            const modelProperty = modelCell[propertyName];
            const storageProperty = storageCell[propertyName];

            if (!modelProperty && !storageProperty) {
                return;
            } else if (
                modelProperty &&
                storageProperty &&
                modelProperty[propertyIdName] === storageProperty[propertyIdName]
            ) {
                return;
            }

            const cellCoords = this.getCellCoordsByCellData(modelCell);
            
            // Skip if cell is not in current display (day not selected)
            if (!cellCoords) return;

            if (modelProperty) {
                await removeFunction(cellCoords, false);
            }

            if (storageProperty) {
                await setFunction(storageProperty[propertyIdName], cellCoords, false);
            }
        };

        const updatePropertyBinded = updateProperty.bind(this);

        modelStorage.forEach(row => {
            row.forEach(async modelCell => {
                const key = getKeyFromCell(modelCell);
                if (storageCellsObj.hasOwnProperty(key)) {
                    const storageCell = storageCellsObj[key];

                    await updatePropertyBinded(
                        modelCell,
                        storageCell,
                        'lesson',
                        'uniqueId',
                        this.setLesson.bind(this),
                        this.removeLesson.bind(this)
                    );
                    await updatePropertyBinded(
                        modelCell,
                        storageCell,
                        'room',
                        'id',
                        this.setClassroom.bind(this),
                        this.removeClassroom.bind(this)
                    );
                } else {
                    const cellCoords = this.getCellCoordsByCellData(modelCell);
                    
                    // Skip if cell is not in current display (day not selected)
                    if (!cellCoords) return;

                    if (modelCell.lesson) {
                        this.removeLesson(cellCoords, false);
                    }
                    if (modelCell.room) {
                        this.removeClassroom(cellCoords, false);
                    }
                }
            });
        });
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
        const { row, col } = clickedCellCoords;
        if (row && col) {
            const { dayOfWeekIndex, clas, htmlElement, room } = cells[row][col];

            const cellCopyWithoutLesson = {
                dayOfWeekIndex,
                clas,
                htmlElement,
                lesson: null,
                room,
            };

            cells[row][col] = cellCopyWithoutLesson;
        }

        const notAllowedByRules = cells.map(row => row.filter(cell => !rules.some(rule => rule(foundLesson, cell))));

        const filteredCellsByOneLessonRule = checkForOneTeacherPerLessonRule(foundLesson, cells);

        const notAllowedCells = [
            ...notAllowedByRules.reduce((acc, row) => [...acc, ...row], []),
            ...filteredCellsByOneLessonRule,
        ];

        const notAllowedCellElements = notAllowedCells.map(({ htmlElement }) => htmlElement);

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
                room: null,
            };

            cells[row][col] = cellCopyWithoutClassroom;
        }

        const notAllowedCells = cells.filter(row => checkForOneClassroomInRow(roomId, row));
        const notAllowedCellElements = notAllowedCells.reduce(
            (acc, row) => [...acc, ...row.map(cell => cell.htmlElement)],
            []
        );

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

const getCoordsFromCell = cell => {
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

    const notAllowedRows = rowsToFilter.filter(row =>
        row.some(cell => {
            if (cell.lesson && cell.lesson.teacherRefId) {
                return cell.lesson.teacherRefId === teacherRefId;
            }

            return false;
        })
    );

    const notAllowedCells = notAllowedRows.reduce((acc, row) => [...acc, ...row], []);

    return notAllowedCells;
};

const checkForOneClassroomInRow = (roomId, cellRow) => cellRow.some(cell => cell.room && cell.room.id == roomId);

const removeRdObject = cell => {
    const rd = ScopeSingleton.getInstance().getRD();
    const rdObj = cell.querySelector('.redips-drag');
    if (rdObj) rd.deleteObject(rdObj);
};

const cloneDndObjectToCell = (dndObject, targetCellElement) => {
    const rd = ScopeSingleton.getInstance().getRD();
    rd.moveObject({
        obj: dndObject,
        target: targetCellElement,
        clone: true,
    });
};
