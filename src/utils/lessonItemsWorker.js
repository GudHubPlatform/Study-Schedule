import ScopeSingleton from './ScopeSingleton.js';

const createId = ({ itemId, dayOfWeekIndex, lessonNumber, clasId }) => {
    return `${itemId}-${clasId}-${dayOfWeekIndex.toString().padStart(2, '0')}-${lessonNumber}`;
};

const createField = (field_id, field_value) => ({
    field_id,
    field_value,
});

const lessonItemsWorker = {
    scope: null,
    lessonsAppId: null,
    items: null,
    fieldsObject: null,
    semesterStartDate: null,
    weeksCount: null,
    enableGenerateButtons: null,

    initSettings: async function (scope) {
        this.scope = scope;
        this.enableGenerateButtons = ScopeSingleton.getInstance().getEnableGenerateButtons();
        this.lessonsAppId = this.scope.field_model.data_model.lessons_app_id;
        this.initFieldsObject();
        this.semesterStartDate = await this.getSemesterStartDate();
        this.weeksCount = await this.getWeeksCount();
        await this.loadItems();

        if (!this.semesterStartDate || isNaN(+this.semesterStartDate) || this.semesterStartDate < 0) {
            this.enableGenerateButtons(false);
        }

        const subscribeOnSemesterStartDateChanges = () => {
            const onUpdate = (event, dateMilliseconds) => {
                if (!dateMilliseconds || isNaN(+dateMilliseconds) || dateMilliseconds < 0) {
                    this.semesterStartDate = null;
                    this.enableGenerateButtons(false);
                    return;
                }
                const date = new Date(+dateMilliseconds).setHours(0, 0, 0, 0);
                this.semesterStartDate = date;

                this.enableGenerateButtons(true);
            };

            const { appId: app_id, itemId: item_id } = this.scope;
            const address = {
                app_id,
                item_id,
                field_id: this.fieldsObject.semesterStartDate,
            };
            gudhub.on('gh_value_update', address, onUpdate);

            return () => gudhub.destroy('gh_value_update', address, onUpdate);
        };

        const { onDisconnectCallbacks } = ScopeSingleton.getInstance().getData();
        const destroySubscribe = subscribeOnSemesterStartDateChanges();
        onDisconnectCallbacks.push(destroySubscribe);
    },
    loadItems: async function () {
        const { itemId } = this.scope;
        const lessonsItems = await gudhub.getItems(this.lessonsAppId, false);
        const filter_list = [
            {
                data_type: 'text',
                field_id: this.fieldsObject.scheduleId,
                search_type: 'contain_and',
                selected_search_option_variable: 'Value',
                valuesArray: [itemId],
            },
        ];
        const filteredItems = await gudhub.filter(lessonsItems, filter_list);
        this.items = filteredItems;
    },
    initFieldsObject: function () {
        const {
            lessons_app_subject_field_id,
            lessons_app_teacher_field_id,
            lessons_app_class_field_id,
            lessons_app_date_field_id,
            lessons_app_schedule_id_field_id,
            lessons_app_room_field_id,
            lessonsTime,
            semester_start_date_field_id,
        } = this.scope.field_model.data_model;

        this.fieldsObject = {
            subject: lessons_app_subject_field_id,
            teacher: lessons_app_teacher_field_id,
            class: lessons_app_class_field_id,
            date: lessons_app_date_field_id,
            scheduleId: lessons_app_schedule_id_field_id,
            room: lessons_app_room_field_id,
            semesterStartDate: semester_start_date_field_id,
            lessonsTime,
        };
    },
    getSemesterStartDate: async function () {
        const { appId, itemId } = this.scope;
        const { semester_start_date_field_id } = this.scope.field_model.data_model;
        if (!semester_start_date_field_id) return;

        const fieldValue = await gudhub.getFieldValue(appId, itemId, semester_start_date_field_id);
        const date = new Date(+fieldValue).setHours(0, 0, 0, 0);
        return date;
    },
    getWeeksCount: async function () {
        const { appId, itemId } = this.scope;
        const { academic_weeks_in_semester_field_id } = this.scope.field_model.data_model;
        const fieldValue = await gudhub.getFieldValue(appId, itemId, academic_weeks_in_semester_field_id);
        return fieldValue;
    },
    generateLessons: async function (cells) {
        const emptyCells = cells.filter(cell => !cell.lesson);
        const filteredCells = cells.filter(cell => cell.lesson);
        const itemsFields = [];

        const promises = filteredCells.map(cell =>
            this.createLessonFields(cell).then(fields => {
                itemsFields.push(...fields);
            })
        );
        await Promise.all(promises);

        const createdItems = await gudhub.addNewItems(this.lessonsAppId, itemsFields);

        //gather itemsScheduleId`s in object
        const itemsIdObject = {};
        for (const item of this.items) {
            const scheduleIdField = item.fields.find(({ field_id }) => field_id == this.fieldsObject.scheduleId);
            if (scheduleIdField) {
                const scheduleId = scheduleIdField.field_value;
                itemsIdObject[scheduleId] = item;
            }
        }

        // delete lesson items if they have empty cell in schedule
        const emptyCellsButHaveLesson = emptyCells.filter(cell => {
            const cellId = createId({
                itemId: this.scope.itemId,
                dayOfWeekIndex: cell.dayOfWeekIndex,
                lessonNumber: cell.lessonNumber,
                clasId: cell.clas.id,
            });

            return itemsIdObject.hasOwnProperty(cellId);
        });

        this.items.push(...createdItems);
        await this.deleteLessons(emptyCellsButHaveLesson);

        return createdItems;
    },
    createLessonFields: async function ({ clas, dayOfWeekIndex, lessonNumber, lesson, room }) {
        const { subjectRefId, teacherRefId } = lesson;

        const roomId = room && room.id ? room.id : '';

        const clasId = clas.id;

        const id = createId({
            itemId: this.scope.itemId,
            dayOfWeekIndex,
            lessonNumber,
            clasId,
        });

        const foundItems = await this.findItem(id);

        if (foundItems.length > 0) {
            const fieldsToCompare = [
                [this.fieldsObject.subject, subjectRefId],
                [this.fieldsObject.teacher, teacherRefId],
                [this.fieldsObject.room, roomId],
            ];

            const itemsWithDifferences = foundItems.filter(item => {
                for (const [fieldId, fieldValue] of fieldsToCompare) {
                    const foundField = item.fields.find(field => field.field_id == fieldId);
                    if (!foundField) return true;
                    if (foundField.field_value != fieldValue) return true;
                }

                return false;
            });

            const updatedItems = await this.updateLesson({ lesson, room }, itemsWithDifferences);

            return [];
        }

        const gatherItemsFields = [];

        for (let weekIndex = 0; weekIndex < this.weeksCount; weekIndex++) {
            const lessonDate = this.getLessonDate(dayOfWeekIndex, weekIndex);
            const lessonTime = this.getLessonTime(lessonNumber);

            const lessonDateInMilliseconds = lessonDate + lessonTime;

            if (lessonDateInMilliseconds < this.semesterStartDate) {
                continue;
            }

            const itemFields = {
                fields: [
                    createField(this.fieldsObject.subject, subjectRefId),
                    createField(this.fieldsObject.teacher, teacherRefId),
                    createField(this.fieldsObject.class, clasId),
                    createField(this.fieldsObject.date, lessonDateInMilliseconds),
                    createField(this.fieldsObject.room, roomId),
                    createField(this.fieldsObject.scheduleId, id),
                ],
            };
            gatherItemsFields.push(itemFields);
        }

        return gatherItemsFields;
    },
    updateLesson: async function ({ lesson, room }, items) {
        const { subjectRefId, teacherRefId } = lesson;

        const roomId = room && room.id ? room.id : '';

        const itemsList = [];

        for (const item of items) {
            const updatedFields = {
                fields: [
                    createField(this.fieldsObject.subject, subjectRefId),
                    createField(this.fieldsObject.teacher, teacherRefId),
                    createField(this.fieldsObject.room, roomId),
                ],
            };

            const itemToUpdate = {
                item_id: item.item_id,
                ...updatedFields,
            };
            itemsList.push(itemToUpdate);
        }

        return gudhub.updateItems(this.lessonsAppId, itemsList);
    },
    deleteLessons: async function (cells) {
        const itemsIds = [];
        const promises = cells.map(cell => {
            const { clas, dayOfWeekIndex, lessonNumber } = cell;
            const clasId = clas.id;
            const id = createId({
                itemId: this.scope.itemId,
                dayOfWeekIndex,
                lessonNumber,
                clasId,
            });

            return this.findItem(id).then(foundItems => {
                const foundItemsIds = foundItems.map(({ item_id }) => item_id);
                if (foundItemsIds.length !== 0) {
                    itemsIds.push(...foundItemsIds);
                }
            });
        });

        await Promise.all(promises);

        if (itemsIds.length === 0) return;

        const deletedItems = await gudhub.deleteItems(this.lessonsAppId, itemsIds);
        await this.loadItems();
        return deletedItems;
    },
    findItem: async function (id) {
        const filter_list = [
            {
                data_type: 'text',
                field_id: this.fieldsObject.scheduleId,
                search_type: 'equal_and',
                selected_search_option_variable: 'Value',
                valuesArray: [id],
            },
        ];
        const foundItem = gudhub.filter(this.items, filter_list);

        return foundItem;
    },
    getLessonTime: function (lessonNumber) {
        const lessons = this.scope.field_model.data_model.lessonsTime;
        const lesson = lessons[lessonNumber - 1];
        const lessonTime = lesson ? lesson.time : undefined;

        return lessonTime;
    },
    getLessonDate: function (lessonDayOfWeek, weeksToAdd = 0) {
        const semesterStartDay = new Date(this.semesterStartDate).getDay() - 1;
        const dayDifference = semesterStartDay - lessonDayOfWeek;
        const daysToAdd = weeksToAdd * 7 - dayDifference;

        const lessonDate = new Date(this.semesterStartDate + daysToAdd * 24 * 60 * 60 * 1000);

        return lessonDate.getTime();
    },
};

export default lessonItemsWorker;
