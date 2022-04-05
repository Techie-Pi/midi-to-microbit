import { Midi } from "@tonaljs/tonal";
import { Midi as Midi2 } from "@tonejs/midi";

import "./style.css";

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
