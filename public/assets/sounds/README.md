# Audio Files for Meerkats Board

## Hockey Buzzer Sound

To add a custom hockey buzzer sound:

1. Find a royalty-free hockey buzzer sound from:
   - https://freesound.org/ (search "hockey buzzer" or "arena horn")
   - https://www.zapsplat.com/ (free with account)
   - https://mixkit.co/free-sound-effects/sports/
   - Record your own at a local hockey rink

2. Download the sound file (MP3 or WAV format)

3. Name it: `hockey-buzzer.mp3` or `hockey-buzzer.wav`

4. Place it in this `assets/sounds/` folder

5. The scoreboard will automatically use it!

## Minute Beep Sound (Optional)

You can also add a custom minute beep:
- Name it: `minute-beep.mp3` or `minute-beep.wav`
- Place in this folder
- Will play every 60 seconds during countdown

## Recommended Specifications

- Format: MP3 (for compatibility) or WAV (for quality)
- Duration: 1-2 seconds for buzzer, 0.1-0.3s for beep
- Sample Rate: 44.1kHz or 48kHz
- Bitrate: 128kbps or higher

## Current Audio System

Currently using: **Web Audio API synthesized sounds**
- Hockey Buzzer: 110 Hz sawtooth wave, 1.2s duration
- Minute Beep: 1000 Hz sine wave, 150ms duration

The synthesized sounds work everywhere without requiring external files!
