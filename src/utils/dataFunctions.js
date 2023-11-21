export function createLessonsForClasses(lessons, classes) {
    const createdLessons = [];

    for (const lesson of lessons) {
        const lessonCourse = lesson.course;

        if (!lessonCourse) continue;

        const filteredClassesByCourse = classes.filter((clas) => clas.course === lesson.course);

        for (const clas of filteredClassesByCourse) {
            const lessonWithClas = {
                uniqueId: `${lesson.id}/${clas.id}`,
                ...lesson,
                clas
            };

            createdLessons.push(lessonWithClas);
        }
    }

    return createdLessons;
}