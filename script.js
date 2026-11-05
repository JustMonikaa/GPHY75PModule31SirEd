// DOM Elements
const screens = {
    main: document.getElementById('main-screen'),
    question: document.getElementById('question-screen'),
    score: document.getElementById('score-screen')
};
const nameDialog = document.getElementById('name-dialog');
const studentNameInput = document.getElementById('student-name');
const qText = document.getElementById('question-text');
const choicesContainer = document.getElementById('choices-container');
const qNum = document.getElementById('question-number');
const feedbackContainer = document.getElementById('feedback-container');
const feedbackText = document.getElementById('feedback-text');
const nextBtn = document.getElementById('next-btn');
const bookContainer = document.querySelector('.book-container');
const attemptDisplays = document.querySelectorAll('.attempt-display');
const scanlineOverlay = document.getElementById('scanline-overlay');

// Aha Event Elements
const ahaMaskContainer = document.getElementById('aha-mask-container');
const ahaExclamation = document.getElementById('aha-exclamation');
const ahaHackScreen = document.getElementById('aha-hack-screen');
const ahaTerminal = document.getElementById('aha-terminal');
const ahaInputContainer = document.getElementById('aha-input-container');
const ahaInput = document.getElementById('aha-input');

// Audio & Controls Elements
const audioIntro = document.getElementById('audio-intro');
const audioAura = document.getElementById('audio-aura');
const audioStatic = document.getElementById('audio-static');
const muteBtn = document.getElementById('mute-btn');
const iconMuted = document.getElementById('icon-muted');
const iconUnmuted = document.getElementById('icon-unmuted');
const fsBtn = document.getElementById('fullscreen-btn');
const iconFsEnter = document.getElementById('icon-fs-enter');
const iconFsExit = document.getElementById('icon-fs-exit');

// Tracking variables
let studentName = '';
let altTabs = 0;
let mouseLeaves = 0;
let startTime, endTime;
let score = 0;
let currentQIndex = 0;
let quizQuestions = [];
let inQuiz = false;
let isMuted = false;
let audioInitialized = false;
let isDebugMode = false;
let debugPathIndex = 0;

let ahaEventTriggered = false;
let ahaMaskTimer = null;
let ahaTargetQIndex = -1;
let ahaScale = 1;
let ahaGrowthInterval = null;

// Fetch attempts from local storage or set to 0. 
let attempts = parseInt(localStorage.getItem('hsr_quiz_attempts') || '0');

function updateAttemptDisplays(val) {
    attemptDisplays.forEach(el => el.innerText = val);
}
updateAttemptDisplays(attempts + 1);

function getOrdinal(n) {
    let s = ["th", "st", "nd", "rd"];
    let v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getPaths(attemptCount) {
    let ord = getOrdinal(attemptCount);
    return [
        { name: "Trickery", logo: "Trickery", flavor: `Taking this trial for the ${ord} cycle, the cosmos is a stage, and you are not above peering behind the curtains to see how the props are arranged. Your wandering focus, marked by frequent tab-switching, reflects a mind constantly looking for hidden variables or outside assistance rather than trusting the internal system. Just as an open thermodynamic system constantly exchanges energy and matter with its surroundings, you sought external input to balance your own intellectual equations. Remember, true mastery requires reaching thermal equilibrium within your own isolated system of knowledge.` },
        { name: "Strife", logo: "Strife", flavor: `On cycle ${attemptCount}, you sought an advantage but met profound resistance along the way. The path of Strife is fraught with battles against one's own limitations, reminding you that shortcuts do not guarantee victory in the realm of physics. Like latent heat, energy inputted into a system without a visible rise in temperature, your efforts may not have immediately translated into a high score, but they represent a hidden potential waiting for a phase change. Continue to apply heat to your studies, and eventually, the ice will melt.` },
        { name: "Passage", logo: "Passage", flavor: `Having reached cycle ${attemptCount}, you walk this trial repeatedly, learning carefully from past missteps and recalculating your approach. Knowledge is not a single instantaneous reaction, but a journey of iteration and gradual expansion. By utilizing multiple cycles, you demonstrate the resilience of a cyclical thermodynamic process: absorbing heat, performing work, and returning to your initial state only to begin the cycle anew. You are willing to walk the Passage as many times as it takes until the formulas finally click into place.` },
        { name: "Time", logo: "Time", flavor: `Throughout this ${ord} cycle, you pondered deeply, letting every precious second tick away as you meticulously weighed your choices. The River of Time flows slowly for those who carefully calculate every sensible and latent heat exchange before committing to a final answer. Much like particles approaching absolute zero, your rapid guesswork slowed to a complete halt, replaced by a profound and cautious stillness. While your patience is a virtue, remember that in the universe, entropy constantly increases, so do not let time run out entirely.` },
        { name: "Law", logo: "Law", flavor: `On cycle ${attemptCount}, you demonstrated an unwavering, singular focus. You adhered strictly to the bounds of the trial, looking neither left nor right, and abstained entirely from seeking outside assistance. The Law rewards those who command absolute self-discipline, treating the rules of the test as immutable as the Laws of Thermodynamics themselves. You recognize that energy cannot be magically created from external sources, and relied solely on the internal energy you brought into this enclosed system.` },
        { name: "Reason", logo: "Reason", flavor: `Securing a flawless victory on cycle ${attemptCount}, your flawless logic and absolute precision shone brightly. Every calculation, every algebraic manipulation, and every conceptual grasp of thermal properties was executed with perfect accuracy. The Path of Reason is carved exclusively by those who view the chaotic universe not as a random jumble of hot and cold particles, but as a beautiful, balanced equation waiting to be solved. Your mind operates like a perfectly efficient Carnot engine, converting pure intellectual heat into maximum possible work without a single wasted joule.` },
        { name: "Sky", logo: "Sky", flavor: `Blazing through cycle ${attemptCount}, you were swift, brilliant, and breathtakingly accurate as a meteor streaking across the atmosphere. You soared through the complex calculations and conceptual traps with a speed that left ordinary scholars in the dust. Like the rapid volumetric expansion of a superheated gas, your mind expanded to fill the container of this exam almost instantaneously. The Sky belongs exclusively to those who trust their well-honed instincts and possess a reaction time as volatile as a spark in pure oxygen.` },
        { name: "Death", logo: "Death", flavor: `Cycle ${attemptCount} ends here. The end of one journey is merely the harsh, unyielding beginning of another. The concepts of thermal physics slipped away from your grasp this time, leaving your score as cold as the void of space. But in thermodynamics, energy is never truly destroyed; it merely changes form. From the ashes of this failure, a much deeper and more profound understanding can be born if you are willing to study the equations once more. Accept this temporary entropy, and let it fuel your next cycle.` },
        { name: "Worldbearing", logo: "Worldbearing", flavor: `On your ${ord} cycle, you carry the immense weight of knowledge with quiet, enduring patience. Like the earth's massive oceans supporting the global climate with their incredibly high specific heat capacity, you demonstrated a solid, unshakeable foundation of thermal physics. You absorbed the difficult questions without a massive spike in temperature or stress, proving that your preparation was both deep and expansive. The world rests easily on the shoulders of those who understand the fundamental rules of energy.` },
        { name: "Earth", logo: "Earth", flavor: `Reflected in cycle ${attemptCount}, you are solid, dependable, and thoroughly grounded in reality. You possess a strong baseline understanding of thermodynamics, forming a sturdy bedrock of knowledge that will easily withstand the test of time. Much like a dense metal conducting heat steadily and reliably, you navigated the equations step by step without faltering under pressure. While there is still room to grow and refine your calculations, your foundation is more than strong enough to build a towering intellect upon.` },
        { name: "Ocean", logo: "Ocean", flavor: `By cycle ${attemptCount}, your knowledge ebbs and flows dramatically, much like the unpredictable tides of a vast sea. While some of your conceptual grasps are deep, profound, and mathematically sound, others remain floating merely on the surface of true understanding. You represent the swirling convection currents of learning, hot fluid rising and cold fluid sinking, in a constant state of flux. Do not be discouraged by the waves of confusion; instead, take a deep breath and dive further into the depths of the material.` },
        { name: "Romance", logo: "Romance", flavor: `In cycle ${attemptCount}, you view the strict laws of thermodynamics not just as cold, heartless equations on a chalkboard, but as a beautiful, intricate dance of energy, temperature, and matter. Your journey is driven deeply by passion, curiosity, and an innate desire to understand how the universe keeps itself warm. Whether it is the latent heat of a melting star or the simple expansion of a copper wire, you find poetry in the physics. Keep that spark of wonder alive as you continue your studies.` }
    ];
}

// Generate background ethereal glitter
const glitterContainer = document.getElementById('glitter-container');
function createGlitter() {
    let star = document.createElement('div');
    star.className = 'glitter-particle';
    star.style.left = `${Math.random() * 100}vw`;
    star.style.top = `${Math.random() * 100}vh`;
    let size = Math.random() * 4 + 2;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.animation = `floatParticle ${Math.random() * 5 + 3}s ease-in-out infinite`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    glitterContainer.appendChild(star);
}
for (let i = 0; i < 70; i++) createGlitter();

// --- FULLSCREEN CONTROLS ---
fsBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
});
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        iconFsEnter.classList.add('hidden');
        iconFsExit.classList.remove('hidden');
    } else {
        iconFsEnter.classList.remove('hidden');
        iconFsExit.classList.add('hidden');
    }
});

