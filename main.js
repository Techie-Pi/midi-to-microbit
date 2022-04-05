import { Midi } from "@tonaljs/tonal";
import { Midi as Midi2 } from "@tonejs/midi";

import "./style.css";

const result_el = document.getElementById("result");
const copy_btn_el = document.getElementById("copy-btn");
const thanks_el = document.getElementById("thanks");
const source_midi = document.getElementById("midi");

function parse_file(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.addEventListener("load", e => {
            resolve(new Midi2(e.target.result))
        })
        reader.readAsArrayBuffer(file);
    });
}

function check_freq(freq, filter_level) {
    if(filter_level === 1) {
        return freq > 988 || freq < 131
    } else if(filter_level === 2) {
        return freq > 587 || freq < 220
    } else {
        console.warn(`Unknown filter_level: ${filter_level}! Using fallback`);
        return freq > 988 || freq < 131
    }
}

function random_rage_emojis() {
    const number_of_emojis = Math.round(Math.random() * 10 + 2);
    const emojis = ["🥵", "😫", "😏", "😣", "🥵", "🤬", "🤐", "😰", "🤡", "🤩", "😥", "🥱", "😪", "😲", "🐆", "🐘", "🐠", "👨‍👧", "🐇", "🐕"];
    let text = "";

    for(let i = 0; i < number_of_emojis; i++) {
        text += emojis[Math.floor(Math.random() * emojis.length)]
    }

    return text;
}

copy_btn_el.addEventListener("click", async () => {
    await window.navigator.clipboard.writeText(result_el.textContent.replace("Resultado:", ""));
})

thanks_el.addEventListener("click", () => {
    thanks_el.textContent = `Para que me haces cosquillas ${random_rage_emojis()}`
})

source_midi.addEventListener("change", async e => {
    let filter_level = 2;

    const files = e.target.files;
    if(files.length <= 0) {
        return;
    }

    const file = files[0];
    const parsed = await parse_file(file);

    console.log(parsed);

    let notes = [];
    parsed.tracks[0].notes.forEach(note => {
        if(filter_level > 0) {
            let freq = Midi.midiToFreq(note.midi);
            if(check_freq(freq, filter_level)) {
                return;
            }
        }

        notes.push([Math.round(note.duration * 1000), Math.round(Midi.midiToFreq(note.midi)), note.name])
    })

    let code = "";
    notes.forEach(note => {
        code += `music.playTone(${note[1]}, ${note[0]})\n`
    })
    console.log(code);

    result_el.textContent = `Resultado:\n\n${code}`;
    thanks_el.hidden = false;
})

/*window.MidiParser.parse(source_midi, midi => {
    console.log(midi);
    let notes = [];
    midi.track.forEach(track => {
        track.event.forEach(event => {
            if(event.metaType != null) {
                return;
            }

            if(event.type === 9) {
                notes.push(event.data[0])
            }

            console.log(event.channel);
        })
    })

    let text = "";
    let counter = 0;
    notes.forEach(midi => {
        if(counter === 0) {
            text += "music.play_melody(\"";
        }

        text += `${Midi.midiToNoteName(midi)} `;

        counter++;
        if((counter - 1) === 7) {
            text += "\", 120)\n";
            counter = 0;
        }
    })

    console.log(text);
})
*/
