const fs = require('fs');

const filePath = '/home/randukumbolo/Workspace/vscode/project/gallery_davinci/gallery_davinci/app/components/UnifiedUploadForm.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const newReturnBlock = `    return (
    <>
      {/* Floating Action Button (FAB) */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(true)}
            className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-40 w-14 h-14 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(168,85,247,0.5)] border border-white/20"
          >
            <Plus className="w-6 h-6 drop-shadow-md" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Modal Overlay & Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl relative bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Close Button */}
              <button 
                onClick={() => setIsExpanded(false)}
                className="absolute top-4 right-4 z-50 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className={\`absolute -top-32 -left-32 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none transition-colors duration-500 \${contentType === 'book' ? 'bg-amber-500' : contentType === 'image' ? 'bg-purple-500' : 'bg-white'}\`} />
              
              {/* Tabs */}
              <div className="flex p-2 gap-2 bg-black/40 border-b border-white/5 relative z-10 pt-16 sm:pt-4 sm:pr-16 shrink-0">
        {[
          { id: 'post', label: 'Puisi / Karya', icon: FileText },
          { id: 'book', label: 'Buku PDF', icon: Book },
          { id: 'image', label: 'Galeri Gambar', icon: ImageIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleContentTypeChange(tab.id as any)}
            className={\`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-2xl text-sm font-bold tracking-widest uppercase transition-all duration-300 \${
              contentType === tab.id 
                ? styles.activeTab
                : 'text-white/40 hover:text-white/80 hover:bg-white/5 border border-transparent'
            }\`}
          >
            <tab.icon className={\`w-4 h-4 \${contentType === tab.id ? styles.activeIcon : 'text-white/30'}\`} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="relative z-10 p-6 sm:p-8 overflow-y-auto custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Alerts */}
          <AnimatePresence mode="popLayout">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold tracking-wide shadow-inner"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-bold tracking-wide shadow-inner"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">
              Judul Karya
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Masukkan judul di sini..."
              className={\`w-full bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder-white/20 focus:outline-none focus:ring-1 shadow-inner transition-all \${styles.borderFocus} \${styles.ring}\`}
            />
          </div>

          {/* Content / Description Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">
              {contentType === 'post' ? 'Isi Puisi / Karya Tulis' : contentType === 'book' ? 'Deskripsi Buku' : 'Caption Gambar'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required={contentType === 'post'}
              rows={contentType === 'post' ? 8 : 4}
              placeholder={contentType === 'post' ? "Tuliskan keindahan sastra Anda..." : "Tambahkan deskripsi singkat..."}
              className={\`w-full bg-black/40 border border-black/50 border-t-black/80 border-b-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-white placeholder-white/20 focus:outline-none focus:ring-1 shadow-inner transition-all custom-scrollbar resize-none \${styles.borderFocus} \${styles.ring}\`}
            />
          </div>

          {/* File Upload Zone */}
          {(contentType === 'book' || contentType === 'image') && (
            <div className="space-y-3">
              <label className="text-xs font-bold tracking-wider text-white/40 uppercase ml-2">
                File Unggahan
              </label>
              
              <div className="relative group">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept={contentType === 'book' ? 'application/pdf' : 'image/*'}
                  multiple={contentType === 'image'}
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className={\`flex flex-col items-center justify-center w-full min-h-[120px] rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-300 bg-black/40 hover:bg-white/5 
                  \${contentType === 'book' ? 'border-amber-500/20 hover:border-amber-500/50' : 'border-purple-500/20 hover:border-purple-500/50'}\`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                    <UploadCloud className={\`w-8 h-8 mb-3 opacity-50 group-hover:opacity-100 transition-opacity \${contentType === 'book' ? 'text-amber-400' : 'text-purple-400'}\`} />
                    <p className="text-sm font-bold text-white/70 mb-1">
                      {contentType === 'book' 
                        ? (file ? file.name : 'Klik untuk memilih file PDF')
                        : (files.length > 0 ? \`\${files.length} gambar dipilih\` : 'Klik untuk memilih Gambar')}
                    </p>
                    <p className="text-sm text-white/30 font-medium tracking-wide">
                      {contentType === 'book' ? 'Maksimal ukuran file 10MB' : 'Bisa pilih banyak gambar sekaligus (Maks 15)'}
                    </p>
                  </div>
                </label>
              </div>

              {/* PDF Preview Meta */}
              {contentType === 'book' && file && (
                <div className="flex items-center gap-2 pl-2">
                  <Book className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold tracking-widest text-amber-400/80 uppercase">
                    Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}

              {/* Image Previews */}
              {contentType === 'image' && previews.length > 0 && (
                <div className="mt-4 bg-black/40 border border-white/5 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-white/50 tracking-widest uppercase">
                      Galeri ({previews.length}/15)
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    <AnimatePresence>
                      {previews.map((preview, index) => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                          key={index}
                          className="relative aspect-square rounded-xl overflow-hidden group/preview border border-white/10 shadow-lg"
                        >
                          <img
                            src={preview}
                            alt={\`Preview \${index}\`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/preview:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => { e.preventDefault(); removeFile(index); }}
                              className="w-8 h-8 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110 shadow-xl"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-xs font-bold text-white">
                            {index + 1}
                          </div>
                        </motion.div>
                      ))}
                      {previews.length < 15 && (
                        <motion.label
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          htmlFor="file-upload"
                          className="relative aspect-square rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5 cursor-pointer flex flex-col items-center justify-center transition-all group/add"
                        >
                          <Plus className="w-6 h-6 text-white/30 group-hover/add:text-purple-400 transition-colors mb-1" />
                          <span className="text-xs font-bold tracking-widest text-white/30 group-hover/add:text-purple-400 uppercase">Tambah</span>
                        </motion.label>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/5 mt-4">
            <button
              type="submit"
              disabled={loading}
              className={\`w-full relative flex items-center justify-center gap-2 py-4 px-6 rounded-xl text-sm font-bold tracking-wider uppercase transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 border \${styles.btn}\`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="">Memproses...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" />
                  <span className="">
                    Bagikan {contentType === 'post' ? 'Puisi' : contentType === 'book' ? 'Buku PDF' : 'Karya Gambar'}
                  </span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
`;

content = content.replace(/    return \([\s\S]*\}\s*$/g, newReturnBlock);
fs.writeFileSync(filePath, content);
console.log('Modified strictly to Floating Modal with Plus button.');
