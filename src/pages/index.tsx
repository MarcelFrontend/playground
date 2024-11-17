import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { MajorTypes } from '@/types/type';
import { useData } from '@/contexts/DataFetchContext';
import { MdAutoFixNormal, MdAutoFixOff, FaPersonCircleQuestion, FaCalendarDays, FaDoorOpen, FaCog, GoSun, GoMoon, FaArrowDown } from '@/assets/icons'
import { IconType } from "react-icons";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useDev } from "@/contexts/DevContext";

function Index() {
  const { data, setData } = useData()
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [animationPreference, setAnimationPreference] = useState<boolean>(true);
  const [animShowed, setAnimShowed] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;

  const { isDev, setIsDev } = useDev();


  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? "dark" : "light");
  }, [])

  const handleAnimationEnd = () => {
    setAnimShowed(true);
    sessionStorage.setItem("azAnim", 'true');
  };

  function updateAnimationPreference() {
    const newAnimationPreference = !animationPreference;
    setAnimationPreference(newAnimationPreference);
    localStorage.setItem("az-anim", String(newAnimationPreference));
  }

  const colorsSmooth = "transition-colors duration-100";

  useEffect(() => {
    console.clear();
    const animationPreference = localStorage.getItem("az-anim");

    if (animationPreference === 'false') {
      setAnimationPreference(false);
    } else {
      setAnimationPreference(true);
    }
    if (!data) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('https://maramowicz.dev/azapi/database.json');
          if (!response.ok) throw new Error("Nie udało się pobrać danych");
          const jsonData: MajorTypes[] = await response.json();
          setData(jsonData)
          console.log("Po pobraniu danych:", jsonData);
        } catch (error) {
          console.error(error);
          setData(null)
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else {
      console.log("Dane istniały");
    }
  }, []);

  function ListEl({ icon: Icon, mainTask, taskDesc, index }: { icon: IconType, mainTask: string, taskDesc: string, index: number }) {
    return (
      <>
        {(animationPreference && animShowed == false) ? (
          <motion.li
            initial={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              delay: index / 2 + 1.2
            }}
            onAnimationComplete={() => index == 2 && animationPreference && handleAnimationEnd()}
            className={`relative md:min-h-48 md:w-52 lg:w-72 flex items-center flex-row md:flex-col gap-2 text-center px-4 py-1.5 md:py-5 rounded-2xl md:rounded-xl transition-shadow duration-1000 delay-500 dark:duration-1000 dark:delay-100 shadow-[0px_2px_7px_1px_rgb(200,200,200)] dark:shadow-[0px_3px_3px_1px_rgb(10,10,10)] hover:bg-gray-100/75 dark:hover:bg-gray-800/50 cursor-pointer`}
          >
            <Icon className={`text-2xl md:text-3xl text-black dark:text-white transition-colors duration-[2.25s] `} />
            <span className={`font-bold md:text-xl text-black dark:text-white transition-colors duration-[2.25s] `}>
              {mainTask}
            </span>
            <p className={`hidden md:block w-55 text-xs md:text-sm md:leading-[19px
            lg:text-lg lg:leading-[24px] text-gray-600 dark:text-gray-400 transition-colors duration-[2.5s]`}>
              {taskDesc}
            </p>
          </motion.li>
        ) : (
          <li
            className={`relative md:min-h-48 md:w-52 lg:w-72 flex items-center flex-row md:flex-col gap-2 text-center px-4 py-1.5 md:py-5 rounded-2xl md:rounded-xl transition-shadow duration-1000 delay-500 dark:duration-1000 dark:delay-100 shadow-[0px_2px_7px_1px_rgb(200,200,200)] dark:shadow-[0px_3px_3px_1px_rgb(10,10,10)] hover:bg-gray-100/75 dark:hover:bg-gray-800/50 cursor-pointer`}
          >
            <Icon className={`text-2xl md:text-3xl text-black dark:text-white transition-colors duration-[2.25s]`} />
            <span className={`font-bold md:text-xl text-black dark:text-white transition-colors duration-[2.25s]`}>
              {mainTask}
            </span>
            <p className={`hidden md:block w-55 text-xs md:text-sm md:leading-[19px
            lg:text-lg lg:leading-[24px] text-gray-600 dark:text-gray-400 transition-colors duration-[2.5s]`}>
              {taskDesc}
            </p>
          </li>
        )}
      </>
    );
  }

  return (
    <div className="h-[92vh] sm:h-screen flex items-center justify-center flex-col gap-16 md:gap-24 lg:gap-32 overflow-hidden">
      {/* Tood opcjonalne: Tu powinien być przycisk ustawień a w nim preferencje */}
      {/* Todo opcjonalne: Mini gra */}
      {/* Todo: Pokaż za pomocą procentów poprawność danych */}

      <div className="w-10 absolute top-3 right-4 md:right-3 flex items-center flex-col gap-2">
        <FaCog onClick={() => setShowSettings(!showSettings)} title="Preferencje" className="text-3xl text-center cursor-pointer hover:rotate-180 transition-transform text-black dark:text-white" />
        {showSettings && (
          <ul className="flex items-center flex-col gap-2 dark:bg-gray-950/75 p-1 rounded-lg">
            <li onClick={() => updateAnimationPreference()}>
              {animationPreference ? (
                <MdAutoFixNormal title="Wyłącz animacje" className="relative -left-[1.1px] -bottom-[1.1px] text-4xl cursor-pointer text-black dark:text-white" />
              ) : (
                <MdAutoFixOff title="Włącz animacje" className="relative -left-[2.6px] -bottom-[2.6px] text-4xl cursor-pointer text-black dark:text-white" />
              )}
            </li>
            <li
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="cursor-pointer">
              {currentTheme === 'dark' ? (
                <GoSun title="Włącz ciemny motyw" className="h-9 w-auto text-black dark:text-white hover:text-yellow-200 transition-colors duration-500" />
              ) : (
                <GoMoon title="Włącz jasny motyw" className="h-9 w-auto text-black dark:text-white hover:text-blue-800 transition-colors duration-500" />
              )}
            </li>
          </ul>
        )}
      </div>
      {(animationPreference && animShowed == false) ? (
        <motion.div
          initial={{
            opacity: 0,
            translateY: 50,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            duration: 1,
            ease: "easeOut",
          }}
          className={`text-2xl md:text-3xl lg:text-5xl text-center text-black dark:text-white ${colorsSmooth} select-none`}>
          Witam w
          <br />
          <b>AZ Essentials</b>
        </motion.div>
      ) : (
        <div
          className={`text-2xl md:text-3xl lg:text-5xl text-center text-black dark:text-white select-none`}>
          Witam w
          <br />
          <b>AZ Essentials</b>
        </div>
      )}

      <div className="flex items-center flex-col gap-1 lg:gap-5">
        {(animationPreference && animShowed == false) ? (
          <motion.span
            initial={{
              opacity: -1,
              translateY: 50,
            }}
            animate={{
              opacity: 1,
              translateY: 0
            }}
            transition={{
              duration: 0.5,
              ease: "linear",
              delay: 0.75
            }}
            className={`text-black dark:text-white md:text-xl lg:text-2xl select-none`}>
            Co chcesz zrobić?
          </motion.span>
        ) : (
          <span
            className={`text-black dark:text-white md:text-xl lg:text-2xl select-none`}>
            Co chcesz zrobić?
          </span>
        )}
        <ul
          className={`flex flex-col md:flex-row gap-5 py-3 pr-1 ${colorsSmooth}`}>
          <Link href="d-w?sT=p">
            <ListEl icon={FaDoorOpen} mainTask="Wyświetl info o sali" taskDesc="Podaj numer sali, dzień i godzinę, aby sprawdzić, jakie zajęcia się odbędą." index={0} />
          </Link>
          <Link href="d-w?sT=t">
            <ListEl icon={FaPersonCircleQuestion} mainTask="Znajdź wykładowcę" taskDesc="Podaj imię, dzień i godzinę, aby zobaczyć, gdzie dany wykładowca ma zajęcia." index={1} />
          </Link>
          <Link href="k">
            <ListEl icon={FaCalendarDays} mainTask="Sprawdź plan zajęć" taskDesc="Wybierz kierunek i dzień, aby zobaczyć listę przyszłych zajęć." index={2} />
          </Link>
        </ul>
      </div>
      <div className="w-full absolute bottom-0">
        <span
          onDoubleClick={() => setIsDev(!isDev)}
          className={`absolute bottom-1 left-2 lg:text-xl leading-3 ${isDev ? "text-red-300 dark:text-red-900" : "text-gray-400 dark:text-gray-700"}`}>
          Beta
        </span>
        {(animationPreference && animShowed == false) ? (
          <motion.span
            initial={{ translateY: 0 }}
            animate={{
              translateY: isLoading ? [0, -10, 1, -10, 0] : 0
            }}
            transition={{
              duration: 1,
              ease: 'linear',
              repeat: isLoading ? Infinity : 0,
              repeatType: "loop"
            }}
            className="absolute bottom-1 right-0">
            <FaArrowDown className={`text-2xl left-1/2 -translate-x-1/2 ${isLoading && "text-yellow-200 dark:text-yellow-900"} ${!isLoading && data && "text-green-200 dark:text-green-900"} ${!isLoading && data === null && "text-red-300 dark:text-red-900"} transition-colors duration-100`} />
          </motion.span>
        ) : (
          <span className="absolute bottom-1 right-0">
            <FaArrowDown className={`text-2xl left-1/2 -translate-x-1/2 ${isLoading && "text-yellow-200 dark:text-yellow-900"} ${!isLoading && data && "text-green-200 dark:text-green-900"} ${!isLoading && data === null && "text-red-300 dark:text-red-900"} transition-colors duration-100`} />
          </span>
        )}
      </div>
    </div>
  );
}

export default Index;