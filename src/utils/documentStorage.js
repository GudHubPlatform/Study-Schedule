import ScopeSingleton from './ScopeSingleton.js';

let documentAddress;

const settings = {
    token: await gudhub.auth.getToken(),

    isSubscribed: false,
};

const data = {
    cells: [],
    lastUpdate: null,
};

async function initStorage({ appId, fieldId, itemId }) {
    documentAddress = {
        app_id: appId,
        item_id: itemId,
        element_id: fieldId,
    };

    if (!settings.isSubscribed) {
        const destroySubscribe = subscribeOnDocumentChange();
        ScopeSingleton.getInstance().getData().onDisconnectCallbacks.push(destroySubscribe);
        settings.isSubscribed = true;
    }

    const document = await gudhub.getDocument(documentAddress);

    if (document) {
        data.cells = document.data.cells;
        data.lastUpdate = document.data.lastUpdate;
    }
}

async function addCell(cell) {
    try {
        const existingCells = data.cells;

        const existingCellIndex = findCellIndex(existingCells, cell);

        if (existingCellIndex !== -1) {
            existingCells[existingCellIndex] = {
                ...existingCells[existingCellIndex],
                ...cell,
            };
        } else {
            existingCells.push(cell);
        }
        await saveCells();
    } catch (error) {
        console.error('Error adding cell to storage:', error);
    }
}

async function removeProperty(cell, propertyName, save = true) {
    try {
        const existingCells = data.cells;
        const cellIndex = findCellIndex(existingCells, cell);

        if (cellIndex !== -1) {
            delete existingCells[cellIndex][propertyName];

            const hasLesson = Boolean(existingCells[cellIndex].lesson);
            const hasClassroom = Boolean(existingCells[cellIndex].room);

            if (!hasLesson && !hasClassroom) {
                existingCells.splice(cellIndex, 1);
            }

            if (save) {
                await saveCells();
            }
        }
    } catch (error) {
        console.error(`Error removing ${propertyName} from cell in storage:`, error);
    }
}

async function removeLesson(cell, save = true) {
    await removeProperty(cell, 'lesson', save);
}

async function removeClassroom(cell, save = true) {
    await removeProperty(cell, 'room', save);
}

async function moveProperty(fromCell, targetCell, propertyName) {
    try {
        removeProperty(fromCell, propertyName, false);
        addCell(targetCell);
    } catch (error) {
        console.error(`Error moving ${propertyName} in storage:`, error);
    }
}

async function moveLesson(fromCell, targetCell) {
    moveProperty(fromCell, targetCell, 'lesson');
}

async function moveClassroom(fromCell, targetCell) {
    moveProperty(fromCell, targetCell, 'room');
}

async function getCells() {
    try {
        return data.cells;
    } catch (error) {
        console.error('Error getting cells from storage:', error);
        return [];
    }
}

function subscribeOnDocumentChange() {
    const event = 'gh_document_insert_one';

    const updateClient = async serverData => {
        if (serverData.lastUpdate > data.lastUpdate) {
            data.cells = serverData.cells;
            data.lastUpdateToken = await gudhub.auth.getToken();
            data.lastUpdate = serverData.lastUpdate;

            const controller = ScopeSingleton.getInstance().getController();
            controller.updateModelFromStorageChanges(data.cells);
        }
    };

    const debouncedUpdateClient = gudhub.debounce(updateClient, 1000);

    const onDocumentChange = (event, serverData) => {
        if (serverData.lastUpdateToken != settings.token) {
            debouncedUpdateClient(serverData);
        }
    };

    gudhub.on(event, documentAddress, onDocumentChange);

    return () => {
        settings.isSubscribed = false;
        gudhub.destroy(event, documentAddress, onDocumentChange);
    };
}

async function updateServer() {
    const updateTime = new Date().getTime();
    const documentObject = {
        ...documentAddress,
        data: {
            ...data,
            lastUpdateToken: settings.token,
            lastUpdate: updateTime,
        },
    };
    data.lastUpdate = updateTime;
    gudhub.createDocument(documentObject);
}

const debouncedUpdateServer = gudhub.debounce(updateServer, 1000);

async function saveCells() {
    try {
        debouncedUpdateServer();
    } catch (error) {
        console.error('Error saving cells to storage:', error);
    }
}

function findCellIndex(cells, cell) {
    return cells.findIndex(
        existingCell =>
            existingCell.clas.id === cell.clas.id &&
            existingCell.dayOfWeekIndex === cell.dayOfWeekIndex &&
            existingCell.lessonNumber === cell.lessonNumber
    );
}

export default {
    addCell,
    removeLesson,
    removeClassroom,
    moveLesson,
    moveClassroom,
    getCells,
    initStorage,
};
