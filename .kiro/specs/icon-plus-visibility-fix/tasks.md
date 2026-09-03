# Implementation Plan

## Overview

This implementation plan addresses two critical visibility bugs in the Multi Kreasi Printing application:
1. **Products Page**: Plus icons not visible on mobile devices due to `hidden sm:block` classes
2. **Login Page**: "Log In" button visibility issues

The plan follows the exploratory bugfix workflow: Explore → Preserve → Implement → Validate.

---

## Tasks

### Phase 1: Bug Condition Exploration

- [ ] 1. Write bug condition exploration tests for Products page icons
  - **Property 1: Bug Condition** - Plus Icon Visibility Across All Viewports
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: These tests encode the expected behavior - they will validate the fix when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the icon visibility bug exists
  - **Scoped PBT Approach**: Scope the property to mobile viewports (width < 640px) where the bug manifests
  - Test that "Tambah Produk" button displays Phosphor Plus icon (not unicode `＋`) at viewport 375x667 (iPhone SE)
  - Test that "Tambah" category button displays Phosphor Plus icon (not unicode `＋`) at viewport 375x667
  - Test that Plus icon is visible (not hidden by `hidden sm:block` class) on mobile devices
  - Test that unicode `＋` symbols do not exist in button text content
  - Run tests on UNFIXED code (frontend/src/pages/Products.tsx before changes)
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bug exists)
  - Document counterexamples found:
    - Expected: Phosphor Plus icon should be visible at mobile viewport
    - Actual: Icon has `hidden sm:block` class, only unicode `＋` visible
    - Expected: No unicode symbols in button text
    - Actual: `<span aria-hidden="true">＋</span>` present in DOM
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 2. Write bug condition exploration test for Login button visibility
  - **Property 1: Bug Condition** - Login Button Visibility and Contrast
  - **IMPORTANT**: Investigate first, then write test based on findings
  - **GOAL**: Verify if Login button visibility issue is real or environmental
  - **Investigation Steps**:
    1. Navigate to Login page in browser DevTools
    2. Inspect button element and check if `bg-primary-600` class is applied
    3. Check computed `background-color` value (should be `rgb(2, 132, 199)`)
    4. Verify button is not hidden by z-index, positioning, or opacity issues
    5. Test on different browsers and devices if available
  - **If Bug Confirmed**: Write test that button should be visible with correct background color
  - **If No Bug Found**: Document investigation results and mark as environmental issue (browser cache, etc.)
  - Test that "Log In" button is visible to users
  - Test that button has background color `#0284c7` (rgb(2, 132, 199)) or equivalent primary-600
  - Test that button text is white with sufficient contrast ratio (>= 4.5:1 for WCAG AA)
  - Test that button is not obscured by z-index or positioning issues
  - Run test on UNFIXED code (frontend/src/pages/Login.tsx before changes)
  - **EXPECTED OUTCOME**: If bug exists, test FAILS; if environmental, test PASSES
  - Document findings from investigation and test results
  - Mark task complete when investigation is done and test results are documented
  - _Requirements: 1.5, 1.6, 1.7, 1.8, 2.6, 2.7, 2.8, 2.9, 2.10_

---

### Phase 2: Preservation Property Tests

- [ ] 3. Write preservation property tests for Products page (BEFORE implementing fix)
  - **Property 2: Preservation** - Products Page Button Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - **Observe behavior on UNFIXED code**:
    - Click "Tambah Produk" button → toggles `showForm` state
    - When `showForm=false`, clicking opens form → button text changes to "Tutup Form"
    - When `showForm=true`, clicking resets form → button text changes to "Tambah Produk"
    - Fill category input and click "Tambah" → submits category form
    - When `editingCategoryId` exists, button text is "Update" instead of "Tambah"
  - **Write property-based tests capturing observed behavior**:
    - For all button click events on "Tambah Produk", verify showForm state toggles correctly
    - For all category form submissions, verify form is submitted and state is updated
    - For all viewport sizes, verify button click handlers work identically
    - Property-based testing generates many test cases for stronger guarantees
  - Verify tests PASS on UNFIXED code (confirms baseline behavior)
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

