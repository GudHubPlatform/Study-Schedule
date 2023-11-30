const lessonItemsWorker = {
    scope: null,
    initSettings: function(scope) {
        this.scope = scope;
    },
    createItem: function({
        subjectRefId,
        teacherRefId,
        classRefId,
        dateInMilliseconds
    }) {
        const {
            lessons_app_id,
            lessons_app_subject_field_id,
            lessons_app_teacher_field_id,
            lessons_app_class_field_id,
            lessons_app_date_field_id
        } = this.scope.field_model.data_model;
    
        const newItem = {
            fields: [
                {
                    field_id: lessons_app_subject_field_id,
                    field_value: subjectRefId,
                },
                {
                    field_id: lessons_app_teacher_field_id,
                    field_value: teacherRefId,
                },
                {
                    field_id: lessons_app_class_field_id,
                    field_value: classRefId,
                },
                {
                    field_id: lessons_app_date_field_id,
                    field_value: dateInMilliseconds,
                },
            ],
        };
    
        gudhub.addNewItems(lessons_app_id, [newItem]).then(item => console.log(item));
    },
    deleteItem: function() {
    
    }
};

export default lessonItemsWorker;