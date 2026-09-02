const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const profiles = fs
  .readdirSync(path.join(root, "app"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name.startsWith("Profile_") && entry.name !== "Profile_eskul")
  .map((entry) => entry.name);

const localStyles = `

/* Hero actions and achievement icons stay local to this profile. */
.profile-hero-title {
  color: #fff !important;
  text-shadow: 0 2px 18px rgba(6, 16, 30, 0.45);
}

.profile-hero-actions {
  display: flex;
  align-items: stretch;
  width: fit-content;
  max-width: 100%;
}

.profile-hero-actions .btn-primary {
  min-height: 3rem;
  justify-content: center;
  text-decoration: none;
}

.achievement-trophy {
  display: block;
  font-size: 1.25rem;
  line-height: 1;
  filter: none;
}

@media (max-width: 640px) {
  .profile-hero-actions,
  .profile-hero-actions .btn-primary {
    width: 100%;
  }
}
`;

for (const profile of profiles) {
  const directory = path.join(root, "app", profile);
  const pagePath = path.join(directory, "page.tsx");
  const cssPath = path.join(directory, "style.module.css");
  let page = fs.readFileSync(pagePath, "utf8");

  page = page.replace(
    /className=\{cx\("text-white (leading-\[[^\]]+\][^"]*)"\)\}/,
    'className={cx("profile-hero-title text-white $1")}',
  );
  page = page.replace(
    /className=\{cx\("flex flex-wrap gap-4 animate-fade-in([^\"]*)"\)\}/,
    'className={cx("profile-hero-actions flex flex-wrap gap-4 animate-fade-in$1")}',
  );

  const heroCtaStart = page.indexOf("CTA Buttons");
  if (heroCtaStart !== -1) {
    const registerOpen = page.indexOf("<button", heroCtaStart);
    const registerClose = page.indexOf("</button>", registerOpen);
    if (registerOpen !== -1 && registerClose !== -1) {
      page =
        page.slice(0, registerOpen) +
        page.slice(registerOpen, registerOpen + 7).replace("<button", '<a href="/Daftar"') +
        page.slice(registerOpen + 7, registerClose) +
        "</a>" +
        page.slice(registerClose + 9);

      const scheduleOpen = page.indexOf("<button", registerOpen);
      if (scheduleOpen !== -1) {
        const scheduleClose = page.indexOf("</button>", scheduleOpen);
        if (scheduleClose !== -1) {
          page = page.slice(0, scheduleOpen) + page.slice(scheduleClose + 9);
        }
      }
    }
  }

  const ctaStart = page.indexOf('className={cx("cta-section")}');
  if (ctaStart !== -1) {
    const before = page.slice(0, ctaStart);
    const after = page.slice(ctaStart).replace('href="#"', 'href="/Daftar"');
    page = before + after;
  }

  let css = fs.readFileSync(cssPath, "utf8");
  if (!css.includes("Hero actions and achievement icons")) css += localStyles;

  fs.writeFileSync(pagePath, page);
  fs.writeFileSync(cssPath, css);
}
