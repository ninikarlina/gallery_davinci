const fs = require('fs');

const configs = [
  { file: 'app/components/PostCard.tsx', type: 'post' },
  { file: 'app/components/BookCard.tsx', type: 'book' },
  { file: 'app/components/ImageCard.tsx', type: 'image' },
];

configs.forEach(({ file, type }) => {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add import CommentPanel
  if (!content.includes('import CommentPanel')) {
    content = content.replace(
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';",
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';\nimport CommentPanel from './CommentPanel';"
    ).replace(
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, Download, ChevronDown, ChevronUp } from 'lucide-react';",
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, Download, ChevronDown, ChevronUp } from 'lucide-react';\nimport CommentPanel from './CommentPanel';"
    );
  }

  // 2. Remove states that are now in CommentPanel
  // const [commentText, setCommentText] = useState('');
  // const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  // ... etc. 
  // Wait, if I just leave them in, it won't break anything, just unused. 
  // Let's remove them to clean up.
  content = content.replace(/const \[commentText, setCommentText\] = useState\(''\);\n/g, '');
  content = content.replace(/const \[replyText, setReplyText\] = useState\(''\);\n/g, '');
  content = content.replace(/const \[replyingTo, setReplyingTo\] = useState<string \| null>\(null\);\n/g, '');
  content = content.replace(/const \[expandedReplies, setExpandedReplies\] = useState<Record<string, boolean>>\(\{\}\);\n/g, '');
  content = content.replace(/const \[activeCommentMenuId, setActiveCommentMenuId\] = useState<string \| null>\(null\);\n/g, '');
  content = content.replace(/const \[editingCommentId, setEditingCommentId\] = useState<string \| null>\(null\);\n/g, '');
  content = content.replace(/const \[editCommentText, setEditCommentText\] = useState\(''\);\n/g, '');
  content = content.replace(/const \[loading, setLoading\] = useState\(false\);\n/g, '');

  // But BookCard/PostCard uses `loading` for other things?
  // Let's check PostCard.tsx ... ah wait, PostCard uses `loading` for handleLike? No, handleLike sets `setLiked`.
  // Wait, PostCard uses `loading` for handleAddComment. What about image upload? PostCard has no upload.
  // BookCard has no upload. ImageCard has no upload.
  // Let's be careful. Let's just leave the states for now, they are harmless, except maybe eslint warnings.

  // 3. Replace the massive comment section
  // Find {showComments && ( ... )}
  // This is tricky with regex because it spans 200+ lines.
  // Let's find the start and end by matching known strings.
  const startIndex = content.indexOf('{showComments && (');
  if (startIndex !== -1) {
    // Find the matching closing bracket for {showComments && (
    // Actually, it's easier to find the end of the AnimatePresence block.
    const startAnimate = content.indexOf('<AnimatePresence>', startIndex - 50);
    const endAnimate = content.indexOf('</AnimatePresence>', startIndex);
    
    if (startAnimate !== -1 && endAnimate !== -1) {
      const targetId = type === 'post' ? 'post.id' : type === 'book' ? 'book.id' : 'image.id';
      const replacement = `<AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4"
              >
                <CommentPanel 
                  comments={comments} 
                  setComments={setComments} 
                  targetId={${targetId}} 
                  targetType="${type}" 
                  currentUser={currentUser} 
                  token={token || ''} 
                />
              </motion.div>
            )}
          </AnimatePresence>`;
      
      content = content.substring(0, startAnimate) + replacement + content.substring(endAnimate + 18);
    }
  }

  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});

