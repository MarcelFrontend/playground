import { useDev } from '@/contexts/DevContext';
import { LessonTypes, MajorTypes } from '@/types/type';
import React, { useEffect, useState } from 'react';
import { FaAngleDown, FaAngleLeft, FaAngleUp } from '@/assets/icons';

interface ScheduleModalProps {
    chosenMajorData: MajorTypes;
    returnToMenu: () => void
}

export default function ScheduleModal({ chosenMajorData, returnToMenu }: ScheduleModalProps) {
    const [devWidth, setDevWidth] = useState<number>(0);
    const { isDev } = useDev();
    const daysOfWeek = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', "Sobota", "Niedziela"];
    const [lessonsInCol, setLessonsInCol] = useState<number>(1);
    const [showDays, setShowDays] = useState<boolean[]>(() => {
        const initialShowDays = Array(daysOfWeek.length).fill(false);
        if (new Date().getDay() - 1 >= 0) {
            initialShowDays[new Date().getDay() - 1] = true;
        }
        return initialShowDays;
    });

    // risizing
    useEffect(() => {
        setDevWidth(window.innerWidth)
        const handleResize = () => {
            const width = window.innerWidth;
            let columns;
            if (width < 640) {
                columns = 1;
            } else if (width < 768) {
                columns = 2;
            } else if (width < 1024) {
                columns = 3;
            } else if (width < 1280) {
                columns = 3;
            } else {
                columns = 5;
            }
            if (width > 768) {
                setShowDays(Array(daysOfWeek.length).fill(true));
            } else {
                const todayIndex = new Date().getDay() - 1;
                const initialShowDays = Array(daysOfWeek.length).fill(false);
                if (todayIndex >= 0) initialShowDays[todayIndex] = true;
                setShowDays(initialShowDays);
            }
            setLessonsInCol(columns);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (!chosenMajorData) return

    const formatTime = (time: number) =>
        `${Math.floor(time / 60)}:${time % 60 === 0 ? '00' : time % 60 < 10 ? '0' + (time % 60) : time % 60}`;

    function renderDayName(dayIndex: number) {
        return <div className="w-full flex px-2 text-black dark:text-white  bg-gray-100 dark:bg-gray-900 dark:border-gray-950 rounded-lg py-1 shadow-[0px_1px_3px_1px_rgb(150,150,150)] dark:shadow-[0px_1px_3px_1px_rgb(0,0,0)]">
            <label htmlFor={String(dayIndex)} className="w-full text-xl py-1 cursor-pointer">
                {daysOfWeek[dayIndex]}
            </label>
            <button
                id={String(dayIndex)}
                onClick={() => {
                    const newShowDays = [...showDays];
                    newShowDays[dayIndex] = !newShowDays[dayIndex];
                    setShowDays(newShowDays);
                }}
            >
                {showDays[dayIndex] ? <FaAngleUp className="text-4xl" /> : <FaAngleDown className="text-4xl" />}
            </button>
        </div>
    }

    function renderDay(day: LessonTypes[], dayIndex: number) {
        if (devWidth <= 639) {
            if (showDays.some((day) => day == true)) {
                if (showDays[dayIndex]) {
                    return <li
                        key={dayIndex}
                        className={`${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'min-h-14 max-h-[90%]' : 'md:h-[21.5rem] md:min-h-[99%] lg:h-[26rem]'} flex flex-col gap-1 bg-transparent transition-colors duration-[2s] overflow-y-auto py-1 px-1 `}
                    >
                        {renderDayName(dayIndex)}
                        {showDays[dayIndex] && (
                            <div
                                className={`max-h-full grid ${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'grid-cols-2' : 'min-[500px]:grid-cols-2'
                                    } sm:grid-cols-1 gap-2 md:gap-3 custom-scrollbar overflow-x-hidden px-2 pb-1`}
                            >
                                {day.map((lesson, index) => renderLesson(lesson, index))}
                            </div>
                        )}
                    </li>
                }
            } else {
                return <li
                    key={dayIndex}
                    className={`${(notEmptyDaysNum === lessonsInCol && devWidth > 768) && 'h-full'} w-full bg-transparent overflow-y-auto p-1`}
                >
                    {renderDayName(dayIndex)}
                    {showDays[dayIndex] && (
                        <div
                            className={`max-h-full grid ${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'grid-cols-2' : 'min-[471px]:grid-cols-2'
                                } sm:grid-cols-1 gap-2 md:gap-3 custom-scrollbar overflow-x-hidden px-2 pb-1`}
                        >
                            {day.map((lesson, index) => renderLesson(lesson, index))}
                        </div>
                    )}
                </li>
            }
        } else {
            return <li
                key={dayIndex}
                className={`${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'min-h-14 max-h-[79%]' : 'md:h-[21.5rem] min-h-[99%] lg:h-[26rem]'} max-h-full flex flex-col gap-1 bg-transparent transition-colors duration-[2s] overflow-y-auto px-2 py-1`}
            >
                {renderDayName(dayIndex)}
                {showDays[dayIndex] && (
                    <div
                        className={`max-h-full grid ${(notEmptyDaysNum === lessonsInCol && devWidth > 768) ? 'grid-cols-2' : 'min-[471px]:grid-cols-2'
                            } sm:grid-cols-1 gap-2 md:gap-3 custom-scrollbar overflow-x-hidden px-2 pb-1`}
                    >
                        {day.map((lesson, index) => renderLesson(lesson, index))}
                    </div>
                )}
            </li>
        }
    }

    function renderLesson(lesson: LessonTypes, index: number) {
        return <div
            key={index}
            className="relative min-h-40 flex items-center text-center justify-center flex-col shadow-[0px_2px_10px_1px_rgb(200,200,200)] dark:shadow-[0px_2px_10px_1px_rgb(10,10,10)] rounded-md text-black dark:text-white py-2 px-2 xl:my-0.5"
        >
            <p className="w-52 text-center">
                {lesson.type}{" "}
                {lesson.name.split(" ").map(word => (word.length > 7 ? word.slice(0, 5) + ". " : word + " "))}
            </p>
            <p>{lesson.subject}</p>
            <p className="w-40 md:w-48">{lesson.teacher}</p>
            <span>
                {formatTime(lesson.start_minute)}-{formatTime(lesson.end_minute)}
            </span>
            <p>{lesson.place}</p>
        </div>
    }

    const notEmptyDaysNum = chosenMajorData.plan?.filter(day => day.length > 0).length;

    chosenMajorData.plan.map((day, index) => {
        const truePos = showDays.findIndex(showDay => showDay === true);
        if (day.length < 1) {
            if(isDev) console.log(showDays[truePos], truePos);
            if (index === truePos) {
                const updatedShowDays = Array(showDays.length).fill(false);
                setShowDays(updatedShowDays);
            }
        }
    });


    if (notEmptyDaysNum) {
        if (isDev) console.log("Niepuste dni:", notEmptyDaysNum);
        if (notEmptyDaysNum < lessonsInCol) setLessonsInCol(notEmptyDaysNum);
        const savedMajors = localStorage.getItem("az-saved")
        if (savedMajors) {
            const numberOfSavedMajors = JSON.parse(savedMajors).length
            return (
                <>
                    <div className='w-full flex items-center text-black dark:text-white border-b-4 border-gray-950 px-5 py-3'>
                        {numberOfSavedMajors > 1 && (
                            <button>
                                <FaAngleLeft className='text-3xl' onClick={() => returnToMenu()} />
                            </button>
                        )}
                        <span className='w-full text-center font-bold text-xl'>
                            {chosenMajorData.name}
                            {" "}
                            {chosenMajorData.year}
                        </span>
                    </div>
                    <ul
                        style={{ gridTemplateColumns: `repeat(${lessonsInCol}, 1fr)` }}
                        className={`relative w-full grid md:content-start gap-1 overflow-y-hidden px-2 py-1 md:pb-0 bg-gray-200 dark:bg-gray-900 rounded-lg transition-colors duration-150 ${isDev && "border border-black dark:border-white"}`}>
                        {/* Todo: Tu powinno być nav na którym powinnien być przycisk do powrotu i informacje o wysłanym kierunku */}
                        {chosenMajorData.plan?.map((day, index) => {
                            if (!Array.isArray(day) || day.length === 0) return null;
                            return renderDay(day, index);
                        })}
                    </ul>
                </>
            );
        }
    }
};
