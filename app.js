const express = require('express');
const fs = require('fs');
require('dotenv/config');
const { URI, AUTH_TOKEN } = process.env;
if (!URI || !AUTH_TOKEN) {
    console.log("Missing required ENV variable.")
    process.exit();
}

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send("Hello world");
})

app.get('/cal', (req, res) => {
    if (req.query["token"] !== AUTH_TOKEN) {
        res.status(401)
           .send("Invalid or missing authorization.")
           .destroy();
        return;
    }

    fetch(new URL(URI)).then(response => {
        if (response.status != 200) {
            res.status(500)
               .send('Failed to fetch calendar.')
               .destroy();
            return;
        }
        response.text().then(text => {
            let ics = modify_ics(text);
            if (!fs.existsSync('temp/')) {
                fs.mkdirSync('temp/');
            }
            fs.writeFileSync('temp/cal.ics', ics)
            res.status(200).download('temp/cal.ics');
        });
    });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

/**
 * @param {string} text
 * @returns {string}
 */
function modify_ics(text) {
    // Get calendar events
    let pointer = text.indexOf("BEGIN:VEVENT\r\n");
    while (pointer != -1) {
        pointer += "BEGIN:VEVENT\r\n".length;
        let end = text.indexOf("\r\nEND:VEVENT", pointer);
        
        let event = text.substring(pointer, end);
        let length = event.length;
        // Get event info
        let summaryMatch = event.match( /(?<=SUMMARY:).*?(?=\r\n[A-Z]+:)/s);
        let locationMatch = event.match( /(?<=LOCATION:).*?(?=\r\n[A-Z]+:)/s);
        if (summaryMatch) {
            // Create new summary
            let summary = summaryMatch[0];
            summary = capitalize(summary.replace(/ *\([\wåäöÅÄÖ]+\/[\wåäöÅÄÖ]+(-[\wåäöÅÄÖ]+)?\).*$/m, ''));
            // Optional location suffix
            if (locationMatch && locationMatch[0].match(/\d+(,\d+)*/)) {
                summary += ' in ' + format_location(locationMatch[0]);
            }

            // Insert new summary
            event = event.substring(0, summaryMatch.index) + summary + event.substring(summaryMatch.index + summaryMatch[0].length);
            text = text.substring(0, pointer) + event + text.substring(pointer+length);
        }
        
        // Find next event
        pointer = text.indexOf("BEGIN:VEVENT\r\n", end+event.length-length);
    }
    return text;
}

/**
 * @param {string} s
 * @returns {string}
 */
function capitalize(s) {
    return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
}

function format_location(location) {
    let locations = location.split('\\,');
    if (locations.length == 1) {
        return 'room ' + locations[0];
    } else {
        return 'rooms ' + locations.slice(0, -1).join('\\, ') + ' and ' + locations.slice(-1);
    }
}
