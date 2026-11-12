"""
Verifies candidate records from data/lc_candidates.csv using free tools.
Run: python scripts/verify-candidates.py           (full)
      python scripts/verify-candidates.py --test   (first 25 rows)

Produces data/lc_candidates_verified.csv and data/verify_progress.json.
Never touches Supabase, the website code, or any paid API.  No email sent.
"""
import csv, json, os, re, sys, time, urllib.request, urllib.error, urllib.robotparser
from urllib.parse import urlparse, urljoin
from collections import Counter

try:
    import dns.resolver
    HAS_DNS = True
except ImportError:
    HAS_DNS = False
    print("[warn] dnspython not installed — MX lookups disabled")

try:
    import phonenumbers
    HAS_PHONE = True
except ImportError:
    HAS_PHONE = False

UA = "LightPathRetreats-research/1.0 (connect@lightpathretreats.com)"
MAX_PAGES_PER_SITE = 3
TIMEOUT = 10
DELAY = 1.0

DATA_DIR = "data"
INPUT_FILE = os.path.join(DATA_DIR, "lc_candidates.csv")
OUTPUT_FILE = os.path.join(DATA_DIR, "lc_candidates_verified.csv")
PROGRESS_FILE = os.path.join(DATA_DIR, "verify_progress.json")
SAVE_EVERY = 50

TEST_LIMIT = 25  # first run only — remove this line for full run


def main():
    if not os.path.exists(INPUT_FILE):
        print(f"STOP: {INPUT_FILE} not found.  Drop the CSV into data/ and re-run.")
        sys.exit(1)

    rows = read_csv(INPUT_FILE)
    print(f"Loaded {len(rows)} rows from {INPUT_FILE}")
    if TEST_LIMIT:
        rows = rows[:TEST_LIMIT]
        print(f"TEST MODE — first {len(rows)} rows only")
    results = []
    progress = load_progress()
    visited_domains: dict[str, str] = {}       # normalised domain → retreat_id (first seen)
    email_registry: dict[str, str] = {}         # email → retreat_id

    for i, row in enumerate(rows):
        rid = row.get("retreat_id", "")
        if rid in progress:
            results.append(progress[rid])
            continue

        print(f"[{i+1}/{len(rows)}] {rid}: {row.get('retreat_name','')[:50]}")
        rec = {"retreat_id": rid, "checked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")}

        # — website —
        ws, wu, rec["website_status"], rec["website_final_url"], rec["website_flag"], site_text = \
            check_website(row.get("website", ""))
        rec["website_status"] = ws
        rec["website_final_url"] = wu
        rec["website_flag"] = rec.get("website_flag", "")

        # dedup domain
        if wu:
            d = normalise_domain(wu)
            if d:
                if d in visited_domains:
                    rec["duplicate_flag"] = f"same domain as {visited_domains[d]}"
                else:
                    visited_domains[d] = rid

        # — emails —
        for kind in ("public_general_email", "named_contact_email"):
            em = row.get(kind, "")
            key_prefix = kind.replace("_email", "")
            ok, mx = check_email(em) if em else ("", "")
            rec[f"{key_prefix}_syntax_ok"] = ok
            rec[f"{key_prefix}_mx_ok"] = mx
            rec[f"{key_prefix}_found_on_site"] = find_on_site(site_text, em) if em and site_text else "not_checked"

            if ok == "yes" and em:
                if em in email_registry:
                    rec.setdefault("duplicate_flag", "")
                    rec["duplicate_flag"] += f"same email as {email_registry[em]};"
                else:
                    email_registry[em] = rid

        # — phone —
        ph = row.get("public_phone", "")
        if ph:
            rec["phone_valid"] = "yes" if validate_phone(ph, row.get("country","")) else "invalid"
            rec["phone_found_on_site"] = find_on_site(site_text, ph, mode="digits") if site_text else "not_checked"
        else:
            rec["phone_valid"] = ""
            rec["phone_found_on_site"] = ""

        if not rec.get("duplicate_flag"):
            rec["duplicate_flag"] = ""

        results.append(rec)
        progress[rid] = rec

        if (i + 1) % SAVE_EVERY == 0:
            save_progress(progress)
            write_output(results, OUTPUT_FILE)
            print(f"  → saved {len(results)} rows so far")

        time.sleep(DELAY)

    write_output(results, OUTPUT_FILE)
    save_progress(progress)
    print("\nDone.  Summary follows.\n")
    print_summary(results)


