const fs = require('fs');

function processFile(file, type, editMarker) {
  let content = fs.readFileSync(file, 'utf8');

  // Add CommentPanel import
  if (!content.includes('import CommentPanel')) {
    content = content.replace(
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, FileText } from 'lucide-react';",
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, FileText } from 'lucide-react';\nimport CommentPanel from './CommentPanel';"
    ).replace(
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, Download } from 'lucide-react';",
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, Download } from 'lucide-react';\nimport CommentPanel from './CommentPanel';"
    ).replace(
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, Download, ChevronDown, ChevronUp } from 'lucide-react';",
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, Download, ChevronDown, ChevronUp } from 'lucide-react';\nimport CommentPanel from './CommentPanel';"
    ).replace(
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';",
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';\nimport CommentPanel from './CommentPanel';"
    );
  }

  // Remove state variables
  content = content.replace(/const \[commentText, setCommentText\] = useState\(''\);\n/g, '');
  content = content.replace(/const \[replyText, setReplyText\] = useState\(''\);\n/g, '');
  content = content.replace(/const \[replyingTo, setReplyingTo\] = useState<string \| null>\(null\);\n/g, '');
  content = content.replace(/const \[expandedReplies, setExpandedReplies\] = useState<Record<string, boolean>>\(\{\}\);\n/g, '');
  content = content.replace(/const \[activeCommentMenuId, setActiveCommentMenuId\] = useState<string \| null>\(null\);\n/g, '');
  content = content.replace(/const \[editingCommentId, setEditingCommentId\] = useState<string \| null>\(null\);\n/g, '');
  content = content.replace(/const \[editCommentText, setEditCommentText\] = useState\(''\);\n/g, '');
  content = content.replace(/const \[loading, setLoading\] = useState\(false\);\n/g, '');
  content = content.replace(/const menuRef = useRef<HTMLDivElement>\(null\);\n/g, '');

  // Remove comment handling functions
  content = content.replace(/const handleAddComment = async [\s\S]*?finally \{\s*setLoading\(false\);\s*\}\s*\};\n/g, '');
  content = content.replace(/const handleDeleteComment = async [\s\S]*?console\.error\('Error deleting comment:', error\);\s*\}\s*\};\n/g, '');
  content = content.replace(/const handleEditComment = async [\s\S]*?console\.error\('Error editing comment:', error\);\s*\}\s*\};\n/g, '');
  content = content.replace(/const toggleReplies = \(commentId: string\) => \{\s*setExpandedReplies\(prev => \(\{ \.\.\.prev, \[commentId\]: !prev\[commentId\] \}\)\);\s*\};\n/g, '');

  // Replace comment UI block
  const startMarker = '{/* Comments Section */}';
  const endMarker = editMarker;
  
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    const targetId = type === 'post' ? 'post.id' : type === 'book' ? 'book.id' : 'image.id';
    const replacement = `{/* Comments Section */}
          <AnimatePresence>
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
          </AnimatePresence>
        </div>
      </div>

      `;
    
    // Some cards have extra `</div></div>` between the end of comments and the edit modal.
    // I need to be careful to preserve the layout wrappers. 
    // Wait, the safest way is to replace `<AnimatePresence>` to `</AnimatePresence>` immediately following `{/* Comments Section */}`.
  }
}

// Just to be safer, let's use exact line replacement instead for each file.