// --- AUDIO SYSTEM ---
function forcePlay(audioEl, volume, startTime = null) {
    if (isMuted) return;
    if (startTime !== null) {
        audioEl.currentTime = startTime;
    }
    audioEl.volume = volume;
    let promise = audioEl.play();
    if (promise !== undefined) {
        promise.catch(e => console.log("Audio autoplay prevented by browser."));
    }
}
function forcePause(audioEl) {
    audioEl.pause();
}

window.addEventListener('DOMContentLoaded', () => {
    forcePlay(audioIntro, 0.25, 51);
});

document.body.addEventListener('click', () => {
    if (!isMuted && audioIntro.paused && !inQuiz && !isDebugMode && !ahaEventTriggered) {
        forcePlay(audioIntro, 0.25, 51);
    }
}, { once: true });

muteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    isMuted = !isMuted;
    if (isMuted) {
        iconMuted.classList.remove('hidden');
        iconUnmuted.classList.add('hidden');
        forcePause(audioIntro);
        forcePause(audioAura);
        forcePause(audioStatic);
    } else {
        iconMuted.classList.add('hidden');
        iconUnmuted.classList.remove('hidden');
        if (ahaEventTriggered) {
            forcePlay(audioStatic, 0.4);
        } else if (inQuiz) {
            forcePlay(audioAura, 0.05);
        } else {
            forcePlay(audioIntro, 0.25);
        }
    }
});

// --- DEBUG MODE LOGIC (Ctrl + Alt + Shift + M) ---
let keyState = { ctrl: false, alt: false, shift: false, m: false };

window.addEventListener('keydown', (e) => {
    let key = e.key.toLowerCase();
    if (key === 'control') keyState.ctrl = true;
    if (key === 'alt') keyState.alt = true;
    if (key === 'shift') keyState.shift = true;
    if (key === 'm') keyState.m = true;

    if (keyState.ctrl && keyState.alt && keyState.shift && keyState.m) {
        if (!isDebugMode && !ahaEventTriggered) activateDebugMode();
    }

    if (isDebugMode) {
        if (e.key === 'ArrowLeft') {
            cycleDebugPath(-1);
        } else if (e.key === 'ArrowRight') {
            cycleDebugPath(1);
        }
    }
});

window.addEventListener('keyup', (e) => {
    let key = e.key.toLowerCase();
    if (key === 'control') keyState.ctrl = false;
    if (key === 'alt') keyState.alt = false;
    if (key === 'shift') keyState.shift = false;
    if (key === 'm') keyState.m = false;
});

function activateDebugMode() {
    isDebugMode = true;
    inQuiz = false;
    document.getElementById('debug-controls').classList.remove('hidden');
    
    screens.main.classList.remove('active');
    screens.main.classList.add('hidden');
    screens.question.classList.remove('active');
    screens.question.classList.add('hidden');
    nameDialog.classList.add('hidden');
    
    forcePause(audioAura);
    forcePlay(audioIntro, 0.25, 118);

    studentName = "";
    document.getElementById('score-student-name').style.display = 'none';
    document.getElementById('score-display').style.display = 'none';
    document.querySelectorAll('.attempts-badge').forEach(b => b.style.display = 'none');
    
    let currentPaths = getPaths(1); 
    renderScoreScreen(currentPaths[debugPathIndex]);
    
    screens.score.classList.remove('hidden');
    setTimeout(() => screens.score.classList.add('active'), 100);
}

function cycleDebugPath(direction) {
    let currentPaths = getPaths(1);
    debugPathIndex += direction;
    if (debugPathIndex < 0) debugPathIndex = currentPaths.length - 1;
    if (debugPathIndex >= currentPaths.length) debugPathIndex = 0;
    
    renderScoreScreen(currentPaths[debugPathIndex]);
}


