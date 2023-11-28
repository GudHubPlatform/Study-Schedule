import ScopeSingleton from "./ScopeSingleton.js";

const documentAddress = {};
const settings = {
    isSubscribed: false,
};

function initDocumentAddress(scope) {
    const {
        appId,
        fieldId,
        itemId
    } = scope;

    documentAddress.app_id = appId;
    documentAddress.item_id = itemId;
    documentAddress.element_id = fieldId;
};

function getDocumentObject() {
    return {
        ...documentAddress,
        data,
    };
};

const actionTypesObject = {
    add: 'add',
    remove: 'remove'
}; 

const data = {
    cells: [],
    action: {},
};

const setAction = (cell, idObject, actionType) => {
    data.action = {};
    
    data.action.cell = cell;
    data.action.type = actionType;

    for (const [key, value] of Object.entries(idObject)) {
        data.action[key] = value;
    }
};

async function addCell(cell, idObject) {
    try {
        const existingCells = data.cells;

        const existingCellIndex = existingCells.findIndex(existingCell => (
            existingCell.clas.id === cell.clas.id &&
            existingCell.dayOfWeek === cell.dayOfWeek &&
            existingCell.lessonNumber === cell.lessonNumber
        ));

        if (existingCellIndex !== -1) {
            existingCells[existingCellIndex] = { ...existingCells[existingCellIndex], ...cell };
        } else {
            existingCells.push(cell);
        }

        setAction(cell, idObject, actionTypesObject.add);
        await saveCells();
    } catch (error) {
        console.error('Error adding cell to document:', error);
    }
}

async function removeLessonFromCell(cell, lessonUniqueId) {
    try {
        const existingCells = data.cells;

        const cellIndex = existingCells.findIndex(existingCell => (
            existingCell.clas.id === cell.clas.id &&
            existingCell.dayOfWeek === cell.dayOfWeek &&
            existingCell.lessonNumber === cell.lessonNumber
        ));

        if (cellIndex !== -1) {
            delete existingCells[cellIndex].lesson;

            if (!existingCells[cellIndex].classroom) {
                existingCells.splice(cellIndex, 1);
            }

            setAction(cell, {lessonUniqueId: lessonUniqueId}, actionTypesObject.remove);
            await saveCells();
        }
    } catch (error) {
        console.error('Error removing lesson from cell in document:', error);
    }
}

async function removeClassroomFromCell(cell, classroomId) {
    try {
        const existingCells = data.cells;

        const cellIndex = existingCells.findIndex(existingCell => (
            existingCell.clas.id === cell.clas.id &&
            existingCell.dayOfWeek === cell.dayOfWeek &&
            existingCell.lessonNumber === cell.lessonNumber
        ));

        if (cellIndex !== -1) {
            delete existingCells[cellIndex].classroom;

            if (!existingCells[cellIndex].lesson) {
                existingCells.splice(cellIndex, 1);
            }

            setAction(cell, {classroomId: classroomId}, actionTypesObject.remove);
            await saveCells();
        }
    } catch (error) {
        console.error('Error removing classroom from cell in document:', error);
    }
}

async function getCells() {
    try {
        if (settings.isSubscribed) {
            return data.cells;
        }

        if (Object.values(documentAddress).some((value) => !value)) {
            const errorProperties = [];
            for (const [key, value] of Object.entries(documentAddress)) {
                errorProperties.push(`Property ${key}, value: ${value}`);
            }
            throw new Error(`Bad values in object "documentAdress":\n${errorProperties.join('\n')}`);
        }

        if (!settings.isSubscribed) {
            const destroySubscribe = subscribeOnDocumentChange();
            ScopeSingleton.getInstance().getData().onDisconnectCallbacks.push(destroySubscribe);
            settings.isSubscribed = true;
        }

        const documentCells = await getDocumentCells();
        data.cells = documentCells ? documentCells : [];

        return data.cells;
    } catch (error) {
        console.error('Error getting cells from document:', error);
        return [];
    }
}

async function getDocumentCells() {
    const document = await gudhub.getDocument(documentAddress);
        if (!document || !document.data || !document.data.cells) return [];
    return document.data.cells;
};

function subscribeOnDocumentChange() {
    gudhub.on('gh_document_insert_one', documentAddress, onDocumentChange); 

    return () => {
        gudhub.destroy('gh_document_insert_one', documentAddress, onDocumentChange);
    };
}

async function saveCells() {
    try {
        const documentObject = getDocumentObject();
        await gudhub.createDocument(documentObject);
    } catch (error) {
        console.error('Error saving cells to document:', error);
    }
}

function onDocumentChange(event, data) {
    const { cells, action } = data;
    data.cells = cells;

    const {type, cell, lessonUniqueId, classroomId} = action;
    const controller = ScopeSingleton.getInstance().getController();
    switch (type) {
        case actionTypesObject.add: {
            if (lessonUniqueId) {
                controller.addLessonFromLocalStorage(cell, lessonUniqueId);
            } else if (classroomId) {
                controller.addClassroomFromLocalStorage(cell, classroomId);
            }
            break;
        }
        case actionTypesObject.remove: {
            if (lessonUniqueId) {
                controller.removeLessonFromLocalStorage(cell, lessonUniqueId);
            } else if (classroomId) {
                controller.removeClassroomFromLocalStorage(cell, classroomId);
            }
            break;
        }
        default:
            break;
    }
}

export default {
    addCell,
    removeClassroomFromCell,
    removeLessonFromCell,
    getCells,
    initDocumentAddress,
}