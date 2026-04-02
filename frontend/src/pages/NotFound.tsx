import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen bg-background bg-noise">
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="mb-4 text-xs font-body uppercase tracking-[0.3em] text-muted-foreground">404</p>
      <h1 className="font-display text-4xl tracking-wider text-foreground sm:text-5xl">Page not found</h1>
      <p className="mt-3 max-w-md text-sm font-body text-muted-foreground">
        The page you opened is not part of the current PlayerIQ experience.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-body font-medium text-foreground transition-colors hover:bg-accent"
      >
        Back home
      </Link>
    </div>
  </div>
);

export default NotFound;
