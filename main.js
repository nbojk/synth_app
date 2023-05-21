// Functionality consts
const whiteKeyWidth = 80;
const pianoHeight = 400;
const rangeSelector = document.getElementById('range');
let range = ["A0", "C8"];  // Default range

const naturalNotes = ["C", "D", "E", "F", "G", "A", "B"];
const naturalNotesSharps = ["C", "D", "F", "G", "A"];
const naturalNotesFlats = ["D", "E", "G", "A", "B"];

//Utils
rangeSelector.addEventListener('change', function () {
    let selectedValue = rangeSelector.value;
    let pianoContainer = document.querySelector('#piano');

    // Remove any existing piano keys
    while (pianoContainer.firstChild) {
        pianoContainer.firstChild.remove();
    }

    if (selectedValue === '88') {
        range = ["A0", "C8"];
    } else if (selectedValue === '76') {
        range = ["E1", "G7"];
    } else if (selectedValue === '61') {
        range = ["C2", "C7"];
    } else if (selectedValue === '49') {
        range = ["C3", "C7"];
    }

    // Update the piano keys based on the new range
    app.setupPiano();
});

const utils = {
    createSVGElement(el) {
        const element = document.createElementNS("http://www.w3.org/2000/svg", el);
        return element;
    },
    setAttributes(el, attrs) {
        for (let key in attrs) {
            el.setAttribute(key, attrs[key]);
        }
    },
    addTextContent(el, content) {
        el.textContent = content;
    },
    removeClassFromNodeCollection(nodeCollection, classToRemove) {
        nodeCollection.forEach(node => {
            if (node.classList.contains(classToRemove)) {
                node.classList.remove(classToRemove)
            }
        })
    }
}

function getNoteNameFromMIDINumber(note) {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = Math.floor(note / 12) - 1;
    const noteIndex = note % 12;
    return noteNames[noteIndex] + octave;
}


function updateDevices(event) {
    console.log(`Name: ${event.port.name}, Brand: ${event.port.manufacturer}, State: ${event.port.state}, Type: ${event.port.type}`);
}

function failure() {
    console.log('Could not connect MIDI')
}

function midiToFreq(number) {
    const a = 440;
    return (a / 32) * (2 ** ((number - 9) / 12));
}

function getMIDINumberFromNoteName(noteName) {
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const octave = parseInt(noteName.slice(-1));
    const noteIndex = noteNames.indexOf(noteName.slice(0, -1));
    return octave * 12 + noteIndex;
}

