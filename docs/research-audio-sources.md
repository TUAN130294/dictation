# Audio Sources & Speech-to-Text Research
## English Dictation App MVP

### Free Open Datasets (Licensed)

| Dataset | Hours | License | Quality | CEFR Fit |
|---------|-------|---------|---------|----------|
| **LibriSpeech (OpenSLR)** | 1,000 | CC0/Public Domain | Clear, read speech | B1-C2 |
| **Multilingual LibriSpeech (MLS)** | 8 langs | CC0/Public Domain | Clear, read speech | B1-C2 |
| **Common Voice (Mozilla)** | 3,000+ | CC0 | Crowdsourced, varied accents | A2-C1 |
| **TED-LIUM 3** | 452 | CC BY-NC-ND 3.0 | Professional talks | B2-C2 |

**Notes:** LibriSpeech/MLS sourced from LibriVox audiobooks. All include aligned transcripts. TED-LIUM has commercial restrictions (NC clause).

### Educational Content Sources (Free/Transcribed)

| Source | Type | Transcript Access | Licensing | Level Range |
|--------|------|-------------------|-----------|-------------|
| **VOA Learning English** | News/Lessons | Built-in transcripts | Public | A1-B2 |
| **BBC Learning English** | Dramas/Grammar | Built-in transcripts | Public | A1-B2 |
| **LibriVox** | Audiobooks | Full transcripts | Public Domain | B1-C2 |

**Pipeline:** VOA/BBC curated by skill level with varying native accent. LibriVox provides long-form content for upper levels.

### Creative Commons Audio Resources

**Repositories:**
- Freesound.org (CC-licensed sound effects, not speech)
- Internet Archive (millions of audio files, variable licensing)
- ccMixter, Jamendo, Free Music Archive (music, not dictation content)

**Recommendation:** Use for background elements; prioritize VOA/BBC/LibriVox for speech content.

---

## Speech-to-Text Comparison

### API Pricing (2025)

| Provider | Cost | Speed | Accuracy (WER) | Streaming | Best For |
|----------|------|-------|----------------|-----------|----------|
| **OpenAI Whisper API** | $0.006/min | 35x realtime | 10.6% | No | Cost vs accuracy trade-off |
| **Deepgram Nova-3** | $4.30/1000min | 300ms latency | 5.26-6.84% | Yes | Speed + accuracy |
| **AssemblyAI** | $2.50/1000min | Real-time | 8.4% WER | Yes | Best accuracy + features |
| **Google Chirp 2** | $16/1000min | 70x realtime | Competitive | Batch only | Enterprise volume discounts |

**Critical caveat:** Whisper API enforces 1-2min minimums; splitting 8-sec clips = 5x billing overhead.

### On-Device/Self-Hosted Options

| Option | Model Size | Accuracy | Latency | Use Case |
|--------|------------|----------|---------|----------|
| **Whisper Large V3** | 3GB | 7.88% WER | Slow | Desktop, batch processing |
| **Whisper Large V3 Turbo** | 809M params | 8-9% WER | 6x faster | Mobile, real-time |
| **Distil-Whisper** | Compact | 1% variance | 6x faster | Edge devices, PWA offline |
| **Moonshine** | 27M params | Competitive | Fast | Mobile/embedded |
| **Browser Speech API** | Built-in | 15-30% WER | Instant | Fallback only, unreliable |

**Performance note:** Quantization reduces size 45% + latency 19% while preserving accuracy.

---

## MVP Recommendation: Hybrid Strategy

### Content Pipeline (Free)
1. **Bootstrap phase (100-200 items):**
   - VOA Learning English (A1-B2): daily releases, ready transcripts
   - BBC Learning English (A1-B2): grammar/dramas, structured
   - LibriSpeech subsets (B1-C2): 100hr train-clean for upper levels

2. **Automated augmentation (next phase):**
   - Pull Common Voice by speaker/accent/clean vs noisy
   - Categorize by WER to infer difficulty level
   - Use Whisper.cpp locally to auto-label edge cases

### STT Solution (MVP)
**Primary:** AssemblyAI ($2.50/1000min, 8.4% WER, includes sentiment/PII detection)
- Handles short clips efficiently (per-second billing)
- Streaming for real-time feedback during dictation

**Fallback:** Whisper.cpp (local deployment for offline PWA)
- Distil-Whisper for mobile: compact, accurate within 1% of Large V3
- Browser Speech API as last resort (accuracy degraded but works offline)

### Content Curation Logic
```
Level A1-A2: VOA (slowest) + BBC basics
Level B1-B2: VOA regular + BBC intermediate
Level B2-C1: TED-LIUM + LibriSpeech train-clean-360
Level C2: LibriSpeech train-other-500 (varied accents/noise)
```

---

## Unresolved Questions
- TED-LIUM NC clause: clarify if "non-commercial" applies to freemium models
- Common Voice accent distribution by CEFR level: verify if data exists
- Whisper.cpp fine-tuning cost on custom accent/field-specific vocab
- PWA offline audio streaming: compare Distil-Whisper vs browser API latency thresholds

---

## Sources
- [LibriSpeech at Hugging Face](https://huggingface.co/datasets/openslr/librispeech_asr)
- [OpenSLR Platform](https://www.openslr.org/12)
- [Common Voice Mozilla](https://commonvoice.mozilla.org/)
- [TED-LIUM Dataset](https://www.openslr.org/51/)
- [VOA Learning English](https://learningenglish.voanews.com/)
- [BBC Learning English](https://www.bbclearningenglish.com/)
- [Deepgram vs Competitors 2025](https://deepgram.com/learn/deepgram-vs-openai-vs-google-stt-accuracy-latency-price-compared)
- [Speech-to-Text Pricing 2025](https://deepgram.com/learn/speech-to-text-api-pricing-breakdown-2025)
- [AssemblyAI Alternatives](https://www.assemblyai.com/blog/deepgram-alternatives)
- [Best Open Source STT 2025](https://northflank.com/blog/best-open-source-speech-to-text-model-in-2025-benchmarks)
- [Whisper.cpp Benchmarks](https://openbenchmarking.org/test/pts/whisper-cpp)
- [Edge Speech-to-Text Benchmark 2025](https://www.ionio.ai/blog/2025-edge-speech-to-text-model-benchmark-whisper-vs-competitors)
- [Web Speech API Analysis](https://blog.addpipe.com/a-deep-dive-into-the-web-speech-api/)
- [Creative Commons Audio Guide](https://www.silvermansound.com/creative-commons-music-licensing-guide)
- [Free Music Archive CC Resources](https://freemusicarchive.org/curator/Creative_Commons/)
