import { newDocument, newLayer } from "./ui-model.mjs";
export function demoDocument() {
  const doc = newDocument({ width: 960, height: 640 });
  doc.name = "Welcome to Web Designer";
  doc.layers = [
    {
      ...newLayer("rectangle", 0, 0),
      name: "Background",
      width: 960,
      height: 640,
      fill: "#171b32",
    },
    {
      ...newLayer("rectangle", 80, 80),
      name: "Gradient card",
      width: 800,
      height: 480,
      fillGradient: {
        type: "linear",
        angle: 30,
        stops: [
          { offset: 0, color: "#6757d8" },
          { offset: 1, color: "#202447" },
        ],
      },
    },
    {
      ...newLayer("text", 140, 150),
      name: "Title",
      width: 680,
      height: 100,
      text: "Create in your browser",
      fontSize: 48,
      tmpFont: "f10a11",
    },
    {
      ...newLayer("text", 140, 280),
      name: "Formats",
      width: 680,
      height: 80,
      text: "PSD • SVGPRO • PNG • SVG",
      fontSize: 30,
      textColor: "#d5d0ff",
      tmpFont: "f10a11",
    },
    {
      ...newLayer("rectangle", 300, 400),
      name: "Button background",
      width: 360,
      height: 88,
      fill: "#b8a5ff",
    },
    {
      ...newLayer("text", 300, 404),
      name: "Button label",
      width: 360,
      height: 80,
      text: "Start designing",
      fontSize: 28,
      textColor: "#211b45",
      tmpFont: "f10a11",
    },
  ];
  return doc;
}
