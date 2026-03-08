import type { QuizQuestion } from "../types";

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: number | undefined;
  onSelectAnswer: (questionId: string, answerIndex: number) => void;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
}: QuestionCardProps) {
  return (
    <div className="glass-card p-6 sm:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="badge-info">
          Question {questionNumber} of {totalQuestions}
        </span>
        {selectedAnswer !== undefined && (
          <span className="badge-success">Answered</span>
        )}
      </div>

      {/* Question Text */}
      <h3 className="text-xl sm:text-2xl font-semibold text-white leading-relaxed mb-8">
        {question.questionText}
      </h3>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const letter = String.fromCharCode(65 + index); // A, B, C, D

          return (
            <button
              key={index}
              onClick={() => onSelectAnswer(question.id, index)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 group
                ${
                  isSelected
                    ? "bg-brand-600/20 border-brand-500/50 text-white shadow-lg shadow-brand-600/10"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/20"
                }
              `}
            >
              {/* Letter badge */}
              <span
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                  ${
                    isSelected
                      ? "bg-brand-500 text-white"
                      : "bg-white/10 text-white/60 group-hover:bg-white/15"
                  }
                `}
              >
                {letter}
              </span>

              <span className="text-base leading-relaxed">{option}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
