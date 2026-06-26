const fs = require('fs');

const filePath = '/home/randukumbolo/Workspace/vscode/project/gallery_davinci/gallery_davinci/app/components/UnifiedUploadForm.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Add isExpanded state
content = content.replace(
  "const [success, setSuccess] = useState('');",
  "const [success, setSuccess] = useState('');\n  const [isExpanded, setIsExpanded] = useState(false);"
);

// Close on success
content = content.replace(
  "setTimeout(() => setSuccess(''), 3000);",
  "setIsExpanded(false);\n      setTimeout(() => setSuccess(''), 3000);"
);

// Modify return block
const newReturnStart = `  return (
    <div className="w-full relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-lg overflow-hidden mb-12">
      <div className={\`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-500 \${contentType === 'book' ? 'bg-amber-500' : contentType === 'image' ? 'bg-purple-500' : 'bg-white'}\`} />
      
      {/* Header / Toggle */}
      <div 
        className="relative z-20 flex items-center justify-between p-5 sm:p-6 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={\`w-10 h-10 rounded-xl flex items-center justify-center transition-colors \${isExpanded ? 'bg-white/10' : 'bg-white/5'}\`}>
            <UploadCloud className="w-5 h-5 text-white/80" />
          </div>
          <span className="font-bold tracking-wide text-white/90">Bagikan Karya Baru</span>
        </div>
        <button 
          className={\`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center transition-all \${isExpanded ? 'bg-white/10 rotate-45' : 'hover:bg-white/10 hover:scale-105'}\`}
        >
          <Plus className="w-5 h-5 text-white/80" />
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 relative z-10">
              {/* Tabs */}
              <div className="flex p-2 gap-2 bg-black/40 border-b border-white/5">`;

content = content.replace(
  /return \([\s\S]*?\{\/\* Tabs \*\/\}\s*<div className="[^"]*flex p-2 gap-2[^"]*">/,
  newReturnStart
);

const newReturnEnd = `        </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );`;

content = content.replace(
  /        <\/form>\s*<\/div>\s*<\/div>\s*\);\s*}\s*$/,
  newReturnEnd + "\n}"
);

fs.writeFileSync(filePath, content);
console.log('UnifiedUploadForm updated successfully.');
