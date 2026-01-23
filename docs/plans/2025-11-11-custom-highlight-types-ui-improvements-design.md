# Custom Highlight Types UI Improvements - Design Document

**Date:** 2025-11-11
**Status:** Approved

## Overview

Redesign the Custom Highlight Types Manager UI to be more compact and provide better color selection through a visual color picker instead of preset swatches.

## Problem Statement

The current UI has two main issues:
1. Each custom type takes excessive vertical space (~150px per item), making the list unwieldy with many types
2. Color selection is limited to 8 preset colors with no way to select custom colors

## Goals

1. Reduce vertical space per item by ~60% (from 150px to 50-60px)
2. Enable custom color selection via a color wheel/picker interface
3. Maintain existing functionality (create, edit, save, delete)
4. Keep manual save workflow (no auto-save)

## Design Decisions

### 1. Horizontal Inline Layout

Each custom type will display as a single horizontal row:
```
[●] [Name Input Field________________________] [Save] [Delete]
```

**Elements (left to right):**
- Color swatch (32px circle, clickable)
- Name input field (flex-grow)
- Save button (compact)
- Delete button (compact)

**Space Savings:**
- Remove vertical stacking
- Reduce padding from 16px to 8-10px
- Remove labels (rely on placeholders)
- Make buttons more compact
- Target height: 50-60px per row (vs current ~150px)

### 2. Color Picker Popover

**Library:** `react-colorful` (2KB, zero dependencies)
- HSL color picker with saturation/brightness square + hue slider
- Standard color wheel experience

**Interaction:**
- Click color swatch to open popover
- Popover appears below swatch (or above if near viewport bottom)
- Click outside or select color to close
- Only one popover open at a time
- Live color preview as user drags

**Popover Styling:**
- White background with shadow
- 8-10px border radius
- Positioned absolutely near swatch
- Optional hex value display below picker
- Active swatch shows blue ring when picker open

### 3. Save Button Approach

Manual save with always-visible save button (current approach maintained):
- User makes changes to name/color
- Clicks save when ready
- Provides clear control over when changes are persisted

## Component Structure

### Color Swatch Specifications
- Size: 32px diameter circle
- Background: Current color
- Border: 1px solid rgba(0,0,0,0.1)
- Hover: scale(1.05)
- Active (picker open): blue ring shadow
- Cursor: pointer

### Name Input Specifications
- Flex-grow: 1
- Height: 36px
- Padding: 8px 12px
- Border: 1px solid #d7dce0
- Border-radius: 6px
- Font-size: 0.9rem

### Action Buttons Specifications
- Height: 36px
- Padding: 8px 12px
- Border-radius: 6px
- Save: Blue background, white text
- Delete: Red background, white text
- Hover: Subtle transform/shadow

### Row Container Specifications
- Display: flex
- Align-items: center
- Gap: 10px
- Padding: 8px 12px (reduced from 16px)
- Border: 1px solid #e0e7ef
- Border-radius: 8px
- Background: white

## Implementation Requirements

### Dependencies
- Add `react-colorful` package

### Files to Modify
1. `CustomItemTypesManager.jsx`
   - Add color picker state management
   - Create ColorPickerPopover component
   - Implement click-outside detection
   - Update layout to horizontal flex

2. `CustomItemTypesManager.css`
   - Update row styles to flex layout
   - Reduce padding throughout
   - Add color picker popover styles
   - Remove preset palette styles
   - Add active swatch styling

### State Management
- Track which color picker is open: `activeColorPicker: null | 'new' | typeId`
- Use refs for click-outside detection
- Maintain existing save/delete state

### Error Handling
- Fallback to `<input type="color">` if react-colorful fails
- Validate hex color format before save

### Accessibility
- Color swatch aria-labels
- Keyboard support (Escape to close popover)
- Proper focus management
- Maintain existing form accessibility

## Success Criteria

1. Each custom type row is 50-60px tall (60% reduction)
2. Users can select any color via color picker
3. All existing functionality works (create, edit, save, delete)
4. UI remains responsive on mobile
5. No regressions in accessibility
