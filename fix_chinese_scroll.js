const fs = require('fs');

let content = fs.readFileSync('app/components/CommentPanel.tsx', 'utf8');

// Replace top section
const topStart = '  return (\n    <div className="relative mt-8 mb-4 px-2 sm:px-4 drop-shadow-2xl">';
const topEnd = '        {/* Comments List */}';

const newTop = `  return (
    <div className="relative mt-14 mb-8 px-2 sm:px-4 drop-shadow-2xl">
      
      {/* Hanging Strings (Tali) */}
      <svg className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-12 z-0" viewBox="0 0 100 50">
        <path d="M50 5 L15 50 M50 5 L85 50" stroke="#8b0000" strokeWidth="2.5" fill="none" className="drop-shadow-sm" strokeLinecap="round" />
        <circle cx="50" cy="5" r="4" fill="#5c0000" />
        <circle cx="50" cy="5" r="2" fill="#8b0000" />
        {/* String knots on the roller */}
        <path d="M13 45 L17 50 M17 45 L13 50 M83 45 L87 50 M87 45 L83 50" stroke="#8b0000" strokeWidth="1.5" />
      </svg>

      {/* Top Roller (Mahogany Wood & Jade/Gold Caps) */}
      <div className="absolute top-0 left-0 right-0 h-6 rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.5)] border-y border-[#1a0500] z-20 mx-[-12px] sm:mx-[-16px]"
           style={{
             backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 8px), linear-gradient(to bottom, #2b0a04, #5c1608, #1a0500)'
           }}>
        {/* Jade End Caps */}
        <div className="absolute top-[-2px] bottom-[-2px] left-[-4px] w-4 bg-gradient-to-r from-[#006b3c] via-[#00a86b] to-[#004225] rounded-full shadow-inner border border-[#002112]" />
        <div className="absolute top-[-2px] bottom-[-2px] right-[-4px] w-4 bg-gradient-to-l from-[#006b3c] via-[#00a86b] to-[#004225] rounded-full shadow-inner border border-[#002112]" />
      </div>

      {/* Silk Brocade & Rice Paper */}
      <div 
        className="relative pt-8 pb-10 px-4 sm:px-6 z-10"
        style={{
          borderLeft: '14px solid #8b0000',
          borderRight: '14px solid #8b0000',
          backgroundColor: '#FFF8E7', // Lighter rice paper for Chinese scrolls
          backgroundImage: \`
            url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.03' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")
          \`,
          boxShadow: 'inset 0 0 40px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(139, 0, 0, 0.1)'
        }}
      >
        {/* Decorative Inner Border (Gold) */}
        <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none border-x-2 border-[#d4af37] opacity-60"></div>

        {/* Comments List */}`;

const startIndex = content.indexOf(topStart);
const endIndex = content.indexOf(topEnd);
if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newTop + content.substring(endIndex + topEnd.length);
}

// Replace bottom section
const bottomStart = '      {/* Bottom Roller */}';
const bottomEnd = '  );\n}';

const newBottom = `      {/* Bottom Roller (Mahogany Wood & Jade Caps) */}
      <div className="absolute bottom-0 left-0 right-0 h-7 rounded-full shadow-[0_6px_8px_rgba(0,0,0,0.6)] border-y border-[#1a0500] z-20 mx-[-16px] sm:mx-[-20px]"
           style={{
             backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.3) 0px, rgba(0,0,0,0.3) 2px, transparent 2px, transparent 8px), linear-gradient(to bottom, #2b0a04, #5c1608, #1a0500)'
           }}>
        {/* Jade End Caps */}
        <div className="absolute top-[-3px] bottom-[-3px] left-[-6px] w-6 bg-gradient-to-r from-[#006b3c] via-[#00a86b] to-[#004225] rounded-full shadow-inner border border-[#002112]" />
        <div className="absolute top-[-3px] bottom-[-3px] right-[-6px] w-6 bg-gradient-to-l from-[#006b3c] via-[#00a86b] to-[#004225] rounded-full shadow-inner border border-[#002112]" />
        
        {/* Bottom Tassels (Rumbai Merah) */}
        <div className="absolute top-full left-[15%] w-2 h-12 bg-gradient-to-b from-[#8b0000] to-transparent opacity-80" style={{ borderLeft: '1px dashed #5c0000', borderRight: '1px dashed #5c0000' }}></div>
        <div className="absolute top-full right-[15%] w-2 h-12 bg-gradient-to-b from-[#8b0000] to-transparent opacity-80" style={{ borderLeft: '1px dashed #5c0000', borderRight: '1px dashed #5c0000' }}></div>
      </div>

    </div>
  );
}`;

const bStartIndex = content.indexOf(bottomStart);
const bEndIndex = content.lastIndexOf(bottomEnd);
if (bStartIndex !== -1 && bEndIndex !== -1) {
  content = content.substring(0, bStartIndex) + newBottom + content.substring(bEndIndex + bottomEnd.length);
}

fs.writeFileSync('app/components/CommentPanel.tsx', content);