- [ ] 4. Write preservation property tests for Login page (BEFORE implementing fix)
  - **Property 2: Preservation** - Login Page Form Functionality
  - **IMPORTANT**: Follow observation-first methodology
  - **Observe behavior on UNFIXED code**:
    - Fill valid credentials and click "Log In" → submits form to API
    - During submission → button shows "Logging in..." loading state
    - On success → redirects to appropriate dashboard based on user role
    - On error → displays error message above form
    - Click "Remember me" checkbox → state updates
    - Click "Forgot password" link → navigates to password reset
    - Form validation with react-hook-form and zod schema works correctly
  - **Write property-based tests capturing observed behavior**:
    - For all valid credential inputs, verify form submits correctly
    - For all invalid inputs, verify validation errors display
    - For all loading states, verify button text changes appropriately
    - For all successful logins, verify redirect behavior based on role
    - Property-based testing generates many test cases for stronger guarantees
  - Verify tests PASS on UNFIXED code (confirms baseline behavior)
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.7, 3.8, 3.9, 3.10, 3.11_

- [ ] 5. Write preservation property tests for other pages (BEFORE implementing fix)
  - **Property 2: Preservation** - Unaffected Pages Consistency
  - **IMPORTANT**: Verify no regressions on pages not being modified
  - **Observe behavior on UNFIXED code**:
    - Users page: Plus icons visible at all viewports with `<Plus size={18} weight="regular" />`
    - Quotations page: Plus icons visible at all viewports
    - Orders page: Plus icons visible at all viewports
    - Dashboard page: No Plus icons, layout unchanged
  - **Write property-based tests**:
    - For all pages (Users, Quotations, Orders), verify Plus icon rendering matches current implementation
    - For all viewport sizes, verify icon visibility on these pages remains consistent
    - Verify no changes to button styling or icon patterns on unaffected pages
  - Verify tests PASS on UNFIXED code (confirms current behavior)
  - **EXPECTED OUTCOME**: Tests PASS (confirms other pages work correctly)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.4_

---

### Phase 3: Implementation

