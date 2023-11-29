import ScopeSingleton from "./ScopeSingleton.js";

let documentAddress;

const settings = {
  isSubscribed: false,
};


const data = {
  cells: [],
  action: {},
};

const actionTypesObject = {
  add: 'add',
  remove: 'remove'
};

function initDocumentAddress({ appId, fieldId, itemId }) {
    documentAddress = {
      app_id: appId,
      item_id: itemId,
      element_id: fieldId,
    };
  }

function setAction(cell, idObject, type) {
    data.action = {
        cell,
        ...idObject,
        type,
    };
};

async function addCell(cell, idObject) {
  try {
    const existingCells = data.cells;

    const existingCellIndex = findCellIndex(existingCells, cell);

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
    const cellIndex = findCellIndex(existingCells, cell);

    if (cellIndex !== -1) {
      delete existingCells[cellIndex].lesson;

      if (!existingCells[cellIndex].classroom) {
        existingCells.splice(cellIndex, 1);
      }

      setAction(cell, { lessonUniqueId }, actionTypesObject.remove);
      await saveCells();
    }
  } catch (error) {
    console.error('Error removing lesson from cell in document:', error);
  }
}

async function removeClassroomFromCell(cell, classroomId) {
  try {
    const existingCells = data.cells;
    const cellIndex = findCellIndex(existingCells, cell);

    if (cellIndex !== -1) {
      delete existingCells[cellIndex].classroom;

      if (!existingCells[cellIndex].lesson) {
        existingCells.splice(cellIndex, 1);
      }

      setAction(cell, { classroomId }, actionTypesObject.remove);
      await saveCells();
    }
  } catch (error) {
    console.error('Error removing classroom from cell in document:', error);
  }
}

async function getCells() {
  try {
    if (!settings.isSubscribed) {
      if (Object.values(documentAddress).some((value) => !value)) {
        const errorProperties = Object.entries(documentAddress)
          .map(([key, value]) => `Property ${key}, value: ${value}`);
        throw new Error(`Bad values in object "documentAdress":\n${errorProperties.join('\n')}`);
      }

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
  if (!document || !document.data || !document.data.cells) {
    return [];
  }
  return document.data.cells;
}

function subscribeOnDocumentChange() {
  const event = 'gh_document_insert_one';
  const onDocumentChange = (event, data) => {
    const { cells, action } = data;
    data.cells = cells;

    const { type, cell, lessonUniqueId, classroomId } = action;
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
  };

  gudhub.on(event, documentAddress, onDocumentChange);

  return () => {
    gudhub.destroy(event, documentAddress, onDocumentChange);
  };
}

async function saveCells() {
  try {
    const documentObject = {
        ...documentAddress,
        data
    };
    await gudhub.createDocument(documentObject);
  } catch (error) {
    console.error('Error saving cells to document:', error);
  }
}

function findCellIndex(cells, cell) {
  return cells.findIndex(existingCell => (
    existingCell.clas.id === cell.clas.id &&
    existingCell.dayOfWeek === cell.dayOfWeek &&
    existingCell.lessonNumber === cell.lessonNumber
  ));
}

export default {
    addCell,
    removeClassroomFromCell,
    removeLessonFromCell,
    getCells,
    initDocumentAddress,
}