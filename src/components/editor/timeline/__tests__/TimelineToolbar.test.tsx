import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelineToolbar } from "../TimelineToolbar";
import { useTimelineStore } from "../../../../store/timelineStore";

function setZoomState(zoomLevel: number) {
  useTimelineStore.setState({
    zoomLevel,
    pixelsPerSecond: zoomLevel * 100,
    tracks: [],
    clips: [],
    scrollLeft: 0,
    rippleEditEnabled: false,
  });
}

function thumbLeftPx(): number {
  const left = screen.getByTestId("timeline-zoom-thumb").style.left;
  return Number(left.replace("px", ""));
}

describe("TimelineToolbar SRP-aware zoom", () => {
  beforeEach(() => {
    setZoomState(0.5);
  });

  it("places 0.25x at the start of the SRP slider and labels Overview", () => {
    setZoomState(0.25);

    render(<TimelineToolbar />);

    expect(screen.getByRole("slider", { name: "Timeline zoom" })).toHaveAttribute("aria-valuemin", "0.25");
    expect(screen.getByRole("slider", { name: "Timeline zoom" })).toHaveAttribute("aria-valuemax", "4");
    expect(screen.getByTestId("timeline-zoom-label")).toHaveTextContent("0.25x · Overview");
    expect(thumbLeftPx()).toBe(11);
  });

  it("places 0.5x at the Standard boundary with logarithmic slider spacing", () => {
    setZoomState(0.5);

    render(<TimelineToolbar />);

    expect(screen.getByTestId("timeline-zoom-label")).toHaveTextContent("0.50x · Standard");
    expect(screen.getByTestId("timeline-cadence-label")).toHaveTextContent("Readable cadence · 1s");
    expect(thumbLeftPx()).toBeGreaterThan(11);
    expect(thumbLeftPx()).toBeCloseTo(49.5);
  });

  it("labels 1.0x as Detail while preserving readable temporal cadence", () => {
    setZoomState(1.0);

    render(<TimelineToolbar />);

    expect(screen.getByTestId("timeline-zoom-label")).toHaveTextContent("1.00x · Detail");
    expect(screen.getByTestId("timeline-cadence-label")).toHaveTextContent("Readable cadence · 1s");
  });

  it("labels 2.0x as Frame with edit temporal cadence", () => {
    setZoomState(2.0);

    render(<TimelineToolbar />);

    expect(screen.getByTestId("timeline-zoom-label")).toHaveTextContent("2.00x · Frame");
    expect(screen.getByTestId("timeline-cadence-label")).toHaveTextContent("Edit cadence · 500ms");
  });

  it("labels 4.0x with frame temporal cadence", () => {
    setZoomState(4.0);

    render(<TimelineToolbar />);

    expect(screen.getByTestId("timeline-cadence-label")).toHaveTextContent("Frame cadence · 250ms");
  });
});
