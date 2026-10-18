import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom has no layout, so it does not implement scrollIntoView. Real browsers do.
Element.prototype.scrollIntoView = () => undefined;

afterEach(cleanup);