# ── website check ───────────────────────────────────────────────────────────

def check_website(raw: str):
    if not raw or raw.strip() == "":
        return "", "", "no_url", "", "", ""
    url = raw.strip()
    if not url.startswith("http"):
        url = "https://" + url
    try:
        rp = urllib.robotparser.RobotFileParser()
        domain = urlparse(url).netloc
        rp.set_url(f"https://{domain}/robots.txt")
        try:
            rp.read()
        except Exception:
            pass
        if not rp.can_fetch(UA, url):
            return "blocked", url, "blocked_by_robots", url, "blocked_by_robots", ""

        req = urllib.request.Request(url, headers={"User-Agent": UA})
        resp = urllib.request.urlopen(req, timeout=TIMEOUT)
        final_url = resp.geturl()
        status = resp.getcode()
        body = resp.read().decode("utf-8", "ignore")
        resp.close()

        parked = looks_parked(body)

        final_domain = urlparse(final_url).netloc
        orig_domain = urlparse(url).netloc
        flag = ""
        if final_domain and orig_domain and final_domain != orig_domain and not final_domain.endswith(orig_domain) and not orig_domain.endswith(final_domain):
            flag = "redirects_to_other_domain"
        if parked:
            flag = (flag + ";looks_parked" if flag else "looks_parked")

        pages_text = body
        # Fetch up to 2 more pages (contact/about)
        for link_text, href in find_contact_links(body, url):
            if len(pages_text) > len(body) * 2:
                break
            try:
                req2 = urllib.request.Request(href, headers={"User-Agent": UA})
                resp2 = urllib.request.urlopen(req2, timeout=TIMEOUT)
                pages_text += "\n" + resp2.read().decode("utf-8", "ignore")
                resp2.close()
                time.sleep(DELAY)
            except Exception:
                pass

        return str(status), final_url, flag or "", final_url, flag or "", pages_text
    except urllib.error.HTTPError as e:
        return str(e.code), url, "dead", url, "dead", ""
    except Exception as e:
        return str(e)[:60], url, "dead", url, "dead", ""


def looks_parked(body: str) -> bool:
    """Heuristic: very short page or domain-for-sale keywords."""
    text = body.lower()[:5000]
    if len(text) < 200:
        return True
    park_words = ["domain for sale", "this domain is parked", "buy this domain",
                  "domain is for sale", "parked by", "under construction"]
    return any(w in text for w in park_words)


def find_contact_links(html: str, base: str):
    """Yield (link_text, absolute_href) for contact/about-like pages, up to 2."""
    found = 0
    for m in re.finditer(r'<a\s[^>]*href="([^"]*)"[^>]*>(.*?)</a>', html, re.I):
        href, txt = m.group(1), m.group(2).strip()
        if re.search(r"contact|kontakt|contacto|about|impressum", href + txt, re.I):
            found += 1
            if found <= 2:
                yield txt, urljoin(base, href)


# ── email ───────────────────────────────────────────────────────────────────

