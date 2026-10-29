
import { useEffect, useState } from "react";
import "./MoneySchool.css";

const lessons = [
  {
    title: "Understanding Money",
    icon: "💰",
    description: "Learn the basics of money management.",
    objective: "Understand why planning your money matters.",
    content:
      "Money helps us pay for the things we need and want. Managing money means deciding how to earn, spend, save, and plan your money.",
    example:
      "If you receive ₹1,000, you can spend some on your needs and save some for the future.",
    question: "What does managing money mean?",
    options: [
      "Spending all your money",
      "Planning how to earn, spend, and save money",
      "Never spending money",
      "Borrowing money every month",
    ],
    answer: 1,
    explanation:
      "Money management means planning your income, expenses, savings, and financial goals.",
  },
  {
    title: "Income and Expenses",
    icon: "↔️",
    description: "Understand money coming in and going out.",
    objective: "Learn to calculate the money you have left.",
    content:
      "Income is money you receive. Expenses are the money you spend on things such as food, transport, bills, and education.",
    example:
      "If you receive ₹5,000 as monthly income and spend ₹3,000, you have ₹2,000 remaining.",
    question: "You receive ₹2,000 and spend ₹500. How much remains?",
    options: ["₹500", "₹1,000", "₹1,500", "₹2,500"],
    answer: 2,
    explanation: "₹2,000 − ₹500 = ₹1,500 remaining.",
  },
  {
    title: "Create a Budget",
    icon: "📊",
    description: "Give your money a simple plan.",
    objective: "Learn how a budget helps control spending.",
    content:
      "A budget is a plan for your income and expenses. It helps you understand where your money goes and avoid spending more than you can afford.",
    example:
      "If your monthly income is ₹6,000, you can plan amounts for food, transport, personal spending, and savings.",
    question: "Why is a budget useful?",
    options: [
      "It helps plan income and expenses",
      "It increases income automatically",
      "It removes every expense",
      "It guarantees wealth",
    ],
    answer: 0,
    explanation:
      "A budget helps you plan your money and make informed spending decisions.",
  },
  {
    title: "Needs and Wants",
    icon: "🛍️",
    description: "Make smarter spending decisions.",
    objective: "Distinguish essential purchases from optional ones.",
    content:
      "Needs are things important for daily living, such as basic food, housing, and essential transport. Wants are things you would like to have but can often live without.",
    example:
      "Buying essential groceries is usually a need. Buying another game or accessory may be a want.",
    question: "Which is usually a need?",
    options: [
      "A new video game",
      "Essential groceries",
      "An extra pair of fashionable shoes",
      "A luxury accessory",
    ],
    answer: 1,
    explanation:
      "Essential groceries help meet a basic daily need.",
  },
  {
    title: "Start Saving",
    icon: "🐷",
    description: "Build a habit of saving for future goals.",
    objective: "Understand the value of regular saving.",
    content:
      "Saving means setting aside money instead of spending all of it. You can save for education, a laptop, unexpected expenses, or other goals.",
    example:
      "Saving ₹200 each month for 6 months gives you ₹1,200, before any interest.",
    question: "What is a good saving habit?",
    options: [
      "Save only if you have a lot of money",
      "Spend everything first",
      "Save an affordable amount regularly",
      "Borrow money to buy unnecessary things",
    ],
    answer: 2,
    explanation:
      "Regular, realistic saving can help you work towards your goals.",
  },
  {
    title: "Emergency Funds",
    icon: "🛡️",
    description: "Prepare for unexpected expenses.",
    objective: "Learn why emergency savings are important.",
    content:
      "An emergency fund is money set aside for unexpected costs, such as urgent repairs or medical bills. Start with a small, realistic target that fits your situation.",
    example:
      "If you save ₹300 per month for 4 months, you will have ₹1,200 set aside, before any interest.",
    question: "What is an emergency fund mainly for?",
    options: [
      "Every shopping sale",
      "Unexpected necessary expenses",
      "Daily entertainment only",
      "Buying things on impulse",
    ],
    answer: 1,
    explanation:
      "An emergency fund helps you prepare for unexpected necessary expenses.",
  },
];

const STORAGE_KEY = "smartspendMoneySchoolCompleted";

