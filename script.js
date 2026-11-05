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

// Tracking variables
let studentName = '';
let altTabs = 0;
let mouseLeaves = 0;
let startTime, endTime;
let score = 0;
let currentQIndex = 0;
let quizQuestions = [];
let inQuiz = false;
let attempts = parseInt(localStorage.getItem('hsr_quiz_attempts') || '0');

// Conceptual Questions from Source
const rawConceptual = [
    {
        q: "Ashley has two freezers in her laboratory. Inside freezer A, the temperature is \\( 0 \\, ^\\circ\\text{F} \\) and inside freezer B the temperature is \\( 0 \\, ^\\circ\\text{C} \\). Which one of the following statements about these freezers is true?",
        options: [
            "The inside of freezer A is colder than the inside of freezer B.",
            "The inside of freezer B is colder than the inside of freezer A.",
            "A and B are at the same temperature.",
            "There's no way to compare the temperatures of these two freezers because the units are different."
        ], answer: 0,
        feedback: "\\( 0 \\, ^\\circ\\text{F} \\) is equivalent to approximately \\( -17.8 \\, ^\\circ\\text{C} \\), making freezer A colder than freezer B (\\( 0 \\, ^\\circ\\text{C} \\))."
    },
    {
        q: "Which one of the following temperatures is approximately equal to 'room temperature?'",
        options: ["\\( 72 \\, ^\\circ\\text{C} \\)", "\\( 50 \\, ^\\circ\\text{C} \\)", "\\( 0 \\text{ K} \\)", "\\( 110 \\text{ K} \\)", "\\( 293 \\text{ K} \\)"], answer: 4,
        feedback: "Room temperature is typically considered to be around \\( 20 \\, ^\\circ\\text{C} \\), which is \\( 293 \\text{ K} \\) (\\( 20 + 273.15 \\))."
    },
    {
        q: "Complete the following statement: A temperature increase of \\( 75 \\text{ C}^\\circ \\) is equal to a temperature increase of",
        options: ["\\( 167 \\text{ F}^\\circ = 75 \\text{ C} \\)", "\\( 75 \\text{ K} \\)", "\\( 75 \\text{ F}^\\circ \\)", "\\( 348 \\text{ K} \\)", "\\( 42 \\text{ F}^\\circ \\)"], answer: 1,
        feedback: "A change of 1 degree Celsius is exactly equivalent in magnitude to a change of 1 Kelvin. Thus, \\( \\Delta T_C = \\Delta T_K \\)."
    },
    {
        q: "Complete the following statement: A temperature decrease of \\( 30 \\text{ C}^\\circ \\) is equal to a temperature decrease of",
        options: ["\\( 30 \\text{ F}^\\circ \\)", "\\( 30 \\text{ K} \\)", "\\( 17 \\text{ F}^\\circ \\)", "\\( 26 \\text{ F}^\\circ \\)", "\\( 303 \\text{ K} \\)"], answer: 1,
        feedback: "Because the size of a Celsius degree and a Kelvin are identical, a decrease of \\( 30 \\text{ C}^\\circ \\) corresponds to a decrease of \\( 30 \\text{ K} \\)."
    },
    {
        q: "Absolute zero on the Kelvin temperature scale is \\( 0 \\text{ K} \\). What is absolute zero on the Celsius temperature scale?",
        options: ["\\( -273.15 \\, ^\\circ\\text{C} \\)", "\\( +273.15 \\, ^\\circ\\text{C} \\)", "\\( -100.00 \\, ^\\circ\\text{C} \\)", "\\( +100.00 \\, ^\\circ\\text{C} \\)", "\\( -459.67 \\, ^\\circ\\text{C} \\)"], answer: 0,
        feedback: "\\( T_C = T_K - 273.15 \\). Therefore, \\( 0 \\text{ K} = -273.15 \\, ^\\circ\\text{C} \\)."
    },
    {
        q: "Three thermometers are in the same water bath. After thermal equilibrium is established, it is found that the Celsius thermometer reads \\( 0 \\, ^\\circ\\text{C} \\), the Fahrenheit thermometer reads \\( 32 \\, ^\\circ\\text{F} \\), and the Kelvin thermometer reads \\( 305 \\text{ K} \\). Which one of the following statements is the most reasonable conclusion?",
        options: [
            "The Celsius thermometer is incorrect.",
            "The Kelvin thermometer is incorrect.",
            "The Fahrenheit thermometer is incorrect.",
            "All three thermometers are incorrect.",
            "The three thermometers are at different temperatures."
        ], answer: 1,
        feedback: "\\( 0 \\, ^\\circ\\text{C} \\) equals \\( 32 \\, ^\\circ\\text{F} \\) and \\( 273.15 \\text{ K} \\). The reading of \\( 305 \\text{ K} \\) is clearly incorrect."
    },
    {
        q: "What is unique about the Kelvin temperature scale?",
        options: [
            "It is the most widely used temperature scale around the world.",
            "It is divided into temperature units called degrees.",
            "It is based on the fact that there is a lower limit to temperature called absolute zero.",
            "It is named after a person.",
            "It is a metric unit based on multiples of 10."
        ], answer: 2,
        feedback: "The Kelvin scale is an absolute thermodynamic temperature scale that uses absolute zero as its null point."
    },
    {
        q: "Which one of the following would not be used as a thermometric property in the construction of a thermometer?",
        options: [
            "the change in length of a metal rod",
            "the change in volume of a liquid",
            "the change in pressure of a gas at constant volume",
            "the change in mass of a solid",
            "the change in electrical resistance of a wire"
        ], answer: 3,
        feedback: "Mass is generally conserved regardless of temperature changes. It does not vary with temperature, making it useless as a thermometric property."
    },
    {
        q: "What type of thermometer involves welded junctions of two different metals?",
        options: ["semi metallic strip", "electrical resistance", "infrared thermography", "Josephson junction", "thermocouple"], answer: 4,
        feedback: "A thermocouple consists of two dissimilar electrical conductors forming an electrical junction, which produces a temperature-dependent voltage."
    },
    {
        q: "Which one of the following thermometers can be useful in detecting breast cancer?",
        options: ["infrared thermography", "electrical resistance", "bimetallic strip", "thermocouple", "sphygmomanometer"], answer: 0,
        feedback: "Infrared thermography maps heat distribution on the body's surface, which can sometimes highlight regions of increased blood flow associated with tumors."
    },
    {
        q: "Complete the following statement: Bimetallic strips used as adjustable switches in electric appliances consist of metallic strips that must have different",
        options: ["thermal expansion coefficients.", "specific heat capacities.", "lengths.", "thicknesses.", "mass."], answer: 0,
        feedback: "To bend when heated, the two metals in the bimetallic strip must expand at different rates, requiring different thermal expansion coefficients."
    },
    {
        q: "A rod with an initial length \\( 3.000 \\text{ cm} \\) is heated so that its temperature increases by \\( 89 \\, ^\\circ\\text{C} \\). When the length is measured again, the length has increased by \\( 0.006 \\text{ cm} \\). This behavior is an example of which one of the following material properties?",
        options: ["specific heat capacity", "thermal stress", "thermal expansion", "calorimetry", "thermal diffusion"], answer: 2,
        feedback: "The change in dimensions of a material in response to a change in temperature is known as thermal expansion."
    },
    {
        q: "A square plate made of lead has an oval-shaped hole. The oval may be described by the lengths \\( a \\) and \\( b \\). Which of the following correctly describes the plate after its temperature is increased by two hundred Celsius degrees?",
        options: [
            "The size of the plate will increase, but a and b will both decrease.",
            "The size of the plate will remain unchanged, but a and b will both increase.",
            "The size of the plate will increase, and a and b will both increase.",
            "The size of the plate will remain unchanged, but a and b will both decrease.",
            "The size of the plate will increase, but only a will increase."
        ], answer: 2,
        feedback: "When an object undergoes thermal expansion, every linear dimension increases, including the dimensions of any holes (acting as if they were made of the solid material)."
    },
    {
        q: "A circular hole is drilled through a penny. Complete the following statement: When the penny is heated,",
        options: [
            "the hole decreases in diameter.",
            "the metal part of the penny expands outward, but the size of the hole does not change.",
            "the area of the hole increases by the same amount as a similar area of the metal does.",
            "linear expansion causes the shape of the hole to become slightly oval-shaped.",
            "the area of the hole increases more than a similar area of the metal does"
        ], answer: 2,
        feedback: "Holes expand in the exact same proportion as the surrounding solid material when heated uniformly."
    },
    {
        q: "Complete the following statement: The term heat most accurately describes",
        options: [
            "the flow of energy resulting from a temperature difference.",
            "the molecular motion inside of an object.",
            "the internal energy of an object.",
            "a measure of how hot or cold an object is.",
            "the absolute temperature of an object."
        ], answer: 0,
        feedback: "In physics, heat is strictly defined as the transfer of thermal energy across a boundary due to a difference in temperature."
    },
    {
        q: "Heat is expressed in the same units as which one of the following quantities?",
        options: ["temperature", "power", "force/time", "specific heat capacity", "work"], answer: 4,
        feedback: "Both heat and work represent transfers of energy and are measured in Joules (J)."
    },
    {
        q: "Two balls, one made of copper and one made of gold, have the same mass and temperature. The same amount of heat is added to each sphere, but the final temperature of the two spheres is different. Which one of the following statements best explains the reason?",
        options: [
            "The specific heat capacities of the two spheres are different.",
            "The densities of the two spheres are different.",
            "The volumes of the two spheres are different.",
            "The coefficients of volume expansion of the two spheres are different.",
            "The latent heats of vaporization of the two spheres are different."
        ], answer: 0,
        feedback: "The relationship \\( Q = mc\\Delta T \\) shows that for the same \\( Q \\) and \\( m \\), a different \\( \\Delta T \\) means the materials must have different specific heat capacities (\\( c \\))."
    },
    {
        q: "During a certain thermal process a solid object's temperature changes as heat flows in. Which of the following quantities is not related to the amount of the temperature change?",
        options: [
            "mass",
            "the amount of heat added or removed",
            "volume",
            "the material of which the object is composed",
            "the specific heat capacity"
        ], answer: 2,
        feedback: "According to \\( Q = mc\\Delta T \\), volume is not directly related to the temperature change (though mass is derived from volume and density)."
    },
    {
        q: "Which one of the following statements is the definition of the specific heat capacity of an object?",
        options: [
            "The specific heat capacity is the amount of energy per unit mass to raise the temperature of the object from its freezing point to its boiling point.",
            "The specific heat capacity is the amount of energy per unit mass to raise the temperature of the object by \\( 1 \\, ^\\circ\\text{C} \\).",
            "The specific heat capacity is the temperature of the object divided by its density.",
            "Given one gram of the material, the specific heat capacity is the amount of energy to change the material from solid to liquid.",
            "Given one gram of the material, the specific heat capacity is the amount of energy to change the material from a solid to a gas."
        ], answer: 1,
        feedback: "Specific heat capacity \\( c \\) is formally defined as the heat \\( Q \\) required to raise the temperature of \\( 1 \\text{ kg} \\) of a substance by \\( 1 \\text{ K} \\) or \\( 1 \\, ^\\circ\\text{C} \\)."
    },
    {
        q: "To what does the specific heat capacity of an object relate?",
        options: [
            "the amount of energy required to change the temperature of an object",
            "the total amount of energy an object can store",
            "the thermal potential energy of the object",
            "the amount of work done by the object",
            "the amount of energy required to melt a solid object"
        ], answer: 0,
        feedback: "Specific heat characterizes a material's resistance to temperature change when energy is added as heat."
    },
    {
        q: "At the steel factory, the hot liquid steel began to show signs of fusion. Which one of the following statements is another way of expressing what the steel did?",
        options: [
            "The hot steel began to sublime as it cooled.",
            "The hot steel began to vaporize as it was heated further.",
            "The hot steel began to condense as it was cooled.",
            "The hot steel began to freeze as it cooled.",
            "The hot steel began to melt as it was heated further."
        ], answer: 4,
        feedback: "In thermodynamics, 'fusion' refers to the phase transition from solid to liquid, which is commonly known as melting."
    },
    {
        q: "The fresh seafood was shipped in dry ice. By the time the package arrived at its destination, half of the dry ice had sublimed. Which one of the following statements is another way of expressing what the dry ice did?",
        options: [
            "The dry ice had gone from a solid to a liquid state.",
            "The dry ice had gone from a solid to a gaseous state.",
            "The dry ice had condensed.",
            "The dry ice had gone from a liquid into a gaseous state.",
            "The dry ice had chemically reacted with the seafood and was absorbed by it."
        ], answer: 1,
        feedback: "Sublimation is the direct phase transition from a solid to a gas, bypassing the liquid phase."
    }
];