// Virutal Piano Setup
const app = {
    setupPiano() {
        const piano = document.querySelector("#piano");
        const allNaturalNotes = this.getAllNaturalNotes(range);
        const pianoWidth = allNaturalNotes.length * whiteKeyWidth;

        const SVG = this.createMainSVG(pianoWidth, pianoHeight);


        // Add white keys
        let whiteKeyPositionX = 0;


        allNaturalNotes.forEach((noteName) => {
            const whiteKeyTextGroup = utils.createSVGElement("g");
            const whiteKey = this.createKey({ className: "white-key", width: whiteKeyWidth, height: pianoHeight });
            const text = utils.createSVGElement("text");

            utils.addTextContent(text, noteName);
            utils.setAttributes(whiteKeyTextGroup, {
                "width": whiteKeyWidth
            });
            utils.setAttributes(text, {
                "x": whiteKeyPositionX + whiteKeyWidth / 2,
                "y": 380,
                "text-anchor": "middle"
            });
            utils.setAttributes(whiteKey, {
                "x": whiteKeyPositionX,
                "data-note-name": noteName,
                "data-audio": midiToFreq(getMIDINumberFromNoteName(noteName)),
                "rx": "15",
                "ry": "15",
            });



            text.classList.add("white-key-text");
            whiteKeyTextGroup.appendChild(whiteKey);
            whiteKeyTextGroup.appendChild(text);
            SVG.appendChild(whiteKeyTextGroup)

            //Increment spacing between
            whiteKeyPositionX += whiteKeyWidth;

        });

        // Add black keys
        let blackKeyPositionX = 60;

        allNaturalNotes.forEach((naturalNote, index, array) => {
            if (index === array.length - 1) {
                return;
            }

            const blackKeyTextGroup = utils.createSVGElement("g");
            const blackKey = this.createKey({ className: "black-key", width: whiteKeyWidth / 2, height: pianoHeight / 1.6 });
            const flatNameText = utils.createSVGElement("text");
            const sharpNameText = utils.createSVGElement("text");

            utils.setAttributes(blackKeyTextGroup, {
                "width": whiteKeyWidth / 2
            });

            for (let i = 0; i < naturalNotesSharps.length; i++) {
                let naturalSharpNoteName = naturalNotesSharps[i];
                let naturalFlatNoteName = naturalNotesFlats[i];

                if (naturalSharpNoteName === naturalNote[0]) {

                    utils.setAttributes(blackKey, {
                        "x": blackKeyPositionX,
                        "data-sharp-name": `${naturalSharpNoteName}#${naturalNote[1]}`,
                        "data-flat-name": `${naturalFlatNoteName}♭${naturalNote[1]}`,
                        "data-audio": midiToFreq(getMIDINumberFromNoteName(`${naturalSharpNoteName}#${naturalNote[1]}`)),
                        "rx": "8",
                        "ry": "8",

                    });

                    utils.setAttributes(sharpNameText, {
                        "text-anchor": "middle",
                        "y": 215,
                        "x": blackKeyPositionX + (whiteKeyWidth / 4)
                    });

                    utils.setAttributes(flatNameText, {
                        "text-anchor": "middle",
                        "y": 235,
                        "x": blackKeyPositionX + (whiteKeyWidth / 4)
                    });

                    utils.addTextContent(sharpNameText, `${naturalSharpNoteName}♯`);
                    utils.addTextContent(flatNameText, `${naturalFlatNoteName}♭`);

                    flatNameText.classList.add("black-key-text");
                    sharpNameText.classList.add("black-key-text");


                    // Add double spacing between D# and A#
                    if (naturalSharpNoteName === "D" || naturalSharpNoteName === "A") {
                        blackKeyPositionX += whiteKeyWidth * 2;
                    } else {
                        blackKeyPositionX += whiteKeyWidth;
                    }

                    blackKeyTextGroup.appendChild(blackKey);
                    blackKeyTextGroup.appendChild(flatNameText);
                    blackKeyTextGroup.appendChild(sharpNameText);
                }
            }
            SVG.appendChild(blackKeyTextGroup);

        });
        // Add main SVG to piano div
        piano.appendChild(SVG);

    },
    handleKeyClick(event) {
        const noteName = event.target.dataset.noteName;
        const notesDisplay = document.getElementById('notes-display');
        notesDisplay.textContent = noteName;
    },

    createOctave(octaveNumber) {
        const octave = utils.createSVGElement("g");
        octave.classList.add("octave");

        utils.setAttributes(octave, {
            "transform": `translate(${octaveNumber * octaveWidth}, 0)`
        });
        return octave;
    },
    createKey({ className, width, height }) {
        const key = utils.createSVGElement("rect");
        key.classList.add(className, "key");
        utils.setAttributes(key, {
            "width": width,
            "height": height
        });

        return key;
    },
    getAllNaturalNotes([firstNote, lastNote]) {
        // Assign octave number, notes and positions to variables
        const firstNoteName = firstNote[0];
        const firstOctaveNumber = parseInt(firstNote[1]);

        const lastNoteName = lastNote[0];
        const lastOctaveNumber = parseInt(lastNote[1]);

        const firstNotePosition = naturalNotes.indexOf(firstNoteName);
        const lastNotePosition = naturalNotes.indexOf(lastNoteName);

        const allNaturalNotes = [];

        for (let octaveNumber = firstOctaveNumber; octaveNumber <= lastOctaveNumber; octaveNumber++) {
            //Handle first octave
            if (octaveNumber === firstOctaveNumber) {
                naturalNotes.slice(firstNotePosition).forEach((noteName) => {
                    allNaturalNotes.push(noteName + octaveNumber);
                });
                // Handle last octave
            } else if (octaveNumber === lastOctaveNumber) {
                naturalNotes.slice(0, lastNotePosition + 1).forEach((noteName) => {
                    allNaturalNotes.push(noteName + octaveNumber);
                });
            } else {
                naturalNotes.forEach((noteName) => {
                    allNaturalNotes.push(noteName + octaveNumber);
                });
            }

        }
        return allNaturalNotes;
    },
    createMainSVG(pianoWidth, pianoHeight) {
        const svg = utils.createSVGElement("svg");

        utils.setAttributes(svg, {
            "width": "100%",
            "version": "1.1",
            "xmlns": "http://www.w3.org/2000/svg",
            "xmlns:xlink": "http://www.w3.org/1999/xlink",
            "viewBox": `0 0 ${pianoWidth} ${pianoHeight}`


        });
        return svg;
    },
}



//Web Audio Implementation

window.AudioContext = window.AudioContext || window.webkitAudioContext




if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(success, failure)
}

function success(midiAccess) {
    midiAccess.addEventListener('statechange', updateDevices);

    const inputs = midiAccess.inputs;

    inputs.forEach((input) => {
        input.addEventListener('midimessage', handleInput);
    })
}

