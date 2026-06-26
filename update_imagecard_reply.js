const fs = require('fs');
const filePath = '/home/randukumbolo/Workspace/vscode/project/gallery_davinci/gallery_davinci/app/components/ImageCard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add state for replying
content = content.replace(
  "const [activeCommentMenuId, setActiveCommentMenuId] = useState<string | null>(null);",
  "const [activeCommentMenuId, setActiveCommentMenuId] = useState<string | null>(null);\n  const [replyingTo, setReplyingTo] = useState<string | null>(null);\n  const [replyText, setReplyText] = useState('');"
);

// 2. Modify handleAddComment
const newHandleAddComment = `  const handleAddComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!currentUser || !token) {
      window.location.href = '/login';
      return;
    }
    
    const textToSubmit = parentId ? replyText : commentText;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post(
        \`/api/images/\${image.id}/comments\`,
        { text: textToSubmit, parentId },
        { headers: { Authorization: \`Bearer \${token}\` } }
      );
      
      const newComment = {
        id: response.data.comment?.id || Date.now().toString(),
        content: textToSubmit,
        createdAt: new Date().toISOString(),
        parentId,
        author: {
          id: currentUser.id,
          fullName: currentUser.fullName,
          username: currentUser.username,
          avatar: currentUser.avatar,
        },
      };
      
      setComments([...comments, newComment]);
      if (parentId) {
        setReplyText('');
        setReplyingTo(null);
      } else {
        setCommentText('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };`;

content = content.replace(/  const handleAddComment = async \(e: React\.FormEvent\) => \{[\s\S]*?  \};\n/g, newHandleAddComment + '\n');

