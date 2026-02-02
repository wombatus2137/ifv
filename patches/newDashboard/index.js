import { waitForRender } from "../apis/waitForElement.js";
import { mapDay } from "../apis/mapTimetable.js";
import { getAssetURL } from "../apis/getAssetURL.js";

const doesHaveClickableParent = (element) => {
    if (["a", "button"].includes(element.tagName.toLowerCase())) return true;
    if (!element.parentElement) return false;
    return doesHaveClickableParent(element.parentElement);
};

const icons = [
    ["Dzisiejszy plan zajęć", "calendar_clock.svg"],
    ["Oceny od ostatniego logowania", "counter_6.svg"],
    ["Sprawdziany", "quiz.svg"],
    ["Zadania domowe", "summarize.svg"],
    ["Informacje", "folder_info.svg"],
    ["Ogłoszenia", "campaign.svg"],
    ["Ankiety", "feedback.svg"],
    ["Frekwencja", "event_available.svg"],
    ["Dyżurni", "person_raised_hand.svg"],
    ["Ważne dzisiaj", "strategy.svg"],
];

const applyIcons = () => {
    for (const [tileTitle, fileName] of icons) {
        const icon = document.createElement("img");
        icon.src = getAssetURL(`icons/${fileName}`);
        const container = Array.from(
            document.querySelectorAll(".content-container .tile.box"),
        )
            ?.find((e) => e.querySelector("h2").textContent === tileTitle)
            ?.querySelector(".tile__header.flex__items > .flex__item-auto");

        if (container) container.insertBefore(icon, container.firstChild);
        else return console.debug(`Tile ${tileTitle} not found`);

        container.parentElement?.parentElement?.addEventListener(
            "click",
            (e) => {
                if (doesHaveClickableParent(e.target)) return;
                container.parentElement.querySelector("a.tile__link")?.click();
            },
        );
    }
};

let maxLessons = 0;
const renderTimetable = () => {
    const timetableElement = document.querySelector(".plan-zajec");
    const timetable = mapDay(timetableElement);
    if (timetable.length < maxLessons) return;
    maxLessons = timetable.length;

    const elements = timetable.map((lesson) => {
        const element = document.createElement("li");
        if (lesson.type === "conflicted") {
            element.innerText = `Więcej pozycji`;
        } else {
            element.classList.add(lesson.type);
            element.innerText = `${lesson.subject} (${lesson.classroom}) ${
                lesson.type === "unknown" ? lesson.annotationText : ""
            }`;
        }
        return element;
    });

    const container = document.createElement("ol");
    container.classList.add("lessons-container");
    container.append(...elements);

    const existingContainer = document.querySelector(".lessons-container");
    if (existingContainer) {
        existingContainer.remove();
    }

    timetableElement.parentElement.insertBefore(container, timetableElement);
};

const replaceTimetable = async () => {
    await waitForRender(() => document.querySelector(".plan-zajec"));
    renderTimetable();
    const observer = new MutationObserver(renderTimetable);
    observer.observe(document.querySelector(".plan-zajec"), {
        childList: true,
        subtree: true,
    });
};

const createToolbar = async () => {
    const getContainer = () =>
        document.querySelector(
            ".content-container > .tile-container > .tile-subcontainer",
        );
    await waitForRender(getContainer);

    const element = document.createElement("div");
    element.classList.add("dashboard-info-toolbar");
    element.innerHTML = `
        <div>
            <img src="${getAssetURL("icons/star.svg")}">
            <span>-</span>
        </div>
        <div>
            <img src="${getAssetURL("icons/event_note.svg")}">
            <span>-</span>
        </div>
        <div>
            <img src="${getAssetURL("icons/mail.svg")}">
            <span>-</span>
        </div>
    </div>`;

    const container = getContainer();
    container.insertBefore(element, container.firstChild);

    const getLuckyNumber = () =>
        document.querySelector(
            ".lucky-number__circle.lucky-number__number > span",
        )?.innerText;
    waitForRender(getLuckyNumber).then(
        () =>
            (element.querySelector("div:first-of-type > span").innerText =
                getLuckyNumber()),
    );

    const getAmountOfMessages = () =>
        document.querySelector(
            'a[title="Przejdź do modułu wiadomości"] .MuiBadge-anchorOriginTopRightRectangle',
        ).innerText;
    waitForRender(getAmountOfMessages).then(
        () =>
            (element.querySelector("div:last-of-type > span").innerText =
                getAmountOfMessages()),
    );
    element.querySelector("div:last-of-type").addEventListener("click", () => {
        document
            .querySelector('a[title="Przejdź do modułu wiadomości"]')
            ?.click();
    });
};

window.appendModule({
    run: () => {
        applyIcons();
        createToolbar();
        replaceTimetable();
    },
    doesRunHere: () => window.location.href.endsWith("tablica"),
    onlyOnReloads: false,
    isLoaded: () =>
        document.querySelector(".plan-zajec") &&
        !document.querySelector(".spinner"),
});