function handleInput(input) {
    const command = input.data[0];
    const note = input.data[1];
    const velocity = input.data[2];

    switch (command) {
        case 144: // noteOn
            noteOn(note, velocity)
            break;
        case 128: //noteOff
            noteOff(note);
            break;
    }
}

//Handling Pressed Keys

const activeNotes = [];
const audioElements = {};

function noteOn(note) {

    const noteName = getNoteNameFromMIDINumber(note);
    const audioFile = `samples/${encodeURIComponent(noteName)}.wav`;

    const audio = new Audio(audioFile);
    audio.volume = document.getElementById('volumeRange').value;

    document.getElementById('volumeRange').addEventListener('input', function (event) {
        const volume = event.target.value;

        // Update the volume for all active audio elements
        Object.values(audioElements).forEach(audio => {
            audio.volume = volume;
        });
    });
    audio.play();

    audioElements[noteName] = audio;

    // Highlight the corresponding key
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        const noteName = key.dataset.noteName;
        const sharpName = key.dataset.sharpName;
        const flatName = key.dataset.flatName;

        if (
            noteName === getNoteNameFromMIDINumber(note) ||
            sharpName === getNoteNameFromMIDINumber(note) ||
            flatName === getNoteNameFromMIDINumber(note)
        ) {
            key.classList.add('highlight');
        }
    });

    // Add the note to the array of active notes
    activeNotes.push(note);

    // Update the displayed notes in the middle of the screen
    updateNotesDisplay();
}


function noteOff(note) {

    const noteName = getNoteNameFromMIDINumber(note);
    const audio = audioElements[noteName];


    if (audio) {
        const fadeOutDuration = 60; // Duration of the fade-out effect in milliseconds
        const fadeOutInterval = 10; // Interval between each volume adjustment during the fade-out

        // Check if there is an existing audio element for the note
        const existingAudio = audioElements[noteName];
        if (existingAudio) {
            // Schedule the fade-out effect for the existing audio element
            let currentVolume = existingAudio.volume;
            const fadeOutIntervalId = setInterval(() => {
                currentVolume -= existingAudio.volume / (fadeOutDuration / fadeOutInterval);
                if (currentVolume > 0) {
                    existingAudio.volume = currentVolume;
                } else {
                    clearInterval(fadeOutIntervalId);
                    existingAudio.pause();
                    existingAudio.currentTime = 0;
                    // Remove the existing audio element from the collection
                    delete audioElements[noteName];
                }
            }, fadeOutInterval);
        }

        // Add the new audio element to the collection
        audioElements[noteName] = audio;
    }



    // Remove the highlight from the corresponding key
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        const noteName = key.dataset.noteName;
        const sharpName = key.dataset.sharpName;
        const flatName = key.dataset.flatName;

        if (noteName === getNoteNameFromMIDINumber(note) || sharpName === getNoteNameFromMIDINumber(note) || flatName === getNoteNameFromMIDINumber(note)) {
            key.classList.remove('highlight');
        }
    });

    // Remove the note from the array of active notes
    const noteIndex = activeNotes.indexOf(note);
    if (noteIndex !== -1) {
        activeNotes.splice(noteIndex, 1);
    }

    // Update the displayed notes in the middle of the screen
    updateNotesDisplay();
}

function updateNotesDisplay() {
    const notesDisplay = document.querySelector('#notes-display');

    // Clear the current content
    notesDisplay.textContent = '';

    // Add the active notes to the display
    activeNotes.forEach(note => {
        const noteName = getNoteNameFromMIDINumber(note);
        const noteText = document.createElement('span');
        noteText.textContent = noteName;
        notesDisplay.appendChild(noteText);
    });
}



//Keyobard Mapping

const keyMap = {
    'a': 60, // C4
    'w': 61, // C#4
    's': 62, // D4
    'e': 63, //D#4
    'd': 64, // E4
    'f': 65, // F4
    't': 66, //F#4
    'g': 67, // G4
    'y': 68, //G#4
    'h': 69, // A4
    'u': 70, //A#4
    'j': 71, // B4
    'k': 72, // C5
};

// Add event listeners to capture keyboard events
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Track the pressed keys
const pressedKeys = new Set();

function handleKeyDown(event) {
    const key = event.key.toLowerCase();

    // Ignore repeated keydown events
    if (pressedKeys.has(key)) return;

    // Check if the pressed key is mapped to a MIDI note
    if (key in keyMap) {
        const note = keyMap[key];
        const velocity = 127; // Set the velocity to maximum

        noteOn(note, velocity);
    }

    pressedKeys.add(key);
}

function handleKeyUp(event) {
    const key = event.key.toLowerCase();

    // Check if the released key is mapped to a MIDI note
    if (key in keyMap) {
        const note = keyMap[key];

        noteOff(note);
    }

    pressedKeys.delete(key);
}


app.setupPiano();