export default function MoneySchool() {
  const [lessonIndex, setLessonIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showQuiz, setShowQuiz] = useState(false);
  const [finished, setFinished] = useState(false);

  const lesson = lessons[lessonIndex];
  const isCorrect = selectedAnswer === lesson.answer;
  const progress = Math.round(
    (completed.length / lessons.length) * 100
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  }, [completed]);

  function chooseLesson(index) {
    setLessonIndex(index);
    setSelectedAnswer(null);
    setShowQuiz(false);
    setFinished(false);
  }

  function startQuiz() {
    setSelectedAnswer(null);
    setShowQuiz(true);
    setFinished(false);
  }

  function submitCorrectAnswer() {
    if (selectedAnswer !== lesson.answer) return;

    setCompleted((previous) =>
      previous.includes(lessonIndex)
        ? previous
        : [...previous, lessonIndex]
    );

    if (lessonIndex < lessons.length - 1) {
      chooseLesson(lessonIndex + 1);
    } else {
      setFinished(true);
      setShowQuiz(false);
    }
  }

  function resetProgress() {
    const confirmed = window.confirm(
      "Are you sure you want to reset your Money School progress?"
    );

    if (!confirmed) return;

    setCompleted([]);
    setLessonIndex(0);
    setSelectedAnswer(null);
    setShowQuiz(false);
    setFinished(false);
  }

  return (
    <main className="money-school-page">
      <nav className="ms-topbar">
        <a className="ms-brand" href="/dashboard">
          <span className="ms-brand-icon">S</span>
          <span>SmartSpend</span>
        </a>

        <button
          className="ms-back-button"
          onClick={() => {
            window.location.href = "/dashboard";
          }}
        >
          ← Back to Dashboard
        </button>
      </nav>

      <section className="ms-hero">
        <div className="ms-hero-content">
          <span className="ms-eyebrow">
            SMARTSPEND LEARNING CENTRE
          </span>

          <h1>Welcome to Money School 🎓</h1>

          <p>
            Build smarter money habits, one small lesson at a time.
            Learn at your own pace with simple explanations and
            practical examples in Indian rupees.
          </p>

          <div className="ms-hero-stats">
            <div className="ms-stat">
              <span className="ms-stat-icon">📚</span>
              <div>
                <strong>{lessons.length} lessons</strong>
                <span>Beginner friendly</span>
              </div>
            </div>

            <div className="ms-stat">
              <span className="ms-stat-icon">✅</span>
              <div>
                <strong>{completed.length} completed</strong>
                <span>Keep learning</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ms-hero-art" aria-hidden="true">
          <div className="ms-art-circle">
            <span>₹</span>
          </div>
          <div className="ms-art-card ms-art-card-one">
            <span>💰</span> Save regularly
          </div>
          <div className="ms-art-card ms-art-card-two">
            <span>📈</span> Grow your habits
          </div>
        </div>
      </section>

      <section className="ms-progress-panel">
        <div className="ms-progress-heading">
          <div>
            <span className="ms-eyebrow">YOUR JOURNEY</span>
            <h2>Learning progress</h2>
          </div>
          <strong className="ms-progress-percent">{progress}%</strong>
        </div>

        <div
          className="ms-progress-track"
          role="progressbar"
          aria-label="Learning progress"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="ms-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p>
          {completed.length === lessons.length
            ? "Amazing! You have completed every lesson."
            : `${completed.length} of ${lessons.length} lessons completed. Every step counts!`}
        </p>
      </section>

      {finished && (
        <section className="ms-completion-banner">
          <span className="ms-completion-icon">🎉</span>
          <div>
            <h2>Congratulations, Money Learner!</h2>
            <p>
              You answered the final lesson correctly. Keep practising
              these habits in your everyday life.
            </p>
          </div>
          <button
            className="ms-primary-button"
            onClick={() => chooseLesson(0)}
          >
            Review lessons
          </button>
        </section>
      )}

      <div className="ms-section-heading">
        <div>
          <span className="ms-eyebrow">LEARN & PRACTISE</span>
          <h2>Your learning path</h2>
          <p>Select a lesson to read, practise, and test yourself.</p>
        </div>

        <button className="ms-reset-button" onClick={resetProgress}>
          Reset progress
        </button>
      </div>

      <section className="ms-learning-layout">
        <aside className="ms-lesson-sidebar">
          <h3>Course lessons</h3>

          {lessons.map((item, index) => {
            const isCompleted = completed.includes(index);
            const isActive = lessonIndex === index;

            return (
              <button
                key={item.title}
                className={`ms-lesson-nav ${
                  isActive ? "is-active" : ""
                }`}
                onClick={() => chooseLesson(index)}
                aria-current={isActive ? "step" : undefined}
              >
                <span className="ms-nav-icon">{item.icon}</span>

                <span className="ms-nav-copy">
                  <strong>
                    {index + 1}. {item.title}
                  </strong>
                  <small>
                    {isCompleted ? "Completed" : "Lesson"}
                  </small>
                </span>

                <span className="ms-nav-status">
                  {isCompleted ? "✓" : "›"}
                </span>
              </button>
            );
          })}

          <div className="ms-sidebar-tip">
            <span>💡</span>
            <strong>Learning tip</strong>
            <p>
              Try to connect each lesson to a real decision you make
              about money.
            </p>
          </div>
        </aside>

        <article className="ms-lesson-card">
          <div className="ms-lesson-card-top">
            <span className="ms-lesson-icon">{lesson.icon}</span>

            <span
              className={`ms-status-pill ${
                completed.includes(lessonIndex) ? "is-done" : ""
              }`}
            >
              {completed.includes(lessonIndex)
                ? "✓ Completed"
                : `Lesson ${lessonIndex + 1} of ${lessons.length}`}
            </span>
          </div>

          <span className="ms-eyebrow">YOUR NEXT STEP</span>
          <h2>{lesson.title}</h2>
          <p className="ms-lesson-description">{lesson.description}</p>

          <div className="ms-objective">
            <span>🎯</span>
            <div>
              <strong>Learning objective</strong>
              <p>{lesson.objective}</p>
            </div>
          </div>

          <div className="ms-content-box">
            <h3>📘 Understand the concept</h3>
            <p>{lesson.content}</p>
          </div>

          <div className="ms-example-box">
            <h3>💡 Real-life example</h3>
            <p>{lesson.example}</p>
          </div>

          {!showQuiz ? (
            <div className="ms-lesson-actions">
              <button
                className="ms-primary-button"
                onClick={startQuiz}
              >
                Test your knowledge <span>→</span>
              </button>

              {lessonIndex > 0 && (
                <button
                  className="ms-secondary-button"
                  onClick={() => chooseLesson(lessonIndex - 1)}
                >
                  Previous lesson
                </button>
              )}
            </div>
          ) : (
            <div className="ms-quiz">
              <div className="ms-quiz-title">
                <span>🧠</span>
                <div>
                  <span className="ms-eyebrow">QUICK CHECK</span>
                  <h3>Test your knowledge</h3>
                </div>
              </div>

              <p className="ms-question">{lesson.question}</p>

              <div className="ms-options">
                {lesson.options.map((option, index) => {
                  let optionClass = "";

                  if (selectedAnswer !== null && index === lesson.answer) {
                    optionClass = "is-correct";
                  } else if (
                    selectedAnswer === index &&
                    selectedAnswer !== lesson.answer
                  ) {
                    optionClass = "is-wrong";
                  } else if (selectedAnswer === index) {
                    optionClass = "is-selected";
                  }

                  return (
                    <button
                      key={option}
                      className={`ms-option ${optionClass}`}
                      onClick={() => setSelectedAnswer(index)}
                      disabled={selectedAnswer !== null}
                    >
                      <span className="ms-option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                      {selectedAnswer !== null &&
                        index === lesson.answer && (
                          <span className="ms-option-check">✓</span>
                        )}
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div
                  className={`ms-feedback ${
                    isCorrect ? "feedback-correct" : "feedback-wrong"
                  }`}
                  role="status"
                >
                  <strong>
                    {isCorrect
                      ? "Correct! Well done 🎉"
                      : "Not quite — keep trying!"}
                  </strong>

                  <p>
                    {isCorrect
                      ? lesson.explanation
                      : "Review the lesson above and try the question again. You can do it!"}
                  </p>

                  {!isCorrect && (
                    <button
                      className="ms-secondary-button"
                      onClick={() => setSelectedAnswer(null)}
                    >
                      Try again
                    </button>
                  )}
                </div>
              )}

              {isCorrect && (
                <button
                  className="ms-primary-button ms-next-button"
                  onClick={submitCorrectAnswer}
                >
                  {lessonIndex < lessons.length - 1
                    ? "Complete & next lesson →"
                    : "Finish course 🎉"}
                </button>
              )}
            </div>
          )}
        </article>
      </section>

      <footer className="ms-footer">
        <div className="ms-footer-mark">S</div>
        <p>
          SmartSpend Money School
          <span>Small steps today. Smarter money decisions tomorrow.</span>
        </p>
      </footer>
    </main>
  );
}
