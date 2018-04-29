import { danger, schedule } from "danger";

// The inspiration for this is https://github.com/artsy/artsy-danger/blob/f019ee1a3abffabad65014afabe07cb9a12274e7/org/all-prs.ts
const isJest = typeof jest !== "undefined";
// Returns the promise itself, for testing.
const _test = (reason: string, promise: Promise<any>) => promise;
// Schedules the promise for execution via Danger.
const _run = (reason: string, promise: Promise<any>) => schedule(promise);
const wrap: any = isJest ? _test : _run;

export const labeler = wrap(
  "Label newly created issue based on title keywords",
  async () => {
    const gh = danger.github as any;
    const repo = gh.repository;
    const issue = gh.issue;

    const title = issue.title.toLowerCase();
    const titleWords = title.split(" ") as string[];

    let labelsToAdd: string[] = [];

    // Helpers

    const titleIncludesAny = (words: Set<string>): boolean => {
      return titleWords.filter(titleWord => words.has(titleWord)).length > 0;
    };

    const titleStartsWithAny = (words: Set<string>): boolean => {
      if (titleWords.length == 0) {
        return false;
      }
      const firstWord = titleWords[0];
      return words.has(firstWord);
    };

    const titleEndsInQuestionMark = (): boolean => {
      return title.slice(-1) == "?";
    };

    // label: question

    const questionWords: Set<string> = new Set([
      "how",
      "who",
      "what",
      "where",
      "when",
      "why",
      "which"
    ]);

    if (titleEndsInQuestionMark() || titleStartsWithAny(questionWords)) {
      labelsToAdd.push("question");
    }

    // label: documentation

    const documentationWords: Set<string> = new Set([
      "documentation",
      "document",
      "docs",
      "doc",
      "readme",
      "changelog"
    ]);

    if (titleIncludesAny(documentationWords)) {
      labelsToAdd.push("documentation");
    }

    // label: enhancement

    const enhancementWords: Set<string> = new Set([
      "add",
      "allow",
      "improve",
      "upgrade",
      "update",
      "support"
    ]);

    if (titleStartsWithAny(enhancementWords)) {
      labelsToAdd.push("enhancement");
    }

    // label: cocoapods

    const cocoaPodsWords: Set<string> = new Set([
      "pod",
      "cocoapod",
      "cocoapods"
    ]);

    if (titleIncludesAny(cocoaPodsWords)) {
      labelsToAdd.push("cocoapods");
    }

    // label: carthage

    const carthageWords: Set<string> = new Set(["carthage", "cartfile"]);

    if (titleIncludesAny(carthageWords)) {
      labelsToAdd.push("carthage");
    }

    // label: bug?

    const bugWords: Set<string> = new Set(["bug", "crash", "leak"]);

    if (titleIncludesAny(bugWords)) {
      labelsToAdd.push("bug?");
    }

    // label: rxmoya

    const rxWords: Set<string> = new Set(["rxmoya", "rxswift", "rx"]);

    if (titleIncludesAny(rxWords)) {
      labelsToAdd.push("rxmoya");
    }

    // label: reactivemoya

    const reactiveWords: Set<string> = new Set([
      "reactivemoya",
      "reactiveswift",
      "rac"
    ]);

    if (titleIncludesAny(reactiveWords)) {
      labelsToAdd.push("reactivemoya");
    }

    // label: spm

    const spmWords: Set<string> = new Set([
      "spm",
      "package.swift",
      "package.resolved"
    ]);

    if (titleIncludesAny(spmWords)) {
      labelsToAdd.push("spm");
    }

    if (labelsToAdd.length > 0) {
      await danger.github.api.issues.addLabels({
        owner: repo.owner.login,
        repo: repo.name,
        number: issue.number,
        labels: labelsToAdd
      });
    }
  }
);
