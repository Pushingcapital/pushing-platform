import json
import subprocess
import urllib.request
from collections import defaultdict
from datetime import datetime

BASE_URL = "https://script.google.com/macros/s/AKfycby4wVJy3DgelIohrdjPPRONF9LDrXcOo_bEXYBcPnMvwiSxZFm-knVVGLPZRK5t0uGr/exec"
WORKER_DIR = "/Volumes/Extreme SSD/PUSHING_CAPITAL_CANONICAL/99_DELETE_PENDING/20260111-225108_imac24_imports/00_PROCESSING_STATION/24 INCH IMAC COMPUTER FILES COMPLETE/pushing-capital-kb-search-worker"


def fetch_catalog():
    url = BASE_URL + "?action=getAll"
    with urllib.request.urlopen(url) as resp:
        data = json.load(resp)
    return data["data"]["products"]


def d1_query(sql):
    cmd = [
        "npx",
        "wrangler",
        "d1",
        "execute",
        "pushpush",
        "--remote",
        "--command",
        sql,
        "--json",
    ]
    res = subprocess.run(cmd, cwd=WORKER_DIR, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(res.stderr.strip() or res.stdout.strip())
    payload = json.loads(res.stdout)
    if not payload:
        return []
    return payload[0].get("results", [])


def normalize(s):
    return (s or "").strip()


def main():
    catalog = fetch_catalog()
    apps_by_code = {p["Code"]: p for p in catalog}

    auto_rows = d1_query(
        "SELECT product_code, product_name, category, subcategory, description, price, price_type, price_notes, pipeline_name, module_id FROM automotive_products;"
    )
    fin_rows = d1_query(
        "SELECT product_code, product_name, category_id, subcategory, description, price, price_type, price_notes, billing_cycle, pipeline_name FROM finance_products;"
    )
    auto_modules = d1_query(
        "SELECT id, module_number, module_key, module_name, category, description, default_job_type, safety_critical FROM automotive_service_modules;"
    )
    fin_categories = d1_query(
        "SELECT id, category_key, category_name, description, pipeline_name FROM finance_service_categories;"
    )
    req_evidence = d1_query(
        "SELECT module_id, evidence_type, evidence_description, required FROM required_evidence;"
    )

    auto_by_code = {r["product_code"]: r for r in auto_rows}
    fin_by_code = {r["product_code"]: r for r in fin_rows}
    modules_by_id = {r["id"]: r for r in auto_modules}
    fin_cat_by_id = {r["id"]: r for r in fin_categories}

    evidence_by_module = defaultdict(list)
    for r in req_evidence:
        evidence_by_module[r["module_id"]].append(
            {
                "type": r.get("evidence_type"),
                "description": r.get("evidence_description"),
                "required": r.get("required"),
            }
        )

    full = []
    diffs = []

    for code, app in sorted(apps_by_code.items()):
        domain = app.get("Domain")
        d1 = None
        if domain == "Automotive":
            d1 = auto_by_code.get(code)
        elif domain == "Finance":
            d1 = fin_by_code.get(code)

        entry = {
            "code": code,
            "domain": domain,
            "apps": app,
            "d1": d1,
            "context": {},
            "gates": [],
            "mismatches": [],
        }

        if d1 is None:
            entry["mismatches"].append("missing_in_d1")
        else:
            # Basic comparisons
            if normalize(app.get("Name")) != normalize(d1.get("product_name")):
                entry["mismatches"].append("name")
            if domain == "Automotive":
                if normalize(app.get("Category")) != normalize(d1.get("category")):
                    entry["mismatches"].append("category")
                if normalize(app.get("Subcategory")) != normalize(d1.get("subcategory")):
                    entry["mismatches"].append("subcategory")
                module_id = d1.get("module_id")
                if module_id is not None:
                    entry["context"]["module"] = modules_by_id.get(module_id)
                    entry["gates"] = evidence_by_module.get(module_id, [])
            elif domain == "Finance":
                cat = fin_cat_by_id.get(d1.get("category_id"))
                if cat:
                    entry["context"]["category"] = cat
                    if normalize(app.get("Category")) != normalize(cat.get("category_name")):
                        entry["mismatches"].append("category")
                if normalize(app.get("Subcategory")) != normalize(d1.get("subcategory")):
                    entry["mismatches"].append("subcategory")

        if entry["mismatches"]:
            diffs.append(entry)

        full.append(entry)

    # Extras in D1 not in Apps Script
    apps_codes = set(apps_by_code.keys())
    extra_auto = sorted([c for c in auto_by_code.keys() if c not in apps_codes])
    extra_fin = sorted([c for c in fin_by_code.keys() if c not in apps_codes])

    summary = {
        "generated_at": datetime.utcnow().isoformat() + "Z",
        "apps_count": len(apps_by_code),
        "d1_auto_count": len(auto_by_code),
        "d1_fin_count": len(fin_by_code),
        "missing_in_d1": sum(1 for e in full if "missing_in_d1" in e["mismatches"]),
        "mismatch_count": len(diffs),
        "extra_auto_in_d1": extra_auto,
        "extra_fin_in_d1": extra_fin,
    }

    out_json = "/Users/emmanuelhaddad/catalog_audit_full.json"
    out_md = "/Users/emmanuelhaddad/catalog_audit_report.md"

    with open(out_json, "w", encoding="utf-8") as f:
        json.dump({"summary": summary, "items": full}, f, indent=2)

    # Markdown report
    lines = []
    lines.append("Catalog Audit Report")
    lines.append("Generated: " + summary["generated_at"])
    lines.append("")
    lines.append("Summary")
    lines.append(f"- Apps Script catalog: {summary['apps_count']} items")
    lines.append(f"- D1 automotive_products: {summary['d1_auto_count']} items")
    lines.append(f"- D1 finance_products: {summary['d1_fin_count']} items")
    lines.append(f"- Missing in D1: {summary['missing_in_d1']}")
    lines.append(f"- Items with mismatches: {summary['mismatch_count']}")
    if summary["extra_auto_in_d1"] or summary["extra_fin_in_d1"]:
        lines.append("- Extra codes in D1 (not in Apps Script):")
        for code in summary["extra_auto_in_d1"]:
            lines.append(f"  - Automotive: {code}")
        for code in summary["extra_fin_in_d1"]:
            lines.append(f"  - Finance: {code}")
    lines.append("")

    if diffs:
        lines.append("Mismatches")
        for e in diffs:
            code = e["code"]
            name = e["apps"].get("Name")
            lines.append(f"- {code} — {name}")
            lines.append(f"  - Issues: {', '.join(e['mismatches'])}")
        lines.append("")
    else:
        lines.append("No mismatches found.")
        lines.append("")

    with open(out_md, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print("Wrote:", out_md)
    print("Wrote:", out_json)


if __name__ == "__main__":
    main()
