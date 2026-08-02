# Contributing

This kit is a commons. It gets better when practitioners who have done this work
contribute what they have learned. Corrections, new templates, sector variants,
and translations are all welcome.

!!! warning "Edit the data files, not the pages"
    Every template page under `docs/` is **generated** from the YAML files in
    `data/`. Editing a generated page directly will have your change silently
    overwritten the next time anyone runs the generator — and CI will reject the
    pull request.

    Generated files carry a `<!-- GENERATED FILE — DO NOT EDIT -->` header. If
    you see it, the content you want is in `data/`.

## Where content actually lives

| To change… | Edit | Then run |
|---|---|---|
| A template's wording, body, or status | `data/templates.yml` | `python tools/build_content.py` |
| An assessment question, its help text or weight | `data/questions.yml` | same |
| A role, or which questions it sees | `data/roles.yml` / `applies_to` in `questions.yml` | same |
| A section's name or blurb | `data/sections.yml` | same |
| The "not legal advice" notice or a shared block | `data/snippets.yml` | same |
| A scoring band, weight meaning, or limitation | `data/benchmarks.yml` | same |
| A recommended default, or its deviation condition | `data/defaults.yml` | same |
| A guided decision's questions or verdicts | `data/decisions.yml` | same |
| A register's columns, dropdowns, or formulas | `data/spreadsheets.yml` | same |
| The landing page, this page, or About | `docs/*.md` directly | — |
| The assessment app's behaviour or styling | `docs/assess/assess.js` / `.css` | — |

## Ways to help

- **Improve a template** — most are `ready`, but real-world experience makes them
  sharper. Concrete beats generic.
- **Correct or update** — regulation moves, the EU AI Act especially. If a date
  or obligation is stale, fix it and cite a source.
- **Add a sector variant** — financial services, health, or public sector
  adaptation notes are the easiest high-value contribution.
- **Add a question** — if a role is being asked something the bank misses.
- **Improve the site** — navigation, styling, accessibility.

## How to contribute

```bash
git clone https://github.com/lsdeva/governance-kit.git
cd governance-kit
pip install -r requirements.txt

# 1. edit the relevant file under data/
# 2. regenerate
python tools/build_content.py

# 3. preview and check it builds clean
mkdocs serve
mkdocs build --strict
```

Commit **both** your `data/` change and the regenerated files under `docs/`, then
open a pull request describing the change.

CI re-runs the generator and fails if the committed pages do not match the data
files, so this is checked automatically rather than left to review.

### Not on GitHub?

You do not need a GitHub account to improve this kit. Most of its audience —
governance leads, DPOs, lawyers — have no reason to hold one, and a pull request
is a poor way to say "this obligation is out of date in my jurisdiction".

Send it to [Lali Devamanthri on LinkedIn](https://www.linkedin.com/in/lalisd/):
a correction, a date that has moved, a template that does not work in your
sector, or simply a question. Anything substantive is raised as an issue here
and credited to you unless you would rather it were not.

Please do not send anything confidential — this is a public, openly licensed
project, and a message about your own organisation's governance gaps is better
kept inside your organisation.

## Adding a template

Add an entry to `data/templates.yml`:

```yaml
- id: my-new-template          # stable slug; other files reference this
  title: My New Template
  section: policies            # must exist in data/sections.yml
  path: policies/my-new-template.md
  status: draft                # ready | draft | stub
  purpose: >-
    What it is for, in two or three sentences.
  when_to_use: >-
    The trigger and the cadence.
  how_to_use: >-
    Practical steps specific to THIS template. Not generic advice.
  body: |
    ### 1. First section

    The template itself. Cross-reference other templates with {{their-id}} —
    the generator turns that into a correct relative link, so pages can move
    without breaking anything.
  adaptation:
    - context: Small organisations
      note: >-
        What changes for them specifically.
  related: [data-governance-policy]
```

Then run the generator. It validates ids, sections, statuses, and every
cross-reference, and fails loudly rather than producing a broken page.

## Adding an assessment question

```yaml
- id: Q41                      # never renumber; answers are stored by id
  text: A statement the user rates.
  help: >-
    Plain English. What "yes" actually requires — write it so someone can
    answer honestly rather than optimistically.
  category: Oversight          # one of the seven categories
  applies_to: [governance-lead, internal-audit]
  weight: 4                    # 1-5; consequence if absent
  templates: [committee-charter]
  obligation:
    ref: Art. 26
    label: Short obligation name
    detail: Why it matters.
```

Notes:

- **Do not renumber existing questions.** Saved assessments in people's browsers
  are keyed by id.
- Questions carrying a `checklist:` number appear on the published 25-point
  checklist, in that order. The numbers must stay contiguous from 1.
- Every role needs at least five questions; the generator enforces this so no
  role gets a report too thin to be useful.

## House style

Keep every template page in the shared structure:

**Purpose → When to use it → How to use it → The template → Adaptation notes.**

- Write in plain, practical English. Assume a busy practitioner.
- Be **specific**. The failure mode this kit was rebuilt to escape was generic
  advice repeated across pages — if a paragraph would fit on any other template,
  it is not earning its place.
- Adaptation notes must be specific to that template. Never boilerplate.
- Cite sources for regulatory claims; prefer primary sources.
- Nothing here is legal advice — do not imply it is.
- **Recommend, do not delegate.** A `[bracketed placeholder]` hands a decision
  to the least qualified person in the room. If a choice has a sensible default,
  put it in `data/defaults.yml` with the condition for deviating. Reserve
  placeholders for details only the user can supply — their name, their date,
  their organisation.
- **Never invent benchmark or survey data.** If you cannot cite it, do not state
  it as a figure. The scoring thresholds in `data/benchmarks.yml` are labelled
  editorial judgement precisely because they are not empirical, and the kit
  holds no peer-comparison data by design — collecting it would mean uploading
  users' answers. A governance kit that fabricates its own evidence base has no
  business telling anyone to evidence their controls.

## Licensing of contributions

By contributing you agree your content is offered under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) and any code under the
[MIT licence](https://github.com/lsdeva/governance-kit/blob/main/LICENSE),
consistent with the rest of the project.
