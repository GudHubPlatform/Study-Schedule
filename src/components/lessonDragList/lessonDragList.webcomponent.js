import styles from './lessonDragList.styles.scss';
import getHtml, { tabIdAttribute } from './lessonDragListLayout.js';

import renderer from '../../utils/componentsRenderer.js';
import ScopeSingleton from '../../utils/ScopeSingleton.js';
import { lessonsListTitleClass } from './lessonDragListLayout.js';

const defaultTitle = 'Уроки';
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

        this.separatedContainer = this.parentElement.querySelector('#lesson-table');

        this.onInit();
    }

    async onInit() {
        await this.determineProperties();
        this.render();
    }

    disconnectedCallback() {
        console.log('disconnectedCallback');
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

    handleClickCloseIcon() {
        console.log('close icon clicked');
    }
}