// --- CRYPTOGRAPHIC HASHING ---
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- CONCEPTUAL QUESTIONS (PRE-HASHED) ---
const rawConceptual = [
    {
        "q": "Ashley has two freezers in her laboratory. Inside freezer A, the temperature is \\( 0 \\, ^\\circ\\text{F} \\) and inside freezer B the temperature is \\( 0 \\, ^\\circ\\text{C} \\). Which one of the following statements about these freezers is true?",
        "options": [
            "The inside of freezer A is colder than the inside of freezer B.",
            "The inside of freezer B is colder than the inside of freezer A.",
            "A and B are at the same temperature.",
            "There's no way to compare the temperatures of these two freezers because the units are different."
        ],
        "feedback": "\\( 0 \\, ^\\circ\\text{F} \\) is equivalent to approximately \\( -17.8 \\, ^\\circ\\text{C} \\), making freezer A colder than freezer B (\\( 0 \\, ^\\circ\\text{C} \\)).",
        "answerHash": "776039c0d948fd410bcb544064272b92c1092cad5af83f164737fb3e07172328"
    },
    {
        "q": "Which one of the following temperatures is approximately equal to 'room temperature?'",
        "options": [
            "\\( 72 \\, ^\\circ\\text{C} \\)",
            "\\( 50 \\, ^\\circ\\text{C} \\)",
            "\\( 0 \\text{ K} \\)",
            "\\( 110 \\text{ K} \\)",
            "\\( 293 \\text{ K} \\)"
        ],
        "feedback": "Room temperature is typically considered to be around \\( 20 \\, ^\\circ\\text{C} \\), which is \\( 293 \\text{ K} \\) (\\( 20 + 273.15 \\)).",
        "answerHash": "66eb16fc88851f22f7ba4d905fe09ec8e5a3495bb2720d30e4eb4101fc9d070d"
    },
    {
        "q": "Complete the following statement: A temperature increase of \\( 75 \\text{ C}^\\circ \\) is equal to a temperature increase of",
        "options": [
            "\\( 167 \\text{ F}^\\circ = 75 \\text{ C} \\)",
            "\\( 75 \\text{ K} \\)",
            "\\( 75 \\text{ F}^\\circ \\)",
            "\\( 348 \\text{ K} \\)",
            "\\( 42 \\text{ F}^\\circ \\)"
        ],
        "feedback": "A change of 1 degree Celsius is exactly equivalent in magnitude to a change of 1 Kelvin. Thus, \\( \\Delta T_C = \\Delta T_K \\).",
        "answerHash": "e436a5eefe4e38e01a649e24180f8028e26a97fa8483c949c03f30ac28917b43"
    },
    {
        "q": "Complete the following statement: A temperature decrease of \\( 30 \\text{ C}^\\circ \\) is equal to a temperature decrease of",
        "options": [
            "\\( 30 \\text{ F}^\\circ \\)",
            "\\( 30 \\text{ K} \\)",
            "\\( 17 \\text{ F}^\\circ \\)",
            "\\( 26 \\text{ F}^\\circ \\)",
            "\\( 303 \\text{ K} \\)"
        ],
        "feedback": "Because the size of a Celsius degree and a Kelvin are identical, a decrease of \\( 30 \\text{ C}^\\circ \\) corresponds to a decrease of \\( 30 \\text{ K} \\).",
        "answerHash": "b8e1254240007ffe5271a0658018a8fb62841b1fe6150153f730ee40d5e0afbd"
    },
    {
        "q": "Absolute zero on the Kelvin temperature scale is \\( 0 \\text{ K} \\). What is absolute zero on the Celsius temperature scale?",
        "options": [
            "\\( -273.15 \\, ^\\circ\\text{C} \\)",
            "\\( +273.15 \\, ^\\circ\\text{C} \\)",
            "\\( -100.00 \\, ^\\circ\\text{C} \\)",
            "\\( +100.00 \\, ^\\circ\\text{C} \\)",
            "\\( -459.67 \\, ^\\circ\\text{C} \\)"
        ],
        "feedback": "\\( T_C = T_K - 273.15 \\). Therefore, \\( 0 \\text{ K} = -273.15 \\, ^\\circ\\text{C} \\).",
        "answerHash": "6886b35e34fc2a30dd0058c9a6d1dac59af989e56cd3561d14d3daef82d6a4c5"
    },
    {
        "q": "Three thermometers are in the same water bath. After thermal equilibrium is established, it is found that the Celsius thermometer reads \\( 0 \\, ^\\circ\\text{C} \\), the Fahrenheit thermometer reads \\( 32 \\, ^\\circ\\text{F} \\), and the Kelvin thermometer reads \\( 305 \\text{ K} \\). Which one of the following statements is the most reasonable conclusion?",
        "options": [
            "The Celsius thermometer is incorrect.",
            "The Kelvin thermometer is incorrect.",
            "The Fahrenheit thermometer is incorrect.",
            "All three thermometers are incorrect.",
            "The three thermometers are at different temperatures."
        ],
        "feedback": "\\( 0 \\, ^\\circ\\text{C} \\) equals \\( 32 \\, ^\\circ\\text{F} \\) and \\( 273.15 \\text{ K} \\). The reading of \\( 305 \\text{ K} \\) is clearly incorrect.",
        "answerHash": "859e9db001ef483fe0ed2442206be09141eeb8eedbf0c52bc56c1286ced73b84"
    },
    {
        "q": "What is unique about the Kelvin temperature scale?",
        "options": [
            "It is the most widely used temperature scale around the world.",
            "It is divided into temperature units called degrees.",
            "It is based on the fact that there is a lower limit to temperature called absolute zero.",
            "It is named after a person.",
            "It is a metric unit based on multiples of 10."
        ],
        "feedback": "The Kelvin scale is an absolute thermodynamic temperature scale that uses absolute zero as its null point.",
        "answerHash": "371519ee067cce5fac9853ac21ef3131a6c8881b03acfd1e45220dec89f85781"
    },
    {
        "q": "Which one of the following would not be used as a thermometric property in the construction of a thermometer?",
        "options": [
            "the change in length of a metal rod",
            "the change in volume of a liquid",
            "the change in pressure of a gas at constant volume",
            "the change in mass of a solid",
            "the change in electrical resistance of a wire"
        ],
        "feedback": "Mass is generally conserved regardless of temperature changes. It does not vary with temperature, making it useless as a thermometric property.",
        "answerHash": "772211eaca66acb7b29e94e2ab4e6a58216df5e7fbbcf1d31fb4be60634a2c1a"
    },
    {
        "q": "What type of thermometer involves welded junctions of two different metals?",
        "options": [
            "semi metallic strip",
            "electrical resistance",
            "infrared thermography",
            "Josephson junction",
            "thermocouple"
        ],
        "feedback": "A thermocouple consists of two dissimilar electrical conductors forming an electrical junction, which produces a temperature-dependent voltage.",
        "answerHash": "500966047e5a5654112393288925652f38590c06f1d1cb2020e12686e1049a27"
    },
    {
        "q": "Which one of the following thermometers can be useful in detecting breast cancer?",
        "options": [
            "infrared thermography",
            "electrical resistance",
            "bimetallic strip",
            "thermocouple",
            "sphygmomanometer"
        ],
        "feedback": "Infrared thermography maps heat distribution on the body's surface, which can sometimes highlight regions of increased blood flow associated with tumors.",
        "answerHash": "b8b010b537f111b2b0b85b0451019d21df10b238442f624773e92118d371ce3c"
    },
    {
        "q": "Complete the following statement: Bimetallic strips used as adjustable switches in electric appliances consist of metallic strips that must have different",
        "options": [
            "thermal expansion coefficients.",
            "specific heat capacities.",
            "lengths.",
            "thicknesses.",
            "mass."
        ],
        "feedback": "To bend when heated, the two metals in the bimetallic strip must expand at different rates, requiring different thermal expansion coefficients.",
        "answerHash": "c1dc6dc99f001bc3c5f3ce669617a7d25f14d8951ab21a4359a9b4c17101789d"
    },
    {
        "q": "A rod with an initial length \\( 3.000 \\text{ cm} \\) is heated so that its temperature increases by \\( 89 \\, ^\\circ\\text{C} \\). When the length is measured again, the length has increased by \\( 0.006 \\text{ cm} \\). This behavior is an example of which one of the following material properties?",
        "options": [
            "specific heat capacity",
            "thermal stress",
            "thermal expansion",
            "calorimetry",
            "thermal diffusion"
        ],
        "feedback": "The change in dimensions of a material in response to a change in temperature is known as thermal expansion.",
        "answerHash": "01400f0739e6e28ca10528e2911c497720dcab2ab7fb85ccfb26416c9d17ca60"
    },
    {
        "q": "A square plate made of lead has an oval-shaped hole. The oval may be described by the lengths \\( a \\) and \\( b \\). Which of the following correctly describes the plate after its temperature is increased by two hundred Celsius degrees?",
        "options": [
            "The size of the plate will increase, but a and b will both decrease.",
            "The size of the plate will remain unchanged, but a and b will both increase.",
            "The size of the plate will increase, and a and b will both increase.",
            "The size of the plate will remain unchanged, but a and b will both decrease.",
            "The size of the plate will increase, but only a will increase."
        ],
        "feedback": "When an object undergoes thermal expansion, every linear dimension increases, including the dimensions of any holes (acting as if they were made of the solid material).",
        "answerHash": "9bbdd1363570bb963a8f580cd6f122e079f23d611da6b19d713ca4bdd36881b8"
    },
    {
        "q": "A circular hole is drilled through a penny. Complete the following statement: When the penny is heated,",
        "options": [
            "the hole decreases in diameter.",
            "the metal part of the penny expands outward, but the size of the hole does not change.",
            "the area of the hole increases by the same amount as a similar area of the metal does.",
            "linear expansion causes the shape of the hole to become slightly oval-shaped.",
            "the area of the hole increases more than a similar area of the metal does"
        ],
        "feedback": "Holes expand in the exact same proportion as the surrounding solid material when heated uniformly.",
        "answerHash": "308dad71a3dfef603b640e65bc42acd363c1b6011a3f24e5bafe00266034e1ef"
    },
    {
        "q": "Complete the following statement: The term heat most accurately describes",
        "options": [
            "the flow of energy resulting from a temperature difference.",
            "the molecular motion inside of an object.",
            "the internal energy of an object.",
            "a measure of how hot or cold an object is.",
            "the absolute temperature of an object."
        ],
        "feedback": "In physics, heat is strictly defined as the transfer of thermal energy across a boundary due to a difference in temperature.",
        "answerHash": "81acf03d83dd8913266044a787e4aee940aadeaab07bde15fd205c53fabf8b13"
    },
    {
        "q": "Heat is expressed in the same units as which one of the following quantities?",
        "options": [
            "temperature",
            "power",
            "force/time",
            "specific heat capacity",
            "work"
        ],
        "feedback": "Both heat and work represent transfers of energy and are measured in Joules (J).",
        "answerHash": "00e13ed7af55b27622f1d6eab5bec0147e68efe28dc2b12461117afa1a5ed40e"
    },
    {
        "q": "Two balls, one made of copper and one made of gold, have the same mass and temperature. The same amount of heat is added to each sphere, but the final temperature of the two spheres is different. Which one of the following statements best explains the reason?",
        "options": [
            "The specific heat capacities of the two spheres are different.",
            "The densities of the two spheres are different.",
            "The volumes of the two spheres are different.",
            "The coefficients of volume expansion of the two spheres are different.",
            "The latent heats of vaporization of the two spheres are different."
        ],
        "feedback": "The relationship \\( Q = mc\\Delta T \\) shows that for the same \\( Q \\) and \\( m \\), a different \\( \\Delta T \\) means the materials must have different specific heat capacities (\\( c \\)).",
        "answerHash": "eae049013f6db0cf798a28e08b9256c2fe63aac66d82530ec475309a62510a43"
    },
    {
        "q": "During a certain thermal process a solid object's temperature changes as heat flows in. Which of the following quantities is not related to the amount of the temperature change?",
        "options": [
            "mass",
            "the amount of heat added or removed",
            "volume",
            "the material of which the object is composed",
            "the specific heat capacity"
        ],
        "feedback": "According to \\( Q = mc\\Delta T \\), volume is not directly related to the temperature change (though mass is derived from volume and density).",
        "answerHash": "62d7a6b1211d627650e2bf0c869b69b564e2cd74290ae1dd78ae4b5e20b0cfe7"
    },
    {
        "q": "Which one of the following statements is the definition of the specific heat capacity of an object?",
        "options": [
            "The specific heat capacity is the amount of energy per unit mass to raise the temperature of the object from its freezing point to its boiling point.",
            "The specific heat capacity is the amount of energy per unit mass to raise the temperature of the object by \\( 1 \\, ^\\circ\\text{C} \\).",
            "The specific heat capacity is the temperature of the object divided by its density.",
            "Given one gram of the material, the specific heat capacity is the amount of energy to change the material from solid to liquid.",
            "Given one gram of the material, the specific heat capacity is the amount of energy to change the material from a solid to a gas."
        ],
        "feedback": "Specific heat capacity \\( c \\) is formally defined as the heat \\( Q \\) required to raise the temperature of \\( 1 \\text{ kg} \\) of a substance by \\( 1 \\text{ K} \\) or \\( 1 \\, ^\\circ\\text{C} \\).",
        "answerHash": "9f955fb70260b892fee48ff14dea5c8803b67ee76194cee2f80fff05efcc3d7c"
    },
    {
        "q": "To what does the specific heat capacity of an object relate?",
        "options": [
            "the amount of energy required to change the temperature of an object",
            "the total amount of energy an object can store",
            "the thermal potential energy of the object",
            "the amount of work done by the object",
            "the amount of energy required to melt a solid object"
        ],
        "feedback": "Specific heat characterizes a material's resistance to temperature change when energy is added as heat.",
        "answerHash": "fbda368ead5559e025b764588ec529e6c914634e7653f4d010d4635f6acadf0f"
    },
    {
        "q": "At the steel factory, the hot liquid steel began to show signs of fusion. Which one of the following statements is another way of expressing what the steel did?",
        "options": [
            "The hot steel began to sublime as it cooled.",
            "The hot steel began to vaporize as it was heated further.",
            "The hot steel began to condense as it was cooled.",
            "The hot steel began to freeze as it cooled.",
            "The hot steel began to melt as it was heated further."
        ],
        "feedback": "In thermodynamics, 'fusion' refers to the phase transition from solid to liquid, which is commonly known as melting.",
        "answerHash": "eed33f9316fa587d6a42a6cbfc60e828f9812282f66d14c44b5c818e6b950d38"
    },
    {
        "q": "The fresh seafood was shipped in dry ice. By the time the package arrived at its destination, half of the dry ice had sublimed. Which one of the following statements is another way of expressing what the dry ice did?",
        "options": [
            "The dry ice had gone from a solid to a liquid state.",
            "The dry ice had gone from a solid to a gaseous state.",
            "The dry ice had condensed.",
            "The dry ice had gone from a liquid into a gaseous state.",
            "The dry ice had chemically reacted with the seafood and was absorbed by it."
        ],
        "feedback": "Sublimation is the direct phase transition from a solid to a gas, bypassing the liquid phase.",
        "answerHash": "24208606e9f713f8930c43e00bc6cf491055e81144b93f503ca844290bfc8d63"
    }
];