def check_email(raw: str):
    """Return (syntax_ok, mx_ok)."""
    raw = raw.strip()
    if not re.match(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$", raw):
        return "invalid", ""
    domain = raw.split("@")[1]
    mx = ""
    if HAS_DNS:
        try:
            answers = dns.resolver.resolve(domain, "MX", lifetime=5)
            mx = "yes" if answers else "no"
        except Exception:
            mx = "no"
    else:
        mx = "not_checked"
    return "yes", mx


# ── phone ───────────────────────────────────────────────────────────────────

def validate_phone(raw: str, country: str) -> bool:
    if not HAS_PHONE or not raw or len(re.sub(r"\D", "", raw)) < 8:
        return False
    try:
        cc = country.upper() if country else None
        n = phonenumbers.parse(raw, cc or None)
        return phonenumbers.is_valid_number(n)
    except Exception:
        return False


# ── on‑site matching ────────────────────────────────────────────────────────

def find_on_site(site_text: str, value: str, mode: str = "exact") -> str:
    if not site_text or not value:
        return "not_checked"
    hay = site_text.lower()
    needle = value.strip().lower()
    if mode == "digits":
        needle = re.sub(r"\D", "", needle)
        if len(needle) < 8:
            return "not_checked"
        return "yes" if needle in re.sub(r"\D", "", hay) else "no"
    return "yes" if needle in hay else "no"


# ── helpers ─────────────────────────────────────────────────────────────────

def normalise_domain(url: str) -> str:
    if not url:
        return ""
    return re.sub(r"^www\.", "", urlparse(url).netloc.lower())


def read_csv(path):
    with open(path, encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


OUTPUT_COLS = [
    "retreat_id", "website_status", "website_final_url", "website_flag",
    "public_general_syntax_ok", "public_general_mx_ok", "public_general_found_on_site",
    "named_contact_syntax_ok", "named_contact_mx_ok", "named_contact_found_on_site",
    "phone_valid", "phone_found_on_site", "duplicate_flag", "checked_at",
]

def write_output(rows, path):
    if not rows:
        return
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=OUTPUT_COLS, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)


def load_progress():
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {}


def save_progress(data):
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(PROGRESS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def print_summary(results):
    total = len(results)
    dead = sum(1 for r in results if r.get("website_flag") == "dead")
    redirects = sum(1 for r in results if "redirects_to_other_domain" in str(r.get("website_flag","")))
    parked = sum(1 for r in results if "looks_parked" in str(r.get("website_flag","")))
    blocked = sum(1 for r in results if "blocked" in str(r.get("website_status","")))
    no_url = sum(1 for r in results if r.get("website_status") == "no_url")
    email_syntax = sum(1 for r in results if r.get("public_general_syntax_ok") == "yes" or r.get("named_contact_syntax_ok") == "yes")
    email_mx = sum(1 for r in results if r.get("public_general_mx_ok") == "yes" or r.get("named_contact_mx_ok") == "yes")
    email_on_site = sum(1 for r in results if r.get("public_general_found_on_site") == "yes" or r.get("named_contact_found_on_site") == "yes")
    phone_valid = sum(1 for r in results if r.get("phone_valid") == "yes")
    phone_on_site = sum(1 for r in results if r.get("phone_found_on_site") == "yes")
    dups = sum(1 for r in results if r.get("duplicate_flag"))

    print(f"Total rows:       {total}")
    print(f"Websites dead:    {dead}")
    print(f"Websites redirect:{redirects}")
    print(f"Websites parked:  {parked}")
    print(f"Websites blocked: {blocked}")
    print(f"No URL:           {no_url}")
    print(f"Emails (syntax ok): {email_syntax}")
    print(f"Emails (MX ok):    {email_mx}")
    print(f"Emails on site:    {email_on_site}")
    print(f"Phones valid:      {phone_valid}")
    print(f"Phones on site:    {phone_on_site}")
    print(f"Duplicates:        {dups}")

    # top 10 countries by dead websites — reload input CSV for country mapping (no email/phone in output)
    country_by_dead = Counter()
    if os.path.exists(INPUT_FILE):
        orig = read_csv(INPUT_FILE)
        orig_map = {r.get("retreat_id",""): r.get("country","") for r in orig}
        for r in results:
            if r.get("website_flag") == "dead":
                co = orig_map.get(r.get("retreat_id",""), "Unknown")
                country_by_dead[co] += 1
        print("Top 10 countries by dead websites:")
        for co, n in country_by_dead.most_common(10):
            print(f"  {co}: {n}")


if __name__ == "__main__":
    main()