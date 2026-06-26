const fs = require('fs');
const files = [
  'app/components/PostCard.tsx',
  'app/components/ImageCard.tsx',
  'app/components/BookCard.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Regex to find the current inline AnimatePresence block
  const oldBlockRegex = /\{\/\* Comments Section \*\/\}\s*<AnimatePresence>\s*\{showComments && \(\s*<motion\.div\s*initial=\{\{ opacity: 0, height: 0 \}\}\s*animate=\{\{ opacity: 1, height: 'auto' \}\}\s*exit=\{\{ opacity: 0, height: 0 \}\}\s*className="overflow-hidden mt-4"\s*>\s*<CommentPanel([\s\S]*?)\/>\s*<\/motion\.div>\s*\)\}\s*<\/AnimatePresence>/g;

  const newBlock = `{/* Comments Bottom Sheet Modal */}
          <AnimatePresence>
            {showComments && (
              <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowComments(false)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                
                {/* Modal Body */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="relative w-full max-w-2xl bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col h-[85vh] sm:max-h-[80vh] overflow-hidden"
                >
                  <div className="flex justify-between items-center p-5 border-b border-white/10 shrink-0 bg-white/[0.02]">
                    <h3 className="text-sm font-bold tracking-widest text-white uppercase flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-white/50" />
                      Komentar
                    </h3>
                    <button onClick={() => setShowComments(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar-parchment bg-black/20">
                    <CommentPanel$1/>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>`;

  const newContent = content.replace(oldBlockRegex, newBlock);
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
  } else {
    console.log('No match found in ' + file);
  }
});