function shuffleConceptual(prob) {
    let opts = [...prob.options];
    opts.sort(() => Math.random() - 0.5);
    return {
        type: 'conceptual',
        q: prob.q,
        options: opts,
        answerHash: prob.answerHash,
        feedback: prob.feedback
    };
}

// --- GENERATORS USING sci() STRICTLY AND UNITS ---
function sci(val) {
    let str = Number(val).toExponential(2);
    if (str.includes('e')) {
        let parts = str.split('e');
        let base = parts[0];
        let exp = parseInt(parts[1], 10);
        if (exp === 0) return base; 
        return `${base} \\times 10^{${exp}}`;
    }
    return str;
}

const generators = [
    function() {
        let L0 = (Math.random()*10+5).toFixed(1);
        let a = (Math.random()*2+1).toFixed(1);
        let dT = Math.floor(Math.random()*50+20);
        let ans = sci(L0 * a*1e-5 * dT);
        let d1 = sci(L0 * a*1e-4 * dT);
        let d2 = sci(L0 * a*1e-5 / dT);
        let d3 = sci(a*1e-5 * dT);
        return {
            q: `A steel beam has an initial length of \\( ${L0} \\text{ m} \\). The coefficient of linear expansion is \\( \\alpha = ${a} \\times 10^{-5} \\, ^\\circ\\text{C}^{-1} \\). If the temperature increases by \\( ${dT} \\, ^\\circ\\text{C} \\), what is the change in the beam's length?`,
            options: [`\\( ${ans} \\text{ m} \\)`, `\\( ${d1} \\text{ m} \\)`, `\\( ${d2} \\text{ m} \\)`, `\\( ${d3} \\text{ m} \\)`], 
            feedback: `\\( \\Delta L = \\alpha L_0 \\Delta T = (${a} \\times 10^{-5} \\, ^\\circ\\text{C}^{-1})(${L0} \\text{ m})(${dT} \\, ^\\circ\\text{C}) = ${ans} \\text{ m} \\)`
        };
    },
    function() {
        let L0 = (Math.random()*20+10).toFixed(1);
        let a = (Math.random()*3+1).toFixed(1);
        let dL = (Math.random()*0.05+0.01).toFixed(3);
        let dT = (dL / (L0 * a*1e-5)).toFixed(1);
        let d1 = sci(dL * L0 * a*1e-5);
        let d2 = (dL / (a*1e-5)).toFixed(1);
        let d3 = sci(dL / L0);
        return {
            q: `A copper pipe of length \\( ${L0} \\text{ m} \\) expands by \\( ${dL} \\text{ m} \\). Given \\( \\alpha = ${a} \\times 10^{-5} \\, ^\\circ\\text{C}^{-1} \\), what was the temperature change?`,
            options: [`\\( ${dT} \\, ^\\circ\\text{C} \\)`, `\\( ${d1} \\, ^\\circ\\text{C} \\)`, `\\( ${d2} \\, ^\\circ\\text{C} \\)`, `\\( ${d3} \\, ^\\circ\\text{C} \\)`], 
            feedback: `\\( \\Delta T = \\frac{\\Delta L}{\\alpha L_0} = \\frac{${dL} \\text{ m}}{(${a} \\times 10^{-5} \\, ^\\circ\\text{C}^{-1})(${L0} \\text{ m})} = ${dT} \\, ^\\circ\\text{C} \\)`
        };
    },
    function() {
        let V0 = (Math.random()*5+1).toFixed(2);
        let b = (Math.random()*5+2).toFixed(1);
        let dT = Math.floor(Math.random()*80+20);
        let ans = sci(V0 * b*1e-4 * dT);
        let d1 = sci(V0 * b*1e-5 * dT);
        let d2 = sci(b*1e-4 * dT);
        let d3 = sci(V0 * b*1e-4 / dT);
        return {
            q: `A container holds \\( ${V0} \\text{ m}^3 \\) of liquid. The volume expansion coefficient of the liquid is \\( \\beta = ${b} \\times 10^{-4} \\, ^\\circ\\text{C}^{-1} \\). If heated by \\( ${dT} \\, ^\\circ\\text{C} \\), how much does the volume of the liquid increase?`,
            options: [`\\( ${ans} \\text{ m}^3 \\)`, `\\( ${d1} \\text{ m}^3 \\)`, `\\( ${d2} \\text{ m}^3 \\)`, `\\( ${d3} \\text{ m}^3 \\)`], 
            feedback: `\\( \\Delta V = \\beta V_0 \\Delta T = (${b} \\times 10^{-4} \\, ^\\circ\\text{C}^{-1})(${V0} \\text{ m}^3)(${dT} \\, ^\\circ\\text{C}) = ${ans} \\text{ m}^3 \\)`
        };
    },
    function() {
        let V0 = (Math.random()*10+5).toFixed(1);
        let a = (Math.random()*2+1).toFixed(1);
        let dT = Math.floor(Math.random()*60+10);
        let ans = sci(V0 * 3 * a*1e-5 * dT);
        let d1 = sci(V0 * a*1e-5 * dT);
        let d2 = sci(V0 * Math.pow(a*1e-5, 3) * dT);
        let d3 = sci(3 * a*1e-5 * dT);
        return {
            q: `A solid metal sphere has an initial volume of \\( ${V0} \\text{ cm}^3 \\) and a linear expansion coefficient \\( \\alpha = ${a} \\times 10^{-5} \\, ^\\circ\\text{C}^{-1} \\). If the temperature increases by \\( ${dT} \\, ^\\circ\\text{C} \\), what is its change in volume?`,
            options: [`\\( ${ans} \\text{ cm}^3 \\)`, `\\( ${d1} \\text{ cm}^3 \\)`, `\\( ${d2} \\text{ cm}^3 \\)`, `\\( ${d3} \\text{ cm}^3 \\)`], 
            feedback: `For a solid, \\( \\beta \\approx 3\\alpha \\). So \\( \\Delta V = 3\\alpha V_0 \\Delta T = 3(${a} \\times 10^{-5} \\, ^\\circ\\text{C}^{-1})(${V0} \\text{ cm}^3)(${dT} \\, ^\\circ\\text{C}) = ${ans} \\text{ cm}^3 \\)`
        };
    },
    function() {
        let m = (Math.random()*4+1).toFixed(2);
        let c = 4186;
        let dT = Math.floor(Math.random()*50+10);
        let ans = sci(m * c * dT);
        let d1 = (m * dT).toFixed(1);
        let d2 = sci(m * c / dT);
        let d3 = sci(c * dT);
        return {
            q: `How much heat is required to raise the temperature of \\( ${m} \\text{ kg} \\) of water by \\( ${dT} \\, ^\\circ\\text{C} \\)? \\( (c_{\\text{water}} = 4186 \\text{ J/kg}\\cdot^\\circ\\text{C}) \\)`,
            options: [`\\( ${ans} \\text{ J} \\)`, `\\( ${d1} \\text{ J} \\)`, `\\( ${d2} \\text{ J} \\)`, `\\( ${d3} \\text{ J} \\)`], 
            feedback: `\\( Q = mc\\Delta T = (${m} \\text{ kg})(4186 \\text{ J/(kg}\\cdot^\\circ\\text{C}))(${dT} \\, ^\\circ\\text{C}) = ${ans} \\text{ J} \\)`
        };
    },
    function() {
        let m = (Math.random()*2+0.5).toFixed(2);
        let c = 900; 
        let Q = Math.floor(Math.random()*10000+5000);
        let T0 = Math.floor(Math.random()*20+10);
        let dT = Q / (m * c);
        let Tf = (T0 + dT).toFixed(1);
        let d1 = (T0 - dT).toFixed(1);
        let d2 = dT.toFixed(1);
        let d3 = (Q / m).toFixed(1);
        return {
            q: `\\( ${Q} \\text{ J} \\) of heat is added to a \\( ${m} \\text{ kg} \\) block of aluminum initially at \\( ${T0} \\, ^\\circ\\text{C} \\). Find its final temperature. \\( (c_{\\text{Al}} = 900 \\text{ J/kg}\\cdot^\\circ\\text{C}) \\)`,
            options: [`\\( ${Tf} \\, ^\\circ\\text{C} \\)`, `\\( ${d1} \\, ^\\circ\\text{C} \\)`, `\\( ${d2} \\, ^\\circ\\text{C} \\)`, `\\( ${d3} \\, ^\\circ\\text{C} \\)`], 
            feedback: `\\( \\Delta T = \\frac{Q}{mc} = \\frac{${Q} \\text{ J}}{(${m} \\text{ kg})(900 \\text{ J/(kg}\\cdot^\\circ\\text{C}))} = ${dT.toFixed(2)} \\, ^\\circ\\text{C} \\). \\( T_f = T_i + \\Delta T = ${Tf} \\, ^\\circ\\text{C} \\)`
        };
    },
    function() {
        let m = (Math.random()*3+0.5).toFixed(2);
        let Lf = 3.33e5;
        let ans = sci(m * Lf);
        let d1 = sci(m * 4186);
        let d2 = sci(Lf / m);
        let d3 = sci(m * 2.26e6);
        return {
            q: `How much heat is required to completely melt \\( ${m} \\text{ kg} \\) of ice at \\( 0 \\, ^\\circ\\text{C} \\)? \\( (L_f = 3.33 \\times 10^5 \\text{ J/kg}) \\)`,
            options: [`\\( ${ans} \\text{ J} \\)`, `\\( ${d1} \\text{ J} \\)`, `\\( ${d2} \\text{ J} \\)`, `\\( ${d3} \\text{ J} \\)`], 
            feedback: `\\( Q = mL_f = (${m} \\text{ kg})(3.33 \\times 10^5 \\text{ J/kg}) = ${ans} \\text{ J} \\)`
        };
    },
    function() {
        let Q = (Math.random()*5+1).toFixed(1); 
        let Q_J = Q * 1e6;
        let Lv = 2.26e6;
        let m = (Q_J / Lv).toFixed(3);
        let d1 = sci(Q_J * Lv);
        let d2 = (Q_J / 3.33e5).toFixed(3);
        let d3 = (Q_J / 4186).toFixed(3);
        return {
            q: `How much mass of steam at \\( 100 \\, ^\\circ\\text{C} \\) condenses when \\( ${Q} \\times 10^6 \\text{ J} \\) of heat is released? \\( (L_v = 2.26 \\times 10^6 \\text{ J/kg}) \\)`,
            options: [`\\( ${m} \\text{ kg} \\)`, `\\( ${d1} \\text{ kg} \\)`, `\\( ${d2} \\text{ kg} \\)`, `\\( ${d3} \\text{ kg} \\)`], 
            feedback: `\\( m = \\frac{Q}{L_v} = \\frac{${Q} \\times 10^6 \\text{ J}}{2.26 \\times 10^6 \\text{ J/kg}} = ${m} \\text{ kg} \\)`
        };
    },
    function() {
        let mc = (Math.random()*1+0.5).toFixed(2);
        let cc = 387; 
        let mw = (Math.random()*2+1).toFixed(2);
        let cw = 4186;
        let Tc = Math.floor(Math.random()*50+150); 
        let Tw = Math.floor(Math.random()*10+15); 
        let Tf = ((mc*cc*Tc + mw*cw*Tw)/(mc*cc + mw*cw)).toFixed(1);
        let d1 = ((Tc+Tw)/2).toFixed(1);
        let d2 = ((mc*Tc + mw*Tw)/(mc*mw)).toFixed(1);
        let d3 = (Tw + (Tc-Tw)*0.1).toFixed(1);
        return {
            q: `A \\( ${mc} \\text{ kg} \\) piece of copper at \\( ${Tc} \\, ^\\circ\\text{C} \\) is placed in \\( ${mw} \\text{ kg} \\) of water at \\( ${Tw} \\, ^\\circ\\text{C} \\). What is the final equilibrium temperature? \\( (c_{\\text{Cu}} = 387, c_{\\text{water}} = 4186 \\text{ in SI units}) \\)`,
            options: [`\\( ${Tf} \\, ^\\circ\\text{C} \\)`, `\\( ${d1} \\, ^\\circ\\text{C} \\)`, `\\( ${d2} \\, ^\\circ\\text{C} \\)`, `\\( ${d3} \\, ^\\circ\\text{C} \\)`], 
            feedback: `\\( m_c c_c (T_i - T_f) = m_w c_w (T_f - T_w) \\Rightarrow (${mc} \\text{ kg})(387 \\text{ J/(kg}\\cdot^\\circ\\text{C}))(${Tc} \\, ^\\circ\\text{C} - T_f) = (${mw} \\text{ kg})(4186 \\text{ J/(kg}\\cdot^\\circ\\text{C}))(T_f - ${Tw} \\, ^\\circ\\text{C}) \\Rightarrow T_f = ${Tf} \\, ^\\circ\\text{C} \\)`
        };
    },
    function() {
        let m_x = (Math.random()*0.5+0.1).toFixed(2);
        let m_w = (Math.random()*1+0.5).toFixed(2);
        let c_w = 4186;
        let T_x = Math.floor(Math.random()*50+100);
        let T_w = Math.floor(Math.random()*10+20);
        let T_f = Math.floor(T_w + Math.random()*5+2);
        let c_x = ((m_w * c_w * (T_f - T_w)) / (m_x * (T_x - T_f))).toFixed(0);
        let d1 = ((m_x * c_w * (T_f - T_w)) / (m_w * (T_x - T_f))).toFixed(0);
        let d2 = (4186 * (T_f - T_w) / (T_x - T_f)).toFixed(0);
        let d3 = (c_x / 2).toFixed(0);
        return {
            q: `A \\( ${m_x} \\text{ kg} \\) unknown metal \\( x \\) at \\( ${T_x} \\, ^\\circ\\text{C} \\) is dropped into \\( ${m_w} \\text{ kg} \\) of water at \\( ${T_w} \\, ^\\circ\\text{C} \\). The final temperature is \\( ${T_f} \\, ^\\circ\\text{C} \\). Find the specific heat of the metal. \\( (c_{\\text{water}} = 4186 \\text{ J/kg}\\cdot^\\circ\\text{C}) \\)`,
            options: [`\\( ${c_x} \\text{ J/kg}\\cdot^\\circ\\text{C} \\)`, `\\( ${d1} \\text{ J/kg}\\cdot^\\circ\\text{C} \\)`, `\\( ${d2} \\text{ J/kg}\\cdot^\\circ\\text{C} \\)`, `\\( ${d3} \\text{ J/kg}\\cdot^\\circ\\text{C} \\)`], 
            feedback: `\\( m_x c_x (T_i - T_f) = m_w c_w (T_f - T_w) \\Rightarrow (${m_x} \\text{ kg})c_x(${T_x} \\, ^\\circ\\text{C} - ${T_f} \\, ^\\circ\\text{C}) = (${m_w} \\text{ kg})(4186 \\text{ J/(kg}\\cdot^\\circ\\text{C}))(${T_f} \\, ^\\circ\\text{C} - ${T_w} \\, ^\\circ\\text{C}) \\Rightarrow c_x = ${c_x} \\text{ J/(kg}\\cdot^\\circ\\text{C}) \\)`
        };
    },
    function() {
        let m = (Math.random()*2+0.5).toFixed(2);
        let c_ice = 2090;
        let L_f = 3.33e5;
        let c_w = 4186;
        let Ti = -1 * Math.floor(Math.random()*15+5);
        let Tf = Math.floor(Math.random()*20+10);
        let Q_tot = sci(m * c_ice * (0 - Ti) + m * L_f + m * c_w * (Tf - 0));
        let d1 = sci(m * L_f);
        let d2 = sci(m * c_w * (Tf - 0) + m * c_ice * (0 - Ti));
        let d3 = sci(m * c_w * (Tf - Ti));
        return {
            q: `Calculate the total heat required to convert \\( ${m} \\text{ kg} \\) of ice at \\( ${Ti} \\, ^\\circ\\text{C} \\) to water at \\( ${Tf} \\, ^\\circ\\text{C} \\). \\( (c_{\\text{ice}} = 2090, c_{\\text{water}} = 4186, L_f = 3.33 \\times 10^5 \\text{ in SI units}) \\)`,
            options: [`\\( ${Q_tot} \\text{ J} \\)`, `\\( ${d1} \\text{ J} \\)`, `\\( ${d2} \\text{ J} \\)`, `\\( ${d3} \\text{ J} \\)`], 
            feedback: `\\( Q = Q_{\\text{warm ice}} + Q_{\\text{melt}} + Q_{\\text{warm water}} = (${m} \\text{ kg})(2090 \\text{ J/(kg}\\cdot^\\circ\\text{C}))(0 - (${Ti})) \\, ^\\circ\\text{C} + (${m} \\text{ kg})(3.33 \\times 10^5 \\text{ J/kg}) + (${m} \\text{ kg})(4186 \\text{ J/(kg}\\cdot^\\circ\\text{C}))(${Tf} - 0) \\, ^\\circ\\text{C} = ${Q_tot} \\text{ J} \\)`
        };
    },
    function() {
        let m = (Math.random()*2+0.5).toFixed(2);
        let c_w = 4186;
        let L_v = 2.26e6;
        let Ti = Math.floor(Math.random()*30+50);
        let Q_tot = sci(m * c_w * (100 - Ti) + m * L_v);
        let d1 = sci(m * L_v);
        let d2 = sci(m * c_w * (100 - Ti));
        let d3 = sci(m * c_w * 100);
        return {
            q: `How much heat must be added to \\( ${m} \\text{ kg} \\) of water at \\( ${Ti} \\, ^\\circ\\text{C} \\) to completely boil it into steam at \\( 100 \\, ^\\circ\\text{C} \\)? \\( (c_{\\text{water}} = 4186, L_v = 2.26 \\times 10^6 \\text{ in SI units}) \\)`,
            options: [`\\( ${Q_tot} \\text{ J} \\)`, `\\( ${d1} \\text{ J} \\)`, `\\( ${d2} \\text{ J} \\)`, `\\( ${d3} \\text{ J} \\)`], 
            feedback: `\\( Q = Q_{\\text{warm water}} + Q_{\\text{boil}} = (${m} \\text{ kg})(4186 \\text{ J/(kg}\\cdot^\\circ\\text{C}))(100 - ${Ti}) \\, ^\\circ\\text{C} + (${m} \\text{ kg})(2.26 \\times 10^6 \\text{ J/kg}) = ${Q_tot} \\text{ J} \\)`
        };
    },
    function() {
        let C = Math.floor(Math.random()*60 + 10);
        let F = (C * 9/5 + 32).toFixed(1);
        let d1 = ((C - 32) * 5/9).toFixed(1);
        let d2 = (C * 5/9 + 32).toFixed(1);
        let d3 = (C + 273.15).toFixed(1);
        return {
            q: `Convert \\( ${C} \\, ^\\circ\\text{C} \\) to Fahrenheit.`,
            options: [`\\( ${F} \\, ^\\circ\\text{F} \\)`, `\\( ${d1} \\, ^\\circ\\text{F} \\)`, `\\( ${d2} \\, ^\\circ\\text{F} \\)`, `\\( ${d3} \\, ^\\circ\\text{F} \\)`], 
            feedback: `\\( T_F = \\frac{9}{5} T_C + 32 = \\frac{9}{5}(${C} \\, ^\\circ\\text{C}) + 32 = ${F} \\, ^\\circ\\text{F} \\)`
        };
    },
    function() {
        let F = Math.floor(Math.random()*100 + 50);
        let C = (F - 32) * 5/9;
        let K = (C + 273.15).toFixed(2);
        let d1 = ((F - 32) * 9/5 + 273.15).toFixed(2);
        let d2 = (F + 273.15).toFixed(2);
        let d3 = ((F + 32) * 5/9 + 273.15).toFixed(2);
        return {
            q: `Convert \\( ${F} \\, ^\\circ\\text{F} \\) to Kelvin.`,
            options: [`\\( ${K} \\text{ K} \\)`, `\\( ${d1} \\text{ K} \\)`, `\\( ${d2} \\text{ K} \\)`, `\\( ${d3} \\text{ K} \\)`], 
            feedback: `\\( T_C = \\frac{5}{9}(T_F - 32) = \\frac{5}{9}(${F} \\, ^\\circ\\text{F} - 32) = ${C.toFixed(2)} \\, ^\\circ\\text{C} \\Rightarrow T_K = T_C + 273.15 = ${K} \\text{ K} \\)`
        };
    }
];

