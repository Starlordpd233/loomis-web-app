import { Code, Binary, BookOpen, Calculator, FlaskConical, Brain } from "lucide-react";
import { CourseCard } from "./CourseCard";

const courses = [
  {
    code: "CS101",
    credits: 1,
    title: "Introduction to Computer Science",
    description:
      "Learn the fundamentals of computational thinking through Python programming. We cover loops, functions, and basic data structures.",
    tags: ["Introductory", "Python"],
    icon: <Code className="w-6 h-6 text-primary" />,
    iconBgClass: "bg-primary/10",
    codeBgClass: "bg-primary",
    codeTextClass: "text-primary-foreground",
  },
  {
    code: "CS450",
    credits: 1,
    title: "Advanced Machine Learning",
    description:
      "A deep dive into neural networks, supervised learning, and AI ethics. Students will build and train their own models.",
    tags: ["Advanced", "AI"],
    icon: <Binary className="w-6 h-6 text-primary" />,
    iconBgClass: "bg-primary/10",
    codeBgClass: "bg-primary",
    codeTextClass: "text-primary-foreground",
  },
  {
    code: "ENG210",
    credits: 1,
    title: "Modern World Literature",
    description:
      "Exploring contemporary voices from across the globe, focusing on themes of identity, migration, and power.",
    tags: ["Writing Intensive", "Global"],
    icon: <BookOpen className="w-6 h-6 text-amber-600" />,
    iconBgClass: "bg-amber-100",
    codeBgClass: "bg-amber-600",
    codeTextClass: "text-primary-foreground",
  },
  {
    code: "MATH305",
    credits: 1,
    title: "Multivariable Calculus",
    description:
      "Calculus of functions of several variables, including partial derivatives, multiple integrals, and vector analysis.",
    tags: ["Advanced", "STEM"],
    icon: <Calculator className="w-6 h-6 text-violet-600" />,
    iconBgClass: "bg-violet-100",
    codeBgClass: "bg-violet-600",
    codeTextClass: "text-primary-foreground",
  },
  {
    code: "SCI150",
    credits: 1,
    title: "Molecular Biology",
    description:
      "Investigation of life at the molecular level, including DNA replication, gene expression, and biotechnology.",
    tags: ["Laboratory", "Core"],
    icon: <FlaskConical className="w-6 h-6 text-emerald-600" />,
    iconBgClass: "bg-emerald-100",
    codeBgClass: "bg-emerald-600",
    codeTextClass: "text-primary-foreground",
  },
  {
    code: "SOC250",
    credits: 1,
    title: "Behavioral Psychology",
    description:
      "Understanding human behavior through cognitive, social, and developmental lenses.",
    tags: ["Research", "Humanities"],
    icon: <Brain className="w-6 h-6 text-rose-600" />,
    iconBgClass: "bg-rose-100",
    codeBgClass: "bg-rose-600",
    codeTextClass: "text-primary-foreground",
  },
];

export function CourseGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {courses.map((course) => (
        <CourseCard key={course.code} {...course} />
      ))}
    </div>
  );
}
