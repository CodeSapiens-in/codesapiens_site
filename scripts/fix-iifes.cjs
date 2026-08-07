const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'CodeSapiensHero.jsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. EXTRACT EVENTS STACK
const eventsStartIndicator = '{(() => {\r\n                // Individual tile';
let eventsStart = code.indexOf('{(() => {\n                // Individual tile');
if (eventsStart === -1) eventsStart = code.indexOf('{(() => {\r\n                // Individual tile');

let eventsEndStr = 'return <EventsStack />;\n            })()}';
let eventsEnd = code.indexOf(eventsEndStr);
if (eventsEnd === -1) {
    eventsEndStr = 'return <EventsStack />;\r\n            })()}';
    eventsEnd = code.indexOf(eventsEndStr);
}

if(eventsStart === -1 || eventsEnd === -1) {
    console.error('Events section not found');
    process.exit(1);
}

const eventsCode = code.slice(eventsStart, eventsEnd + eventsEndStr.length);
// Transform eventsCode to extract just the components
let extractedEvents = eventsCode
    .replace('{(() => {', '')
    .replace('return <EventsStack />;\n            })()}', '')
    .replace('return <EventsStack />;\r\n            })()}', '');
    
// Replace `communityPhotos.slice` with `props.communityPhotos`
extractedEvents = extractedEvents.replace('const EventsStack = () => {', 'const EventsStack = ({ communityPhotos }) => {');


// 2. EXTRACT MAPPED CARDS
let mappedStart = code.indexOf('{(() => {\n                    const members = [');
if (mappedStart === -1) mappedStart = code.indexOf('{(() => {\r\n                    const members = [');

let mappedEndStr = 'return <MappedCards />;\n                })()}';
let mappedEnd = code.indexOf(mappedEndStr);
if (mappedEnd === -1) {
    mappedEndStr = 'return <MappedCards />;\r\n                })()}';
    mappedEnd = code.indexOf(mappedEndStr);
}

if(mappedStart === -1 || mappedEnd === -1) {
    console.error('MappedCards section not found');
    process.exit(1);
}

const mappedCode = code.slice(mappedStart, mappedEnd + mappedEndStr.length);
let extractedMapped = mappedCode
    .replace('{(() => {', '')
    .replace('return <MappedCards />;\n                })()}', '')
    .replace('return <MappedCards />;\r\n                })()}', '');


// 3. EXTRACT SCROLL COLOR TEXT
let scrollStart = code.indexOf('{(() => {\n                const ScrollColorText = () => {');
if (scrollStart === -1) scrollStart = code.indexOf('{(() => {\r\n                const ScrollColorText = () => {');

let scrollEndStr = 'return <ScrollColorText />;\n            })()}';
let scrollEnd = code.indexOf(scrollEndStr);
if (scrollEnd === -1) {
    scrollEndStr = 'return <ScrollColorText />;\r\n            })()}';
    scrollEnd = code.indexOf(scrollEndStr);
}

if(scrollStart === -1 || scrollEnd === -1) {
    console.error('Scroll portion not found');
    process.exit(1);
}

const scrollCode = code.slice(scrollStart, scrollEnd + scrollEndStr.length);
let extractedScroll = scrollCode
    .replace('{(() => {', '')
    .replace('return <ScrollColorText />;\n            })()}', '')
    .replace('return <ScrollColorText />;\r\n            })()}', '');


// DO REPLACEMENTS
code = code.replace(eventsCode, '<EventsStack communityPhotos={communityPhotos} />');
code = code.replace(mappedCode, '<MappedCards />');
code = code.replace(scrollCode, '<ScrollColorText />');

// INSERT EXTRACTED COMPONENTS ABOVE CodeSapiensHero
const insertionPointStr = '// --- Main Hero Component ---';
const insertionPoint = code.indexOf(insertionPointStr);
if (insertionPoint === -1) {
    console.error('Insertion point not found');
    process.exit(1);
}

const combinedExtracted = `
// --- Extracted Top Level Components to Fix Production Hooks Rule ---
${extractedEvents}
${extractedMapped}
${extractedScroll}

`;

code = code.slice(0, insertionPoint) + combinedExtracted + code.slice(insertionPoint);

fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully refactored IIFE components outside!');
