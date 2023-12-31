import styles from './lessonDragList.styles.scss';
import getHtml, {
    tabIdAttribute,
    lessonsListTitleClass,
    lessonUniqueIdAttribute,
    headerHoursCounterClass,
} from './lessonDragListLayout.js';

import renderer from '../../utils/componentsRenderer.js';
import ScopeSingleton from '../../utils/ScopeSingleton.js';

const columnsCount = {
    all: 5,
    lesson: 4,
};

const hoursRemainsClass = '.hours-remains';
const hoursTotalAmountClass = '.hours-total-amount';

export const defaultTitle = 'Уроки';
export const allTab = {
    id: 'all',
    title: 'Всі',
};

export const roomsTab = {
    id: 'rooms',
    title: 'Кабінети',
};

const defaultTabs = [allTab, roomsTab];

export default class LessonDragList extends HTMLElement {
    constructor() {
        super();
        //component
        this.columnsCount = columnsCount;
        this.attachShadow({ mode: 'open' });
        this.scope;
        this.app_id;
        this.renderer = renderer;
        this.lessons;
        this.classes;
        this.rooms;
        this.selectedClassId = defaultTabs[0];

        this.onDisconnectCallbacks = [];

        this.handleSelectTab = this.handleSelectTab;

        this.separatedContainer = this.parentElement.querySelector('#lesson-table-container');

        this.onInit();
    }

    async onInit() {
        await this.determineProperties();
        this.render();
        await this.renderHoursCounters();
    }

    disconnectedCallback() {
        this.onDisconnectCallbacks.forEach(method => {
            method();
        });
    }

    render() {
        const style = document.createElement('style');
        style.textContent = styles;
        this.shadowRoot.appendChild(style);
        this.shadowRoot.innerHTML += getHtml.call(this);

        this.attachOnClicks();

        while (this.shadowRoot.firstChild) {
            this.separatedContainer.appendChild(this.shadowRoot.firstChild);
        }
    }

    async determineProperties() {
        const { lessons, classes, rooms } = ScopeSingleton.getInstance().getData();

        this.lessons = lessons;
        this.classes = [...defaultTabs, ...classes];
        this.rooms = rooms;
    }

    attachOnClicks() {
        const tabElements = this.shadowRoot.querySelector('.tabs-lesson-list').children;
        for (const tab of tabElements) {
            const tabId = tab.getAttribute('tab-id');
            tab.onclick = () => this.handleSelectTab(tabId);
        }
    }

    updateTitle() {
        const titleElement = this.separatedContainer.querySelector(lessonsListTitleClass);

        const selectedTitle = this.classes.find(clas => clas.id === this.selectedClassId).title;

        if (this.selectedClassId === allTab.id) {
            titleElement.textContent = defaultTitle;
        } else if (defaultTabs.some(({ title }) => title === selectedTitle)) {
            titleElement.textContent = selectedTitle;
        } else {
            titleElement.textContent = `${defaultTitle} ${selectedTitle}`;
        }
    }

    setSelectedTab() {
        const tabListElement = this.separatedContainer.querySelector('.tabs-lesson-list');

        const oldSelectedTab = tabListElement.querySelector('.selected');
        if (oldSelectedTab) oldSelectedTab.classList.remove('selected');

        //set selected tab
        for (const tab of tabListElement.children) {
            if (tab.getAttribute('tab-id') === this.selectedClassId) {
                tab.classList.add('selected');
                break;
            }
        }
    }

    filterElements() {
        const selectedClassId = this.selectedClassId;
        const listElement = this.separatedContainer.querySelector('tbody');
        const rows = listElement.children;
        const lessonRows = listElement.querySelectorAll(`[${lessonUniqueIdAttribute}]`);
        const roomRows = listElement.querySelectorAll(`[${tabIdAttribute}="${roomsTab.id}"]`);

        const enableDisplay = (elements, isDisplayed) => {
            for (const el of elements) {
                el.style.display = isDisplayed ? '' : 'none';
            }
        };

        switch (selectedClassId) {
            case allTab.id: {
                enableDisplay(lessonRows, true);
                enableDisplay(roomRows, false);
                break;
            }
            default: {
                for (const el of rows) {
                    const classId = el.getAttribute(tabIdAttribute);

                    const isDisplayed = classId == selectedClassId;

                    if (isDisplayed || !selectedClassId) {
                        el.style.display = '';
                    } else {
                        el.style.display = 'none';
                    }
                }

                break;
            }
        }
    }

    updateListHeaders() {
        const headerHoursCounterElement = this.separatedContainer.querySelector(headerHoursCounterClass);
        if (this.selectedClassId === roomsTab.id) {
            headerHoursCounterElement.style.display = 'none';
        } else {
            headerHoursCounterElement.style.display = '';
        }
    }

    handleSelectTab(id) {
        this.selectedClassId = id;
        this.updateTitle();
        this.filterElements();
        this.updateListHeaders();
        this.setSelectedTab();
    }

