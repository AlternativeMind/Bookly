# Design System: The Illuminated Archive

## 1. Overview & Creative North Star
**Creative North Star: "The Illuminated Archive"**
This design system moves away from the generic "grid of cards" common in retail apps, opting instead for a high-end editorial experience. It treats the digital bookstore not as a database, but as a prestigious gallery. By leveraging extreme typographic contrast and a "glowing" palette against a void-black backdrop, we create a sense of depth and curated luxury. 

The aesthetic is driven by **intentional asymmetry** and **tonal layering**. We avoid the rigid, boxed-in look of standard UI by allowing elements to overlap and breathe, using the primary orange as a light source that "illuminates" the content within the dark environment.

## 2. Colors & Surface Philosophy
The palette is built on a high-contrast foundation of deep obsidian and vibrant, energetic oranges. 

### The "No-Line" Rule
To maintain a premium, seamless feel, **1px solid borders are strictly prohibited for sectioning.** We do not "box" content. Boundaries must be defined through:
*   **Background Shifts:** Transitioning from `surface` (#0e0e0e) to `surface-container-low` (#131313).
*   **Tonal Transitions:** Using soft gradients to guide the eye rather than hard lines.

### Surface Hierarchy & Nesting
We treat the UI as a series of physical layers. Hierarchy is achieved by "stacking" surface tiers:
*   **Base:** `surface` (#0e0e0e) for the main background.
*   **Sections:** `surface-container-low` (#131313) for large content areas.
*   **Featured Elements:** `surface-container-high` (#20201f) for interactive cards.
*   **Nesting:** An inner container (like a search bar or a quote block) should always use a tier higher or lower than its parent to define its importance without needing a stroke.

### The "Glass & Gradient" Rule
Flat colors can feel static. To inject "soul" into the interface:
*   **Glassmorphism:** Floating elements (like navigation bars or hovering price tags) should use semi-transparent surface colors with a `backdrop-blur` (20px-40px). 
*   **Signature Gradients:** Main CTAs must use a subtle linear gradient from `primary` (#ffa44c) to `primary_container` (#fd9000) at a 135-degree angle. This mimics the way light hits a physical book spine.

## 3. Typography
The system utilizes a dual-font strategy to balance editorial character with functional clarity.

*   **Display & Headlines (Epilogue):** This is our "voice." Epilogue is used for large-scale headers (`display-lg` at 3.5rem) to create an authoritative, modern feel. Bold weights should be used for book titles to create high-contrast impact against the dark background.
*   **Body & Labels (Manrope):** This is our "engine." Manrope provides exceptional readability at smaller scales. Use `body-lg` (1rem) for book descriptions to ensure an effortless reading experience.
*   **Identity through Scale:** We use a "High-Contrast Scale." A `display-lg` headline should often sit directly adjacent to a `label-md` metadata point. This gap in scale is what creates the "Editorial" look.

## 4. Elevation & Depth
Depth is never an afterthought; it is a structural tool.

*   **Tonal Layering:** Avoid shadows for static elements. A `surface-container-lowest` card placed on a `surface-container-low` section provides a natural, sophisticated lift.
*   **Ambient Shadows:** For "floating" elements like Modals or floating action buttons, use an extra-diffused shadow. 
    *   *Spec:* `0px 24px 48px rgba(0, 0, 0, 0.5)`. 
    *   The shadow should feel like a soft glow of darkness, rather than a hard edge.
*   **The "Ghost Border" Fallback:** In rare cases where accessibility requires a container boundary, use a **Ghost Border**: `outline-variant` (#484847) at **15% opacity**. It should be felt, not seen.

## 5. Components

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` (#552d00) text, `full` roundedness. 
*   **Secondary:** `surface_container_highest` (#262626) fill with `primary` (#ffa44c) text.
*   **Tertiary:** No background. Text-only using `primary` with a `title-sm` weight.

### Cards (The "Book Jacket" approach)
*   Forbid divider lines. Use `surface_container` (#1a1a1a) as the card base. 
*   Image-first: Book covers should have a `md` (0.75rem) corner radius.
*   Metadata should be grouped using vertical white space (e.g., 1.5rem between title and description).

### Input Fields
*   **Styling:** Use `surface_container_low` (#131313) with a `Ghost Border`.
*   **Focus State:** Transition the border to 100% opacity `primary` and add a subtle `primary_dim` outer glow (4px blur).

### Chips (Genre & Filter)
*   **Selected:** `primary` fill with `on_primary_fixed` (#1e0c00) text.
*   **Unselected:** `surface_container_high` fill with `on_surface_variant` text.

### Specialized Component: The "Reading Progress" Bar
*   A thin 4px track using `surface_container_highest` with a `primary` glow effect on the progress indicator to mimic a "lit" filament.

## 6. Do's and Don'ts

### Do:
*   **Embrace Negative Space:** Allow at least 2rem of padding between major sections to let the high-contrast type "own" the screen.
*   **Use Asymmetry:** Place a large book cover off-center with text wrapping into the open space to create a dynamic editorial layout.
*   **Layer Oranges:** Use `secondary` (#feb64c) for accents (like star ratings) to provide depth against the `primary` CTA.

### Don't:
*   **Don't use 100% white text for everything:** Use `on_surface` (#ffffff) for headers, but `on_surface_variant` (#adaaaa) for long-form body text to reduce eye strain in the dark theme.
*   **Don't use "Card-in-Card" borders:** If you need to nest content, use a background color one step lighter (e.g., `surface-container-high` on `surface-container`).
*   **Don't use standard shadows:** Never use a default black shadow with 0 blur. It kills the "Illuminated" effect.