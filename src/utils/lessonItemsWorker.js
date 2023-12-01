const createId = ({itemId, dayOfWeekIndex, lessonNumber, clasId}) => {
    return `${itemId}-${clasId}-${dayOfWeekIndex.toString().padStart(2, '0')}-${lessonNumber}`;
};

const lessonItemsWorker = {
    scope: null,
    lessonsAppId: null,
    items: null,
    fieldsObject: null,
    semesterStartDate: null,
    weeksCount: null,
    initSettings: async function(scope) {
        this.scope = scope;
        this.lessonsAppId = this.scope.field_model.data_model.lessons_app_id;
        this.initFieldsObject();
        this.semesterStartDate = await this.getSemesterStartDate();
        this.weeksCount = await this.getWeeksCount();
        await this.loadItems();
    },
    loadItems: async function() {
        const {itemId} = this.scope;
        const lessonsItems = await gudhub.getItems(this.lessonsAppId, false);
        const filter_list = [
            {
              "data_type": "text",
              "field_id": this.fieldsObject.scheduleId,
              "search_type": "contain_and",
              "selected_search_option_variable": "Value",
              "valuesArray": [itemId]
            }
        ];
        const filteredItems = await gudhub.filter(lessonsItems, filter_list);

        this.items = filteredItems;
    },
    initFieldsObject: function() {
        const {
            lessons_app_subject_field_id,
            lessons_app_teacher_field_id,
            lessons_app_class_field_id,
            lessons_app_date_field_id,
            lessons_app_schedule_id_field_id,
            lessonsTime,
        } = this.scope.field_model.data_model;

        this.fieldsObject = {
            subject: lessons_app_subject_field_id,
            teacher: lessons_app_teacher_field_id,
            class: lessons_app_class_field_id,
            date: lessons_app_date_field_id,
            scheduleId: lessons_app_schedule_id_field_id,
            lessonsTime,
        };
    },
    getSemesterStartDate: async function() {
        const { appId, itemId } = this.scope;
        const { semester_start_date_field_id } = this.scope.field_model.data_model;
        if (!semester_start_date_field_id) return;
        
        const fieldValue = await gudhub.getFieldValue(appId, itemId, semester_start_date_field_id);
        const date = new Date(+fieldValue).setHours(0, 0, 0, 0);
        return date;
    },
    getWeeksCount: async function() {
        const { appId, itemId } = this.scope;
        const { academic_weeks_in_semester_field_id } = this.scope.field_model.data_model;
        const fieldValue = await gudhub.getFieldValue(appId, itemId, academic_weeks_in_semester_field_id);
        return fieldValue;
    },
    generateItems: async function(cells) {
        const filteredCells = cells.filter(cell => cell.lesson);
        const itemsFields = [];

        for (const cell of filteredCells) {
            for (let i = 0; i < this.weeksCount; i++) {
                const itemFields = await this.createItemFields(cell, i);

                if (!itemFields) {
                    continue;
                }
                itemsFields.push(itemFields);
            }
        }

        const createdItems = await gudhub.addNewItems(this.lessonsAppId, itemsFields);

        this.items.push(...createdItems);

        return createdItems;
    },
    createItemFields: async function({clas, dayOfWeekIndex, lessonNumber, lesson}, week) {
        const {
            subjectRefId,
            teacherRefId
        } = lesson;

        const clasId = clas.id;

        const id = createId({appId: this.scope.appId, itemId: this.scope.itemId, dayOfWeekIndex, lessonNumber, clasId});

        const foundItems = await this.findItem(id);

        if (foundItems.length > 0) {
            return undefined;
        }
    
        const lessonDate = this.getLessonDate(dayOfWeekIndex, week);
        const lessonTime = this.getLessonTime(lessonNumber);
        
        const lessonDateInMilliseconds = lessonDate + lessonTime;

        const itemFields = {
            fields: [
                {
                    field_id: this.fieldsObject.subject,
                    field_value: subjectRefId,
                },
                {
                    field_id: this.fieldsObject.teacher,
                    field_value: teacherRefId,
                },
                {
                    field_id: this.fieldsObject.class,
                    field_value: clasId,
                },
                {
                    field_id: this.fieldsObject.date,
                    field_value: lessonDateInMilliseconds,
                },
                {
                    field_id: this.fieldsObject.scheduleId,
                    field_value: id,
                },
            ],
        };

        return itemFields;
    },
    updateItem: async function({itemId, clas, dayOfWeekIndex, lessonNumber, lesson}) {
        const {
            subjectRefId,
            teacherRefId
        } = lesson;

        const clasId = clas.id;
        const id = createId({itemId, dayOfWeekIndex, lessonNumber, clasId});

        if (!item_id) {}

        const updatedFields = {
            fields: [
                {
                    field_id: this.fieldsObject.subject,
                    field_value: subjectRefId,
                },
                {
                    field_id: this.fieldsObject.teacher,
                    field_value: teacherRefId,
                },
                {
                    field_id: this.fieldsObject.class,
                    field_value: clasId,
                },
                {
                    field_id: this.fieldsObject.date,
                    field_value: new Date().setHours(),
                },
                {
                    field_id: this.fieldsObject.scheduleId,
                    field_value: id,
                },
            ],
        };

        const itemToUpdate = {
            item_id: itemId,
            ...updatedFields
        };
    },
    deleteLessons: async function(cells) {
        const itemsIds = [];

        for (const cell of cells) {
            const {clas, dayOfWeekIndex, lessonNumber} = cell;
            const clasId = clas.id;
            const id = createId({appId: this.scope.appId, itemId: this.scope.itemId, dayOfWeekIndex, lessonNumber, clasId});
            const foundItems = await this.findItem(id);
            const foundItemsIds = foundItems.map(({item_id}) => item_id);

            itemsIds.push(...foundItemsIds);
        }

        const deletedItems = await gudhub.deleteItems(this.lessonsAppId, itemsIds);
        await this.loadItems();
        return deletedItems;
    },
    findItem: async function(id) {
        const filter_list = [{
              "data_type": "text",
              "field_id": this.fieldsObject.scheduleId,
              "search_type": "equal_and",
              "selected_search_option_variable": "Value",
              "valuesArray": [id]
            }];
        const foundItem = gudhub.filter(this.items, filter_list);

        return foundItem;
    },
    getLessonTime: function(lessonNumber) {
        const lessons = this.scope.field_model.data_model.lessonsTime;
        const lesson = lessons[lessonNumber - 1];
        const lessonTime = lesson ? lesson.time : undefined;

        return lessonTime;
    },
    getLessonDate: function(lessonDayOfWeek, weeksToAdd = 0) {
        const daysToAdd = lessonDayOfWeek + weeksToAdd * 7;
    
        const lessonDate = new Date(this.semesterStartDate + daysToAdd * 24 * 60 * 60 * 1000 );
    
        return lessonDate.getTime();
    }
};

export default lessonItemsWorker;