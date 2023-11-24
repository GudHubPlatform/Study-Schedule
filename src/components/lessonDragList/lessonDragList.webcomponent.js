import styles from './lessonDragList.styles.scss';
import getHtml, { tabIdAttribute, lessonsListTitleClass, lessonUniqueIdAttribute } from './lessonDragListLayout.js';

import renderer from '../../utils/componentsRenderer.js';
import ScopeSingleton from '../../utils/ScopeSingleton.js';


const hoursRemainsClass = '.hours-remains';
const hoursTotalAmountClass = '.hours-total-amount';

const defaultTitle = 'Предмети';
export const allTab = {
    id: 'all',
    title: defaultTitle,
};

export const classroomsTab = {
    id: 'classrooms',
    title: 'Кабінети'
};

const defaultTabs = [
    allTab,
    classroomsTab
];

export default class LessonDragList extends HTMLElement {
    constructor() {
        super();
        //component
        this.attachShadow({ mode: 'open' });
        this.classroomsInRow = 3;
        this.scope;
        this.app_id;
        this.renderer = renderer;
        this.lessons;
        this.classes;
        this.classrooms;
        this.selectedClassId = defaultTabs[0];
        

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
    };

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
        const { 
            lessons,
            classes,
            classrooms
         } = ScopeSingleton.getInstance().getData();

         this.lessons = lessons;
         this.classes = [ ...defaultTabs, ...classes];
         this.classrooms = classrooms;
    };

    attachOnClicks() {
        const tabElements = this.shadowRoot.querySelector('.tabs-lesson-list').children;
        for (const tab of tabElements) {
            const tabId = tab.getAttribute('tab-id');
            tab.onclick = () => this.handleSelectTab(tabId);
        }
    }

    updateTitle() {
        const titleElement = this.separatedContainer.querySelector(lessonsListTitleClass);

        const selectedTitle = this.classes.find((clas) => clas.id === this.selectedClassId).title;

        if (defaultTabs.some(({title}) => title === selectedTitle)) {
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

        const allElementsDisplay = (elements, isDisplayed) => {
            for (const el of elements) {
                el.style.display = isDisplayed ? '' : 'none';
            }
        };

        switch (selectedClassId) {
            case allTab.id: {
                allElementsDisplay(rows, true);
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
    };

    handleSelectTab(id) {
        this.selectedClassId = id;
        this.updateTitle();
        this.filterElements();
        this.setSelectedTab();
    }

    async renderHoursCounters() {
        const controller = ScopeSingleton.getInstance().getController();
        const scope = ScopeSingleton.getInstance().getScope();
        const tbody = this.separatedContainer.getElementsByTagName('tbody')[0];
        
        for (const tr of tbody.children) {
            const uniqueId = tr.getAttribute(lessonUniqueIdAttribute);
            if (!uniqueId) continue;

            const lesson = controller.findLessonById(uniqueId);
            if (!lesson) continue;
            
            const cell = tr.querySelector('.hours-counter-cell');

            //hours counter container
            const hoursCounterConteinerHtml = /*html*/`
                <div class=hours-counter-container redips-trash>
                </div>
            `;
            cell.insertAdjacentHTML('afterbegin', hoursCounterConteinerHtml);
            const hoursCounterContainer = cell.children[0];

            //total hours
            const {
                lessons_app_academic_hours_field_id
            } = scope.field_model.data_model;
            const getTotalHours = () => gudhub.getInterpretationById(...lesson.itemRefId.split('.'), lessons_app_academic_hours_field_id, 'value');

            const hoursObject = {
                totalHours: await getTotalHours(),
            };

            const totalHoursHtml = /*html*/`
                <span class=${hoursTotalAmountClass.replace('.', '')}>${hoursObject.totalHours}</span>
            `;
            hoursCounterContainer.insertAdjacentHTML('afterbegin', totalHoursHtml);
            const totalHoursElement = hoursCounterContainer.querySelector(hoursTotalAmountClass);


            // remains hours
            hoursObject.settedHours = controller.getAcademicHours(uniqueId);
            const remainHours = hoursObject.settedHours > 0 ? hoursObject.totalHours - hoursObject.settedHours : hoursObject.totalHours;
            
            const remainHoursHtml = /*html*/`
                <span class="${hoursRemainsClass.replace('.', '')}">${remainHours}</span>
            `;
            hoursCounterContainer.insertAdjacentHTML('beforeend', remainHoursHtml);

            const remainsHoursElement = hoursCounterContainer.querySelector(hoursRemainsClass);

            //add listeners
            const lessonComponent = tr.getElementsByTagName('schedule-lesson')[0];
            const toggleLessonDrag = (remainHours) => {
                if (remainHours > 0) {
                    if (!lessonComponent.isDragEnabled) {
                        lessonComponent.toggleDrag(true);
                    }
                } else {
                    lessonComponent.toggleDrag(false);
                }
            };

            const updateRemainsCounter = (settedHours) => {
                if (!isNaN(settedHours)) hoursObject.settedHours = settedHours;
                const remain = hoursObject.totalHours - hoursObject.settedHours;
                remainsHoursElement.textContent = remain;

                toggleLessonDrag(remain);
            };

            const updateTotalCounter = (totalAmount) => {
                hoursObject.totalHours = totalAmount;
                totalHoursElement.textContent = hoursObject.totalHours;
                updateRemainsCounter();
            };

            const subscribeOnLessonTotalAcademicHours = () => {
                const onAcademicHoursUpdate = async () => {
                    const updatedTotalHours = await getTotalHours();
                    updateTotalCounter(updatedTotalHours);
                };

                const [app_id, item_id] = lesson.itemRefId.split('.');
                const address = {
                    app_id,
                    item_id,
                    field_id: lessons_app_academic_hours_field_id,
                };
                gudhub.on('gh_value_update', address, onAcademicHoursUpdate);
            };
            
            toggleLessonDrag(remainHours);
            controller.addHoursCallback(uniqueId, updateRemainsCounter);
            subscribeOnLessonTotalAcademicHours();
        }
    }
}