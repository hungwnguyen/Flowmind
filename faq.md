> **General**

### Q: How can I reduce the waiting time during UI generation?

**A:** Processing time is directly proportional to the **input resolution and the number of images** being analyzed.
If the **mockup resolution is very high** or the **total size of all sub-images and template assets is large**, the detection and matching process will take longer to complete.

To improve performance:

* Use a **reasonable mockup resolution** (avoid unnecessarily large images).
* Reduce the **number of template images** when possible.

In general, **the larger the combined file size of the mockup and sub-images, the longer the processing time will be**.

---

### Q: How can I improve text detection accuracy?

**A:** Ensure **Detect Text (OCR)** is enabled in the Configuration panel. High-resolution mockups work best. Note that stylized or handwritten fonts may result in minor OCR errors.

---

### Q: Does the tool support multiple Canvases?

**A:** Yes. Drag any Canvas or UI root into the **Target Root** field. The tool will automatically locate the parent Canvas to calculate relative coordinates.

---

### Q: Why do some images appear as Magenta/Pink squares?

**A:** This happens because the matching sprite is **missing** from your **Templates** folder.
The system displays a pink placeholder when it cannot find a file that matches the detected element's name.

---

### Q: Why do I need to match the Game View ratio to the image ratio?

**A:** The tool calculates positions based on the screenshot's dimensions. If your Game View or Canvas has a different aspect ratio, the anchors and positions may shift during the `ApplyLayout` process.

---

### Q: Can I use custom fonts or button designs?

**A:** Yes. The tool uses prefabs located at `Assets/Auto UI Generator/Editor/Prefabs/`.

* **For Text:** Customize `Text.prefab` to set your default **Font Asset**, **color**, **outline**, **material**, or other custom scripts.
* **For Buttons:** Customize `Button.prefab` to configure **transitions**, **animations**, or attach additional **gameplay/UI scripts**.

All generated UI elements will inherit the settings defined in these prefabs.

---

### Q: Why are some UI elements not detected?

**A:** This usually happens when the visual appearance of the UI element differs from the provided template.

Common causes include:

* The element in the mockup was **scaled or slightly modified**
* The template image does not **match the exact pixel appearance**
* The element is **too small or partially occluded**
* The UI element has **heavy effects (blur, glow, gradient)**

For best results, ensure templates are **exact exports from the original design assets**.

---

### Q: What image formats are recommended?

**A:** The recommended formats are:

* **PNG** (preferred) – preserves transparency and exact pixel data
* **JPG** – acceptable for mockups without transparency

For template images, **PNG is strongly recommended** to maintain accurate alpha masks for detection.

---

### Q: Does Auto UI Generator support responsive layouts?

**A:** Yes. Generated UI elements use Unity's **RectTransform anchors and pivots** relative to the detected layout positions.

This allows the UI to scale correctly with **Canvas Scaler** settings such as:

* `Scale With Screen Size`
* `Match Width Or Height`

However, complex responsive behavior may still require **manual adjustment or layout groups**.
