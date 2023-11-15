import GhHtmlElement from "@gudhub/gh-html-element";
import html from "./studyschedule.html";
import './style.scss';

import {REDIPS} from './redips-drag-min.js';
import { classesScheme, lessonsScheme } from "./jsonSchemes.js";
import { classrooms } from "./offlineData.js";
import ScheduleController from "./ScheduleController.js";
import ScheduleModel from "./ScheduleModel.js";

import { 
    lesson as renderLesson,
    cellColAttribute, 
    cellRowAttribute, 
    lessonCellClass, 
    classRoomCellClass,
    lessonIdAttribute,
    lessonContentContainerClass,
    lessonContentContainerRemovableClass,
    closeIconClass,
    lessonClass
} from './components/lessonComponent.js';

import {
    lessonsList as renderLessonsList,
    rerenderTitle as rerenderLessonsListTitle,
    rerenderLessonsList,
    rerenderLessonsCounters,
    selectedTabClass,
    lessonsListTitleClass,
    lessonsListId,
    hoursRemainsClass,
    lessonCloneDisabledClass,
    classIdAttribute,
    classroomTabId,
} from './components/lessonsListComponent.js';

import { 
    classroom as renderClassroom,
    classroomIdAttribute,
    classroomClass
} from "./components/classroomComponent.js";
import { createLessonsForClasses } from "./utils/dataFunctions.js";

const elementTypes = {
    lesson: 'lesson',
    classroom: 'classroom',
};

class GhStudySchedule extends GhHtmlElement {

    // Constructor with super() is required for native web component initialization

    constructor() {
        super();

        //data
        this.columnWidth = 2;
        this.daysOfWeek = ["понеділок","вівторок","середа","четвер","п'ятниця"];
        this.lessonsPerDay = 7;
        this.classes;
        this.rawLessons;
        this.lessons;
        this.classrooms = classrooms;
        
        // attributes
        this.cellColAttribute = cellColAttribute;
        this.cellRowAttribute = cellRowAttribute;
        this.lessonIdAttribute = lessonIdAttribute;
        this.classIdAttribute = classIdAttribute;
        this.classroomTabId = classroomTabId;
        this.classroomIdAttribute = classroomIdAttribute;
        
        // classes
        this.lessonCellClass = lessonCellClass;
        this.classRoomCellClass = classRoomCellClass;
        this.selectedTabClass = selectedTabClass;
        this.lessonsListTitleClass = lessonsListTitleClass;
        this.classroomClass = classroomClass;

        // all about schedule
        this.clickedCell;
        this.disableHighlight;
        this.isClickedCloseIcon;
        this.setIsClickedCloseIcon = (bool) => {this.isClickedCloseIcon = bool};
        this.handleClickCloseIcon = this.handleClickCloseIcon;
        this.draggedElementType;

        //lessons list and tabs
        this.lessonsTabAll = 'all';
        this.selectedClassTabId = this.lessonsTabAll;
        this.handleSelectTab = this.handleSelectTab;

        // mvc
        this.model;
        this.controller;
        this.storage;

        //components renders
        this.renderLessonsList = renderLessonsList.bind(this);

        this.renderLesson = renderLesson.bind(this);
        this.rerenderLessonsListTitle = rerenderLessonsListTitle.bind(this);
        this.rerenderLessonsList = rerenderLessonsList.bind(this);
        this.rerenderLessonsCounters = rerenderLessonsCounters.bind(this);

        this.renderClassroom = renderClassroom.bind(this);
    }

    // onInit() is called after parent gh-element scope is ready

    async onInit() {
        await this.loadData();
        this.lessons = createLessonsForClasses(this.rawLessons, this.classes);
        this.model = new ScheduleModel(this.classes, this.daysOfWeek, this.lessonsPerDay);
        this.controller = new ScheduleController(this.model, this.lessons, classrooms);
        this.controller.loadLocalStorageCellsToStorage();
        this.storage = this.controller.getStorage();

        super.render(html);

        this.setCorrespondingHTMLElements();
        this.dndInit();

        this.rerenderLessonsCounters();
    };

    async loadData() {
        const classesPromise = gudhub.jsonConstructor(classesScheme).then((data) => {this.classes = data.classes});
        const lessonsPromise = gudhub.jsonConstructor(lessonsScheme).then((data) => {this.rawLessons = data.lessons});

        await Promise.all([
            classesPromise,
            lessonsPromise
        ]);
    }

