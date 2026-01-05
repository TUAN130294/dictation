# Audio & Diff Libraries Research - Dictation App

**Date:** 2026-01-05 | **Focus:** Audio player + text diffing for dictation practice

---

## 1. Audio Player: Howler.js vs WaveSurfer.js

### Quick Comparison Table

| Feature | Howler.js | WaveSurfer.js |
|---------|-----------|---------------|
| **Waveform Visualization** | ❌ None | ✅ Native waveform rendering |
| **Segment Loop** | ✅ Audio sprites (precise segments) | ✅ Regions plugin |
| **Weekly Downloads** | 553K | 5K |
| **GitHub Stars** | 24.8K | 9.6K |
| **Browser Support** | Extensive (IE9+) | Modern browsers only |
| **Large Files** | ✅ Better streaming | ⚠️ Memory constraints |
| **Best For** | Playback control | Visual waveform + playback |

### Recommendation for Dictation App
**Use WaveSurfer.js** - native waveform visualization essential for:
- Visual playback position feedback
- Segment loop marking (practice zones)
- Click-to-seek functionality
- User engagement (see speech patterns)

**Alternative:** Combine both - WaveSurfer.js for visualization + Howler.js for advanced audio control (3D pan, spatial audio if needed later)

---

## 2. Diff Libraries: diff-match-patch for WER

### Word Error Rate (WER) Formula
```
WER = (S + D + I) / N

S = substitutions, D = deletions, I = insertions, N = total words in reference
```

### Library Options

**Google's diff-match-patch:**
- ✅ Supports word-level diffs
- ✅ Line/word diff modes (less detailed than char)
- ⚠️ General-purpose (not specialized for WER)
- Uses Myer's diff algorithm

**JiWER (Python/JS):**
- ✅ Purpose-built for WER calculation
- ✅ Fast (C++ backend with RapidFuzz)
- ✅ Supports: WER, MER, WIL, WIP, CER
- ✅ Industry standard for speech-to-text eval
- **Benchmarks:** <5% WER = excellent, 5-10% = good

### Recommendation
**Use diff-match-patch for MVP** (JavaScript-native, no external deps):
```javascript
const diff = new DiffMatchPatch();
const diffs = diff.diff_main(userTranscript, referenceTranscript);
const [subs, dels, ins, matches] = calculateWER(diffs);
const wer = (subs + dels + ins) / referenceWords.length;
```

**Future:** Consider JiWER for production-grade accuracy metrics if backend in Python.

---

## 3. React Audio Player Patterns

### Keyboard Shortcuts Implementation

**Best-in-class libraries (with native keyboard support):**
- **react-h5-audio-player** (TypeScript, a11y)
  - `hasDefaultKeyBindings`: true (default)
  - Arrow keys: volume control
  - Space/Enter: play/pause
  - Custom `progressJumpStep` for seek

- **react-audio-play**
  - `hasKeyBindings` prop enables shortcuts
  - Lightweight alternative

### Custom Implementation Pattern
```javascript
// Accessible approach: native range input
<input
  type="range"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'ArrowRight') audio.currentTime += 5;
    if (e.key === ' ') audio.play();
  }}
/>
```

**Accessibility wins:**
- Native `<input type="range">` = free keyboard + mouse scrubbing
- `tabIndex={0}` for focus navigation
- WCAG 2.1 keyboard events (Enter/Space for buttons, arrows for sliders)

---

## 4. Implementation Strategy for Dictation App

### Recommended Stack
```
Audio: WaveSurfer.js (waveform + playback)
Diff: diff-match-patch (word-level WER in browser)
UI: Custom React hooks + react-h5-audio-player if needed for fallback
Keyboard: Native HTML input + onKeyDown handlers (WCAG 2.1)
```

### Core Integration Example
```javascript
// Playback with visual feedback
const ws = WaveSurfer.create({ container, waveColor: '#ddd' });
ws.load('/audio.wav');
ws.regions.addRegion({ start: 5, end: 15 }); // Practice zone

// WER Calculation
const diff = new DiffMatchPatch();
const diffs = diff.diff_main(userText, correctText);
const wer = calculateWER(diffs);
```

---

## Unresolved Questions
- WaveSurfer.js performance with large audio files (>30min)? → Recommend pre-decoded peaks for files >5min
- Offline waveform caching strategy? → Research service worker + IndexedDB integration
- Mobile waveform tap-to-seek behavior? → Test on iOS/Android with WaveSurfer.js

---

## Sources
- [npm trends: audio vs howler vs wavesurfer](https://npmtrends.com/audio-vs-howler-vs-wavesurfer)
- [WaveSurfer.js Official](https://wavesurfer.xyz/)
- [GitHub: katspaugh/wavesurfer.js](https://github.com/katspaugh/wavesurfer.js)
- [Howler.js](https://howlerjs.com/)
- [GitHub: google/diff-match-patch](https://github.com/google/diff-match-patch)
- [Wikipedia: Word Error Rate](https://en.wikipedia.org/wiki/Word_error_rate)
- [JiWER - PyPI](https://pypi.org/project/jiwer/)
- [What Is WER in Speech-to-Text? (2025)](https://vatis.tech/blog/what-is-wer-in-speech-to-text-everything-you-need-to-know-2025)
- [react-h5-audio-player - npm](https://www.npmjs.com/package/react-h5-audio-player)
- [Building an Audio Player in React - LogRocket](https://blog.logrocket.com/building-audio-player-react/)
- [Building an Audio Player With React Hooks](https://www.letsbuildui.dev/articles/building-an-audio-player-with-react-hooks/)