// Helper to shuffle arrays and map answers
function shuffleProblem(prob) {
    let opts = prob.options.map((text, idx) => ({ text, isCorrect: idx === prob.answer }));
    opts.sort(() => Math.random() - 0.5);
    let newAnsIdx = opts.findIndex(o => o.isCorrect);
    return {
        type: 'problem',
        q: prob.q,
        options: opts.map(o => o.text),
        answer: newAnsIdx,
        feedback: prob.feedback
    };
}
function shuffleConceptual(prob) {
    let opts = prob.options.map((text, idx) => ({ text, isCorrect: idx === prob.answer }));
    opts.sort(() => Math.random() - 0.5);
    let newAnsIdx = opts.findIndex(o => o.isCorrect);
    return {
        type: 'conceptual',
        q: prob.q,
        options: opts.map(o => o.text),
        answer: newAnsIdx,
        feedback: prob.feedback
    };
}

// 14 Problem Solving Generators (2 per topic)
const generators = [
    // 1. Linear Expansion 1
    function() {
        let L0 = (Math.random()*10+5).toFixed(1);
        let a = (Math.random()*2+1).toFixed(1);
        let dT = Math.floor(Math.random()*50+20);
        let ans = (L0 * a*1e-5 * dT).toExponential(2);
        let d1 = (L0 * a*1e-4 * dT).toExponential(2);
        let d2 = (L0 * a*1e-5 / dT).toExponential(2);
        let d3 = (a*1e-5 * dT).toExponential(2);
        return {
            q: `A steel beam has an initial length of \\( ${L0} \\text{ m} \\). The coefficient of linear expansion is \\( \\alpha = ${a} \\times 10^{-5} \\, ^\\circ\\text{C}^{-1} \\). If the temperature increases by \\( ${dT} \\, ^\\circ\\text{C} \\), what is the change in the beam's length?`,
            options: [`\\( ${ans} \\text{ m} \\)`, `\\( ${d1} \\text{ m} \\)`, `\\( ${d2} \\text{ m} \\)`, `\\( ${d3} \\text{ m} \\)`], answer: 0,
            feedback: `\\( \\Delta L = \\alpha L_0 \\Delta T = (${a} \\times 10^{-5})(${L0})(${dT}) = ${ans} \\text{ m} \\)`
        };
    },
    // 2. Linear Expansion 2
    function() {
        let L0 = (Math.random()*20+10).toFixed(1);
        let a = (Math.random()*3+1).toFixed(1);
        let dL = (Math.random()*0.05+0.01).toFixed(3);
        let dT = (dL / (L0 * a*1e-5)).toFixed(1);
        let d1 = (dL * L0 * a*1e-5).toExponential(2);
        let d2 = (dL / (a*1e-5)).toFixed(1);
        let d3 = (dL / L0).toExponential(2);
        return {
            q: `A copper pipe of length \\( ${L0} \\text{ m} \\) expands by \\( ${dL} \\text{ m} \\). Given \\( \\alpha = ${a} \\times 10^{-5} \\, ^\\circ\\text{C}^{-1} \\), what was the temperature change?`,
            options: [`\\( ${dT} \\, ^\\circ\\text{C} \\)`, `\\( ${d1} \\, ^\\circ\\text{C} \\)`, `\\( ${d2} \\, ^\\circ\\text{C} \\)`, `\\( ${d3} \\, ^\\circ\\text{C} \\)`], answer: 0,
            feedback: `\\( \\Delta T = \\frac{\\Delta L}{\\alpha L_0} = \\frac{${dL}}{(${a} \\times 10^{-5})(${L0})} = ${dT} \\, ^\\circ\\text{C} \\)`
        };
    },
    // 3. Volume Exp 1
    function() {
        let V0 = (Math.random()*5+1).toFixed(2);
        let b = (Math.random()*5+2).toFixed(1);
        let dT = Math.floor(Math.random()*80+20);
        let ans = (V0 * b*1e-4 * dT).toExponential(2);
        let d1 = (V0 * b*1e-5 * dT).toExponential(2);
        let d2 = (b*1e-4 * dT).toExponential(2);
        let d3 = (V0 * b*1e-4 / dT).toExponential(2);
        return {
            q: `A container holds \\( ${V0} \\text{ m}^3 \\) of liquid. The volume expansion coefficient of the liquid is \\( \\beta = ${b} \\times 10^{-4} \\, ^\\circ\\text{C}^{-1} \\). If heated by \\( ${dT} \\, ^\\circ\\text{C} \\), how much does the volume of the liquid increase?`,
            options: [`\\( ${ans} \\text{ m}^3 \\)`, `\\( ${d1} \\text{ m}^3 \\)`, `\\( ${d2} \\text{ m}^3 \\)`, `\\( ${d3} \\text{ m}^3 \\)`], answer: 0,
            feedback: `\\( \\Delta V = \\beta V_0 \\Delta T = (${b} \\times 10^{-4})(${V0})(${dT}) = ${ans} \\text{ m}^3 \\)`
        };
    },
    // 4. Volume Exp 2
    function() {
        let V0 = (Math.random()*10+5).toFixed(1);
        let a = (Math.random()*2+1).toFixed(1);
        let dT = Math.floor(Math.random()*60+10);
        let ans = (V0 * 3 * a*1e-5 * dT).toExponential(2);
        let d1 = (V0 * a*1e-5 * dT).toExponential(2);
        let d2 = (V0 * Math.pow(a*1e-5, 3) * dT).toExponential(2);
        let d3 = (3 * a*1e-5 * dT).toExponential(2);
        return {
            q: `A solid metal sphere has an initial volume of \\( ${V0} \\text{ cm}^3 \\) and a linear expansion coefficient \\( \\alpha = ${a} \\times 10^{-5} \\, ^\\circ\\text{C}^{-1} \\). If the temperature increases by \\( ${dT} \\, ^\\circ\\text{C} \\), what is its change in volume?`,
            options: [`\\( ${ans} \\text{ cm}^3 \\)`, `\\( ${d1} \\text{ cm}^3 \\)`, `\\( ${d2} \\text{ cm}^3 \\)`, `\\( ${d3} \\text{ cm}^3 \\)`], answer: 0,
            feedback: `For a solid, \\( \\beta \\approx 3\\alpha \\). So \\( \\Delta V = 3\\alpha V_0 \\Delta T = 3(${a} \\times 10^{-5})(${V0})(${dT}) = ${ans} \\text{ cm}^3 \\)`
        };
    },
    // 5. Sensible 1
    function() {
        let m = (Math.random()*4+1).toFixed(2);
        let c = 4186;
        let dT = Math.floor(Math.random()*50+10);
        let ans = (m * c * dT).toExponential(2);
        let d1 = (m * dT).toFixed(1);
        let d2 = (m * c / dT).toExponential(2);
        let d3 = (c * dT).toExponential(2);
        return {
            q: `How much heat is required to raise the temperature of \\( ${m} \\text{ kg} \\) of water by \\( ${dT} \\, ^\\circ\\text{C} \\)? \\( (c_{\\text{water}} = 4186 \\text{ J/kg}\\cdot^\\circ\\text{C}) \\)`,
            options: [`\\( ${ans} \\text{ J} \\)`, `\\( ${d1} \\text{ J} \\)`, `\\( ${d2} \\text{ J} \\)`, `\\( ${d3} \\text{ J} \\)`], answer: 0,
            feedback: `\\( Q = mc\\Delta T = (${m})(4186)(${dT}) = ${ans} \\text{ J} \\)`
        };
    },
    // 6. Sensible 2
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
            options: [`\\( ${Tf} \\, ^\\circ\\text{C} \\)`, `\\( ${d1} \\, ^\\circ\\text{C} \\)`, `\\( ${d2} \\, ^\\circ\\text{C} \\)`, `\\( ${d3} \\, ^\\circ\\text{C} \\)`], answer: 0,
            feedback: `\\( \\Delta T = \\frac{Q}{mc} = \\frac{${Q}}{(${m})(900)} = ${dT.toFixed(2)} \\, ^\\circ\\text{C} \\). \\( T_f = T_i + \\Delta T = ${Tf} \\, ^\\circ\\text{C} \\)`
        };
    },
    // 7. Latent 1
    function() {
        let m = (Math.random()*3+0.5).toFixed(2);
        let Lf = 3.33e5;
        let ans = (m * Lf).toExponential(2);
        let d1 = (m * 4186).toExponential(2);
        let d2 = (Lf / m).toExponential(2);
        let d3 = (m * 2.26e6).toExponential(2);
        return {
            q: `How much heat is required to completely melt \\( ${m} \\text{ kg} \\) of ice at \\( 0 \\, ^\\circ\\text{C} \\)? \\( (L_f = 3.33 \\times 10^5 \\text{ J/kg}) \\)`,
            options: [`\\( ${ans} \\text{ J} \\)`, `\\( ${d1} \\text{ J} \\)`, `\\( ${d2} \\text{ J} \\)`, `\\( ${d3} \\text{ J} \\)`], answer: 0,
            feedback: `\\( Q = mL_f = (${m})(3.33 \\times 10^5) = ${ans} \\text{ J} \\)`
        };
    },
    // 8. Latent 2
    function() {
        let Q = (Math.random()*5+1).toFixed(1); 
        let Q_J = Q * 1e6;
        let Lv = 2.26e6;
        let m = (Q_J / Lv).toFixed(3);
        let d1 = (Q_J * Lv).toExponential(2);
        let d2 = (Q_J / 3.33e5).toFixed(3);
        let d3 = (Q_J / 4186).toFixed(3);
        return {
            q: `How much mass of steam at \\( 100 \\, ^\\circ\\text{C} \\) condenses when \\( ${Q} \\times 10^6 \\text{ J} \\) of heat is released? \\( (L_v = 2.26 \\times 10^6 \\text{ J/kg}) \\)`,
            options: [`\\( ${m} \\text{ kg} \\)`, `\\( ${d1} \\text{ kg} \\)`, `\\( ${d2} \\text{ kg} \\)`, `\\( ${d3} \\text{ kg} \\)`], answer: 0,
            feedback: `\\( m = \\frac{Q}{L_v} = \\frac{${Q} \\times 10^6}{2.26 \\times 10^6} = ${m} \\text{ kg} \\)`
        };
    },
    // 9. Calorimetry 1
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
            options: [`\\( ${Tf} \\, ^\\circ\\text{C} \\)`, `\\( ${d1} \\, ^\\circ\\text{C} \\)`, `\\( ${d2} \\, ^\\circ\\text{C} \\)`, `\\( ${d3} \\, ^\\circ\\text{C} \\)`], answer: 0,
            feedback: `\\( m_c c_c (T_i - T_f) = m_w c_w (T_f - T_w) \\). Solving for \\( T_f \\) gives \\( ${Tf} \\, ^\\circ\\text{C} \\)`
        };
    },
    // 10. Calorimetry 2
    function() {
        let m_unk = (Math.random()*0.5+0.1).toFixed(2);
        let m_w = (Math.random()*1+0.5).toFixed(2);
        let c_w = 4186;
        let T_unk = Math.floor(Math.random()*50+100);
        let T_w = Math.floor(Math.random()*10+20);
        let T_f = Math.floor(T_w + Math.random()*5+2);
        let c_unk = ((m_w * c_w * (T_f - T_w)) / (m_unk * (T_unk - T_f))).toFixed(0);
        let d1 = ((m_unk * c_w * (T_f - T_w)) / (m_w * (T_unk - T_f))).toFixed(0);
        let d2 = (4186 * (T_f - T_w) / (T_unk - T_f)).toFixed(0);
        let d3 = (c_unk / 2).toFixed(0);
        return {
            q: `A \\( ${m_unk} \\text{ kg} \\) unknown metal at \\( ${T_unk} \\, ^\\circ\\text{C} \\) is dropped into \\( ${m_w} \\text{ kg} \\) of water at \\( ${T_w} \\, ^\\circ\\text{C} \\). The final temperature is \\( ${T_f} \\, ^\\circ\\text{C} \\). Find the specific heat of the metal. \\( (c_{\\text{water}} = 4186 \\text{ J/kg}\\cdot^\\circ\\text{C}) \\)`,
            options: [`\\( ${c_unk} \\text{ J/kg}\\cdot^\\circ\\text{C} \\)`, `\\( ${d1} \\text{ J/kg}\\cdot^\\circ\\text{C} \\)`, `\\( ${d2} \\text{ J/kg}\\cdot^\\circ\\text{C} \\)`, `\\( ${d3} \\text{ J/kg}\\cdot^\\circ\\text{C} \\)`], answer: 0,
            feedback: `\\( m_{unk} c_{unk} (T_i - T_f) = m_w c_w (T_f - T_w) \\). Solving for \\( c_{unk} \\) gives \\( ${c_unk} \\text{ J/kg}\\cdot^\\circ\\text{C} \\)`
        };
    },
    // 11. Sensible + Latent 1
    function() {
        let m = (Math.random()*2+0.5).toFixed(2);
        let c_ice = 2090;
        let L_f = 3.33e5;
        let c_w = 4186;
        let Ti = -1 * Math.floor(Math.random()*15+5);
        let Tf = Math.floor(Math.random()*20+10);
        let Q_tot = (m * c_ice * (0 - Ti) + m * L_f + m * c_w * (Tf - 0)).toExponential(2);
        let d1 = (m * L_f).toExponential(2);
        let d2 = (m * c_w * (Tf - 0) + m * c_ice * (0 - Ti)).toExponential(2);
        let d3 = ((m*c_w*(Tf-Ti))).toExponential(2);
        return {
            q: `Calculate the total heat required to convert \\( ${m} \\text{ kg} \\) of ice at \\( ${Ti} \\, ^\\circ\\text{C} \\) to water at \\( ${Tf} \\, ^\\circ\\text{C} \\). \\( (c_{\\text{ice}} = 2090, c_{\\text{water}} = 4186, L_f = 3.33 \\times 10^5 \\text{ in SI units}) \\)`,
            options: [`\\( ${Q_tot} \\text{ J} \\)`, `\\( ${d1} \\text{ J} \\)`, `\\( ${d2} \\text{ J} \\)`, `\\( ${d3} \\text{ J} \\)`], answer: 0,
            feedback: `\\( Q = Q_{\\text{warm ice}} + Q_{\\text{melt}} + Q_{\\text{warm water}} = mc_{\\text{ice}}\\Delta T_1 + mL_f + mc_{\\text{water}}\\Delta T_2 = ${Q_tot} \\text{ J} \\)`
        };
    },
    // 12. Sensible + Latent 2
    function() {
        let m = (Math.random()*2+0.5).toFixed(2);
        let c_w = 4186;
        let L_v = 2.26e6;
        let Ti = Math.floor(Math.random()*30+50);
        let Q_tot = (m * c_w * (100 - Ti) + m * L_v).toExponential(2);
        let d1 = (m * L_v).toExponential(2);
        let d2 = (m * c_w * (100 - Ti)).toExponential(2);
        let d3 = (m * c_w * 100).toExponential(2);
        return {
            q: `How much heat must be added to \\( ${m} \\text{ kg} \\) of water at \\( ${Ti} \\, ^\\circ\\text{C} \\) to completely boil it into steam at \\( 100 \\, ^\\circ\\text{C} \\)? \\( (c_{\\text{water}} = 4186, L_v = 2.26 \\times 10^6 \\text{ in SI units}) \\)`,
            options: [`\\( ${Q_tot} \\text{ J} \\)`, `\\( ${d1} \\text{ J} \\)`, `\\( ${d2} \\text{ J} \\)`, `\\( ${d3} \\text{ J} \\)`], answer: 0,
            feedback: `\\( Q = Q_{\\text{warm water}} + Q_{\\text{boil}} = mc_{\\text{water}}(100 - ${Ti}) + mL_v = ${Q_tot} \\text{ J} \\)`
        };
    },
    // 13. Conversion 1
    function() {
        let C = Math.floor(Math.random()*60 + 10);
        let F = (C * 9/5 + 32).toFixed(1);
        let d1 = ((C - 32) * 5/9).toFixed(1);
        let d2 = (C * 5/9 + 32).toFixed(1);
        let d3 = (C + 273.15).toFixed(1);
        return {
            q: `Convert \\( ${C} \\, ^\\circ\\text{C} \\) to Fahrenheit.`,
            options: [`\\( ${F} \\, ^\\circ\\text{F} \\)`, `\\( ${d1} \\, ^\\circ\\text{F} \\)`, `\\( ${d2} \\, ^\\circ\\text{F} \\)`, `\\( ${d3} \\, ^\\circ\\text{F} \\)`], answer: 0,
            feedback: `\\( T_F = \\frac{9}{5} T_C + 32 = \\frac{9}{5}(${C}) + 32 = ${F} \\, ^\\circ\\text{F} \\)`
        };
    },
    // 14. Conversion 2
    function() {
        let F = Math.floor(Math.random()*100 + 50);
        let C = (F - 32) * 5/9;
        let K = (C + 273.15).toFixed(2);
        let d1 = ((F - 32) * 9/5 + 273.15).toFixed(2);
        let d2 = (F + 273.15).toFixed(2);
        let d3 = ((F + 32) * 5/9 + 273.15).toFixed(2);
        return {
            q: `Convert \\( ${F} \\, ^\\circ\\text{F} \\) to Kelvin.`,
            options: [`\\( ${K} \\text{ K} \\)`, `\\( ${d1} \\text{ K} \\)`, `\\( ${d2} \\text{ K} \\)`, `\\( ${d3} \\text{ K} \\)`], answer: 0,
            feedback: `First to Celsius: \\( T_C = \\frac{5}{9}(T_F - 32) = ${C.toFixed(2)} \\, ^\\circ\\text{C} \\). Then to Kelvin: \\( T_K = T_C + 273.15 = ${K} \\text{ K} \\)`
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

// Initialization
document.getElementById('start-btn').addEventListener('click', () => {
    nameDialog.classList.remove('hidden');
});

document.getElementById('submit-name-btn').addEventListener('click', () => {
    studentName = studentNameInput.value.trim() || "Nameless Traveler";
    nameDialog.classList.add('hidden');
    startQuiz();
});

function startQuiz() {
    // Prep attempts
    attempts++;
    localStorage.setItem('hsr_quiz_attempts', attempts.toString());
    
    // Build and Shuffle
    let conceptuals = rawConceptual.map(shuffleConceptual);
    conceptuals.sort(() => Math.random() - 0.5);
    
    let problems = generators.map(g => shuffleProblem(g()));
    problems.sort(() => Math.random() - 0.5);
    
    quizQuestions = [...conceptuals, ...problems];
    
    score = 0;
    currentQIndex = 0;
    altTabs = 0;
    mouseLeaves = 0;
    inQuiz = true;
    startTime = new Date();
    
    screens.main.classList.remove('active');
    screens.question.classList.add('active');
    
    loadQuestion();
}

function loadQuestion() {
    feedbackContainer.classList.add('hidden');
    nextBtn.classList.add('hidden');
    
    let currentQ = quizQuestions[currentQIndex];
    qNum.innerText = `Question ${currentQIndex + 1} of ${quizQuestions.length}`;
    qText.innerHTML = currentQ.q;
    
    choicesContainer.innerHTML = '';
    currentQ.options.forEach((opt, idx) => {
        let btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.innerHTML = opt;
        btn.onclick = () => selectAnswer(idx, btn);
        choicesContainer.appendChild(btn);
    });
    
    // Typeset MathJax dynamically, gracefully checking if it's fully loaded
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([qText, choicesContainer]).catch((err) => console.log(err.message));
    }
}

function selectAnswer(selectedIndex, btnElement) {
    let currentQ = quizQuestions[currentQIndex];
    
    // Disable all buttons
    let allBtns = choicesContainer.querySelectorAll('.choice-btn');
    allBtns.forEach(b => b.disabled = true);
    
    if (selectedIndex === currentQ.answer) {
        btnElement.classList.add('correct');
        score++;
    } else {
        btnElement.classList.add('wrong');
        allBtns[currentQ.answer].classList.add('correct');
    }
    
    feedbackText.innerHTML = currentQ.feedback;
    feedbackContainer.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
    
    if (window.MathJax && MathJax.typesetPromise) {
        MathJax.typesetPromise([feedbackText]).catch((err) => console.log(err.message));
    }
}

nextBtn.addEventListener('click', () => {
    currentQIndex++;
    if (currentQIndex < quizQuestions.length) {
        loadQuestion();
    } else {
        endQuiz();
    }
});

function endQuiz() {
    inQuiz = false;
    endTime = new Date();
    screens.question.classList.remove('active');
    screens.score.classList.add('active');
    
    let pathData = determinePath();
    
    document.getElementById('path-name').innerText = pathData.name;
    document.getElementById('score-display').innerText = `${score} / ${quizQuestions.length}`;
    document.getElementById('flavor-text').innerText = pathData.flavor;
    document.getElementById('path-logo').src = `pathimage/${pathData.logo}.webp`;
}

function determinePath() {
    let percent = score / quizQuestions.length;
    let totalTimeSec = Math.floor((endTime - startTime) / 1000);

    // Trickery
    if (altTabs > 2 || mouseLeaves > 4) {
        return { name: "Trickery", logo: "Trickery", flavor: "The cosmos is a stage, and you are not above peaking behind the curtains. Your wandering focus and frequent tab-switching reflects a mind looking for hidden variables—or simply outside help." };
    }
    // Strife
    if ((altTabs > 0 || mouseLeaves > 2) && percent < 0.5) {
        return { name: "Strife", logo: "Strife", flavor: "You sought an advantage but met resistance. The path of Strife is fraught with battles against one's own limitations, reminding you that shortcuts do not guarantee victory." };
    }
    // Passage
    if (attempts > 2) {
        return { name: "Passage", logo: "Passage", flavor: "You walk this trial repeatedly, learning from past missteps. Knowledge is a journey of iteration. You are willing to walk the Passage as many times as it takes." };
    }
    // Time
    if (totalTimeSec > 1500) { // 25 mins
        return { name: "Time", logo: "Time", flavor: "You ponder deeply, letting every second tick away as you weigh your choices. The River of Time flows slowly for those who meticulously calculate every heat exchange." };
    }
    // Law
    if (altTabs === 0 && mouseLeaves === 0 && attempts === 1 && percent >= 0.7) {
        return { name: "Law", logo: "Law", flavor: "Unwavering focus. You adhered strictly to the bounds of the trial, looking neither left nor right. The Law rewards those who command absolute self-discipline." };
    }
    // Reason
    if (percent === 1.0) {
        return { name: "Reason", logo: "Reason", flavor: "Flawless logic. Every calculation, every conceptual grasp was absolute. The Path of Reason is carved by those who see the universe not as chaos, but as an equation to be solved." };
    }
    // Sky
    if (totalTimeSec < 300 && percent > 0.8) {
        return { name: "Sky", logo: "Sky", flavor: "Swift and brilliant as a meteor. You soared through the challenges with breathtaking speed and accuracy. The Sky belongs to those who trust their instincts." };
    }
    // Death
    if (percent < 0.4) {
        return { name: "Death", logo: "Death", flavor: "The end of one journey is merely the beginning of another. The concepts slipped away this time, but from the ashes of failure, a deeper understanding can be born." };
    }
    // Worldbearing
    if (percent >= 0.8) {
        return { name: "Worldbearing", logo: "Worldbearing", flavor: "You carry the weight of knowledge with patience. Like the earth supporting the heavens, you demonstrated a solid foundation of thermal physics." };
    }
    // Earth
    if (percent >= 0.6) {
        return { name: "Earth", logo: "Earth", flavor: "Solid and dependable. You possess a grounding in thermodynamics, forming a sturdy bedrock of understanding that will withstand the test of time." };
    }
    // Ocean
    if (percent >= 0.4) {
        return { name: "Ocean", logo: "Ocean", flavor: "Your knowledge ebbs and flows like the tides. While some concepts are deep and profound, others remain on the surface. Keep diving deeper into the waves." };
    }
    // Romance (Default)
    return { name: "Romance", logo: "Romance", flavor: "You view the laws of thermodynamics not just as cold equations, but as a beautiful dance of energy and temperature. Your journey is driven by passion and curiosity." };
}

document.getElementById('restart-btn').addEventListener('click', () => {
    screens.score.classList.remove('active');
    screens.main.classList.add('active');
});
