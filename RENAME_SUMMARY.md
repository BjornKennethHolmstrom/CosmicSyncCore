# CivicBase Rename Summary

## Changes Applied

This repository has been renamed from **CosmicSyncCore** to **CivicBase** to reflect the refocused mission: resilient digital infrastructure for Swedish municipalities.

### What Changed

1. **All file names** containing "cosmicsynccore" → "civicbase"
2. **All code references** CosmicSyncCore → CivicBase
3. **Package name** updated to "civicbase"
4. **Documentation** updated with totalförsvar framing

### What Was Archived

The original SharedSpheres vision and phase 2-5 planning documents have been moved to:
```
docs/ARCHIVE/cosmic-era/
```

These documents remain accessible for future reference or potential revival after CivicBase proves the platform architecture.

### New Documentation

```
docs/CURRENT/
├── VISION.md              # CivicBase mission (totalförsvar focus)
├── 12-MONTH-ROADMAP.md    # Vinnova grant implementation plan
└── ARCHITECTURE.md        # Technical architecture (CivicBase framing)
```

### Technical Foundation Unchanged

The core technical architecture remains identical:
- libp2p P2P networking
- Offline-first data layer
- Agent-centric design
- End-to-end encryption
- Eventual consistency sync

Only the framing and immediate use cases changed:
- **From:** Global digital sovereignty platform
- **To:** Swedish municipal resilience infrastructure

### Next Steps

1. Review new VISION.md in docs/CURRENT/
2. Read 12-MONTH-ROADMAP.md for grant implementation plan
3. Update local git config if needed:
   ```bash
   git remote set-url origin git@github.com:yourusername/CivicBase.git
   ```
4. Submit Vinnova and MCF grant applications

### Original Vision Status

The SharedSpheres vision is **archived, not abandoned**. Once CivicBase validates the architecture at municipal scale, the global sovereignty vision becomes feasible.

**Timeline:** CivicBase (2026-2027) → SharedSpheres (2028+)
