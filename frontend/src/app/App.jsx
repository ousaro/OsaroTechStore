/**
 * APP ROOT
 * Thin entry point — mirrors backend's server.js.
 * Delegates everything to Router (which boots the composition root).
 */
import { Router } from "./Router.jsx";

export default function App() {
  return <Router />;
}
