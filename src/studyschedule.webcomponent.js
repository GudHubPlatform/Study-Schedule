import GhHtmlElement from '@gudhub/gh-html-element';
import html from './studyschedule.html';
import loader from './loader.html';
import './style.scss';

import Lesson, { dragDisabledClass } from './components/lesson/lesson.webcomponent.js';
import Classroom from './components/room/room.webcomponent.js';
import LessonDragList from './components/lessonDragList/lessonDragList.webcomponent.js';

import renderer from './utils/componentsRenderer.js';
import ScopeSingleton from './utils/ScopeSingleton.js';

import { REDIPS } from './redips-drag-min.js';
import { getClassesScheme, getClassroomsScheme, getSubjectsScheme } from './jsonSchemes.js';
import ScheduleController from './ScheduleController.js';
import ScheduleModel from './ScheduleModel.js';

import { createLessons } from './utils/dataFunctions.js';

import lessonItemsWorker from './utils/lessonItemsWorker.js';
import resizeElements from './utils/resizeComponent.js';

// Constants for class and attribute selectors
export const scheduleScrollId = 'schedule-scroll';
export const lessonClass = '.lesson';
export const roomClass = '.room';
export const lessonCellClass = '.lesson-cell';
export const classRoomCellClass = '.room-cell';
export const lessonAllowedClass = '.lesson-allowed';
export const roomAllowedClass = '.room-allowed';
const cellRowAttribute = 'row';
const cellColAttribute = 'col';

export const columnWidth = 2;

class GhStudySchedule extends GhHtmlElement {
    // Constructor with super() is required for native web component initialization

    constructor() {
        super();
        this.renderer = renderer;

        this.scheduleScrollId = scheduleScrollId;

        //table classes
        this.lessonCellClass = lessonCellClass;
        this.classRoomCellClass = classRoomCellClass;
        this.lessonAllowedClass = lessonAllowedClass;
        this.roomAllowedClass = roomAllowedClass;

        //table attributes
        this.cellRowAttribute = cellRowAttribute;
        this.cellColAttribute = cellColAttribute;

        //data
        this.columnWidth = columnWidth;
        this.daysOfWeek = ['понеділок', 'вівторок', 'середа', 'четвер', "п'ятниця"];
        this.lessonsPerDay;
        this.classes;
        this.subjects;
        this.lessons;
        this.rooms;

        // mvc
        this.model;
        this.controller;
        this.storage;

        //highlight cells
        this.disableHighlight;

        this.onDisconnectCallbacks = [];
    }

    // onInit() is called after parent gh-element scope is ready

    async onInit() {
        super.render(loader);

        await this.loadData.all();

        // Initialize necessary data
        this.lessonsPerDay = this.scope.field_model.data_model.lessonsTime.length;
        this.lessons = createLessons(this.subjects, this.classes);

        // Initialize model, controller, and storage
        this.model = new ScheduleModel(this.classes, this.daysOfWeek, this.lessonsPerDay);
        this.controller = new ScheduleController(this.scope, this.model, this.lessons, this.rooms);
        this.initScopeSingleton();

        await this.controller.loadInitialDataFromStorage();
        this.storage = this.controller.getStorage();
        super.render(html);

        this.setCorrespondingHTMLElements();
        this.assignButtons();

        this.dndInit();

        await lessonItemsWorker.initSettings(this.scope);

        const destroyLessonsSubscribe = this.subscribeOnItemsUpdate.subjects();
        const destroyClassroomsSubscribe = this.subscribeOnItemsUpdate.rooms();

        this.onDisconnectCallbacks.push(destroyLessonsSubscribe, destroyClassroomsSubscribe);
        resizeElements.subscribe();
    }

    // disconnectedCallback() is called after the component is destroyed
    disconnectedCallback() {
        this.onDisconnectCallbacks.forEach(callback => callback());

        ScopeSingleton.reset();
        resizeElements.destroy();
    }

    loadData = {
        subjects: () => {
            const {
                subjects_app_id,
                subjects_app_title_field_id,
                subjects_app_teacher_field_id,
                subjects_app_course_field_id,
                subjects_app_academic_hours_field_id,
                subjects_filters_list = [],
            } = this.scope.field_model.data_model;
            const subjectsScheme = getSubjectsScheme({
                subjects_app_id,
                subjects_app_title_field_id,
                subjects_app_teacher_field_id,
                subjects_app_course_field_id,
                subjects_app_academic_hours_field_id,
                subjects_filters_list,
            });
            return gudhub.jsonConstructor(subjectsScheme).then(data => {
                this.subjects = data.lessons;
            });
        },
        classes: () => {
            const {
                classes_app_id,
                classes_app_title_field_id,
                classes_app_course_field_id,
                classes_filters_list = [],
                classes_sorting_type = 'asc',
            } = this.scope.field_model.data_model;
            const classesScheme = getClassesScheme({
                classes_app_id,
                classes_app_title_field_id,
                classes_app_course_field_id,
                classes_filters_list,
                classes_sorting_type,
            });
            return gudhub.jsonConstructor(classesScheme).then(data => {
                this.classes = data.classes;
            });
        },
        rooms: () => {
            const { rooms_app_id, rooms_app_number_field_id } = this.scope.field_model.data_model;
            const roomsScheme = getClassroomsScheme({
                rooms_app_id,
                rooms_app_number_field_id,
            });
            return gudhub.jsonConstructor(roomsScheme).then(data => {
                this.rooms = data.rooms;
            });
        },
        all: () => {
            const classesPromise = this.loadData.subjects();
            const lessonsPromise = this.loadData.classes();
            const roomsPromise = this.loadData.rooms();
            return Promise.all([classesPromise, lessonsPromise, roomsPromise]);
        },
    };