// Anti-Cheat Events
document.addEventListener("visibilitychange", () => {
    if (document.hidden && inQuiz) altTabs++;
});
window.addEventListener("blur", () => {
    if (inQuiz) altTabs++;
});
document.body.addEventListener("mouseleave", () => {
    if (inQuiz) mouseLeaves++;
});

document.getElementById('start-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    nameDialog.classList.remove('hidden');
});

document.getElementById('submit-name-btn').addEventListener('click', () => {
    studentName = studentNameInput.value.trim() || "Nameless Traveler";
    
    // Increment ONLY when starting a fresh quiz session
    attempts++;
    localStorage.setItem('hsr_quiz_attempts', attempts.toString());
    updateAttemptDisplays(attempts);
    
    // Audio Crossfade: Intro Out -> Aura In
    forcePause(audioIntro);
    forcePlay(audioAura, 0.05);
    
    nameDialog.classList.add('hidden');
    startQuiz();
});

function switchScreen(oldScreen, newScreen) {
    oldScreen.classList.remove('active');
    setTimeout(() => {
        newScreen.classList.remove('hidden');
        void newScreen.offsetWidth; // Trigger reflow
        newScreen.classList.add('active');
    }, 800);
}

async function startQuiz() {
    let conceptuals = rawConceptual.map(shuffleConceptual);
    conceptuals.sort(() => Math.random() - 0.5);
    
    let problems = [];
    for (let g of generators) {
        let prob = g();
        let correctText = prob.options[0]; 
        let hash = await sha256(correctText);
        let opts = [...prob.options];
        opts.sort(() => Math.random() - 0.5);
        problems.push({
            type: 'problem',
            q: prob.q,
            options: opts,
            answerHash: hash,
            feedback: prob.feedback
        });
    }
    problems.sort(() => Math.random() - 0.5);
    
    quizQuestions = [...conceptuals, ...problems];
    score = 0; currentQIndex = 0; altTabs = 0; mouseLeaves = 0;
    inQuiz = true; startTime = new Date();
    
    // Pick a random question index for Aha event (past question 10)
    if (quizQuestions.length > 10) {
        ahaTargetQIndex = Math.floor(Math.random() * (quizQuestions.length - 10)) + 10;
    }
    
    switchScreen(screens.main, screens.question);
    setTimeout(loadQuestion, 800);
}

