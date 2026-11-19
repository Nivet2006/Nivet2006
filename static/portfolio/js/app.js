const cursorElement = document.getElementById("cursor");
if (cursorElement) {
    let cursorVisible = true;
    window.setInterval(() => {
        cursorVisible = !cursorVisible;
        cursorElement.style.opacity = cursorVisible ? "1" : "0";
    }, 500);
}

const themeToggle = document.querySelector(".theme-toggle");
const rootElement = document.documentElement;
const themeDuration = 1000;
const themeEasing = "cubic-bezier(0.22, 0.61, 0.36, 1)";
let themeTransitioning = false;

function isDarkTheme() {
    return rootElement.classList.contains("dark");
}

function updateThemeButton() {
    const dark = isDarkTheme();
    themeToggle.setAttribute("aria-pressed", String(dark));
    themeToggle.setAttribute(
        "aria-label",
        dark ? "Switch to light theme" : "Switch to dark theme"
    );
}

function applyTheme(theme) {
    const dark = theme === "dark";
    rootElement.classList.toggle("dark", dark);
    rootElement.style.colorScheme = theme;
    updateThemeButton();
    try {
        localStorage.setItem("portfolio-theme", theme);
    } catch (error) {
        // The current page theme still works when storage is unavailable.
    }
}

function getThemeWaveOrigin(button) {
    const bounds = button.getBoundingClientRect();
    return {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2
    };
}

function getFurthestCornerDistance(x, y, width, height) {
    return Math.max(
        Math.hypot(x, y),
        Math.hypot(width - x, y),
        Math.hypot(x, height - y),
        Math.hypot(width - x, height - y)
    ) + 4;
}

async function toggleTheme(button) {
    if (themeTransitioning) {
        return;
    }

    const nextTheme = isDarkTheme() ? "light" : "dark";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startViewTransition = document.startViewTransition;

    if (reducedMotion) {
        applyTheme(nextTheme);
        return;
    }

    themeTransitioning = true;
    if (typeof startViewTransition === "function") {
        const origin = getThemeWaveOrigin(button);
        const width = rootElement.clientWidth || window.innerWidth;
        const height = rootElement.clientHeight || window.innerHeight;
        const radius = getFurthestCornerDistance(origin.x, origin.y, width, height);
        let safetyTimer;

        try {
            rootElement.classList.add("theme-wave-active");
            safetyTimer = window.setTimeout(() => {
                rootElement.classList.remove("theme-wave-active");
                themeTransitioning = false;
            }, themeDuration + 400);

            const transition = startViewTransition.call(document, () => {
                applyTheme(nextTheme);
            });
            await transition.ready;

            const animation = rootElement.animate(
                [
                    { clipPath: `circle(0px at ${origin.x}px ${origin.y}px)` },
                    { clipPath: `circle(${radius}px at ${origin.x}px ${origin.y}px)` }
                ],
                {
                    duration: themeDuration,
                    easing: themeEasing,
                    pseudoElement: "::view-transition-new(root)",
                    fill: "forwards"
                }
            );
            await Promise.all([
                animation.finished.catch(() => {}),
                transition.finished.catch(() => {})
            ]);
        } catch (error) {
            rootElement.classList.remove("theme-wave-active");
            rootElement.classList.add("theme-fade");
            applyTheme(nextTheme);
            console.warn("Radial theme transition failed; using the fade fallback.", error);
            await new Promise((resolve) => {
                window.setTimeout(resolve, 450);
            });
            rootElement.classList.remove("theme-fade");
        } finally {
            window.clearTimeout(safetyTimer);
            rootElement.classList.remove("theme-wave-active");
            themeTransitioning = false;
        }
        return;
    }

    rootElement.classList.add("theme-fade");
    applyTheme(nextTheme);
    window.setTimeout(() => {
        rootElement.classList.remove("theme-fade");
        themeTransitioning = false;
    }, 450);
}

if (themeToggle) {
    updateThemeButton();
    themeToggle.addEventListener("click", () => {
        toggleTheme(themeToggle);
    });
}