    subscribeOnItemsUpdate = {
        subjects: () => {
            const { subjects_app_id } = this.scope.field_model.data_model;

            const onLessonsItemsUpdate = async () => {
                await this.loadData.subjects();
                this.lessons = createLessons(this.subjects, this.classes);
            };

            gudhub.on('gh_items_update', { subjects_app_id }, onLessonsItemsUpdate);

            return () => gudhub.destroy('gh_items_update', { subjects_app_id }, onLessonsItemsUpdate);
        },
        rooms: () => {
            const { rooms_app_id } = this.scope.field_model.data_model;

            const onClassroomsItemsUpdate = async () => {
                await this.loadData.rooms();
            };

            gudhub.on('gh_items_update', { rooms_app_id }, onClassroomsItemsUpdate);

            return () => gudhub.destroy('gh_items_update', { rooms_app_id }, onClassroomsItemsUpdate);
        },
    };

    dndInit() {
        const redips = {};

        const controller = this.controller;

        redips.init = function () {
            const rd = REDIPS.drag;

            rd.init('redips-drag');
            rd.hover.colorTd = 'rgba(80, 177, 255, 0.2)';
            rd.scroll.bound = 30;

            rd.mark.exceptionClass[roomClass.replace('.', '')] = roomAllowedClass.replace('.', '');
            rd.mark.exceptionClass[lessonClass.replace('.', '')] = lessonAllowedClass.replace('.', '');

            rd.event.clicked = async clickedCell => {
                const dndDiv = clickedCell.getElementsByClassName('redips-drag')[0];
                const scheduleElement = dndDiv.children[0];
                if (scheduleElement && scheduleElement.isCloseIconClicked) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (scheduleElement.isRemoved) return;
                }
                const clickedCellCoords = {
                    row: clickedCell.getAttribute(cellRowAttribute),
                    col: clickedCell.getAttribute(cellColAttribute),
                };
                if (scheduleElement instanceof Lesson) {
                    this.disableHighlight = controller.highlightLessonsCells(
                        scheduleElement.uniqueId,
                        clickedCellCoords
                    );
                } else if (scheduleElement instanceof Classroom) {
                    const { app_id, item_id } = scheduleElement;
                    const roomId = [app_id, item_id].join('.');
                    this.disableHighlight = controller.highlightClassroomsCells(roomId, clickedCellCoords);
                }
            };

            rd.event.droppedBefore = targetCell => {};

            rd.event.dropped = () => {};

            rd.event.deleted = clonedAndDirectlyMovedToTrasg => {};

            rd.event.finish = () => {
                if (this.disableHighlight) {
                    this.disableHighlight();
                    this.disableHighlight = null;
                }
            };

            rd.event.clonedDropped = () => {};

            return rd;
        };

        const checkForDisabledDivs = () => {
            const dragListContainer = document.getElementById('lesson-table-container');
            const lessons = dragListContainer.getElementsByTagName('schedule-lesson');

            for (const lesson of lessons) {
                const dragDiv = lesson.parentElement;
                if (dragDiv.classList.contains(dragDisabledClass.replace('.', ''))) {
                    this.rd.enableDrag(false, dragDiv);
                }
            }
        };

        setTimeout(() => {
            this.rd = redips.init();
            ScopeSingleton.getInstance().setRD(this.rd);
            checkForDisabledDivs();
        }, 0);
    }

    initScopeSingleton = () => {
        const data = {
            lessons: this.lessons,
            classes: this.classes,
            rooms: this.rooms,
            onDisconnectCallbacks: this.onDisconnectCallbacks,
        };
        ScopeSingleton.getInstance(this.scope, this.controller, data);
    };

    assignButtons = () => {
        const getCellsForGeneration = () => this.controller.getStorage().reduce((acc, row) => [...acc, ...row], []);
        const enableButtons = bool => {
            generateButton.disabled = !bool;
            deleteButton.disabled = !bool;
        };
        const enableLoader = bool => {
            loader.style.display = bool ? 'block' : 'none';
        };

        const loader = this.getElementsByClassName('loader-container')[0];

        const generateButton = this.getElementsByClassName('generate-button')[0];
        generateButton.addEventListener('click', () => {
            enableButtons(false);
            enableLoader(true);
            const cellsToGenerate = getCellsForGeneration();
            lessonItemsWorker.generateLessons(cellsToGenerate).then(() => {
                enableButtons(true);
                enableLoader(false);
            });
        });

        const deleteButton = this.getElementsByClassName('delete-button')[0];
        deleteButton.addEventListener('click', () => {
            enableButtons(false);
            enableLoader(true);
            const cellsToGenerate = getCellsForGeneration();
            lessonItemsWorker.deleteLessons(cellsToGenerate).then(() => {
                enableButtons(true);
                enableLoader(false);
            });
        });

        ScopeSingleton.getInstance().setEnableGenerateButtons(enableButtons);
    };

    setCorrespondingHTMLElements() {
        const htmlElements = document.querySelectorAll(lessonCellClass);
        this.controller.setHTMLElements(htmlElements);
    }

    handleEnableHighlight() {
        this.disableHighlight = this.controller.highlightClassroomsCells();
    }
}

// Register web component only if it is not registered yet

if (!customElements.get('gh-study-schedule')) {
    customElements.define('gh-study-schedule', GhStudySchedule);
}
if (!customElements.get('schedule-lesson')) {
    customElements.define('schedule-lesson', Lesson);
}
if (!customElements.get('schedule-room')) {
    customElements.define('schedule-room', Classroom);
}
if (!customElements.get('schedule-lesson-drag-list')) {
    customElements.define('schedule-lesson-drag-list', LessonDragList);
}