// 3. Extract rendering comments into a function to support nesting
const renderCommentsSection = `                  {/* Comments List */}
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-2 space-y-4">
                    {comments?.length > 0 ? (
                      comments.filter((c: any) => !c.parentId).map((comment: any) => {
                        const commentAuthorName = comment.author?.username || comment.author?.fullName || 'Anonim';
                        const commentAuthorId = comment.author?.id;
                        const isCommentOwner = currentUser?.id === commentAuthorId;
                        const isEditing = editingCommentId === comment.id;
                        const replies = comments.filter((c: any) => c.parentId === comment.id);

                        return (
                          <div key={comment.id} className="space-y-3">
                            <div className="flex gap-3 group/comment relative">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-black border border-white/10 shrink-0">
                                {comment.author?.avatar ? (
                                  <img src={comment.author.avatar} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="flex items-center justify-center w-full h-full text-sm font-bold text-white/50">
                                    {commentAuthorName.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <span className="text-sm font-bold text-white/80">{commentAuthorName}</span>
                                  
                                  {/* Comment Actions */}
                                  {isCommentOwner && !isEditing && (
                                    <div className="relative" ref={activeCommentMenuId === comment.id ? menuRef : null}>
                                      <button 
                                        onClick={() => setActiveCommentMenuId(activeCommentMenuId === comment.id ? null : comment.id)}
                                        className="p-1 text-white/20 hover:text-white transition-colors opacity-0 group-hover/comment:opacity-100 focus:opacity-100"
                                      >
                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                      </button>
                                      
                                      <AnimatePresence>
                                        {activeCommentMenuId === comment.id && (
                                          <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute right-0 top-6 w-24 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden z-20"
                                          >
                                            <button 
                                              onClick={() => { setActiveCommentMenuId(null); setEditingCommentId(comment.id); setEditCommentText(comment.content || comment.text); }}
                                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5"
                                            >
                                              Edit
                                            </button>
                                            <button 
                                              onClick={() => { setActiveCommentMenuId(null); handleDeleteComment(comment.id); }}
                                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                            >
                                              Hapus
                                            </button>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                                </div>

                                {isEditing ? (
                                  <div className="mt-1">
                                    <textarea
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      className="w-full bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 shadow-inner min-h-[60px]"
                                    />
                                    <div className="flex gap-2 mt-2">
                                      <button 
                                        onClick={() => handleEditComment(comment.id)}
                                        className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-colors"
                                      >
                                        Simpan
                                      </button>
                                      <button 
                                        onClick={() => setEditingCommentId(null)}
                                        className="px-3 py-1.5 bg-white/5 text-white/50 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors"
                                      >
                                        Batal
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm text-white/60 mt-0.5 leading-relaxed">{comment.content || comment.text}</p>
                                    <button 
                                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                      className="text-[10px] font-bold tracking-widest text-white/30 hover:text-blue-400 uppercase transition-colors mt-1"
                                    >
                                      Balas
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Replies */}
                            {replies.length > 0 && (
                              <div className="ml-11 space-y-3">
                                {replies.map((reply: any) => {
                                  const replyAuthorName = reply.author?.username || reply.author?.fullName || 'Anonim';
                                  const isReplyOwner = currentUser?.id === reply.author?.id;
                                  const isEditingReply = editingCommentId === reply.id;
                                  
                                  return (
                                    <div key={reply.id} className="flex gap-2.5 group/reply relative">
                                      <div className="w-6 h-6 rounded-full overflow-hidden bg-black border border-white/10 shrink-0">
                                        {reply.author?.avatar ? (
                                          <img src={reply.author.avatar} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                          <span className="flex items-center justify-center w-full h-full text-xs font-bold text-white/50">
                                            {replyAuthorName.charAt(0).toUpperCase()}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                          <span className="text-xs font-bold text-white/80">{replyAuthorName}</span>
                                          {isReplyOwner && !isEditingReply && (
                                            <div className="relative" ref={activeCommentMenuId === reply.id ? menuRef : null}>
                                              <button 
                                                onClick={() => setActiveCommentMenuId(activeCommentMenuId === reply.id ? null : reply.id)}
                                                className="p-1 text-white/20 hover:text-white transition-colors opacity-0 group-hover/reply:opacity-100 focus:opacity-100"
                                              >
                                                <MoreHorizontal className="w-3 h-3" />
                                              </button>
                                              
                                              <AnimatePresence>
                                                {activeCommentMenuId === reply.id && (
                                                  <motion.div
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.95 }}
                                                    className="absolute right-0 top-5 w-24 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg shadow-xl overflow-hidden z-20"
                                                  >
                                                    <button onClick={() => { setActiveCommentMenuId(null); setEditingCommentId(reply.id); setEditCommentText(reply.content || reply.text); }} className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-white/70 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5">Edit</button>
                                                    <button onClick={() => { setActiveCommentMenuId(null); handleDeleteComment(reply.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">Hapus</button>
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>
                                            </div>
                                          )}
                                        </div>
                                        {isEditingReply ? (
                                          <div className="mt-1">
                                            <textarea value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="w-full bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-xl p-2 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 shadow-inner min-h-[50px]" />
                                            <div className="flex gap-2 mt-2">
                                              <button onClick={() => handleEditComment(reply.id)} className="px-2 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500/30 transition-colors">Simpan</button>
                                              <button onClick={() => setEditingCommentId(null)} className="px-2 py-1 bg-white/5 text-white/50 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:text-white transition-colors">Batal</button>
                                            </div>
                                          </div>
                                        ) : (
                                          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">{reply.content || reply.text}</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Reply Input Form */}
                            <AnimatePresence>
                              {replyingTo === comment.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="ml-11 mt-2"
                                >
                                  <form onSubmit={(e) => handleAddComment(e, comment.id)} className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="Balas komentar..."
                                      value={replyText}
                                      onChange={(e) => setReplyText(e.target.value)}
                                      autoFocus
                                      className="flex-1 bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-full px-3 py-1.5 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 shadow-inner"
                                    />
                                    <button
                                      type="submit"
                                      disabled={loading || !replyText.trim()}
                                      className="w-7 h-7 rounded-full bg-gradient-to-b from-blue-500/80 to-blue-600/80 hover:from-blue-400 hover:to-blue-500 border border-blue-400/50 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shrink-0"
                                    >
                                      <Send className="w-3 h-3 -ml-0.5" />
                                    </button>
                                  </form>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-white/30 text-center py-4 font-medium tracking-widest uppercase">Belum ada komentar</p>
                    )}
                  </div>

                  {/* Add Top-level Comment Input */}`;

content = content.replace(
  /                  \{\/\* Comments List \*\/\}\n                  <div className="max-h-\[300px\] overflow-y-auto custom-scrollbar pr-2 space-y-4">[\s\S]*?                  \{\/\* Add Comment Input \*\/\}/g,
  renderCommentsSection
);

fs.writeFileSync(filePath, content);
console.log('ImageCard.tsx updated successfully');
