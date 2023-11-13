import GhHtmlElement from "@gudhub/gh-html-element";
import html from "./studyschedule.html";
import './style.scss';

import {REDIPS} from './redips-drag-min.js';
import { classes, lessons } from "./offlineData.js";
import ScheduleController from "./ScheduleController.js";
import ScheduleModel from "./ScheduleModel.js";

import { 
    lesson as renderLesson,
    cellColAttribute, 
    cellRowAttribute, 
    lessonCellClass, 
    lessonIdAttribute,
    lessonContentContainerClass,
    lessonContentContainerRemovableClass,
    removeDotFromClass,
    closeIconClass
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
    classIdAttribute
} from './components/lessonsListComponent.js';

class GhStudySchedule extends GhHtmlElement {

    // Constructor with super() is required for native web component initialization

    constructor() {
        super();

        //data
        this.columnWidth = 2;
        this.daysOfWeek = ["понеділок","вівторок","середа","четвер","п'ятниця"];
        this.lessonsPerDay = 7;
        this.classes = classes;
        this.lessons = lessons;
        
        // attributes
        this.cellColAttribute = cellColAttribute;
        this.cellRowAttribute = cellRowAttribute;
        this.lessonIdAttribute = lessonIdAttribute;
        this.classIdAttribute = classIdAttribute;
        
        // classes
        this.lessonCellClass = lessonCellClass;
        this.selectedTabClass = selectedTabClass;
        this.lessonsListTitleClass = lessonsListTitleClass;

        // all about schedule
        this.clickedCell;
        this.disableHighlight;
        this.isClickedCloseIcon;
        this.setIsClickedCloseIcon = (bool) => {this.isClickedCloseIcon = bool};
        this.handleClickCloseIcon = this.handleClickCloseIcon;

        //lessons list and tabs
        this.lessonsTabAll = 'all';
        this.selectedClassTabId = this.lessonsTabAll;
        this.handleSelectTab = this.handleSelectTab;

        // mvc
        this.model = new ScheduleModel(classes, this.daysOfWeek, this.lessonsPerDay);
        this.controller = new ScheduleController(this.model, lessons);
        this.controller.loadLocalStorageCellsToStorage();
        this.storage = this.controller.getStorage();

        //components renders
        this.renderLessonsList = renderLessonsList.bind(this);

        this.renderLesson = renderLesson.bind(this);
        this.rerenderLessonsListTitle = rerenderLessonsListTitle.bind(this);
        this.rerenderLessonsList = rerenderLessonsList.bind(this);
        this.rerenderLessonsCounters = rerenderLessonsCounters.bind(this);
    }

    // onInit() is called after parent gh-element scope is ready

    onInit() {
        super.render(html);

        this.setCorrespondingHTMLElements();
        this.dndInit();

        this.rerenderLessonsCounters();
    };

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
    
        const lessonId = this.clickedCell.children[0].getAttribute(lessonIdAttribute);
        
        const row = clickedCell.getAttribute(cellRowAttribute);
        const col = clickedCell.getAttribute(cellColAttribute);

        const clickedCellCoords = {row, col};

        this.disableHighlight = this.controller.highlightCells(lessonId, clickedCellCoords);
    }

    handleBeforeDropElement(targetCell) {
        if (this.isClickedCloseIcon) return;

        const row = targetCell.getAttribute(cellRowAttribute);
        const col = targetCell.getAttribute(cellColAttribute);

        if (targetCell === this.clickedCell) return false;

        const lessonId = this.clickedCell.children[0].getAttribute(lessonIdAttribute);

        const resultStorageObject = this.controller.setLesson(row, col, lessonId);

        if (Boolean(resultStorageObject) && this.clickedCell.classList.contains('lesson-cell')) {
            const clickedCellRow = this.clickedCell.getAttribute(cellRowAttribute);
            const clickedCellCol = this.clickedCell.getAttribute(cellColAttribute);

            const removedLessonId = this.controller.removeLesson(clickedCellRow, clickedCellCol);
        }

        return Boolean(resultStorageObject);
    }

    handleDeleted(clonedAndDirectlyMovedToTrasg) {
        if (clonedAndDirectlyMovedToTrasg) return;

        const clickedCellRow = this.clickedCell.getAttribute(cellRowAttribute);
        const clickedCellCol = this.clickedCell.getAttribute(cellColAttribute);

        const removedLessonId = this.controller.removeLesson(clickedCellRow, clickedCellCol);
        this.rerenderLessonsCounters();
        this.checkLessonForHourLimit(removedLessonId);
    }

    handleFinishEvent() {
        if (this.disableHighlight) {
            this.disableHighlight();
        }
    }

    handleCloneDropped(clonedElement) {
        const lessonId = clonedElement.getAttribute(lessonIdAttribute);
        const lessonContentContainer = clonedElement.querySelector(lessonContentContainerClass);
        lessonContentContainer.classList.add(removeDotFromClass(lessonContentContainerRemovableClass));

        const closeIcon = clonedElement.querySelector(closeIconClass);
        closeIcon.addEventListener('mousedown', () => this.handleClickCloseIcon());
        this.rerenderLessonsCounters();

        this.checkLessonForHourLimit(lessonId);
    }

    handleClickCloseIcon(event) {
        this.setIsClickedCloseIcon(true);
    }

    checkLessonForHourLimit(lessonId) {
        const lessonsList = document.getElementById(lessonsListId);
        const cellElement = lessonsList.querySelector(`tr[data-id="${lessonId}"]`);
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
        const lessonsIdsArr = this.lessons.map(({id}) => id);

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