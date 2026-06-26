const fs = require('fs');

function updateCard(file, type) {
  let content = fs.readFileSync(file, 'utf8');

  // Add CommentPanel import
  if (!content.includes('import CommentPanel')) {
    content = content.replace(
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';",
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, FileText, ChevronDown, ChevronUp } from 'lucide-react';\nimport CommentPanel from './CommentPanel';"
    ).replace(
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, Download, ChevronDown, ChevronUp } from 'lucide-react';",
      "import { Heart, MessageCircle, MoreHorizontal, Edit2, Trash2, Send, X, Download, ChevronDown, ChevronUp } from 'lucide-react';\nimport CommentPanel from './CommentPanel';"
    );
  }

  const startMarker = '<AnimatePresence>\n            {showComments && (';
  const startIndex = content.indexOf(startMarker);
  
  if (startIndex !== -1) {
    // Find the end marker
    let endMarker = '          </AnimatePresence>\n        </div>\n      </div>';
    let endIndex = content.indexOf(endMarker, startIndex);
    
    if (endIndex !== -1) {
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
            )}`;
      
      const contentBefore = content.substring(0, startIndex);
      const contentAfter = content.substring(endIndex - 11); // keep `          </AnimatePresence>\n...`
      
      content = contentBefore + replacement + contentAfter;
      fs.writeFileSync(file, content);
      console.log('Updated', file);
    } else {
      console.log('End marker not found for', file);
    }
  } else {
    console.log('Start marker not found for', file);
  }
}

updateCard('app/components/PostCard.tsx', 'post');
updateCard('app/components/BookCard.tsx', 'book');
updateCard('app/components/ImageCard.tsx', 'image');
