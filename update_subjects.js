const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'questions.json');
const rawData = fs.readFileSync(filePath, 'utf8');
const questions = JSON.parse(rawData);

let updatedCount = 0;

questions.forEach((q) => {
    const text = (q.question + ' ' + q.subtopic + ' ' + q.explanation).toLowerCase();

    // Split Blood Banking & Serology
    if (q.subject === 'Blood Banking & Serology') {
        if (
            text.includes('syphilis') ||
            text.includes('rpr') ||
            text.includes('vdrl') ||
            text.includes('reagin') ||
            text.includes('fta') ||
            text.includes('elisa') ||
            text.includes('hiv')
        ) {
            q.subject = 'Serology';
        } else {
            q.subject = 'Blood Banking';
        }
        updatedCount++;
    }

    // Split Histopathology & MedTech Laws
    if (q.subject === 'Histopathology & MedTech Laws') {
        if (
            text.includes('ra 5527') ||
            text.includes('republic act') ||
            text.includes('board') ||
            text.includes('chairman') ||
            text.includes('prc') ||
            text.includes('law') ||
            text.includes('section') ||
            text.includes('pamet') ||
            text.includes('pasmeth') ||
            text.includes('license')
        ) {
            q.subject = 'MedTech Laws';
        } else {
            q.subject = 'Histopathology';
        }
        updatedCount++;
    }
});

fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
console.log(`Successfully classified and updated ${updatedCount} questions!`);