const fs = require('fs');

const files = [
  'app/components/PostCard.tsx',
  'app/components/BookCard.tsx',
  'app/components/ImageCard.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add ChevronUp, ChevronDown to lucide-react imports if not present
  if (!content.includes('ChevronDown')) {
    content = content.replace(/from 'lucide-react';/, ", ChevronDown, ChevronUp } from 'lucide-react';");
    content = content.replace(/} , ChevronDown/, ", ChevronDown"); // quick fix if regex matched strangely
  }

  // 2. Add expandedReplies state
  if (!content.includes('expandedReplies')) {
    content = content.replace(
      /const \[replyingTo, setReplyingTo\] = useState<string \| null>\(null\);/,
      "const [replyingTo, setReplyingTo] = useState<string | null>(null);\n  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});"
    );
  }

  // 3. Replace Balas button
  const oldBalas = `<button 
                                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                      className="text-[10px] font-bold tracking-widest text-white/30 hover:text-blue-400 uppercase transition-colors mt-1"
                                    >
                                      Balas
                                    </button>`;

  const newBalas = `<div className="flex items-center gap-4 mt-1">
                                      <button 
                                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                        className="text-[10px] font-bold tracking-widest text-white/30 hover:text-blue-400 uppercase transition-colors"
                                      >
                                        Balas
                                      </button>
                                      {replies.length > 0 && (
                                        <button 
                                          onClick={() => setExpandedReplies(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                                          className="text-[10px] font-bold tracking-widest text-blue-400/70 hover:text-blue-400 uppercase transition-colors flex items-center gap-1"
                                        >
                                          {expandedReplies[comment.id] ? (
                                            <>
                                              <ChevronUp className="w-3 h-3" />
                                              Sembunyikan
                                            </>
                                          ) : (
                                            <>
                                              <ChevronDown className="w-3 h-3" />
                                              Lihat {replies.length} balasan
                                            </>
                                          )}
                                        </button>
                                      )}
                                    </div>`;

  if (content.includes(oldBalas)) {
    content = content.replace(oldBalas, newBalas);
  }

  // 4. Update replies rendering condition
  content = content.replace(
    /\{\/\* Replies \*\/\}\n\s*\{replies\.length > 0 && \(/g,
    `{/* Replies */}\n                            {replies.length > 0 && expandedReplies[comment.id] && (`
  );

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
