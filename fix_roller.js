const fs = require('fs');
const file = 'app/components/CommentPanel.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldTopRoller = `<div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#5c4033] via-[#8b5a2b] to-[#3e2723] rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.5)] border-y border-[#2a1710] z-20 mx-[-12px] sm:mx-[-16px]">`;

const newTopRoller = `<div className="absolute top-0 left-0 right-0 h-6 rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.5)] border-y border-[#2a1710] z-20 mx-[-12px] sm:mx-[-16px]"
           style={{
             backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, transparent 2px, transparent 8px), linear-gradient(to bottom, #5c4033, #8b5a2b, #3e2723)'
           }}>`;

const oldBottomRoller = `<div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-[#5c4033] via-[#8b5a2b] to-[#3e2723] rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.5)] border-y border-[#2a1710] z-20 mx-[-12px] sm:mx-[-16px]">`;

const newBottomRoller = `<div className="absolute bottom-0 left-0 right-0 h-6 rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.5)] border-y border-[#2a1710] z-20 mx-[-12px] sm:mx-[-16px]"
           style={{
             backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, transparent 2px, transparent 8px), linear-gradient(to bottom, #5c4033, #8b5a2b, #3e2723)'
           }}>`;

content = content.replace(oldTopRoller, newTopRoller);
content = content.replace(oldBottomRoller, newBottomRoller);

fs.writeFileSync(file, content);
console.log('Updated rollers');
