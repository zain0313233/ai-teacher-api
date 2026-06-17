export type TopicWeaknessRow = {
  topic: string;
  subject: string;
  chapterLabel: string;
  wrongCount: number;
  totalAnswered: number;
  accuracy: number;
};

export function getBoardBenchmarkTarget(board?: string | null): number {
  const key = (board || '').toLowerCase();
  if (key.includes('cambridge') || key.includes('o level')) return 75;
  if (key.includes('federal')) return 68;
  if (key.includes('sindh')) return 67;
  if (key.includes('kpk')) return 66;
  return 70;
}

export function classifyStrength(avgScore: number): 'strong' | 'moderate' | 'weak' {
  if (avgScore >= 80) return 'strong';
  if (avgScore >= 60) return 'moderate';
  return 'weak';
}

export function buildBenchmarkMessage(
  classAvg: number | null,
  benchmark: number,
  subject: string,
): string {
  if (classAvg == null) {
    return `Board benchmark for ${subject} is typically around ${benchmark}%. Assign quizzes to compare class performance.`;
  }
  const delta = Math.round((classAvg - benchmark) * 10) / 10;
  if (delta >= 5) {
    return `Class average is ${delta}% above the typical ${benchmark}% board benchmark for ${subject}.`;
  }
  if (delta <= -5) {
    return `Class average is ${Math.abs(delta)}% below the typical ${benchmark}% board benchmark — consider review sessions.`;
  }
  return `Class average is in line with the typical ${benchmark}% board benchmark for ${subject}.`;
}

type AnswerRow = {
  questionId: string;
  isCorrect: boolean | null;
  attempt: {
    quizSession: {
      subject: string;
      chapterStart: number | null;
      chapterEnd: number | null;
    };
  };
};

type QuestionMeta = {
  id: string;
  topicTag: string | null;
  concept: string | null;
};

export function aggregateTopicWeakness(
  answers: AnswerRow[],
  questionMap: Map<string, QuestionMeta>,
  limit = 8,
): TopicWeaknessRow[] {
  const stats = new Map<
    string,
    {
      topic: string;
      subject: string;
      chapterLabel: string;
      wrong: number;
      total: number;
    }
  >();

  for (const ans of answers) {
    if (ans.isCorrect !== false) continue;
    const q = questionMap.get(ans.questionId);
    const session = ans.attempt.quizSession;
    const topic =
      q?.topicTag?.trim() ||
      q?.concept?.trim() ||
      (session.chapterStart
        ? `Chapter ${session.chapterStart}${
            session.chapterEnd && session.chapterEnd !== session.chapterStart
              ? `–${session.chapterEnd}`
              : ''
          }`
        : 'General');
    const key = `${session.subject}::${topic}`;
    const chapterLabel =
      session.chapterStart && session.chapterEnd
        ? session.chapterStart === session.chapterEnd
          ? `Ch ${session.chapterStart}`
          : `Ch ${session.chapterStart}–${session.chapterEnd}`
        : '';
    const row = stats.get(key) || {
      topic,
      subject: session.subject,
      chapterLabel,
      wrong: 0,
      total: 0,
    };
    row.wrong += 1;
    stats.set(key, row);
  }

  for (const ans of answers) {
    if (ans.isCorrect == null) continue;
    const q = questionMap.get(ans.questionId);
    const session = ans.attempt.quizSession;
    const topic =
      q?.topicTag?.trim() ||
      q?.concept?.trim() ||
      (session.chapterStart ? `Chapter ${session.chapterStart}` : 'General');
    const key = `${session.subject}::${topic}`;
    const row = stats.get(key);
    if (row) row.total += 1;
  }

  return [...stats.values()]
    .map((row) => ({
      topic: row.topic,
      subject: row.subject,
      chapterLabel: row.chapterLabel,
      wrongCount: row.wrong,
      totalAnswered: Math.max(row.total, row.wrong),
      accuracy:
        row.total > 0
          ? Math.round(((row.total - row.wrong) / row.total) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, limit);
}
