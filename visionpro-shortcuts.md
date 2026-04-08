# PCRM Vision Pro Voice Shortcuts

Use these in the macOS Shortcuts app with `Run Shell Script`.

## Focus Targets

### PCRM Debate Voice
```bash
/Users/emmanuelhaddad/bin/pcrm-voice-debate
```

### PCRM Codex Voice
```bash
/Users/emmanuelhaddad/bin/pcrm-voice-codex
```

### PCRM Stitch Voice
```bash
/Users/emmanuelhaddad/bin/pcrm-voice-stitch
```

### PCRM Agent Voice
```bash
/Users/emmanuelhaddad/bin/pcrm-voice-agent
```

### PCRM Media Voice
```bash
/Users/emmanuelhaddad/bin/pcrm-voice-media
```

## Mic Toggle

### PCRM Debate Mic
```bash
/Users/emmanuelhaddad/bin/pcrm-voice-mic debate
```

### PCRM Dock Mic
```bash
/Users/emmanuelhaddad/bin/pcrm-voice-mic codex
```

## Notes

- `pcrm-voice-target` switches to the matching Superwhisper mode, opens PCRM in Chrome, and focuses the right target.
- Add `--record` if you want the shortcut to start Superwhisper recording immediately after focus.
- `pcrm-voice-mic` toggles the page mic shortcuts, but Superwhisper + target focus is the preferred path.
- In `PushingDebate Studio`, the prompt auto-sends after a short pause once dictated text lands in the field.

## One-Step Recording Examples

### PCRM Debate Voice + Record
```bash
/Users/emmanuelhaddad/bin/pcrm-voice-debate --record
```

### PCRM Codex Voice + Record
```bash
/Users/emmanuelhaddad/bin/pcrm-voice-codex --record
```

### PCRM Stitch Voice + Record
```bash
/Users/emmanuelhaddad/bin/pcrm-voice-stitch --record
```

### PCRM Agent Voice + Record
```bash
/Users/emmanuelhaddad/bin/pcrm-voice-agent --record
```

### PCRM Media Voice + Record
```bash
/Users/emmanuelhaddad/bin/pcrm-voice-media --record
```