- [x] 6. Fix Products page icon visibility issues

  - [x] 6.1 Fix "Tambah Produk" main button icon (Line ~397-411 in Products.tsx)
    - Remove `<span aria-hidden="true" className="text-lg leading-none">＋</span>` from button
    - Remove `className="hidden sm:block"` from `<Plus />` component
    - Keep `<Plus size={18} weight="bold" />` visible at all times
    - Verify button still has correct classes: `inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-primary-200 transition hover:bg-primary-700`
    - Verify button text continues to toggle between "Tambah Produk" and "Tutup Form" based on `showForm` state
    - _Bug_Condition: isBugCondition(input) where input.page="Products" AND input.viewport.width < 640 AND input.elementType="PlusIcon" AND hasClass(input.element, "hidden sm:block")_
    - _Expected_Behavior: Plus icon visible at all viewport sizes without responsive hiding classes_
    - _Preservation: Button click handler continues to toggle showForm state and reset form_
    - _Requirements: 1.1, 2.1, 2.3, 2.5, 3.1, 3.3, 3.5_

  - [x] 6.2 Fix product form header icon badge (Line ~448-460 in Products.tsx)
    - Replace `<span aria-hidden="true" className="text-lg leading-none">＋</span>` with `<Plus size={16} weight="bold" />`
    - Keep badge styling: `inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm shadow-primary-200`
    - Verify form header displays "Tambah Produk" or "Edit Produk" based on `editingProductId` state
    - _Bug_Condition: Product form uses inconsistent unicode symbol instead of Phosphor icon_
    - _Expected_Behavior: Consistent Phosphor icon usage across all product-related actions_
    - _Preservation: Form header text continues to reflect edit vs add state_
    - _Requirements: 2.5, 3.5_

  - [x] 6.3 Fix "Tambah" category button icon (Line ~571-579 in Products.tsx)
    - Remove `<span aria-hidden="true" className="text-base leading-none">＋</span>` from button
    - Remove `className="hidden sm:block"` from `<Plus />` component
    - Keep `<Plus size={14} weight="bold" />` visible at all times
    - Verify button still has correct classes: `inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700`
    - Verify button text continues to toggle between "Tambah" and "Update" based on `editingCategoryId` state
    - _Bug_Condition: isBugCondition(input) where input.page="Products" AND input.viewport.width < 640 AND category button Plus icon has "hidden sm:block"_
    - _Expected_Behavior: Plus icon visible at all viewport sizes on category button_
    - _Preservation: Category form submission continues to work with same validation and state management_
    - _Requirements: 1.2, 2.2, 2.4, 2.5, 3.2_

  - [ ] 6.4 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Plus Icon Visibility Across All Viewports
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run bug condition exploration tests from step 1
    - Verify "Tambah Produk" button displays Phosphor Plus icon at mobile viewport (375x667)
    - Verify "Tambah" category button displays Phosphor Plus icon at mobile viewport (375x667)
    - Verify Plus icons are visible without `hidden sm:block` classes
    - Verify unicode `＋` symbols are removed from all buttons
    - **EXPECTED OUTCOME**: Tests PASS (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 6.5 Verify preservation tests still pass for Products page
    - **Property 2: Preservation** - Products Page Button Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 3 - do NOT write new tests
    - Run preservation property tests from step 3
    - Verify "Tambah Produk" button click handler still toggles showForm state
    - Verify "Tambah" category button still submits category form
    - Verify button text labels still reflect current state (showForm, editingCategoryId)
    - Verify role-based access control still works (Owner/Manager only)
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 3.6_

- [ ] 7. Fix Login page button visibility (if investigation confirms bug)

  - [ ] 7.1 Implement Login button visibility fix based on investigation findings
    - **NOTE**: Only implement if task 2 investigation confirmed an actual bug
    - **If no bug found**: Skip this task and document that issue was environmental
    - **If CSS class not applying**: Add inline style fallback: `style={{ backgroundColor: '#0284c7' }}`
    - **If specificity conflict**: Increase specificity or use `!important` as last resort
    - **If z-index issue**: Adjust stacking context or z-index value
    - Verify button still has all existing classes: `w-full bg-primary-600 text-white p-3 rounded-lg font-bold shadow-md hover:bg-primary-700 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2`
    - Verify button continues to show loading state: "Logging in..." when `loading=true`
    - Verify button remains disabled during form submission
    - _Bug_Condition: isBugCondition(input) where input.page="Login" AND NOT isVisible(input.submitButton)_
    - _Expected_Behavior: Button visible with background #0284c7 and white text, contrast ratio >= 4.5:1_
    - _Preservation: Form submission, validation, loading states, and authentication flow unchanged_
    - _Requirements: 1.5, 1.6, 1.7, 1.8, 2.6, 2.7, 2.8, 2.9, 2.10, 3.7, 3.8_

  - [ ] 7.2 Verify bug condition exploration test now passes (if fix was applied)
    - **Property 1: Expected Behavior** - Login Button Visibility and Contrast
    - **IMPORTANT**: Re-run the SAME test from task 2 - do NOT write a new test
    - Only run if task 7.1 was executed (bug was confirmed and fix applied)
    - Run bug condition exploration test from step 2
    - Verify "Log In" button is visible with correct background color
    - Verify button has sufficient contrast ratio (>= 4.5:1)
    - Verify button is not obscured by other elements
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.6, 2.7, 2.8, 2.9, 2.10_

  - [ ] 7.3 Verify preservation tests still pass for Login page
    - **Property 2: Preservation** - Login Page Form Functionality
    - **IMPORTANT**: Re-run the SAME tests from task 4 - do NOT write new tests
    - Run preservation property tests from step 4
    - Verify form submission with valid credentials works correctly
    - Verify loading state displays "Logging in..." during submission
    - Verify error handling displays error messages correctly
    - Verify successful login redirects to correct page based on role
    - Verify "Remember me" checkbox and "Forgot password" link still work
    - Verify form validation with react-hook-form and zod schema still works
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - _Requirements: 3.7, 3.8, 3.9, 3.10, 3.11_

---

### Phase 4: Validation

- [ ] 8. Checkpoint - Comprehensive validation
  - Ensure all bug condition exploration tests pass (tasks 1 and 2)
  - Ensure all preservation property tests pass (tasks 3, 4, and 5)
  - Visual testing across multiple viewports:
    - Mobile (375x667 - iPhone SE)
    - Tablet (768x1024 - iPad)
    - Desktop (1920x1080)
  - Cross-browser testing if possible (Chrome, Firefox, Safari, Edge)
  - Verify consistency with other pages (Users, Quotations, Orders)
  - Verify no visual regressions introduced
  - Verify all functional behavior preserved
  - Ask the user if questions arise or if additional testing is needed
  - _Requirements: All requirements from bugfix.md_

---

## Notes

**Test Execution Order is Critical:**
1. **First**: Write and run exploration tests on UNFIXED code (expect failures)
2. **Second**: Write and run preservation tests on UNFIXED code (expect passes)
3. **Third**: Implement the fixes
4. **Fourth**: Re-run exploration tests (expect passes now)
5. **Fifth**: Re-run preservation tests (expect passes still)

**Why This Order Matters:**
- Exploration tests failing on unfixed code proves the bug exists
- Preservation tests passing on unfixed code captures the baseline behavior
- After fix, exploration tests passing proves bug is fixed
- After fix, preservation tests passing proves no regressions

**Property-Based Testing:**
- Recommended for stronger guarantees across input domain
- Generates many test cases automatically
- Catches edge cases that manual tests might miss
- Especially valuable for preservation checking

**Investigation First for Login Button:**
- The design document notes that the button works functionally
- The Tailwind config correctly defines `primary-600` as `#0284c7`
- Investigation is needed to confirm if this is a real bug or environmental issue
- Only implement fix if investigation confirms actual rendering problem

---

## Task Dependency Graph

### Wave Execution

```json
{
  "waves": [
    {
      "wave": 1,
      "tasks": ["1", "2"],
      "description": "Bug Condition Exploration - Run tests on unfixed code to surface counterexamples"
    },
    {
      "wave": 2,
      "tasks": ["3", "4", "5"],
      "description": "Preservation Property Tests - Capture baseline behavior on unfixed code"
    },
    {
      "wave": 3,
      "tasks": ["6.1", "6.2", "6.3"],
      "description": "Implementation - Apply fixes to Products page"
    },
    {
      "wave": 4,
      "tasks": ["6.4", "6.5"],
      "description": "Verification - Confirm Products page fixes work and preserve behavior"
    },
    {
      "wave": 5,
      "tasks": ["7.1"],
      "description": "Implementation - Apply Login page fix if needed"
    },
    {
      "wave": 6,
      "tasks": ["7.2", "7.3"],
      "description": "Verification - Confirm Login page fix works and preserves behavior"
    },
    {
      "wave": 7,
      "tasks": ["8"],
      "description": "Final Validation - Comprehensive testing across all changes"
    }
  ]
}
```

### Dependency Diagram

```
1 (Exploration: Products Icons)
  ↓
2 (Exploration: Login Button)
  ↓
3 (Preservation: Products Functionality) ← depends on 1
  ↓
4 (Preservation: Login Functionality) ← depends on 2
  ↓
5 (Preservation: Other Pages) ← depends on 3, 4
  ↓
6 (Implement: Products Fixes) ← depends on 1, 3
  ├─ 6.1 (Fix "Tambah Produk" button)
  ├─ 6.2 (Fix form header icon)
  ├─ 6.3 (Fix "Tambah" category button)
  ├─ 6.4 (Verify exploration tests pass)
  └─ 6.5 (Verify preservation tests pass)
  ↓
7 (Implement: Login Fix) ← depends on 2, 4
  ├─ 7.1 (Implement visibility fix if needed)
  ├─ 7.2 (Verify exploration test passes)
  └─ 7.3 (Verify preservation tests pass)
  ↓
8 (Checkpoint: Final Validation) ← depends on 6, 7
```

**Critical Path:**
1 → 3 → 6 → 8 (Products page fixes)
2 → 4 → 7 → 8 (Login page investigation and potential fix)

**Parallel Work:**
- Tasks 1 and 2 can be done in parallel (both are exploration)
- Tasks 3 and 4 can be done in parallel (both are preservation)
- Tasks 6 and 7 can be done in parallel (separate files, no conflicts)

**Sequential Requirements:**
- Exploration MUST come before preservation (need to understand bug first)
- Preservation MUST come before implementation (need baseline behavior)
- Implementation sub-tasks (6.4, 6.5, 7.2, 7.3) MUST come after code changes
- Final validation MUST come after all fixes are applied