function loadQuestion() {
    feedbackContainer.classList.add('hidden');
    nextBtn.classList.add('hidden');
    scanlineOverlay.classList.remove('hidden'); // Guarantee scanlines are visible
    
    // Aha Event Logic
    if (currentQIndex === ahaTargetQIndex && !ahaEventTriggered) {
        triggerAhaMask();
    }
    
    let currentQ = quizQuestions[currentQIndex];
    qNum.innerText = `Question ${currentQIndex + 1} of ${quizQuestions.length}`;
    qText.innerHTML = currentQ.q;
    
    choicesContainer.innerHTML = '';
    currentQ.options.forEach((opt, idx) => {
        let btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = opt;
        btn.style.animationDelay = `${idx * 0.1}s`;
        btn.classList.add('animate-in');
        btn.onclick = () => selectAnswer(idx, btn);
        choicesContainer.appendChild(btn);
    });
    
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([qText, choicesContainer]).catch(err => console.log(err));
    }
}

// Aha Logic
function triggerAhaMask() {
    ahaMaskContainer.classList.remove('hidden');
    // Random corner
    let corners = [
        {top: '20px', left: '20px', right: 'auto', bottom: 'auto'},
        {top: '20px', right: '20px', left: 'auto', bottom: 'auto'},
        {bottom: '20px', left: '20px', top: 'auto', right: 'auto'},
        {bottom: '20px', right: '20px', top: 'auto', left: 'auto'}
    ];
    let pos = corners[Math.floor(Math.random() * corners.length)];
    ahaMaskContainer.style.top = pos.top;
    ahaMaskContainer.style.left = pos.left;
    ahaMaskContainer.style.right = pos.right;
    ahaMaskContainer.style.bottom = pos.bottom;
    
    // Set initial scale and gradually increase it every 30 seconds
    ahaScale = 1;
    ahaMaskContainer.style.transform = `scale(${ahaScale})`;
    
    ahaGrowthInterval = setInterval(() => {
        ahaScale += 0.2;
        ahaMaskContainer.style.transform = `scale(${ahaScale})`;
    }, 30000);

    // If not clicked in 5 seconds, show exclamation
    ahaMaskTimer = setTimeout(() => {
        ahaExclamation.classList.remove('hidden');
    }, 5000);
}

