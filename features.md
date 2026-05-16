# Supported Features

> The **Auto UI Generator** provides a professional suite of tools to automate the tedious aspects of UI implementation while maintaining full developer control through deep customization.

## Advanced AI Detection & Customization

The **AutoUIProjectSettings** class is a ScriptableObject used to store configuration settings related to generating user interfaces (UI) within the project. These settings include information about UI Toolkit, UGUI prefabs, and adjustment values for text elements in the UGUI interface.

![Image: Unity Game View resolution settings demo](images\1.png)

### Variable Details:

**1. uiToolkitStylePreset**

* **Data type:** UIToolkitStylePreset
* **Description:**
* A reference to a style preset used to define UI properties when using UI Toolkit.
* This preset may include information such as colors, fonts, sizes, and other attributes to ensure a consistent interface.

**2. uiToolkitReferenceResolution**

* **Data type:** Vector2Int
* **Description:**
* The reference resolution used as the basis for designing UI Toolkit layouts.
* The default value is **1080x2340**, used as the Reference Resolution in Panel Settings.
* Ensure that you input the correct parameters corresponding to the mockup image.

**3. textPrefab**

* **Data type:** GameObject
* **Description:**
* A prefab used as a template for text components in the UGUI interface.
* This prefab may contain settings such as font, color, or additional effects.
* It is used to automatically generate text elements in the UI.

**4. buttonPrefab**

* **Data type:** GameObject
* **Description:**
* A prefab used as a template for button components in the UGUI interface.
* This prefab may include settings such as background images, click behavior, or additional effects.
* It is used to automatically generate buttons in the UI.

**5. textFontSizeOffset**

* **Data type:** float
* **Description:**
* A value used to adjust (offset) the font size of text components in the UGUI interface.
* The default value is **0f**, meaning no adjustment is applied.
* It can be used to increase or decrease the default font size to match specific design requirements.

**6. textPositionOffset**

* **Data type:** Vector3
* **Description:**
* A value used to adjust (offset) the position of text components in the UGUI interface.
* The default value is **Vector3.zero**, meaning no adjustment is applied.
* It is used to fine-tune the position of text relative to its default placement, ensuring precise alignment in the UI.


## 🎨 UI Toolkit Styling & Preset System

Auto UI Generator fully supports modern **Unity UI Toolkit (UXML + USS)** workflows with a powerful preset-driven styling system.

### 🧩 ScriptableObject Style Preset

All UI Toolkit elements can be styled using a centralized `UIToolkitStylePreset` ScriptableObject.

This allows you to define global visual rules once and apply them consistently across all generated UI Toolkit layouts.

#### ✍️ Text Styling Control

* Global **Text Color**
* Custom **FontAsset (TextCore)** support
* Optional **Fallback Font**
* Configurable **Font Style**
* Adjustable **Letter Spacing**
* Custom **Line Height**
* Configurable **Estimated Character Width Ratio** (improves bounding box fitting)
* Full **Text Alignment** control

#### 🖊️ Text Outline Support

* Toggleable outline rendering
* Custom outline color
* Adjustable outline width

This enables design systems that require strong readability (e.g., mobile games, stylized UI, RPG interfaces).

![Image: Unity Game View resolution settings demo](images\3.png)

### 🔘 Button Styling & Interaction States

Generated UI Toolkit buttons automatically inherit styling rules from the preset.

* Configurable **Border Radius**
* Centralized base styling logic
* Custom **Hover Color**
* Configurable **Hover Scale**
* Smooth transition animation
* Custom **Active Color**
* Configurable **Pressed Scale**

When generating in **UI Toolkit mode**, the system automatically:

* Creates structured **UXML layouts** + PanelSettings
* Generates optimized **USS stylesheets**
* Applies `UIToolkitStylePreset` rules
* Maps detected elements to proper VisualElements
* Preserves layout hierarchy and proportional positioning

## Intelligent Anchoring (Nine-Slice Regions)

The tool features a sophisticated `NineSliceRegion` system that calculates the optimal anchor points based on an element's position on the Canvas.



* **Dynamic Region Mapping:** Automatically assigns anchors to one of 9 regions: **Top (Left/Center/Right)**, **Middle (Left/Center/Right)**, or **Bottom (Left/Center/Right)**.
* **Proportional Scaling:** The Y-axis is split into a 1:2:1 ratio to provide the "Middle" region more flexibility for content-heavy UI layouts.
* **Full Stretch Detection:** Any element occupying >99% of the Canvas (like backgrounds) is automatically set to **Stretch-Stretch** with zeroed-out offsets.

## Auto9Slicer Technology & Sprite Optimization

The **Auto9Slicer** technology provides intelligent sprite processing and optimization for UI assets.

* **Automatic 9-Slice Detection:** Automatically detects and applies 9-slice borders to UI sprites using Auto9Slicer technology
* **Optimized Sprite Variants:** Optimizes sprite file sizes by creating `.handle9slicer` variants with reduced dimensions
* **Smart Asset Reuse:** Intelligently reuses optimized sprites to reduce asset bundle size

This advanced sprite optimization reduces memory footprint while maintaining visual quality across different screen resolutions and aspect ratios.

## Hierarchy & Workflow Utilities

### 🗂️ Hierarchy Management
* **Z-Order Sorting:** Elements are sorted by their `z` value before generation, ensuring that the Unity Hierarchy matches the visual depth of your design.
* **Parent-Child Reconstruction:** The generator reconstructs complex, nested UI structures based on detection data.

### 🔧 Developer Productivity
* **Full Undo Support:** Every generation is registered with Unity's `Undo` system, allowing you to revert changes with a single `Ctrl + Z`.

---
[Back to Getting Started](getting-started.md) | [View FAQ](faq.md)