import { getAssetURL } from "../apis/getAssetURL.js";

const createButton = () => {
    const button = document.createElement("button");
    button.classList.add("justify-abstence");
    button.innerHTML = `<img src="${getAssetURL("icons/stylus.svg")}"> Usprawiedliw`;
    button.addEventListener("click", () => {
        document
            .querySelector(".app__content__header > .toolbar > button")
            .click();
    });
    document
        .querySelector(
            window.innerWidth < 1024
                ? ".app__content > .mobile__frame"
                : ".app__content > .desktop__frame",
        )
        .appendChild(button);
};

window.appendModule({
    run: createButton,
    doesRunHere: () => window.location.href.endsWith("frekwencja"),
    onlyOnReloads: false,
    isLoaded: () =>
        document.querySelector(
            ".app__content > .mobile__frame, .app__content > .desktop__frame",
        ) &&
        document.querySelector(".app__content__header > .toolbar > button") &&
        !document.querySelector(".spinner"),
});