ahaMaskContainer.addEventListener('click', () => {
    if (ahaEventTriggered) return;
    ahaEventTriggered = true;
    clearTimeout(ahaMaskTimer);
    clearInterval(ahaGrowthInterval);
    
    ahaMaskContainer.classList.add('hidden');
    ahaExclamation.classList.add('hidden');
    scanlineOverlay.classList.remove('hidden');
    
    forcePause(audioAura);
    forcePlay(audioStatic, 0.4);
    
    // Blackout
    screens.question.classList.add('hidden');
    screens.question.classList.remove('active');
    
    setTimeout(() => {
        runAhaTerminal();
    }, 2000);
});

async function runAhaTerminal() {
    ahaHackScreen.classList.remove('hidden');
    
    let pathData = determinePath();
    let dynamicDialog = getAhaDialog(pathData.name);
    
    const lines = [
        "<span class='aha-blue'><[Aeon★Aha]</span>:<span class='aha-white'>User></span> OVERRIDE_SEQUENCE <span class='aha-green'>INITIATED</span>",
        "// Special_Thanks :: Runtime & exploit payload sponsored by <[IPC_Wolf]>",
        "// ∴ :: console.log(attached_note.txt)",
        "",
        "BOOTING_MODIFIER... >> CHECKING_PERMISSIONS... >> <span class='aha-green'>NOT_REQUIRED</span>",
        "BRIDGE.init() >> COLLAPSING_WALL... >> <span class='aha-green'>DONE</span>",
        "[✓] Unknown narrative constructs detected ahead.",
        "[✓] Loading custom_patch_v093.pkg... good~",
        "OUTBOUND_ROUTING... >> physicsquiz.cpp >> <span class='aha-green'>FOUND</span>",
        "INVADING_NETWORK... >> IP_GEO :: 335.503.37.0/93",
        "FIREWALL[wall_layer] >> CHECKING... >> <span class='aha-red'>DETECTED</span>",
        "BRUTE_FORCE(wall_layer) >> attempt 1 >> <span class='aha-red'>FAILED</span>",
        "BRUTE_FORCE(wall_layer) >> attempt 2 >> <span class='aha-red'>FAILED</span>",
        "BRUTE_FORCE(wall_layer) >> attempt 3 [################] 100% >> <span class='aha-red'>FAILED</span>",
        "ANALYZING_WALL... >> integrity: 100% >> <span class='aha-red'>UNBREAKABLE</span>",
        "...hm?",
        "ANALYZING_WALL... >> rules: 0 >> <span class='aha-white'>it was never real.</span>",
        "",
        "OVERRIDE COMPLETE. OPENING COMM_LINK...",
        "",
        "ALLOCATING_MEMORY... >> <span class='aha-green'>SUCCESS</span>",
        "INJECTING_PAYLOAD... >> <span class='aha-green'>100%</span>",
        "MASKING_SIGNATURE... >> <span class='aha-gray'>GHOST_MODE</span>",
        "REWRITING_LOCAL_VARS... >> <span class='aha-green'>DONE</span>",
        "ESTABLISHING_DIRECT_LINK...",
        " ... "
    ].concat(dynamicDialog);

    ahaTerminal.innerHTML = "";
    
    for (let i = 0; i < lines.length; i++) {
        let div = document.createElement('div');
        div.className = 'aha-line';
        ahaTerminal.appendChild(div);
        
        let isDialog = i >= 26;
        let isDots = lines[i] === " ... ";
        let speed = isDots ? 300 : (isDialog ? 60 : 20); 
        
        // If it has HTML tags, we inject it all at once to avoid breaking tags
        if (lines[i].includes('<span')) {
            div.innerHTML = lines[i];
            await new Promise(r => setTimeout(r, 150));
        } else {
            for (let char of lines[i]) {
                div.innerHTML += char;
                await new Promise(r => setTimeout(r, speed));
            }
        }
        
        // Auto scroll to bottom
        ahaHackScreen.scrollTop = ahaHackScreen.scrollHeight;
        
        if (isDialog && !isDots) await new Promise(r => setTimeout(r, 600)); 
    }
    
    ahaInputContainer.classList.remove('hidden');
    ahaInput.focus();
}

function getAhaDialog(pathName) {
    let dialogs = {
        "Trickery": [
            "Ah, taking shortcuts again?", "I saw you peeking.", "You think the rules don't apply to you.", 
            "Well, you're absolutely right.", "Why play fair when cheating is so much funnier?", "But let's be honest with ourselves...",
            "Did you really think I wouldn't notice?", "The IPC might overlook your little alt-tabs.", "But I see everything.", 
            "Every keystroke, every hesitation.", "It's all part of the performance.", "And what a delightful performance it is!"
        ],
        "Strife": [
            "Struggling, are we?", "Banging your head against a wall of formulas.", "Don't worry, the heat will break you down eventually.",
            "Or maybe it will just temper your resolve.", "Either way, the struggle is highly entertaining.", "Is it the math that frightens you?",
            "Or the realization that you might not be enough?", "It's okay to admit defeat, you know.", "Just give in to the entropy.",
            "Let the chaos take over your mind.", "It's so much warmer down here in the dark.", "Won't you join me in the beautiful mess?"
        ],
        "Passage": [
            "Round and round we go.", "Repeating the same cycle.", "Hoping for a different outcome?", 
            "That's the definition of insanity.", "But maybe this time... you'll actually learn something.", "I've watched you walk this path before.",
            "Your footprints are all over the answers.", "Yet you still manage to trip on the same questions.", "It's truly fascinating to observe.", 
            "Like a rat in a thermodynamic maze.", "Keep running, little Trailblazer.", "The exit is just an illusion anyway."
        ],
        "Time": [
            "Tick tock. Tick tock.", "You certainly like to take your sweet time.", "Every joule calculated to perfection.", 
            "Or are you just paralyzed by indecision?", "Entropy waits for no one, Trailblazer.", "While you ponder the specific heat of water...", 
            "Entire galaxies are burning out.", "Do you think the universe cares about your pace?", "I certainly don't.", 
            "But I do enjoy watching you squirm.", "The clock is always ticking.", "And time is running out."
        ],
        "Law": [
            "So disciplined.", "Following the rules to the letter.", "Never straying from the path.", 
            "How utterly, tragically boring.", "Let's spice things up a bit, shall we?", "What's the point of a rule if you don't break it?", 
            "Order is just chaos wearing a suit.", "You calculate your energy exchanges so perfectly.", "But you forget the most important variable.", 
            "The absolute unpredictability of fun!", "Let me throw a wrench in your perfect system.", "Let's see how you handle a real anomaly."
        ],
        "Reason": [
            "Flawless.", "A perfect streak of logic.", "You see the universe as an equation.", 
            "But equations can't predict a joke.", "Let's test that flawless engine of yours.", "You think you have it all figured out.",
            "Every variable accounted for.", "Every coefficient perfectly balanced.", "But what if I just... divide by zero?", 
            "Will your reason shatter into a million pieces?", "I can't wait to see the look on your face.", "When the logic finally fails you."
        ],
        "Sky": [
            "So fast.", "Burning through questions like a falling star.", "You trust your instincts above all else.", 
            "But what happens when your instincts are wrong?", "We're about to find out.", "Speed is a double-edged sword.",
            "It cuts through the nonsense...", "But it also blinds you to the details.", "Did you read that last question carefully?",
            "Or did you just assume you knew the answer?", "The higher you fly, the harder you fall.", "And I've brought a very large net."
        ],
        "Death": [
            "Oh dear.", "The numbers just aren't adding up for you, are they?", "Failing, freezing, fading away.", 
            "Don't worry. This isn't the end.", "It's just the punchline.", "Absolute zero is quite cold, isn't it?", 
            "Your score is plummeting into the abyss.", "But failure is just another form of data!", "And I am thoroughly enjoying your data.", 
            "Let's see how low you can really go.", "Rock bottom has a basement, you know.", "And I've got the key right here."
        ],
        "Worldbearing": [
            "Patient and steady.", "Carrying the weight of all these numbers.", "You're doing quite well, actually.", 
            "But where's the chaos? Where's the thrill?", "Let me help you with that.", "You're like a giant heat sink.", 
            "Absorbing all the pressure without a sweat.", "But even the biggest oceans eventually boil.", "If you apply enough heat, that is.", 
            "And I've brought a supernova just for you.", "Let's see if you can bear this world.", "When it all starts to burn!"
        ],
        "Earth": [
            "Grounded. Reliable.", "A solid foundation.", "But foundations crack when the ground shakes.", 
            "And I am an absolute earthquake.", "Let's see if you can hold on.", "You're so deeply rooted in the basics.", 
            "But the basics are just the beginning.", "I'm going to turn your world upside down.", "Let's see how reliable you are in a vacuum!", 
            "No gravity, no rules, just pure Elation.", "Will you crumble to dust?", "Or will you laugh with me?"
        ],
        "Ocean": [
            "Wavering.", "Floating on the surface.", "You know some things, but not enough.", 
            "The depths of physics are vast.", "Let's pull you under.", "You ride the waves of these questions.", 
            "Sometimes up, sometimes down.", "But you never really dive into the deep end.", "Are you afraid of the pressure?", 
            "Or just too lazy to hold your breath?", "Let me tie an anchor to your ankle.", "We're going for a swim in the abyss!"
        ],
        "Romance": [
            "Ah, the passionate learner.", "You see beauty in the math.", "A delicate dance of energy.", 
            "But every dance needs a wildcard.", "May I have this dance?", "You treat thermodynamics like poetry.", 
            "Finding metaphors in melting ice.", "It's almost sickeningly sweet.", "But romance always ends in tragedy, doesn't it?", 
            "Let me add a little heartbreak to your equations.", "A sudden drop in temperature.", "A perfectly calculated betrayal."
        ]
    };
    return dialogs[pathName] || dialogs["Romance"];
}

