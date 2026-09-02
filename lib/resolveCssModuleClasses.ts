type CssModule = Record<string, string>;

/** Preserves utility classes while resolving locally-scoped CSS Module classes. */
export function resolveCssModuleClasses(styles: CssModule, className: string) {
  return className
    .split(/\s+/)
    .filter(Boolean)
    .map((name) => styles[name] ?? name)
    .join(" ");
}
