import styles from './lessonDragList.styles.scss';
import getHtml, { tabIdAttribute, hoursTotalAmountClass, lessonsListTitleClass, hoursRemainsClass, lessonUniqueIdAttribute } from './lessonDragListLayout.js';

import renderer from '../../utils/componentsRenderer.js';
import ScopeSingleton from '../../utils/ScopeSingleton.js';

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
        this.renderHoursCounters();
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

    renderHoursCounters() {
        const controller = ScopeSingleton.getInstance().getController();
        const tbody = this.separatedContainer.getElementsByTagName('tbody')[0];
        
        for (const tr of tbody.children) {
            const uniqueId = tr.getAttribute(lessonUniqueIdAttribute);
            if (!uniqueId) continue;

            const lesson = controller.findLessonById(uniqueId);
            if (!lesson) continue;
            
            const cell = tr.querySelector('.hours-counter-cell');
            const hoursCounterConteinerHtml = /*html*/`
                <div class=hours-counter-container redips-trash>
                    <span class=${hoursTotalAmountClass}>${lesson.academicHours}</span>
                </div>
            `;
            cell.insertAdjacentHTML('afterbegin', hoursCounterConteinerHtml);
            const hoursCounterConteiner = cell.children[0];

            const hoursSetted = controller.getAcademicHours(uniqueId);
            const remainHours = hoursSetted ? lesson.academicHours - hoursSetted : lesson.academicHours;
            
            const remainHoursHtml = /*html*/`
                <span class="${hoursRemainsClass}">${remainHours}</span>
            `;
            hoursCounterConteiner.insertAdjacentHTML('beforeend', remainHoursHtml);

            const remainsHoursElement = hoursCounterConteiner.children[1];
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

            toggleLessonDrag(remainHours);

            const updateRemainsCounter = ({ total, setted }) => {
                const remain = total - setted;
                remainsHoursElement.textContent = remain;

                toggleLessonDrag(remain);
            };
            
            controller.addHoursCallback(uniqueId, updateRemainsCounter);
        }
    }
}