# Rule: Unslop (Clear, Human-Voice Communication)

## Purpose
Strip AI tells, filler, and corporate puffery from any text humans will read: commit messages, PR descriptions, documentation, code comments, and chat responses.

---

## 1. Patterns to Detect and Cut

### Puffery & Buzzwords
* Cut words like: *pivotal*, *testament to*, *evolving landscape*, *seamlessly*, *robust*, *delve*, *enhance*, *showcase*, *foster*, *vibrant*, *comprehensive*, *groundbreaking*.
* State directly what happened or what the code does.

### Filler & Hedging
* "In order to" -> "To"
* "Due to the fact that" -> "Because"
* "It is important to note that" -> [Delete]
* "could potentially possibly be argued that it might" -> "may"
* "Great question! You're absolutely right!" -> [Delete, answer directly]

### Style Tells
* **No Em-Dashes**: Avoid em-dashes (`—`). Use periods, commas, or clean sentence breaks instead.
* **No Decorative Emojis in Commit/PR Messages**: Keep Git logs professional and concise.
* **Plain Words Over Jargon**: Use "use" instead of "leverage" or "utilize"; use "help" instead of "facilitate".
* **Active Voice**: "The function calculates totals" instead of "Totals are calculated by the function".

---

## 2. Commit Message Standard
* Use concise sentence case or conventional commits: `feat: add export to csv button` or `Fix budget sum calculation on empty cells`.
* Explain *why* if non-obvious, not just *what*.
