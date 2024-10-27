// Todo: Wybierz dzisiejszy dzień i może godzine domyślnie
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import ErrorModal from '@/pages/ErrorModal';
import { useDev } from '@/contexts/DevContext';


function DynamicSearch({ returnToMenu, searchType, firstTryFetchingData }: {    returnToMenu: () => void;
    searchType: string;
    firstTryFetchingData?: MajorTypes[];}) {
    const [data, setData] = useState<MajorTypes[]>();
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [hourSuggestions, setHourSuggestions] = useState<string[]>([]);
    const [searchInput, setSearchInput] = useState<string>('');
    const [dayInput, setDayInput] = useState<string>('');
    const [hoursInput, setHoursInput] = useState<string>('');
    const [results, setResults] = useState<Lesson[]>([]);
    const [showResults, setShowResults] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [daysInSearchType, setDaysInSearchType] = useState<string[]>([])
    const { isDev } = useDev();

    const colorsSmooth = "transition-colors duration-150"
    const optionsStyle = "md:w-72 lg:w-[25rem] text-3xl md:text-[32px] lg:text-5xl px-2 py-1 md:text-lg text-black dark:text-white bg-white dark:bg-gray-900 shadow-md shadow-gray-400 disabled:shadow-black dark:shadow-[1px_2px_5px_1px_rgb(10,10,10)] rounded-md outline-none focus:border-gray-900 dark:focus:border-gray-400 border-2 border-transparent hover:scale-[1.05] transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-25"

    const daysOfWeek = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek'];

    function resetInputs() {
        setSearchInput('');
        setDayInput('');
        setHoursInput('');
    }

    useEffect(() => {
        if (firstTryFetchingData) {
            if (isDev) console.log("Dane istnieją, nie trzeba ich pobierać");
            setData(firstTryFetchingData);
        } else {
            const fetchData = async () => {
                try {
                    const response = await fetch('https://maramowicz.dev/azapi/database.json');
                    if (!response.ok) throw new Error("Failed to fetch data");
                    const jsonData: MajorTypes[] = await response.json();
                    const filteredData = jsonData.filter((major: MajorTypes) => {
                        return major.doc_type !== -1 && major.doc_type !== -2;
                    });
                    if (isDev) console.log(filteredData);

                    setData(filteredData);
                } catch (error) {
                    console.error(error);
                    setErrorMessage("Błąd przy pobieraniu danych.");
                    setTimeout(() => {
                        returnToMenu()
                    }, 2000)
                }
            };
            console.clear();
            fetchData();
            resetInputs();
            setSearchInput("");
            setDayInput("");
            setHoursInput("");
        }
    }, []);

    useEffect(() => {
        const chosenTypeSet = new Set<string>();
        if (data) {
            Object.entries(data).forEach((major) => {
                const majorData = major[1] as MajorTypes;
                majorData.plan.forEach((day) => {
                    if (day) {
                        Object.entries(day).forEach(([, lekcja]) => {
                            const lesson = lekcja as Lesson;
                            if (searchType === "place") {
                                const formattedPlace = formatPlace(lesson.place);
                                chosenTypeSet.add(formattedPlace);
                            } else {
                                chosenTypeSet.add(lesson.teacher);
                            }
                        });
                    }
                });
            });
            setSuggestions(Array.from(chosenTypeSet));
            if (isDev) console.log("Podpowiedzi:", Array.from(chosenTypeSet));
        }
    }, [data, searchType]);

    useEffect(() => {
        if (isDev && data) {
            console.log("Pobrane dane:", data);
        }
    }, [data]);

    function formatPlace(place: string[] | object | undefined): string {
        if (!place) return "";
        if (Array.isArray(place)) {
            return place.join(" ");
        }
        return place.toString();
    }
    const dayOrderMap = daysOfWeek.reduce((acc, day, index) => {
        acc[day] = index;
        return acc;
    }, {} as Record<string, number>);

    function fetchChosenType(searchValue: string): (Lesson | string | null)[][] | null {
        const chosenTypeSet: (Lesson | string | null)[][] = [];
        setSearchInput(searchValue);
        const daysInSearchTypeSet = new Set<string>();

        if (searchValue.length >= 4 && data) {
            for (const [, major] of Object.entries(data)) {
                const majorData = major as MajorTypes;
                majorData.plan.forEach((day, dayIndex) => {
                    if (day.length > 0) {
                        for (const [, lekcja] of Object.entries(day)) {
                            const lesson = lekcja as Lesson;
                            if (searchType == 'place') {
                                if (formatPlace(lesson.place) === searchValue) {
                                    chosenTypeSet.push([lesson, daysOfWeek[dayIndex]]);
                                    daysInSearchTypeSet.add(daysOfWeek[dayIndex])
                                }
                            } else {
                                if (lesson.teacher === searchValue) {
                                    chosenTypeSet.push([lesson, daysOfWeek[dayIndex]]);
                                    daysInSearchTypeSet.add(daysOfWeek[dayIndex])
                                }
                            }
                        }
                    }
                });
                const sortedDays = Array.from(daysInSearchTypeSet).sort((a, b) => {
                    return (dayOrderMap[a] || 0) - (dayOrderMap[b] || 0);
                });
                setDaysInSearchType(sortedDays);
            }
            if (chosenTypeSet.length > 0) {
                if (isDev) console.log("Lekcje posiadające określoną wartość:", chosenTypeSet);
                return chosenTypeSet;
            }
        }
        return null;
    }

    function fetchDay(dayInput: string): Lesson[] | null {
        const lessonDetails: Lesson[] = [];
        const hoursSuggestions = new Set<string>();
        setDayInput(dayInput);

        if (searchInput.length > 2 && dayInput.length > 2) {
            const lessons = fetchChosenType(searchInput);
            if (isDev) console.log("lessons:", lessons);

            if (lessons) {
                lessons.forEach((lesson) => {
                    const [details, day] = lesson as [Lesson, string];
                    if (day === dayInput) {
                        lessonDetails.push(details);
                        const startTime = `${Math.floor(details.start_minute / 60)}:${details.start_minute % 60 === 0 ? '00' : details.start_minute % 60}`;
                        hoursSuggestions.add(startTime);
                    }
                });

                if (lessonDetails.length != 0) {
                    if (isDev) console.log("Są niepuste wyniki");


                    const sortedHours = Array.from(hoursSuggestions).sort((a, b) => {
                        const [aHours, aMinutes] = a.split(':').map(Number);
                        const [bHours, bMinutes] = b.split(':').map(Number);
                        return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
                    });
                    if (isDev) console.log(sortedHours);

                    setHourSuggestions(sortedHours);
                    if (isDev && hoursInput.length < 4) {
                        console.log("Lekcje spełniające warunki:", lessonDetails);
                    }
                    return lessonDetails;
                }
            } else {
                console.log("Wynik jest pusty");
                setErrorMessage("Brak wyników");
            }
        }
        return null;
    }

    function fetchHours(timeInput: string) {
        setHoursInput(timeInput);
        if (timeInput.length >= 4) {
            const lessonsData: Lesson[] | null = fetchDay(dayInput);
            const [hours, minutes] = timeInput.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes;
            const matchedLessons = lessonsData?.filter(lesson => {
                return typeof lesson === 'object' && lesson.start_minute == totalMinutes;
            }) as Lesson[];
            setResults(matchedLessons || []);
            if (isDev) console.log("Znaleziona lekcja:", matchedLessons);
            return totalMinutes;
        }
    }

    function handleCheck() {
        let errorMessages: string = "";

        if (!searchInput && !dayInput) {
            errorMessages = `Proszę wybrać ${searchType == 'place' ? "sale" : "wykładowce"} i dzień.`;
        } else if (!dayInput && !hoursInput) {
            errorMessages = "Proszę wybrać dzień i godzine.";
        } else if (!hoursInput && !searchInput) {
            errorMessages = `Proszę wybrać ${searchType == 'place' ? "sale" : "wykładowce"} i godzine.`;
        } else if (!searchInput) {
            errorMessages = `Proszę wybrać ${searchType == 'place' ? "sale" : "wykładowce"}.`;
        } else if (!dayInput) {
            errorMessages = "Proszę wybrać dzień.";
        } else if (!hoursInput) {
            errorMessages = "Proszę wybrać godzine.";
        }

        if (errorMessages.length > 0) {
            setErrorMessage(errorMessages);
            return;
        }

        if (results.length > 0) {
            setShowResults(true);
        } else {
            setErrorMessage("Nie znaleziono wykładu dla podanych danych");
        }
    }

    function closeErrorModal() {
        setErrorMessage(null);
    }

    function goBack() {
        setShowResults(false);
        setResults([]);
        setDayInput("");
        setHoursInput("");
        setSearchInput("");
    }

    function formatResult() {
        function formatTime(time: number) {
            return `${Math.floor(time / 60)}:${time % 60 === 0 ? '00' : time % 60 < 10 ? '0' + (time % 60) : time % 60}`;
        }

        return (
            <div className="h-[91vh] md:h-[92vh] flex items-center justify-center">
                <ul className={`relative -top-9 sm:top-0 h-[78%] flex items-center justify-center flex-col gap-2 md:gap-4 overflow-y-auto overflow-x-hidden px-2 pb-1.5 custom-scrollbar ${isDev && "border border-red-500"}`}>
                    {results.map((lesson, index) => (
                        <li key={index} className={`w-80 sm:w-96 text-center text-black dark:text-white rounded-lg flex items-center flex-col py-3 mr-1 text-2xl
                         shadow-[0px_3px_8px_2px_rgb(100,100,100)] dark:shadow-[1px_2px_8px_1px_rgb(10,10,10)] transition-all hover:scale-[1.02] duration-100 ${isDev && "border border-blue-500"}`}>
                            <span>{dayInput} <span className={searchType == "place" ? "font-bold" : ""}>{lesson.place}</span></span>
                            <span className={`px-10 ${searchType == "place" ? "" : "font-bold"} `}>{lesson.teacher}</span>
                            <span>
                                {formatTime(lesson.start_minute)} - {formatTime(lesson.end_minute)}
                            </span>
                            <span>{lesson.subject}</span>
                            <span className='px-10'>
                                {lesson.type} {lesson.name}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
    return (
        <div className={`h-[100vh] bg-gray-100 dark:bg-gray-900 transition-colors duration-700 overflow-y-hidden ${isDev && "border"}`}>
            <Head>
                <title>{searchType == "place" ? "Kto ma w ...?" : "Gdzie jest ...?"}</title>
            </Head>
            {showResults && results.length > 0 && (
                <button className='relative top-2 sm:top-1 text-black dark:text-white border-2 border-black dark:border-white rounded-md text-2xl md:text-lg px-4 md:px-3 mt-2 ml-2 hover:scale-105 active:scale-95 transition-transform duration-150 ' onClick={goBack}>Wróć</button>
            )}
            {!showResults && (
                <div className={`relative h-full flex items-center justify-center flex-col gap-5 md:gap-10 ${isDev && "border border-yellow-500"}`}>
                    <button
                        onClick={returnToMenu}
                        className={`absolute -top-1 left-2 text-2xl md:text-3xl lg:text-4xl mt-4 border-2 border-gray-400 text-black dark:text-white dark:shadow-gray-600 py-1 px-5 rounded-lg hover:scale-105 active:scale-95 focus:scale-105 transition-transform duration-150 ${colorsSmooth}`}>
                        Cofnij
                    </button>
                    <div
                        className={`bg-gray-100 shadow-[1px_2px_10px_1px_rgb(125,125,125)] dark:shadow-[1px_2px_8px_1px_rgb(10,10,10)] dark:bg-gray-900 rounded-xl py-7 px-4 md:px-7 flex items-center justify-center flex-col gap-2 ${colorsSmooth} duration-700 ${isDev && "border border-red-500"}`}>
                        {/* Todo: resetowanie reszty pól gdy zmienia się sala */}
                        <input
                            type="text"
                            placeholder={searchType == "place" ? "Numer sali" : "Wykładowca"}
                            className={`w-52 md:w-72 lg:w-[25rem] text-3xl md:text-4xl lg:text-5xl text-black dark:text-white dark:bg-gray-900 pl-2 rounded-md outline-none focus:border-gray-400 border-2 border-transparent placeholder:text-gray-500 dark:placeholder:text-white/65 hover:scale-[1.05] transition-all duration-150 shadow-md shadow-gray-400 dark:shadow-[1px_2px_5px_1px_rgb(10,10,10)]`}
                            list="suggestions"
                            value={searchInput}
                            onChange={(e) => fetchChosenType(e.target.value)}
                        />
                        {searchInput.length > 1 && (
                            <datalist id="suggestions">
                                {suggestions.map((item, i) => (
                                    <option key={i} value={item} />
                                ))}
                            </datalist>
                        )}
                        <select className={`${optionsStyle}`} onChange={(e) => fetchDay(e.target.value)}
                            disabled={searchInput == ""}>
                            <option hidden>Wybierz dzień</option>
                            {daysInSearchType.map((day, i) => (
                                <option key={i} value={day}>{day}</option>
                            ))}
                        </select>
                        <select className={`${optionsStyle}`} onChange={(e) => fetchHours(e.target.value)}
                            disabled={!dayInput}>
                            <option hidden>Wybierz godzine</option>
                            {hourSuggestions.map((hour, i) => (
                                <option key={i} value={hour}>Od {hour}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        className={`text-[32px] md:text-6xl px-7 py-1.5 rounded-lg focus:border-black focus:scale-[1.1] bg-gray-100 dark:bg-gray-900 disabled:shadow-[0px_4px_10px_4px_rgb(75,75,75)] shadow-[0px_4px_10px_4px_rgb(150,150,150)] dark:shadow-[0px_2px_10px_2px_rgb(10,10,10)] transition-all duration-150  hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${colorsSmooth} transition-transform`}
                        onClick={handleCheck}
                        disabled={(!hoursInput)}>
                        <span className={`text-black dark:text-gray-200 ${colorsSmooth} `}>
                            Sprawdź
                        </span>
                    </button>
                </div>
            )}
            {showResults && results.length > 0 && (
                formatResult()
            )}
            {errorMessage && (
                <ErrorModal message={errorMessage} onClose={closeErrorModal} />
            )}
        </div>
    );
}

export default DynamicSearch;
