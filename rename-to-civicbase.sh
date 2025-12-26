#!/bin/bash

# CivicBase Rename Script
# Renames all instances of CosmicSyncCore to CivicBase
# Usage: bash rename-to-civicbase.sh

set -e  # Exit on error

echo "==================================================================="
echo "CivicBase Rename Script"
echo "This script will rename CosmicSyncCore → CivicBase throughout the codebase"
echo "==================================================================="
echo ""

# Confirm before proceeding
read -p "Have you committed all changes? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted. Please commit your changes first."
    exit 1
fi

echo ""
echo "Step 1: Archive old vision documents..."
mkdir -p docs/ARCHIVE/cosmic-era
mv docs/ESSENTIAL_READING/PROJECT_VISION.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase2.0-overview.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase2.1-advanced-p2p.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase2.2-improved-sync.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase2.3-expanded-api.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase2.4-basic-plugin-system.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase2.5-enhanced-security.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase3.0-overview.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase3.1-advanced-security.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase3.2-performance-tuning.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase3.3-scalability-enhancements.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase3.4-security-audit.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase3.5-monitoring-logging.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase4.0-overview.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase4.1-full-plugin-system.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase4.2-advanced-offline-capabilities.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase4.3-developer-tools-sdk.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase4.4-interoperability-enhancements.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase4.5-comprehensive-documentation.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase5.0-overview.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase5.1-comprehensive-testing.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase5.2-bug-fixing.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase5.3-user-experience-refinements.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase5.4-final-security-audit.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase5.5-documentation-completion.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
mv docs/PLANNING/phase5.6-launch-preparation.md docs/ARCHIVE/cosmic-era/ 2>/dev/null || true
echo "✓ Archived phase 2-5 planning documents"

echo ""
echo "Step 2: Rename files containing 'cosmicsynccore'..."
find . -depth -name "*cosmicsynccore*" -type f | while read file; do
    newname=$(echo "$file" | sed 's/cosmicsynccore/civicbase/g')
    if [ "$file" != "$newname" ]; then
        mkdir -p "$(dirname "$newname")"
        mv "$file" "$newname"
        echo "  Renamed: $file → $newname"
    fi
done
echo "✓ Files renamed"

echo ""
echo "Step 3: Find and replace 'CosmicSyncCore' → 'CivicBase' in all files..."

# List of file extensions to process
EXTENSIONS=("js" "mjs" "json" "md" "html" "css" "jsx" "ts" "tsx" "yaml" "yml")

for ext in "${EXTENSIONS[@]}"; do
    find . -name "*.${ext}" -type f ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./docs/ARCHIVE/*" | while read file; do
        # Check if file contains the string (case-sensitive)
        if grep -q "CosmicSyncCore" "$file" 2>/dev/null; then
            # Create backup
            cp "$file" "${file}.bak"
            
            # Replace all variants
            sed -i '' \
                -e 's/CosmicSyncCore/CivicBase/g' \
                -e 's/cosmicsynccore/civicbase/g' \
                -e 's/cosmic-sync-core/civicbase/g' \
                "$file" 2>/dev/null || sed -i \
                -e 's/CosmicSyncCore/CivicBase/g' \
                -e 's/cosmicsynccore/civicbase/g' \
                -e 's/cosmic-sync-core/civicbase/g' \
                "$file"
            
            echo "  Updated: $file"
            rm "${file}.bak"
        fi
    done
done
echo "✓ Content replaced in all files"

echo ""
echo "Step 4: Create new CURRENT directory with updated docs..."
mkdir -p docs/CURRENT

# Copy new vision docs (these should be created separately)
if [ -f "VISION.md" ]; then
    cp VISION.md docs/CURRENT/
    echo "  ✓ Copied VISION.md"
fi

if [ -f "12-MONTH-ROADMAP.md" ]; then
    cp 12-MONTH-ROADMAP.md docs/CURRENT/
    echo "  ✓ Copied 12-MONTH-ROADMAP.md"
fi

if [ -f "ARCHITECTURE.md" ]; then
    cp ARCHITECTURE.md docs/CURRENT/
    echo "  ✓ Copied ARCHITECTURE.md"
fi

# Move existing architecture.md to ARCHIVE if it exists
if [ -f "docs/ESSENTIAL_READING/architecture.md" ]; then
    mv docs/ESSENTIAL_READING/architecture.md docs/ARCHIVE/cosmic-era/architecture-original.md
    echo "  ✓ Archived original architecture.md"
fi

echo ""
echo "Step 5: Update package.json metadata..."
if [ -f "package.json" ]; then
    # Backup
    cp package.json package.json.bak
    
    # Update name, description, keywords
    sed -i '' \
        -e 's/"name": ".*"/"name": "civicbase"/g' \
        -e 's/"description": ".*"/"description": "Offline-first P2P infrastructure for Swedish municipal resilience"/g' \
        package.json 2>/dev/null || sed -i \
        -e 's/"name": ".*"/"name": "civicbase"/g' \
        -e 's/"description": ".*"/"description": "Offline-first P2P infrastructure for Swedish municipal resilience"/g' \
        package.json
    
    rm package.json.bak
    echo "✓ Updated package.json"
fi

echo ""
echo "Step 6: Update README.md..."
if [ -f "README.md" ]; then
    cp README.md README.md.bak
    
    # Replace header and description
    sed -i '' \
        -e 's/# CosmicSyncCore/# CivicBase/g' \
        -e 's/CosmicSyncCore/CivicBase/g' \
        README.md 2>/dev/null || sed -i \
        -e 's/# CosmicSyncCore/# CivicBase/g' \
        -e 's/CosmicSyncCore/CivicBase/g' \
        README.md
    
    rm README.md.bak
    echo "✓ Updated README.md"
fi

echo ""
echo "Step 7: Create RENAME_SUMMARY.md..."
cat > RENAME_SUMMARY.md << 'EOF'
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
EOF
echo "✓ Created RENAME_SUMMARY.md"

echo ""
echo "==================================================================="
echo "Rename Complete!"
echo "==================================================================="
echo ""
echo "Summary of changes:"
echo "  ✓ All 'CosmicSyncCore' references → 'CivicBase'"
echo "  ✓ Phase 2-5 docs archived to docs/ARCHIVE/cosmic-era/"
echo "  ✓ New vision docs in docs/CURRENT/"
echo "  ✓ package.json updated"
echo "  ✓ README.md updated"
echo ""
echo "Next steps:"
echo "  1. Review changes with: git diff"
echo "  2. Test the build: npm install && npm test"
echo "  3. Review new docs: docs/CURRENT/"
echo "  4. Commit changes: git add . && git commit -m 'Rename CosmicSyncCore → CivicBase'"
echo ""
echo "Note: Run 'git status' to see all modified files before committing."
echo "==================================================================="