    dndInit() {
        const redips = {};

        const isClickedCloseIcon = () => this.isClickedCloseIcon;
        const setIsClickedCloseIcon = (bool) => this.setIsClickedCloseIcon(bool);
        const setClickedCell = (cell) => {this.clickedCell = cell};

        const handleDrag = this.handleDragElement.bind(this);
        const handleBeforeDrop = this.handleBeforeDropElement.bind(this);
        const handleDeleted = this.handleDeleted.bind(this);
        const handleFinish = this.handleFinishEvent.bind(this);
        const handleCloneDropped = this.handleCloneDropped.bind(this);

        redips.init = function () {
            const rd = REDIPS.drag;

            rd.init('redips-drag');
            rd.hover.colorTd = '#9BB3DA';
            rd.scroll.bound = 30;

            rd.mark.exceptionClass[classroomClass.replace('.','')] = 'classroom-allowed';
            rd.mark.exceptionClass[lessonClass.replace('.','')] = 'lesson-allowed';

            rd.event.clicked = (clickedCell) => {
                setClickedCell(clickedCell);

                if (isClickedCloseIcon()) {
                    handleDeleted();
                    rd.emptyCell(clickedCell);
                    setIsClickedCloseIcon(false);
                } else {
                    handleDrag(clickedCell);
                }
            };

            rd.event.droppedBefore = (targetCell) => {
                return handleBeforeDrop(targetCell);
            };

            rd.event.deleted = (clonedAndDirectlyMovedToTrasg) => {
                return handleDeleted(clonedAndDirectlyMovedToTrasg);
            };

            rd.event.finish = () => {
                handleFinish();
            };

            rd.event.clonedDropped = () => {
                const clonedElement = REDIPS.drag.obj;
                handleCloneDropped(clonedElement);
            };

            return rd;
        }

        setTimeout(() => {
            this.rd = redips.init();
            this.checkAllLessonsForHourLimit();
        }, 0);
    }

    setCorrespondingHTMLElements() {
        const htmlElements = document.querySelectorAll(lessonCellClass);

        this.controller.setHTMLElements(htmlElements);
    }

    // schedule table RedipsDnD handlers
    handleDragElement(clickedCell) {
        this.clickedCell = clickedCell;
    
        const row = clickedCell.getAttribute(cellRowAttribute);
        const col = clickedCell.getAttribute(cellColAttribute);
        const clickedCellCoords = {row, col};

        this.draggedElementType = this.rd.obj.getAttribute(lessonIdAttribute) ? elementTypes.lesson : elementTypes.classroom;

        switch (this.draggedElementType) {
            case elementTypes.lesson: {
                const lessonId = this.clickedCell.children[0].getAttribute(lessonIdAttribute);
                this.disableHighlight = this.controller.highlightLessonsCells(lessonId, clickedCellCoords);
                break;
            }
            case elementTypes.classroom: {
                const classroomId = clickedCell.children[0].getAttribute(classroomIdAttribute);
                this.disableHighlight = this.controller.highlightClassroomsCells(classroomId, clickedCellCoords);
                break;
            }
            default: {
                break;
            }
        }
    }

    handleBeforeDropElement(targetCell) {
        if (this.isClickedCloseIcon) return;

        const row = targetCell.getAttribute(cellRowAttribute);
        const col = targetCell.getAttribute(cellColAttribute);

        if (targetCell === this.clickedCell) return false;

        switch (this.draggedElementType) {
            case elementTypes.lesson: {
                const lessonId = this.clickedCell.children[0].getAttribute(lessonIdAttribute);

                const resultStorageCell = this.controller.setLesson(row, col, lessonId);

                if (Boolean(resultStorageCell)) {
                    const clickedCellRow = this.clickedCell.getAttribute(cellRowAttribute);
                    const clickedCellCol = this.clickedCell.getAttribute(cellColAttribute);

                    const removedLessonId = this.controller.removeLesson(clickedCellRow, clickedCellCol);
                }

                return Boolean(resultStorageCell);
            }
            case elementTypes.classroom: {
                const classroomId = this.clickedCell.children[0].getAttribute(classroomIdAttribute);
                const resultStorageCell = this.controller.setClassroom(row, col, classroomId);
                if (Boolean(resultStorageCell)) {
                    const clickedCellRow = this.clickedCell.getAttribute(cellRowAttribute);
                    const clickedCellCol = this.clickedCell.getAttribute(cellColAttribute);

                    const removedClassroomId = this.controller.removeClassroom(clickedCellRow, clickedCellCol);

                    return Boolean(resultStorageCell);
                }
                break;
            }
            default: {
                break;
            }
        }
    }