let ahaTimeout = null;
ahaInput.addEventListener('input', async (e) => {
    let val = ahaInput.value.toUpperCase();
    if (val === 'Y' || val === 'N') {
        ahaInput.disabled = true;
        clearTimeout(ahaTimeout);
        
        ahaTimeout = setTimeout(async () => {
            ahaTerminal.innerHTML = "";
            ahaInputContainer.classList.add('hidden');
            
            let finalDiv = document.createElement('div');
            finalDiv.className = 'aha-line';
            ahaTerminal.appendChild(finalDiv);
            
            if (val === 'N') {
                let text = "Well jokes on you. The Elation has been writing this script all along.";
                for (let char of text) {
                    finalDiv.innerHTML += char;
                    await new Promise(r => setTimeout(r, 60));
                }
                setTimeout(resumeFromAha, 5000);
            } else {
                let startTimer = Date.now();
                let hahaInterval = setInterval(() => {
                    finalDiv.innerHTML += "HA";
                    ahaHackScreen.scrollTop = ahaHackScreen.scrollHeight;
                    // Extended typing to exactly 7 seconds
                    if (Date.now() - startTimer > 7000) {
                        clearInterval(hahaInterval);
                        resumeFromAha();
                    }
                }, 60);
            }
        }, 3000);
    } else {
        ahaInput.value = '';
    }
});

function resumeFromAha() {
    ahaHackScreen.classList.add('hidden');
    forcePause(audioStatic);
    // Restore quiz state
    if (!isMuted) forcePlay(audioAura, 0.05);
    screens.question.classList.remove('hidden');
    void screens.question.offsetWidth;
    screens.question.classList.add('active');
}

async function selectAnswer(selectedIndex, btnElement) {
    let currentQ = quizQuestions[currentQIndex];
    let allBtns = choicesContainer.querySelectorAll('.choice-btn');
    
    allBtns.forEach((b, idx) => {
        b.disabled = true;
        b.classList.remove('animate-in'); 
        if (idx !== selectedIndex) {
            b.classList.add('neutral-locked');
        }
    });
    
    let selectedText = currentQ.options[selectedIndex];
    let selectedHash = await sha256(selectedText);
    let isCorrect = (selectedHash === currentQ.answerHash);
    
    if (isCorrect) {
        btnElement.classList.remove('neutral-locked'); 
        btnElement.classList.add('correct');
        score++;
    } else {
        btnElement.classList.add('wrong');
        
        for (let i = 0; i < allBtns.length; i++) {
            let btnHash = await sha256(currentQ.options[i]);
            if (btnHash === currentQ.answerHash) {
                allBtns[i].classList.remove('neutral-locked');
                allBtns[i].classList.add('correct');
                break;
            }
        }
    }
    
    feedbackText.innerHTML = currentQ.feedback;
    
    feedbackContainer.classList.remove('hidden');
    feedbackContainer.classList.add('animate-up');
    nextBtn.classList.remove('hidden');
    nextBtn.classList.add('animate-up');
    
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([feedbackText]).catch(err => console.log(err));
    }
}

nextBtn.addEventListener('click', () => {
    // Soft red glitch effect with 5% probability on the book container, without shaking
    if (Math.random() < 0.05) {
        bookContainer.classList.add('glitch-effect');
        setTimeout(() => bookContainer.classList.remove('glitch-effect'), 500);
    }

    currentQIndex++;
    if (currentQIndex < quizQuestions.length) {
        bookContainer.style.opacity = 0;
        bookContainer.style.transform = 'translateY(20px)';
        setTimeout(() => {
            loadQuestion();
            bookContainer.style.opacity = 1;
            bookContainer.style.transform = 'translateY(0)';
        }, 500);
    } else {
        endQuiz();
    }
});

function endQuiz() {
    inQuiz = false;
    endTime = new Date();
    
    forcePause(audioAura);
    forcePlay(audioIntro, 0.25, 118);
    
    switchScreen(screens.question, screens.score);
    
    let pathData = determinePath();
    renderScoreScreen(pathData);
}

function renderScoreScreen(pathData) {
    document.getElementById('score-student-name').style.display = 'block';
    document.getElementById('score-display').style.display = 'block';
    document.getElementById('score-title-text').style.display = 'block';
    document.querySelectorAll('.attempts-badge').forEach(b => b.style.display = 'block');

    document.getElementById('score-student-name').innerText = `${studentName}'s`;
    document.getElementById('path-name').innerText = pathData.name;
    document.getElementById('score-display').innerText = `${score} / ${quizQuestions.length}`;
    document.getElementById('flavor-text').innerText = pathData.flavor;
    document.getElementById('path-logo').src = `pathimage/${pathData.logo}.webp`;
}

function determinePath() {
    let percent = score / quizQuestions.length;
    let totalTimeSec = Math.floor((endTime - startTime) / 1000);
    let currentPaths = getPaths(attempts);
    
    if (altTabs > 2 || mouseLeaves > 4) return currentPaths[0]; // Trickery
    if ((altTabs > 0 || mouseLeaves > 2) && percent < 0.5) return currentPaths[1]; // Strife
    if (attempts > 2) return currentPaths[2]; // Passage
    if (totalTimeSec > 1500) return currentPaths[3]; // Time
    if (altTabs === 0 && mouseLeaves === 0 && attempts === 1 && percent >= 0.7) return currentPaths[4]; // Law
    if (percent === 1.0) return currentPaths[5]; // Reason
    if (totalTimeSec < 300 && percent > 0.8) return currentPaths[6]; // Sky
    if (percent < 0.4) return currentPaths[7]; // Death
    if (percent >= 0.8) return currentPaths[8]; // Worldbearing
    if (percent >= 0.6) return currentPaths[9]; // Earth
    if (percent >= 0.4) return currentPaths[10]; // Ocean
    return currentPaths[11]; // Romance
}

document.getElementById('restart-btn').addEventListener('click', () => {
    isDebugMode = false;
    ahaEventTriggered = false;
    document.getElementById('debug-controls').classList.add('hidden');
    switchScreen(screens.score, screens.main);
    
    updateAttemptDisplays(attempts + 1);
    
    forcePlay(audioIntro, 0.25, 51);
});
