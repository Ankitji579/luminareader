const fs = require('fs');
let code = fs.readFileSync('components/reader/ReaderWorkspace.tsx', 'utf8');

// Also remove text from Theme Button
code = code.replace(/<span className="hidden md:inline">\{T.emoji\} \{T.name\}<\/span>/, '<span className="hidden md:inline">{T.emoji}</span>');

// Replace the Bubble rendering
code = code.replace(
  /\{\/\* ── FLOATING DICTIONARY \/ TRANSLATION BUBBLE \(selection-triggered, no sidebar\) ── \*\/\}[\s\S]*?\n            \{\/\* Keyboard Shortcuts Modal \*\/\}/,
  `{/* ── FLOATING DICTIONARY / TRANSLATION BUBBLE (selection-triggered, no sidebar) ── */}
            {selectedWord && !showDictionaryDrawer && (
              <div id="dict-bubble" style={getBubbleStyle()} className="animate-in fade-in duration-150">
                {isMultiWord ? (
                  /* TRANSLATION VIEW */
                  <>
                    <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: \`1px solid \${T.panelBorder}\` }}>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" style={{ color: T.panelAccent }} />
                        <span className="font-extrabold text-sm uppercase tracking-wide" style={{ color: T.panelAccent }}>Translation</span>
                      </div>
                      <button onClick={closeDictionaryBubble} style={{ color: T.panelSubtext }}><X className="w-4 h-4" /></button>
                    </div>

                    {dictionaryLoading ? (
                      <div className="flex items-center gap-2 py-3 justify-center">
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: T.panelAccent, borderTopColor: "transparent" }} />
                        <span className="text-xs" style={{ color: T.panelSubtext }}>Translating text...</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-2.5 rounded-lg max-h-32 overflow-y-auto no-scrollbar" style={{ background: T.panelItemBg, border: \`1px solid \${T.panelBorder}\` }}>
                          <p className="text-xs leading-relaxed italic" style={{ color: T.panelSubtext }}>&ldquo;{selectedWord}&rdquo;</p>
                        </div>
                        <div className="p-3 rounded-lg shadow-inner" style={{ background: T.btnBg, border: \`1px solid \${T.panelBorder}\` }}>
                          <p className="text-sm font-medium leading-relaxed" style={{ color: T.text, fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{translationText}</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* DICTIONARY VIEW */
                  <>
                    <div className="flex items-center justify-between pb-2 mb-2" style={{ borderBottom: \`1px solid \${T.panelBorder}\` }}>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm capitalize" style={{ color: T.panelAccent }}>{dictionaryData?.word || selectedWord}</span>
                        <span className="font-mono text-[11px]" style={{ color: T.panelSubtext }}>{dictionaryData?.phonetic}</span>
                        <button onClick={() => speakWord(dictionaryData?.word || selectedWord)} className="p-1 rounded transition-transform hover:scale-105" style={{ background: T.panelItemBg, color: T.panelAccent }} title="Pronounce">
                          <Volume2 className={\`w-3.5 h-3.5 \${isPlayingAudio ? "animate-pulse" : ""}\`} />
                        </button>
                      </div>
                      <button onClick={closeDictionaryBubble} style={{ color: T.panelSubtext }}><X className="w-4 h-4" /></button>
                    </div>

                    {dictionaryLoading ? (
                      <div className="flex items-center gap-2 py-3 justify-center">
                        <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: T.panelAccent, borderTopColor: "transparent" }} />
                        <span className="text-xs" style={{ color: T.panelSubtext }}>Looking up...</span>
                      </div>
                    ) : dictionaryData ? (
                      <div className="space-y-2">
                        <div className="max-h-48 overflow-y-auto no-scrollbar space-y-2">
                          {dictionaryData.meanings.slice(0, 3).map((m, idx) => (
                            <div key={idx} className="space-y-1 pb-2" style={{ borderBottom: idx < 2 ? \`1px solid \${T.panelBorder}\` : "none" }}>
                              <span className="font-semibold italic text-[11px]" style={{ color: T.panelAccent }}>{m.partOfSpeech}</span>
                              <p className="leading-relaxed text-xs" style={{ color: T.panelText }}>{m.definition}</p>
                              {m.example && <p className="italic text-[11px]" style={{ color: T.panelSubtext }}>&ldquo;{m.example}&rdquo;</p>}
                            </div>
                          ))}
                        </div>

                        {/* Hindi — shown only after user clicks Translate */}
                        {dictionaryData.hindiTranslation ? (
                          <div className="mt-1 px-3 py-2 rounded-lg" style={{ background: T.panelItemBg, border: \`1px solid \${T.panelBorder}\` }}>
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-sm">🇮🇳</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: T.panelSubtext }}>Hindi</span>
                            </div>
                            <p className="text-sm font-bold" style={{ color: T.panelText, fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{dictionaryData.hindiTranslation}</p>
                          </div>
                        ) : (
                          <button onClick={() => fetchHindi(dictionaryData.word, false)} className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90" style={{ background: T.panelItemBg, color: T.panelText, border: \`1px solid \${T.panelBorder}\` }}>
                            <Globe className="w-3.5 h-3.5" style={{ color: T.panelAccent }} />🇮🇳 Translate to Hindi
                          </button>
                        )}

                        <div className="pt-1 text-[10px] flex items-center justify-between" style={{ color: T.panelSubtext }}>
                          <span>Source: {dictionaryData.source}</span>
                          <button onClick={() => { setShowDictionaryDrawer(true); setSelectedWord(null); }} className="underline" style={{ color: T.panelAccent }}>Full panel →</button>
                        </div>
                      </div>
                    ) : (
                      <p className="py-1 text-xs text-center" style={{ color: T.panelSubtext }}>Searching definition...</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Keyboard Shortcuts Modal */}`
);
fs.writeFileSync('components/reader/ReaderWorkspace.tsx', code);
