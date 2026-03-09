import bcrypt
from django.core.management.base import BaseCommand
from quizzes.models import User, Quiz, Question


class Command(BaseCommand):
    help = "Seed the database with sample data"

    def handle(self, *args, **options):
        self.stdout.write("🌱 Seeding database...")

        admin_pw = bcrypt.hashpw(b"admin123", bcrypt.gensalt(12)).decode()
        user_pw = bcrypt.hashpw(b"user123", bcrypt.gensalt(12)).decode()

        admin, _ = User.objects.update_or_create(
            email="admin@example.com",
            defaults={
                "name": "Admin User",
                "role": User.Role.ADMIN,
                "password": admin_pw,
            },
        )
        self.stdout.write(f"  ✅ Admin user: {admin.email}")

        test_user, _ = User.objects.update_or_create(
            email="user@example.com",
            defaults={
                "name": "Test User",
                "role": User.Role.USER,
                "password": user_pw,
            },
        )
        self.stdout.write(f"  ✅ Test user: {test_user.email}")

        # Quiz 1: JavaScript Fundamentals
        quiz1, created = Quiz.objects.get_or_create(
            title="JavaScript Fundamentals",
            defaults={
                "description": "Test your knowledge of core JavaScript concepts including closures, prototypes, async programming, and ES6+ features.",
                "time_limit": 300,
                "is_published": True,
                "created_by": admin,
            },
        )
        if created:
            questions = [
                ("What is the output of `typeof null` in JavaScript?",
                 ['"null"', '"object"', '"undefined"', '"boolean"'], 1),
                ("Which method creates a new array with the results of calling a function on every element?",
                 [".forEach()", ".map()", ".filter()", ".reduce()"], 1),
                ("What does the `===` operator check?",
                 ["Value equality only", "Type equality only", "Value and type equality", "Reference equality"], 2),
                ("Which keyword is used to declare a block-scoped variable?",
                 ["var", "let", "const", "Both let and const"], 3),
                ("What is a closure in JavaScript?",
                 ["A function that returns void",
                  "A function with access to its outer scope even after the outer function has returned",
                  "A method on the window object",
                  "A way to close browser windows"], 1),
            ]
            for idx, (text, opts, correct) in enumerate(questions):
                Question.objects.create(
                    quiz=quiz1,
                    question_text=text,
                    options=opts,
                    correct_answer_index=correct,
                    order=idx,
                )
        self.stdout.write(f"  ✅ Quiz: {quiz1.title} ({quiz1.id})")

        # Quiz 2: React & TypeScript Essentials
        quiz2, created = Quiz.objects.get_or_create(
            title="React & TypeScript Essentials",
            defaults={
                "description": "Challenge yourself with questions about React hooks, component patterns, TypeScript generics, and best practices.",
                "time_limit": 600,
                "is_published": True,
                "created_by": admin,
            },
        )
        if created:
            questions = [
                ("What hook is used to manage side effects in React?",
                 ["useState", "useEffect", "useContext", "useMemo"], 1),
                ("In TypeScript, what does the `interface` keyword do?",
                 ["Creates a class", "Defines a type contract", "Declares a variable", "Imports a module"], 1),
                ("Which React hook is used to share state across components without prop drilling?",
                 ["useReducer", "useRef", "useContext", "useCallback"], 2),
                ("What is the purpose of `React.memo`?",
                 ["It memoizes a function",
                  "It prevents unnecessary re-renders of a component",
                  "It caches API responses",
                  "It creates a new component type"], 1),
                ("What TypeScript utility type makes all properties optional?",
                 ["Required<T>", "Partial<T>", "Readonly<T>", "Pick<T, K>"], 1),
                ("What is the virtual DOM in React?",
                 ["The actual browser DOM",
                  "A lightweight JavaScript representation of the real DOM",
                  "A CSS rendering engine",
                  "A server-side template engine"], 1),
            ]
            for idx, (text, opts, correct) in enumerate(questions):
                Question.objects.create(
                    quiz=quiz2,
                    question_text=text,
                    options=opts,
                    correct_answer_index=correct,
                    order=idx,
                )
        self.stdout.write(f"  ✅ Quiz: {quiz2.title} ({quiz2.id})")

        self.stdout.write(self.style.SUCCESS("\n✅ Seeding complete!"))