    async renderHoursCounters() {
        const controller = ScopeSingleton.getInstance().getController();
        const scope = ScopeSingleton.getInstance().getScope();
        const tbody = this.separatedContainer.getElementsByTagName('tbody')[0];

        const { academic_weeks_in_semester_field_id } = scope.field_model.data_model;

        const getWeeksInSemesterCount = async () => {
            const { appId, itemId } = scope;
            const fieldValue = await gudhub.getFieldValue(appId, itemId, academic_weeks_in_semester_field_id);
            return fieldValue;
        };

        const weeksInSemesterCountFromField = await getWeeksInSemesterCount();
        let weeksInSemester = weeksInSemesterCountFromField ? weeksInSemesterCountFromField : 1;

        const onWeeksInSemesterUpdateCallbacks = [];

        const subscribeOnWeeksInSemester = () => {
            const onWeeksInSemesterUpdate = async (event, weeksCount) => {
                if (!isNaN(weeksCount)) {
                    weeksInSemester = weeksCount;
                }

                onWeeksInSemesterUpdateCallbacks.forEach(callback => callback());
            };

            const { appId: app_id, itemId: item_id } = scope;
            const address = {
                app_id,
                item_id,
                field_id: academic_weeks_in_semester_field_id,
            };
            gudhub.on('gh_value_update', address, onWeeksInSemesterUpdate);

            return () => gudhub.destroy('gh_value_update', address, onWeeksInSemesterUpdate);
        };

        this.onDisconnectCallbacks.push(subscribeOnWeeksInSemester());

        for (const tr of tbody.children) {
            const uniqueId = tr.getAttribute(lessonUniqueIdAttribute);
            if (!uniqueId) continue;

            const lesson = controller.findLessonById(uniqueId);
            if (!lesson) continue;

            const cell = tr.querySelector('.hours-counter-cell');

            //hours counter container
            const hoursCounterContainerHtml = /*html*/ `
                <div class=hours-counter-container redips-trash>
                </div>
            `;
            cell.insertAdjacentHTML('afterbegin', hoursCounterContainerHtml);
            const hoursCounterContainer = cell.children[0];

            //total hours
            const { subjects_app_academic_hours_field_id } = scope.field_model.data_model;
            const getTotalHours = () =>
                gudhub.getInterpretationById(
                    ...lesson.subjectRefId.split('.'),
                    subjects_app_academic_hours_field_id,
                    'value'
                );

            const hoursObject = {
                totalHours: await getTotalHours(),
            };

            const calculateTotalHours = () => hoursObject.totalHours / weeksInSemester;

            const totalHoursHtml = /*html*/ `
                <span class=${hoursTotalAmountClass.replace('.', '')}>${customToFixed(calculateTotalHours())}</span>
            `;
            hoursCounterContainer.insertAdjacentHTML('afterbegin', totalHoursHtml);
            const totalHoursElement = hoursCounterContainer.querySelector(hoursTotalAmountClass);

            // remains hours
            hoursObject.settedHours = controller.getAcademicHours(uniqueId);
            const remainHours =
                hoursObject.settedHours > 0 ? calculateTotalHours() - hoursObject.settedHours : calculateTotalHours();

            const remainHoursHtml = /*html*/ `
                <span class="${hoursRemainsClass.replace('.', '')}">${customToFixed(remainHours)}</span>
            `;
            hoursCounterContainer.insertAdjacentHTML('beforeend', remainHoursHtml);

            const remainsHoursElement = hoursCounterContainer.querySelector(hoursRemainsClass);

            //add listeners
            const lessonComponent = tr.getElementsByTagName('schedule-lesson')[0];
            const toggleLessonDrag = remainHours => {
                if (remainHours > 0) {
                    if (!lessonComponent.isDragEnabled) {
                        lessonComponent.toggleDrag(true);
                    }
                } else {
                    lessonComponent.toggleDrag(false);
                }
            };

            const updateRemainsCounter = settedHours => {
                if (!isNaN(settedHours)) hoursObject.settedHours = settedHours;
                const remain = calculateTotalHours() - hoursObject.settedHours;
                remainsHoursElement.textContent = customToFixed(remain);

                toggleLessonDrag(remain);
            };

            const updateTotalCounter = totalAmount => {
                if (totalAmount) {
                    hoursObject.totalHours = totalAmount;
                }
                totalHoursElement.textContent = customToFixed(calculateTotalHours());
                updateRemainsCounter();
            };

            onWeeksInSemesterUpdateCallbacks.push(updateTotalCounter);

            const subscribeOnLessonTotalAcademicHours = () => {
                const onAcademicHoursUpdate = async () => {
                    const updatedTotalHours = await getTotalHours();
                    updateTotalCounter(updatedTotalHours);
                };

                const [app_id, item_id] = lesson.subjectRefId.split('.');
                const address = {
                    app_id,
                    item_id,
                    field_id: subjects_app_academic_hours_field_id,
                };
                gudhub.on('gh_value_update', address, onAcademicHoursUpdate);

                return () => gudhub.destroy('gh_value_update', address, onAcademicHoursUpdate);
            };

            toggleLessonDrag(remainHours);
            controller.addHoursUpdateCallback(uniqueId, updateRemainsCounter);
            this.onDisconnectCallbacks.push(subscribeOnLessonTotalAcademicHours());
        }
    }
}

function customToFixed(number, precision = 2) {
    const strNumber = number.toString();
    const dotIndex = strNumber.indexOf('.');

    return dotIndex !== -1
        ? parseFloat(`${strNumber.slice(0, dotIndex)}.${strNumber.slice(dotIndex + 1, dotIndex + 1 + precision)}`)
        : number;
}
