# Getting Started with Auto UI Generator

> The **Auto UI Generator** is a breakthrough AI solution for Unity Developers, transforming static UI mockups into fully functional hierarchies (**UGUI** or **UI Toolkit**) in seconds.

## Step 1: Set Up The Dependencies

Before starting, ensure your environment meets the following requirements for the AI Engine to operate correctly.

### Install Unity

Auto UI Generator is compatible with the following Unity versions:

* **Unity 2021.3 (LTS) or newer.**
* You can download Unity from the [Unity download archive](https://unity.com/releases/editor/archive).

### AI Engine Installation

Ensure you have run the **Setup Wizard** via the Tools menu to install the local AI Engine.

![Image: Unity Game View resolution settings demo](images\12.png)

## Step 2: Scene Preparation & Resolution Matching

For the AI to accurately map your mockup, your Unity project must match the design's properties.

### 1️⃣ Create a Canvas (For UGUI)

* Add a **Canvas** to your scene.
* In the **Canvas Scaler** component:

  * Set **UI Scale Mode** → `Scale With Screen Size`
  * Set **Screen Match Mode** → `Match Width Or Height`
  * Set **Reference Resolution** → Enter the exact resolution of your original mockup.

👉 Example:
If your mockup is **1080 × 1920**, set the Reference Resolution to **1080 × 1920**.

📌 This ensures the UI scales correctly and keeps the same proportions as your original design.

![Image: Unity Game View resolution settings demo](images\13.png)

### 2️⃣ Match the Game View Resolution

* Open the **Game View** tab in Unity.
* Create (or select) a resolution preset.
* Set the **Width** and **Height** to match your mockup exactly.

👉 Example:
If your mockup is **1080 × 1920**, set the Game View resolution to **1080 × 1920**.

📌 This guarantees that the aspect ratio inside Unity matches your design image, preventing layout distortion during testing.

![Image: Unity Game View resolution settings demo](images\14.png)

## Step 3: Open the Auto UI Tool

Launch the interface via **Tools > Auto UI Generator > Auto UI Tools** or use the shortcut `Shift + A`.

![Image: Unity Game View resolution settings demo](images\15.png)

## Step 4: Input & Asset Mapping

Populate the tool using a simple drag-and-drop workflow:

1. **Template Assets (Sub-Images):** Drag your UI sprites or folders containing sub-images into the **"DROP FOLDERS / IMAGES HERE"** zone. The AI uses these to identify. All images must preserve their original scale ratio from the mockup — do not resize, stretch, crop, rotate, or modify them in any way. If an element exists in multiple resolutions (e.g., 1x, 2x, 3x), drag **all resolution variants** into the system. The AI will automatically validate them and select the highest-resolution version for optimal detection accuracy.

![Image: Unity Game View resolution settings demo](images\16.png)

2. **Main Screenshot (Mockup):** Drop the target UI design image into the **Main Screenshot** field.
3. **Target Root (UGUI only):** Drag the **RectTransform** of your Canvas or a specific Panel from the Hierarchy into this slot.

> **Note:** For **UI Toolkit**, no complex root setup is required. The tool generates the UXML/USS files automatically based on the mockup's reference resolution.

<img src="images/demo 1.gif" alt="Unity Game View resolution settings demo" width="100%">

## Step 5: Intelligent Detection Options

Choose what the AI should identify in the **Detection Options** section:

* **Detect Text (OCR):** Enable this to convert image text into **TextMeshPro** objects automatically.
* **Detect Buttons:** Enable this to identify clickable elements and apply button logic.

<img src="images/demo 2.gif" alt="Unity Game View resolution settings demo" width="100%">

## Step 6: Execute Generation

The tool now supports two powerful export modes:

| Mode | Description |
| --- | --- |
| **Generate UGUI** | Builds a traditional hierarchy using GameObjects and RectTransforms. Requires a Target Root. |
| **Generate UI Toolkit** | (Unity 2021+) Generates UI Toolkit assets instantly. No manual setup is needed—just click and export. |

Click the desired **Generate** button. The backend will process the data and build the UI in your project automatically.

---
[Next Step: Explore Supported Features](features.md)