    handleDeleted(clonedAndDirectlyMovedToTrasg) {
        if (clonedAndDirectlyMovedToTrasg) return;

        const clickedCellRow = this.clickedCell.getAttribute(cellRowAttribute);
        const clickedCellCol = this.clickedCell.getAttribute(cellColAttribute);

        switch (this.draggedElementType) {
            case elementTypes.lesson: {
                const removedLessonId = this.controller.removeLesson(clickedCellRow, clickedCellCol);
                this.rerenderLessonsCounters();
                this.checkLessonForHourLimit(removedLessonId);
                break;
            }
            case elementTypes.classroom: {
                const removedClassroomId = this.controller.removeClassroom(clickedCellRow, clickedCellCol);
                break;
            }
            default: {
                break;
            }
        }
    }

    handleFinishEvent() {
        if (this.disableHighlight) {
            this.disableHighlight();
        }
    }

    handleCloneDropped(clonedElement) {

        switch (this.draggedElementType) {
            case elementTypes.lesson: {
                const lessonId = clonedElement.getAttribute(lessonIdAttribute);
                const lessonContentContainer = clonedElement.querySelector(lessonContentContainerClass);
                lessonContentContainer.classList.add(lessonContentContainerRemovableClass.replace('.', ''));
        
                const closeIcon = clonedElement.querySelector(closeIconClass);
                closeIcon.addEventListener('mousedown', () => this.handleClickCloseIcon());
                this.rerenderLessonsCounters();
        
                this.checkLessonForHourLimit(lessonId);
                break;
            }
            default: {
                break;
            }
        }
    }

    handleClickCloseIcon(event) {
        this.setIsClickedCloseIcon(true);
    }

    checkLessonForHourLimit(lessonId) {
        const lessonsList = document.getElementById(lessonsListId);
        const cellElement = lessonsList.querySelector(`tr[${lessonIdAttribute}="${lessonId}"]`);
        const remainsCounter = cellElement.querySelector(`.${hoursRemainsClass}`);
        const dragElement = cellElement.querySelector('.redips-clone');

        const isDragElementEnabled = remainsCounter.textContent != 0;

        this.rd.enableDrag(isDragElementEnabled, dragElement);

        if (isDragElementEnabled) {
            dragElement.classList.remove(lessonCloneDisabledClass);
        } else {
            dragElement.classList.add(lessonCloneDisabledClass);
        }
    }

    checkAllLessonsForHourLimit() {
        const lessonsIdsArr = this.lessons.map(({uniqueId}) => uniqueId);

        for (const id of lessonsIdsArr) {
            this.checkLessonForHourLimit(id);
        }
    }

    //lessons tabs handlers
    handleSelectTab(selectedElement) {
        //separated functions
        const setNewSelectedAndRemovePrevSelectedTab = () => {
            const tabListElement = selectedElement.parentElement;
            [...tabListElement.children].forEach((el) => el.classList.remove(this.selectedTabClass.replace('.', '')));
            selectedElement.classList.add(this.selectedTabClass.replace('.', ''));
        };

        // handler code start
        const selectedClassTabId = selectedElement.getAttribute(this.classIdAttribute);
        
        if (selectedClassTabId === this.selectedClassTabId) return;
        if (selectedClassTabId === this.classroomTabId) {
            
        }

        this.selectedClassTabId = selectedClassTabId;
        
        setNewSelectedAndRemovePrevSelectedTab();

        this.rerenderLessonsListTitle();
        this.rerenderLessonsList();
    }

    // disconnectedCallback() is called after the component is destroyed
    disconnectedCallback() {
    };
}
// Register web component only if it is not registered yet

if(!customElements.get('gh-study-schedule')){
    customElements.define('gh-study-schedule', GhStudySchedule);
}